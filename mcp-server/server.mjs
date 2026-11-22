import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { McpDocsServer } from "docusaurus-plugin-mcp-server";
import crypto from "crypto";
import { SANDBOX_OTTU_NET, WALLET_SEED_LIMITS } from "./config.mjs";
import { getKeycloakToken } from "./keycloak.mjs";
import { createProvider } from "./search.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3456;
const BASE_URL = process.env.BASE_URL || "https://docs.ottu.dev";

const DATA_DIR = path.join(__dirname, "data");
const DOCS_PATH = path.join(DATA_DIR, "docs.json");
const INDEX_PATH = path.join(DATA_DIR, "search-index.json");

// The flexsearch search index (built by docusaurus-plugin-mcp-server) can balloon
// far beyond the docs themselves because of contextual indexing over full page
// content. Loading a multi-hundred-MB index OOMs this small service and fails the
// deploy readiness probe — taking the whole docs site's deployment down with it.
// Above this cap we skip loading the index and run search-degraded (doc lookups +
// webhook relay still work) instead of crashing. Shrink the index to restore search.
const MAX_INDEX_BYTES = 50 * 1024 * 1024; // 50 MB

// ── Webhook Relay ────────────────────────────────────────────────────────────
// In-memory store for webhook payloads, keyed by orderId. Clients poll for
// updates via GET /:orderId/events.json?since=<id> — SSE was dropped because
// Cloudflare (DO App Platform's edge) non-deterministically buffers streaming
// responses; request/response is reliable where streaming was 50/50.
//
// The relay is anonymous (Ottu posts webhooks to it), so everything it keeps is
// bounded (#161374): body size, events and bytes per order id, order ids, total
// bytes. It keeps each event as JSON text, not as the parsed object: a parsed
// body can take 20 times its text size in memory (e.g. `[{},{},...]`), so only
// the text makes the byte caps hold. Senders are Ottu's servers, all demo users
// share them, so there is no per-address limit here.
export const webhookStore = new Map();
const WEBHOOK_TTL_MS = 3600000; // 1 hour
const WEBHOOK_MAX_BODY_BYTES = 64 * 1024;
const WEBHOOK_MAX_EVENTS_PER_ORDER = 100;
const WEBHOOK_MAX_ORDER_BYTES = 2 * 1024 * 1024;
const WEBHOOK_MAX_ORDERS = 5000;
const WEBHOOK_MAX_TOTAL_BYTES = 32 * 1024 * 1024;
// About what one stored event costs: up to 2 bytes per character of text, plus
// the event object and its receivedAt string.
const WEBHOOK_EVENT_OVERHEAD_BYTES = 256;
const eventCost = (text) => text.length * 2 + WEBHOOK_EVENT_OVERHEAD_BYTES;
// The demos use ids like `journey-<ms>-<rand>` and `demo-<ms>-<rand>`.
const ORDER_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
let webhookStoreBytes = 0;

function pruneWebhookStore(now = Date.now()) {
  for (const [id, entry] of webhookStore) {
    if (now - entry.createdAt > WEBHOOK_TTL_MS) {
      webhookStoreBytes -= entry.bytes;
      webhookStore.delete(id);
    }
  }
}

function sendJson(res, status, obj, extraHeaders = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...extraHeaders });
  res.end(JSON.stringify(obj));
}

