import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { McpDocsServer } from "docusaurus-plugin-mcp-server";
import { SANDBOX_OTTU_NET } from "./config.mjs";
import { getKeycloakToken } from "./keycloak.mjs";

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
const webhookStore = new Map();
const WEBHOOK_TTL_MS = 3600000; // 1 hour

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of webhookStore) {
    if (now - entry.createdAt > WEBHOOK_TTL_MS) {
      webhookStore.delete(id);
    }
  }
}, 300000); // cleanup every 5 min

function getOrCreateEntry(orderId) {
  if (!webhookStore.has(orderId)) {
    webhookStore.set(orderId, {
      webhooks: [],
      createdAt: Date.now(),
    });
  }
  return webhookStore.get(orderId);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function handleWebhookPost(orderId, req, res) {
  parseBody(req)
    .then((payload) => {
      const entry = getOrCreateEntry(orderId);
      entry.webhooks.push({ payload, receivedAt: new Date().toISOString() });
      console.log(
        `[Webhook] Received for ${orderId} (${entry.webhooks.length} total)`
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
    })
    .catch((err) => {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    });
}

function handleWebhookPoll(orderId, req, res) {
  const entry = getOrCreateEntry(orderId);
  const sinceParam = new URL(req.url, "http://x").searchParams.get("since");
  const since = Number.parseInt(sinceParam ?? "-1", 10);
  const startIdx = Number.isFinite(since) ? since + 1 : 0;
  const events = [];
  for (let i = startIdx; i < entry.webhooks.length; i++) {
    events.push({ id: i, ...entry.webhooks[i] });
  }
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(
    JSON.stringify({ events, lastId: entry.webhooks.length - 1 })
  );
}

// ── Wallet seed: backend proxy with Keycloak JWT ─────────────────────────────
// The browser cannot hold the wallet service's client_credentials grant secret.
// This handler mints a fresh Keycloak token (cached in keycloak.mjs) and forwards
// the seed request to the wallet service for the active environment.

const seedRateLimits = new Map(); // ip -> number[] (timestamps)
const SEED_LIMIT_WINDOW_MS = 60_000;
const SEED_LIMIT_MAX = 30;

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function checkSeedRateLimit(req) {
  const ip = clientIp(req);
  const now = Date.now();
  const recent = (seedRateLimits.get(ip) || []).filter((t) => now - t < SEED_LIMIT_WINDOW_MS);
  if (recent.length >= SEED_LIMIT_MAX) {
    seedRateLimits.set(ip, recent);
    return false;
  }
  recent.push(now);
  seedRateLimits.set(ip, recent);
  return true;
}

async function handleSeedWallet(req, res) {
  if (!checkSeedRateLimit(req)) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "rate_limited" }));
    return;
  }

  let body;
  try {
    body = await parseBody(req);
  } catch {
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

  const merchant = SANDBOX_OTTU_NET;
  let token;
  try {
    token = await getKeycloakToken({
      url: merchant.keycloak.url,
      realm: merchant.keycloak.realm,
      clientId: merchant.keycloak.clientId,
      clientSecret: process.env[merchant.keycloak.clientSecretEnvVar],
    });
  } catch (err) {
    console.error("[seed-wallet] keycloak error:", err.message);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "keycloak_error", message: err.message }));
    return;
  }

  const idempotencyKey = crypto.randomUUID();
  const demoTag = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  let upstream;
  try {
    upstream = await fetch(`${merchant.walletUrl}/wallet/credits`, {
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
    });
  } catch (err) {
    console.error("[seed-wallet] upstream fetch failed:", err.message);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "upstream_unreachable", message: err.message }));
    return;
  }

  const text = await upstream.text();
  console.log(`[seed-wallet] merchant=${merchant.merchantId} status=${upstream.status}`);
  res.writeHead(upstream.status, { "Content-Type": "application/json" });
  res.end(text);
}

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

async function start() {
  let mcpServer = null;
  let ready = false;

  // Build (or rebuild) the in-memory MCP server from the artifact files currently
  // on disk. Reused by startup and by POST /refresh — so a refresh actually
  // reloads the index instead of only re-downloading the files.
  function buildMcpServer() {
    mcpServer = new McpDocsServer({
      docsPath: DOCS_PATH,
      indexPath: INDEX_PATH,
      name: "ottu-docs",
      baseUrl: BASE_URL,
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
    if (req.method === "POST" && url === "/refresh") {
      try {
        await fetchArtifacts();
        buildMcpServer(); // reload the in-memory index, not just the files on disk
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "refreshed" }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
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
    const postMatch = url.match(/^\/([^/]+)\/?$/);
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

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
