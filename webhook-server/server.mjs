import http from "http";

const PORT = process.env.PORT || 3457;

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
    .catch(() => {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON body" }));
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

  // Send any previously received webhooks as catch-up
  for (const event of entry.webhooks) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  entry.clients.add(res);
  req.on("close", () => entry.clients.delete(res));
}

// ── HTTP Server ──────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── Webhook relay routes ──
  // Match both /webhook/{id} (full path) and /{id} (DO may strip prefix)
  const path = req.url?.replace(/^\/webhook/, "") || "";
  const postMatch = path.match(/^\/([^/]+)\/?$/);
  const sseMatch = path.match(/^\/([^/]+)\/events\/?$/);

  if (sseMatch && req.method === "GET") {
    handleWebhookSSE(sseMatch[1], req, res);
    return;
  }

  if (postMatch && postMatch[1] !== "health" && req.method === "POST") {
    handleWebhookPost(postMatch[1], req, res);
    return;
  }

  // ── Health check ──
  if (req.method === "GET" && (req.url === "/health" || req.url === "/webhook/health" || path === "/health")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Webhook relay server listening on port ${PORT}`);
});