// Reads a JSON body of at most maxBytes. Past the cap it stops buffering and
// rejects with code "too_large"; the caller answers 413 and closes.
function parseBody(req, maxBytes = WEBHOOK_MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    let tooLarge = false;
    req.on("data", (chunk) => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > maxBytes) {
        tooLarge = true;
        body = "";
        const err = new Error("Payload too large");
        err.code = "too_large";
        reject(err);
        return;
      }
      body += chunk;
    });
    req.on("end", () => {
      if (tooLarge) return;
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function sendTooLarge(res) {
  sendJson(res, 413, { error: "payload_too_large" }, { Connection: "close" });
}

export function handleWebhookPost(orderId, req, res) {
  if (!ORDER_ID_RE.test(orderId)) {
    // Drain so the client sees the answer, not a reset.
    req.resume();
    sendJson(res, 400, { error: "invalid_order_id" });
    return;
  }
  parseBody(req)
    .then((payload) => {
      // Same text JSON.stringify gave the poll answer before; the parsed
      // object is dropped here.
      const text = JSON.stringify(payload);
      const bytes = eventCost(text);
      let entry = webhookStore.get(orderId);
      if (!entry) {
        if (webhookStore.size >= WEBHOOK_MAX_ORDERS) pruneWebhookStore();
        if (webhookStore.size >= WEBHOOK_MAX_ORDERS) {
          sendJson(res, 503, { error: "relay_full" });
          return;
        }
      } else if (
        entry.webhooks.length >= WEBHOOK_MAX_EVENTS_PER_ORDER ||
        entry.bytes + bytes > WEBHOOK_MAX_ORDER_BYTES
      ) {
        sendJson(res, 429, { error: "too_many_events" });
        return;
      }
      if (webhookStoreBytes + bytes > WEBHOOK_MAX_TOTAL_BYTES) pruneWebhookStore();
      if (webhookStoreBytes + bytes > WEBHOOK_MAX_TOTAL_BYTES) {
        sendJson(res, 503, { error: "relay_full" });
        return;
      }
      if (!entry) {
        entry = { webhooks: [], createdAt: Date.now(), bytes: 0 };
        webhookStore.set(orderId, entry);
      }
      entry.webhooks.push({ text, receivedAt: new Date().toISOString() });
      entry.bytes += bytes;
      webhookStoreBytes += bytes;
      console.log(
        `[Webhook] Received for ${orderId} (${entry.webhooks.length} total)`
      );
      sendJson(res, 200, { status: "ok" });
    })
    .catch((err) => {
      if (err.code === "too_large") return sendTooLarge(res);
      sendJson(res, 400, { error: err.message });
    });
}

export function handleWebhookPoll(orderId, req, res) {
  // Read only: an unknown id answers "no events" without creating an entry.
  const webhooks = webhookStore.get(orderId)?.webhooks ?? [];
  const sinceParam = new URL(req.url, "http://x").searchParams.get("since");
  const since = Number.parseInt(sinceParam ?? "-1", 10);
  const startIdx = Number.isFinite(since) ? since + 1 : 0;
  // Built from the stored text, in the same shape and key order that
  // JSON.stringify({ events: [{ id, payload, receivedAt }], lastId }) gave.
  const events = [];
  for (let i = startIdx; i < webhooks.length; i++) {
    const w = webhooks[i];
    events.push(
      w
        ? `{"id":${i},"payload":${w.text},"receivedAt":${JSON.stringify(w.receivedAt)}}`
        : `{"id":${i}}` // a negative `since` asks for indexes that do not exist
    );
  }
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(`{"events":[${events.join(",")}],"lastId":${webhooks.length - 1}}`);
}

// ── Wallet seed: backend proxy with Keycloak JWT ─────────────────────────────
// The browser cannot hold the wallet service's client_credentials grant secret.
// This handler mints a fresh Keycloak token (cached in keycloak.mjs) and forwards
// the seed request to the wallet service for the active environment.
//
// The route is public (the docs WalletDemo calls it), so it only accepts the
// demo's own shape of request: see WALLET_SEED_LIMITS in config.mjs (#161374).

export const SANDBOX_MERCHANT = SANDBOX_OTTU_NET;
export const seedRateLimits = new Map(); // ip -> number[] (timestamps)
const SEED_LIMIT_WINDOW_MS = 60_000;
const SEED_LIMIT_MAX = 30;
// All callers together, so changing address does not lift the limit.
const SEED_GLOBAL_LIMIT_MAX = 300;
const SEED_LIMIT_MAX_KEYS = 10_000;
const SEED_MAX_BODY_BYTES = 4 * 1024;
const WALLET_TIMEOUT_MS = 15_000;
let seedGlobalHits = [];

const AMOUNT_RE = /^\d{1,6}(\.\d{1,3})?$/;
const SAFE_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

// The caller's address as the platform proxy saw it. DO App Platform sets
// do-connecting-ip; otherwise the last X-Forwarded-For entry is the one the
// nearest proxy appended. The first entry is whatever the caller wrote.
export function clientIp(req) {
  const doIp = req.headers["do-connecting-ip"];
  if (typeof doIp === "string" && doIp.trim()) return doIp.trim();
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) {
    const last = fwd.split(",").map((s) => s.trim()).filter(Boolean).pop();
    if (last) return last;
  }
  return req.socket?.remoteAddress || "unknown";
}

export function pruneSeedRateLimits(now = Date.now()) {
  for (const [ip, hits] of seedRateLimits) {
    const recent = hits.filter((t) => now - t < SEED_LIMIT_WINDOW_MS);
    if (recent.length === 0) seedRateLimits.delete(ip);
    else seedRateLimits.set(ip, recent);
  }
  seedGlobalHits = seedGlobalHits.filter((t) => now - t < SEED_LIMIT_WINDOW_MS);
}

export function checkSeedRateLimit(req, now = Date.now()) {
  const ip = clientIp(req);
  seedGlobalHits = seedGlobalHits.filter((t) => now - t < SEED_LIMIT_WINDOW_MS);
  if (seedGlobalHits.length >= SEED_GLOBAL_LIMIT_MAX) return false;
  if (!seedRateLimits.has(ip) && seedRateLimits.size >= SEED_LIMIT_MAX_KEYS) {
    pruneSeedRateLimits(now);
    if (seedRateLimits.size >= SEED_LIMIT_MAX_KEYS) return false;
  }
  const recent = (seedRateLimits.get(ip) || []).filter((t) => now - t < SEED_LIMIT_WINDOW_MS);
  if (recent.length >= SEED_LIMIT_MAX) {
    seedRateLimits.set(ip, recent);
    return false;
  }
  recent.push(now);
  seedRateLimits.set(ip, recent);
  seedGlobalHits.push(now);
  return true;
}

// Returns an error code, or null when the request is a demo-shaped seed.
function seedRequestError({ customer_id, currency, amount, pg_code }) {
  const limits = WALLET_SEED_LIMITS;
  const amountText = typeof amount === "number" ? String(amount) : amount;
  if (typeof amountText !== "string" || !AMOUNT_RE.test(amountText)) return "invalid_amount";
  const value = Number(amountText);
  if (!(value > 0) || value > limits.maxAmount) return "invalid_amount";
  if (typeof currency !== "string" || !limits.currencies.includes(currency)) return "invalid_currency";
  if (
    typeof customer_id !== "string" ||
    !customer_id.startsWith(limits.customerIdPrefix) ||
    !SAFE_ID_RE.test(customer_id.slice(limits.customerIdPrefix.length))
  ) {
    return "invalid_customer_id";
  }
  if (typeof pg_code !== "string" || !SAFE_ID_RE.test(pg_code)) return "invalid_pg_code";
  if (limits.pgCodes.length > 0 && !limits.pgCodes.includes(pg_code)) return "invalid_pg_code";
  return null;
}

// deps lets the tests stand in for Keycloak and the wallet service.
export async function handleSeedWallet(req, res, deps = {}) {
  const fetchImpl = deps.fetch ?? fetch;
  const getToken = deps.getToken ?? getKeycloakToken;
  const merchant = deps.merchant ?? SANDBOX_MERCHANT;

  if (!checkSeedRateLimit(req)) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "rate_limited" }));
    return;
  }

  let body;
  try {
    body = await parseBody(req, SEED_MAX_BODY_BYTES);
  } catch (err) {
    if (err.code === "too_large") return sendTooLarge(res);
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "invalid_json" }));
    return;
  }

  const { customer_id, currency, amount, pg_code } = body || {};
  if (!customer_id || !currency || !amount || !pg_code) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "missing_fields", required: ["customer_id", "currency", "amount", "pg_code"] }));
    return;
  }
  const invalid = seedRequestError({ customer_id, currency, amount, pg_code });
  if (invalid) {
    sendJson(res, 400, { error: invalid });
    return;
  }

  let token;
  try {
    token = await getToken({
      url: merchant.keycloak.url,
      realm: merchant.keycloak.realm,
      clientId: merchant.keycloak.clientId,
      clientSecret: process.env[merchant.keycloak.clientSecretEnvVar],
    });
  } catch (err) {
    console.error("[seed-wallet] keycloak error:", err.message);
    sendJson(res, 502, { error: "keycloak_error" });
    return;
  }

  const idempotencyKey = crypto.randomUUID();
  const demoTag = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  let upstream;
  try {
    upstream = await fetchImpl(`${merchant.walletUrl}/wallet/credits`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Merchant-Id": merchant.merchantId,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        customer_id,
        currency,
        amount,
        funding_source_type: "promo",
        session_id: `sess_${demoTag}`,
        pg_code,
        provider: "",
        reference_number: `ref_${demoTag}`,
        order_no: `ord_${demoTag}`,
        metadata: { source: "docs_walletdemo", synthetic: true, merchant: merchant.merchantId },
      }),
      signal: AbortSignal.timeout(WALLET_TIMEOUT_MS),
      // The bearer token goes to the wallet host only, never to a redirect.
      redirect: "error",
    });
  } catch (err) {
    console.error("[seed-wallet] upstream fetch failed:", err.message);
    sendJson(res, 502, { error: "upstream_unreachable" });
    return;
  }

  console.log(`[seed-wallet] merchant=${merchant.merchantId} status=${upstream.status}`);
  if (!upstream.ok) {
    // Same status for the demo, but the wallet's own error text stays here.
    await upstream.body?.cancel().catch(() => {});
    sendJson(res, upstream.status, { error: "wallet_error" });
    return;
  }
  const text = await upstream.text();
  res.writeHead(upstream.status, { "Content-Type": "application/json" });
  res.end(text);
}

