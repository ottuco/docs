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

function handleWebhookPost(orderId, req, res) {
  parseBody(req)
    .then((payload) => {
      const entry = getOrCreateEntry(orderId);
      const event = { payload, receivedAt: new Date().toISOString() };
      entry.webhooks.push(event);
      const data = `data: ${JSON.stringify(event)}\n\n`;
      entry.clients.forEach((client) => client.write(data));
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
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  const entry = getOrCreateEntry(orderId);

  // Send any already-received webhooks (catch-up)
  for (const event of entry.webhooks) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  entry.clients.add(res);
  req.on("close", () => entry.clients.delete(res));
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
    console.log(`[REQ] ${req.method} ${url}`);

    // ── Health check (works with or without ingress prefix) ──
    if (
      req.method === "GET" &&
      (url === "/health" ||
        url === "/mcp/health" ||
        url === "/webhook/health")
    ) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: ready ? "ok" : "loading",
          baseUrl: BASE_URL,
        })
      );
      return;
    }

    // ── Webhook relay routes ──
    // DO ingress sends /webhook/... — strip the prefix for matching
    const webhookPath = url.startsWith("/webhook")
      ? url.replace(/^\/webhook/, "")
      : null;

    if (webhookPath !== null) {
      const sseMatch = webhookPath.match(/^\/([^/]+)\/events\/?$/);
      const postMatch = webhookPath.match(/^\/([^/]+)\/?$/);

      if (sseMatch && req.method === "GET") {
        handleWebhookSSE(sseMatch[1], req, res);
        return;
      }

      if (postMatch && req.method === "POST") {
        handleWebhookPost(postMatch[1], req, res);
        return;
      }
    }

    // ── MCP refresh ──
    if (req.method === "POST" && (url === "/refresh" || url === "/mcp/refresh")) {
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

    // ── MCP protocol ──
    if (req.method === "POST") {
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

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`MCP protocol: POST /mcp`);
    console.log(`Webhook relay: /webhook/:orderId`);
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
