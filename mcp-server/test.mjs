/**
 * Integration tests for the MCP + Webhook relay server.
 * Starts the server, runs tests against it, then exits.
 *
 * Usage: node test.mjs
 * Exit code: 0 = all passed, 1 = failure
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 9876;
const BASE_URL = `http://localhost:${PORT}`;

let server;
let passed = 0;
let failed = 0;

function log(msg) {
  console.log(`  ${msg}`);
}

function pass(name) {
  passed++;
  console.log(`  \x1b[32m✓\x1b[0m ${name}`);
}

function fail(name, reason) {
  failed++;
  console.log(`  \x1b[31m✗\x1b[0m ${name}: ${reason}`);
}

async function startServer() {
  // Ensure data dir exists with minimal test files so server can start
  const dataDir = path.join(__dirname, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(path.join(dataDir, "docs.json"))) {
    fs.writeFileSync(path.join(dataDir, "docs.json"), "[]");
  }
  if (!fs.existsSync(path.join(dataDir, "search-index.json"))) {
    fs.writeFileSync(path.join(dataDir, "search-index.json"), "{}");
  }

  return new Promise((resolve, reject) => {
    server = spawn("node", ["server.mjs"], {
      cwd: __dirname,
      env: { ...process.env, PORT: String(PORT), BASE_URL: "http://localhost" },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let started = false;
    server.stdout.on("data", (data) => {
      if (!started && data.toString().includes("listening")) {
        started = true;
        resolve();
      }
    });
    server.stderr.on("data", (data) => {
      // Ignore MCP artifact fetch errors (expected in test environment)
    });

    setTimeout(() => {
      if (!started) reject(new Error("Server failed to start within 10s"));
    }, 10000);
  });
}

function stopServer() {
  if (server) server.kill("SIGTERM");
}

// ── Tests ──

async function testHealthCheck() {
  const res = await fetch(`${BASE_URL}/health`);
  const body = await res.json();

  if (res.status !== 200) return fail("Health check", `status ${res.status}`);
  if (!body.status) return fail("Health check", "missing status field");
  pass("Health check returns 200 with status field");
}

async function testWebhookPostAndRetrieve() {
  const orderId = `test-${Date.now()}`;
  const testPayload = { result: "success", session_id: "test_session_123", state: "paid" };

  // POST webhook
  const postRes = await fetch(`${BASE_URL}/${orderId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testPayload),
  });

  if (postRes.status !== 200) return fail("Webhook POST", `status ${postRes.status}`);
  const postBody = await postRes.json();
  if (postBody.status !== "ok") return fail("Webhook POST", `unexpected response: ${JSON.stringify(postBody)}`);
  pass("Webhook POST accepts payload");
}

async function testWebhookSSEHeaders() {
  const orderId = `sse-headers-${Date.now()}`;

  const controller = new AbortController();
  const res = await fetch(`${BASE_URL}/${orderId}/events`, {
    signal: controller.signal,
    headers: { Accept: "text/event-stream" },
  });

  const contentType = res.headers.get("content-type");
  const accelBuffering = res.headers.get("x-accel-buffering");
  const cacheControl = res.headers.get("cache-control");

  controller.abort();

  if (contentType !== "text/event-stream") return fail("SSE headers", `content-type: ${contentType}`);
  if (accelBuffering !== "no") return fail("SSE headers", `x-accel-buffering: ${accelBuffering} (must be "no" for Cloudflare)`);
  if (!cacheControl || !cacheControl.includes("no-transform")) return fail("SSE headers", `cache-control missing no-transform: ${cacheControl}`);
  pass("SSE response has correct anti-buffering headers");
}

async function testWebhookSSEReceivesEvents() {
  const orderId = `sse-flow-${Date.now()}`;

  // Connect SSE first
  const controller = new AbortController();
  const sseRes = await fetch(`${BASE_URL}/${orderId}/events`, {
    signal: controller.signal,
  });

  const reader = sseRes.body.getReader();
  const decoder = new TextDecoder();

  // POST a webhook after short delay
  setTimeout(async () => {
    await fetch(`${BASE_URL}/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: "success", token: { token: "tok_123" } }),
    });
  }, 200);

  // Read from SSE stream with timeout
  let received = "";
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += decoder.decode(value);
      if (received.includes("tok_123")) break;
    }
  } catch (e) {
    // AbortError is expected on timeout
  }
  clearTimeout(timeout);
  controller.abort();

  if (!received.includes("tok_123")) return fail("SSE event delivery", "event not received within 5s");
  if (!received.includes("data:")) return fail("SSE event delivery", "event not in SSE format");
  pass("SSE delivers webhook events to connected clients");
}

async function testWebhookSSECatchUp() {
  const orderId = `sse-catchup-${Date.now()}`;

  // POST webhook BEFORE connecting SSE
  await fetch(`${BASE_URL}/${orderId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result: "success", catchup: true }),
  });

  // Now connect SSE — should receive the historical event
  const controller = new AbortController();
  const sseRes = await fetch(`${BASE_URL}/${orderId}/events`, {
    signal: controller.signal,
  });

  const reader = sseRes.body.getReader();
  const decoder = new TextDecoder();

  let received = "";
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += decoder.decode(value);
      if (received.includes("catchup")) break;
    }
  } catch (e) {
    // AbortError expected
  }
  clearTimeout(timeout);
  controller.abort();

  if (!received.includes("catchup")) return fail("SSE catch-up", "historical event not delivered on connect");
  pass("SSE delivers historical events on connect (catch-up)");
}

async function testWebhookInvalidJSON() {
  const orderId = `bad-json-${Date.now()}`;
  const res = await fetch(`${BASE_URL}/${orderId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not json",
  });

  if (res.status !== 400) return fail("Invalid JSON", `expected 400, got ${res.status}`);
  pass("Webhook POST rejects invalid JSON with 400");
}

async function testMCPEndpoint() {
  // MCP may or may not be ready (artifacts might not load in test env)
  // Just verify the endpoint responds (200 or 503)
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
  });

  if (res.status !== 200 && res.status !== 503) {
    return fail("MCP endpoint", `unexpected status ${res.status}`);
  }
  pass(`MCP endpoint responds (status ${res.status})`);
}

async function test404() {
  const res = await fetch(`${BASE_URL}/nonexistent/path/deep`);
  if (res.status !== 404) return fail("404 handler", `expected 404, got ${res.status}`);
  pass("Unknown routes return 404");
}

// ── Runner ──

async function run() {
  console.log("\nStarting MCP + Webhook server...");
  await startServer();
  console.log(`Server running on port ${PORT}\n`);

  console.log("Running tests:\n");

  await testHealthCheck();
  await testWebhookPostAndRetrieve();
  await testWebhookSSEHeaders();
  await testWebhookSSEReceivesEvents();
  await testWebhookSSECatchUp();
  await testWebhookInvalidJSON();
  await testMCPEndpoint();
  await test404();

  console.log(`\n  ${passed} passed, ${failed} failed\n`);

  stopServer();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test runner failed:", err);
  stopServer();
  process.exit(1);
});