// Drop expired webhook entries and idle rate-limit counters every 5 minutes.
setInterval(() => {
  const now = Date.now();
  pruneWebhookStore(now);
  pruneSeedRateLimits(now);
}, 300000).unref();

// ── MCP Artifacts ────────────────────────────────────────────────────────────

// Read a fetch body (web ReadableStream) into a UTF-8 string, returning null if
// the decoded byte count exceeds maxBytes. Counting decoded chunks (not the
// Content-Length header) is what makes the cap robust against gzip.
async function readCapped(body, maxBytes) {
  if (!body) return null;
  const reader = body.getReader();
  const chunks = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock?.();
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function fetchArtifacts() {
  const dataUrl = `${BASE_URL}/_mcp-data`;
  console.log(`Fetching MCP artifacts from ${dataUrl}...`);

  // Bound each fetch so a stalled docs origin (e.g. mid-deploy) can't hang the
  // "ready" transition forever — fetchWithRetry then advances to the next attempt.
  const opts = { signal: AbortSignal.timeout(20000) };
  const [docsRes, indexRes] = await Promise.all([
    fetch(`${dataUrl}/docs.json`, opts),
    fetch(`${dataUrl}/search-index.json`, opts),
  ]);

  if (!docsRes.ok || !indexRes.ok) {
    throw new Error(
      `Failed to fetch artifacts: docs=${docsRes.status}, index=${indexRes.status}`
    );
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DOCS_PATH, await docsRes.text());

  // Guard against an oversized index (see MAX_INDEX_BYTES). Content-Length is
  // unreliable — the docs origin gzips responses, so the header reports the
  // compressed size while the body decompresses to something far larger. So we
  // stream the (decoded) body and bail past the cap, bounding memory regardless.
  const indexText = await readCapped(indexRes.body, MAX_INDEX_BYTES);
  if (indexText === null) {
    fs.writeFileSync(INDEX_PATH, "{}");
    console.warn(
      `Search index exceeds the ${MAX_INDEX_BYTES / 1048576}MB cap — skipping load. MCP search is DEGRADED until the index is shrunk; doc lookups and webhook relay are unaffected.`
    );
  } else {
    fs.writeFileSync(INDEX_PATH, indexText);
  }

  const docsSize = (fs.statSync(DOCS_PATH).size / 1024).toFixed(0);
  const indexSize = (fs.statSync(INDEX_PATH).size / 1024).toFixed(0);
  console.log(
    `Artifacts loaded: docs.json (${docsSize}KB), search-index.json (${indexSize}KB)`
  );
}

async function fetchWithRetry(maxAttempts = 10, delayMs = 15000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fetchArtifacts();
      return;
    } catch (err) {
      console.error(`Attempt ${attempt}/${maxAttempts} failed: ${err.message}`);
      if (attempt === maxAttempts) throw err;
      console.log(`Retrying in ${delayMs / 1000}s...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

// ── HTTP Server ──────────────────────────────────────────────────────────────
// DO App Platform strips the ingress prefix before forwarding to the service.
// - Requests to /mcp/* arrive here as /*
// - Requests to /webhook/* arrive here as /*
//
// Routing after prefix stripping:
//   POST /          → MCP protocol (from /mcp)
//   POST /refresh   → re-fetch MCP artifacts (from /mcp/refresh)
//   GET  /health    → health check (from /mcp/health or /webhook/health)
//   POST /:id             → webhook relay (from /webhook/:id)
//   GET  /:id/events.json → webhook poll (from /webhook/:id/events.json)

const REFRESH_COOLDOWN_MS = 60_000;
let lastRefreshAt = 0;
let refreshRunning = false;

function refreshAllowed(req) {
  const expected = process.env.MCP_REFRESH_TOKEN;
  if (!expected) return true;
  const given = req.headers["x-mcp-refresh-token"];
  if (typeof given !== "string") return false;
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

async function start() {
  let mcpServer = null;
  let ready = false;

  // Build (or rebuild) the in-memory MCP server from the artifact files currently
  // on disk. Reused by startup and by POST /refresh — so a refresh actually
  // reloads the index instead of only re-downloading the files.
  function buildMcpServer() {
    // Must match the build-side FlexSearch config in docusaurus.config.ts.
    // The query-side index is reconstructed from the artifact, so its
    // tokenizer/resolution have to mirror how the index was built or
    // lookups won't match. Replaces the former 0.11.0 patch-package patch.
    const flexsearch = {
      tokenize: "strict",
      resolution: 3,
      context: false,
    };
    mcpServer = new McpDocsServer({
      docsPath: DOCS_PATH,
      indexPath: INDEX_PATH,
      name: "ottu-docs",
      baseUrl: BASE_URL,
      flexsearch,
      // Our provider wraps the plugin's FlexSearch one: see search.mjs.
      search: createProvider({ flexsearch, baseUrl: BASE_URL }),
      tools: {
        docs_search: {
          description:
            "Search the Ottu documentation. Returns matching pages with URLs, snippets and relevance scores. Use two or three specific words from the topic, for example `export transactions` or `password reset`. General words such as merchant, dashboard or Ottu do not help. Scores only rank the results of one query; do not compare them across queries.",
        },
        docs_fetch: {
          description:
            "Fetch the complete markdown content of a documentation page. Pass the page's full URL, as a search result gives it. A trailing slash or an #anchor on the URL is fine.",
        },
      },
    });
    ready = true;
  }

  const httpServer = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-ottu-demo");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = req.url || "";

    // ── Health check ──
    if (req.method === "GET" && url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ status: ready ? "ok" : "loading", baseUrl: BASE_URL })
      );
      return;
    }

    // ── MCP refresh ──
    // The deploy workflows call this once after a deploy. When MCP_REFRESH_TOKEN
    // is set, the call must carry it in x-mcp-refresh-token. Either way it runs
    // at most once a minute (#161374).
    if (req.method === "POST" && url === "/refresh") {
      if (!refreshAllowed(req)) {
        sendJson(res, 401, { error: "unauthorized" });
        return;
      }
      const now = Date.now();
      if (refreshRunning || now - lastRefreshAt < REFRESH_COOLDOWN_MS) {
        sendJson(res, 429, { error: "refresh_cooldown" });
        return;
      }
      refreshRunning = true;
      lastRefreshAt = now;
      try {
        await fetchArtifacts();
        buildMcpServer(); // reload the in-memory index, not just the files on disk
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "refreshed" }));
      } catch (err) {
        console.error("[refresh] failed:", err.message);
        sendJson(res, 500, { error: "refresh_failed" });
      } finally {
        refreshRunning = false;
      }
      return;
    }

    // ── Webhook poll: GET /:orderId/events.json ──
    const pollMatch = url.match(/^\/([^/]+)\/events\.json(?:\?.*)?$/);
    if (pollMatch && req.method === "GET") {
      handleWebhookPoll(pollMatch[1], req, res);
      return;
    }

    // ── Wallet seed: POST / with x-ottu-demo: seed-wallet ──
    // Ingress strips the /seed-wallet prefix, so the request arrives as POST /.
    // The header marker disambiguates from the MCP POST /.
    if (
      req.method === "POST" &&
      (url === "/" || url === "") &&
      req.headers["x-ottu-demo"] === "seed-wallet"
    ) {
      await handleSeedWallet(req, res);
      return;
    }

    // ── MCP protocol: POST / ──
    if (req.method === "POST" && (url === "/" || url === "")) {
      if (!ready || !mcpServer) {
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "MCP server is loading artifacts, please retry shortly",
          })
        );
        return;
      }
      await mcpServer.handleHttpRequest(req, res);
      return;
    }

    // ── Webhook relay: POST /:orderId ──
    const postMatch = url.split("?")[0].match(/^\/([^/]+)\/?$/);
    if (postMatch && req.method === "POST") {
      handleWebhookPost(postMatch[1], req, res);
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Base URL: ${BASE_URL}`);
  });

  // Fetch artifacts in background — don't block webhook relay
  fetchWithRetry()
    .then(() => {
      buildMcpServer();
      console.log("MCP server ready.");
    })
    .catch((err) => {
      console.error(
        "MCP artifacts failed to load (webhook relay still active):",
        err.message
      );
    });
}

// Listen only when run as `node server.mjs`; the tests import the handlers.
function isMain() {
  try {
    return fs.realpathSync(process.argv[1] || "") === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMain()) {
  start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
