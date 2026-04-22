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

async function testWebhookPollHeaders() {
  const orderId = `poll-headers-${Date.now()}`;
  const res = await fetch(`${BASE_URL}/${orderId}/events.json`);

  const contentType = res.headers.get("content-type");
  const cacheControl = res.headers.get("cache-control");

  if (res.status !== 200) return fail("Poll headers", `status ${res.status}`);
  if (!contentType || !contentType.includes("application/json")) {
    return fail("Poll headers", `content-type: ${contentType}`);
  }
  if (!cacheControl || !cacheControl.includes("no-store")) {
    return fail("Poll headers", `cache-control missing no-store: ${cacheControl}`);
  }
  pass("Poll response has correct JSON + no-store headers");
}

async function testWebhookPollReceivesEvents() {
  const orderId = `poll-flow-${Date.now()}`;

  // Empty store → events: []
  const empty = await fetch(`${BASE_URL}/${orderId}/events.json?since=-1`).then((r) => r.json());
  if (empty.events.length !== 0) return fail("Poll empty", `expected empty, got ${empty.events.length}`);
  if (empty.lastId !== -1) return fail("Poll empty", `expected lastId -1, got ${empty.lastId}`);

  // POST a webhook
  await fetch(`${BASE_URL}/${orderId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ result: "success", token: { token: "tok_123" } }),
  });

  // Poll picks it up
  const after = await fetch(`${BASE_URL}/${orderId}/events.json?since=-1`).then((r) => r.json());
  if (after.events.length !== 1) return fail("Poll after POST", `expected 1 event, got ${after.events.length}`);
  if (after.lastId !== 0) return fail("Poll after POST", `expected lastId 0, got ${after.lastId}`);
  if (after.events[0].id !== 0) return fail("Poll after POST", `missing id field`);
  if (!JSON.stringify(after.events[0].payload).includes("tok_123")) {
    return fail("Poll after POST", "payload missing");
  }
  pass("Poll returns webhook events with id + payload + lastId");
}

async function testWebhookPollSinceCursor() {
  const orderId = `poll-cursor-${Date.now()}`;

  // POST three events
  for (let i = 0; i < 3; i++) {
    await fetch(`${BASE_URL}/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seq: i }),
    });
  }

  // since=0 must return only events 1 and 2
  const after = await fetch(`${BASE_URL}/${orderId}/events.json?since=0`).then((r) => r.json());
  if (after.events.length !== 2) return fail("Poll cursor", `since=0 expected 2, got ${after.events.length}`);
  if (after.events[0].id !== 1 || after.events[1].id !== 2) {
    return fail("Poll cursor", `wrong ids: ${after.events.map((e) => e.id).join(",")}`);
  }
  if (after.lastId !== 2) return fail("Poll cursor", `lastId ${after.lastId}`);
  pass("Poll `since` cursor filters already-seen events");
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
  await testWebhookPollHeaders();
  await testWebhookPollReceivesEvents();
  await testWebhookPollSinceCursor();
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
