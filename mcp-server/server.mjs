import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { McpDocsServer } from "docusaurus-plugin-mcp-server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3456;
const BASE_URL = process.env.BASE_URL || "https://docs.ottu.dev";

const DATA_DIR = path.join(__dirname, "data");
const DOCS_PATH = path.join(DATA_DIR, "docs.json");
const INDEX_PATH = path.join(DATA_DIR, "search-index.json");

// ── Webhook Relay ────────────────────────────────────────────────────────────
// In-memory store for webhook payloads, keyed by orderId.
// Each entry holds SSE clients and received webhooks, with a 1-hour TTL.
const webhookStore = new Map();
const WEBHOOK_TTL_MS = 3600000; // 1 hour

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of webhookStore) {
    if (now - entry.createdAt > WEBHOOK_TTL_MS) {
      entry.clients.forEach((res) => res.end());
      webhookStore.delete(id);
    }
  }
}, 300000); // cleanup every 5 min

function getOrCreateEntry(orderId) {
  if (!webhookStore.has(orderId)) {
    webhookStore.set(orderId, {
      clients: new Set(),
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

// ~4KB of padding to defeat proxy buffering on the first response chunk
// (DO App Platform ingress / Cloudflare hold small SSE responses in a buffer
// until a threshold is breached, which stalls EventSource.onopen).
const SSE_PAD = ": " + " ".repeat(4096) + "\n\n";

function formatEvent(id, event) {
  return `id: ${id}\ndata: ${JSON.stringify(event)}\n\n`;
}

function handleWebhookPost(orderId, req, res) {
  parseBody(req)
    .then((payload) => {
      const entry = getOrCreateEntry(orderId);
      const event = { payload, receivedAt: new Date().toISOString() };
      entry.webhooks.push(event);
      const id = entry.webhooks.length - 1;
      const data = formatEvent(id, event);
      // Append padding after each frame — DO App Platform / Envoy ingress buffers
      // small SSE writes (<~4KB) indefinitely. Initial handshake padding only
      // covers the open; every live broadcast needs its own flush.
      entry.clients.forEach((client) => {
        client.write(data);
        client.write(SSE_PAD);
      });
      console.log(
        `[Webhook] Received for ${orderId} (${entry.clients.size} SSE clients)`
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
    })
    .catch((err) => {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    });
}

function handleWebhookSSE(orderId, req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
    "Access-Control-Allow-Origin": "*",
  });
  // Force headers out before any body chunk — some proxies hold them otherwise.
  res.flushHeaders?.();
  // Disable Nagle so small SSE frames flush immediately.
  res.socket?.setNoDelay?.(true);
  // Prime the stream with padding to breach proxy buffer thresholds.
  res.write(SSE_PAD);

  const entry = getOrCreateEntry(orderId);

  // Catch-up: replay only events newer than the client's Last-Event-ID.
  const lastHeader = req.headers["last-event-id"];
  const lastId = lastHeader !== undefined ? Number.parseInt(lastHeader, 10) : -1;
  const startIdx = Number.isFinite(lastId) ? lastId + 1 : 0;
  for (let i = startIdx; i < entry.webhooks.length; i++) {
    res.write(formatEvent(i, entry.webhooks[i]));
  }
  // Flush replay frames past the ingress buffer (see handleWebhookPost).
  if (entry.webhooks.length > startIdx) {
    res.write(SSE_PAD);
  }

  entry.clients.add(res);
  console.log(
    `[SSE] connected ${orderId} (${entry.clients.size} total, replayed ${entry.webhooks.length - startIdx})`
  );

  // Send keepalive comments every 15s to prevent proxy/Cloudflare from closing the connection
  const keepalive = setInterval(() => res.write(": keepalive\n\n"), 15000);
  req.on("close", () => {
    clearInterval(keepalive);
    entry.clients.delete(res);
    console.log(`[SSE] disconnected ${orderId} (${entry.clients.size} remaining)`);
  });
}

// ── MCP Artifacts ────────────────────────────────────────────────────────────

async function fetchArtifacts() {
  const dataUrl = `${BASE_URL}/_mcp-data`;
  console.log(`Fetching MCP artifacts from ${dataUrl}...`);

  const [docsRes, indexRes] = await Promise.all([
    fetch(`${dataUrl}/docs.json`),
    fetch(`${dataUrl}/search-index.json`),
  ]);

  if (!docsRes.ok || !indexRes.ok) {
    throw new Error(
      `Failed to fetch artifacts: docs=${docsRes.status}, index=${indexRes.status}`
    );
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DOCS_PATH, await docsRes.text());
  fs.writeFileSync(INDEX_PATH, await indexRes.text());

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
//   POST /:id       → webhook relay (from /webhook/:id)
//   GET  /:id/events → webhook SSE (from /webhook/:id/events)

async function start() {
  let mcpServer = null;
  let ready = false;

  const httpServer = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "refreshed" }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // ── Webhook SSE: GET /:orderId/events ──
    const sseMatch = url.match(/^\/([^/]+)\/events\/?$/);
    if (sseMatch && req.method === "GET") {
      handleWebhookSSE(sseMatch[1], req, res);
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
      mcpServer = new McpDocsServer({
        docsPath: DOCS_PATH,
        indexPath: INDEX_PATH,
        name: "ottu-docs",
        baseUrl: BASE_URL,
      });
      ready = true;
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
