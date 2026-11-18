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
import http from "http";
import os from "os";
import { loadIndexer } from "docusaurus-plugin-mcp-server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 9876;
const BASE_URL = `http://localhost:${PORT}`;

let server;
let origin; // stands in for the docs site that serves /_mcp-data
const DOCS_ORIGIN_PORT = 9877;
const DOCS_ORIGIN = `http://localhost:${DOCS_ORIGIN_PORT}`;

// Must match the FlexSearch settings in server.mjs and docusaurus.config.ts.
const FLEXSEARCH = { tokenize: "strict", resolution: 3, context: false };

const page = (route, title, description, markdown, headings = []) => ({
  route,
  title,
  description,
  markdown,
  headings: headings.map((text) => ({ level: 2, text, id: text })),
});

// A handful of pages, indexed the same way the site build indexes the docs.
// "dashboard" and "merchant" are on every page on purpose.
const PAGES = [
  page("/", "Docs home", "Start here.", "Welcome, merchant. Open the dashboard."),
  page(
    "/business/users-and-access",
    "Users and Access",
    "Get the list of users on your account.",
    "Each merchant has users. In the dashboard, open Users to see the list of users.",
    ["How do I get the list of users on my account?"]
  ),
  page(
    "/business/users-and-access/password",
    "Change or Reset Your Password",
    "Change your password or have it reset.",
    "A merchant user can change the password in the dashboard, or ask for a password reset.",
    ["I forgot my password"]
  ),
  page(
    "/business/payment-management/export-transactions",
    "Export Transactions",
    "Export your transactions to a file.",
    "A merchant can export transactions from the dashboard to CSV.",
    ["How do I export my transactions?"]
  ),
  page(
    "/business/payment-management/settlements",
    "Settlements",
    "Where the money goes.",
    "The merchant bank settles payments. The dashboard shows each payment.",
    ["My customer paid but the money is not in my bank"]
  ),
];

async function startDocsOrigin() {
  const indexer = await loadIndexer("flexsearch", { flexsearch: FLEXSEARCH });
  await indexer.initialize({
    baseUrl: DOCS_ORIGIN,
    serverName: "test",
    serverVersion: "1.0.0",
    outputDir: os.tmpdir(),
  });
  await indexer.indexDocuments(PAGES);
  const artifacts = await indexer.finalize();
  origin = http.createServer((req, res) => {
    const name = (req.url || "").replace("/_mcp-data/", "");
    if (!artifacts.has(name)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(artifacts.get(name)));
  });
  await new Promise((resolve) => origin.listen(DOCS_ORIGIN_PORT, resolve));
}
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
  // The server downloads its docs and search index from BASE_URL/_mcp-data
  // at startup; here that is the local stand-in started above.
  await startDocsOrigin();

  return new Promise((resolve, reject) => {
    server = spawn("node", ["server.mjs"], {
      cwd: __dirname,
      env: { ...process.env, PORT: String(PORT), BASE_URL: DOCS_ORIGIN },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let started = false;
    let out = "";
    server.stdout.on("data", (data) => {
      out += data.toString();
      if (!started && out.includes("MCP server ready.")) {
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
  if (origin) origin.close();
}

// Calls an MCP tool the way a client does and returns the text it answers.
async function callTool(name, args) {
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name, arguments: args },
    }),
  });
  const raw = await res.text();
  const json = raw.trimStart().startsWith("{")
    ? raw
    : raw
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5))
        .join("");
  const body = JSON.parse(json);
  return (body.result?.content ?? []).map((c) => c.text).join("\n");
}

// The first address a docs_search answer lists.
function firstUrl(text) {
  const m = text.match(/https?:\/\/[^\s)]+/);
  return m ? m[0] : null;
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
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
  });

  if (res.status !== 200) {
    return fail("MCP endpoint", `unexpected status ${res.status}`);
  }
  const raw = await res.text();
  for (const tool of ["docs_search", "docs_fetch"]) {
    if (!raw.includes(tool)) return fail("MCP endpoint", `tools/list misses ${tool}`);
  }
  // our descriptions replace the plugin's defaults
  for (const hint of ["two or three specific words", "trailing slash"]) {
    if (!raw.includes(hint)) return fail("MCP endpoint", `tool description misses "${hint}"`);
  }
  pass("MCP endpoint lists docs_search and docs_fetch with our descriptions");
}

async function testFetchAcceptsAddressSpellings() {
  const page = `${DOCS_ORIGIN}/business/users-and-access`;
  const spellings = {
    "as indexed": page,
    "trailing slash": `${page}/`,
    "anchor": `${page}#how-do-i-get-the-list`,
    "slash and query": `${page}/?from=sitemap`,
  };
  for (const [label, url] of Object.entries(spellings)) {
    const text = await callTool("docs_fetch", { url });
    if (!text.includes("Users and Access")) {
      return fail(`docs_fetch ${label}`, `no page for ${url}: ${text.slice(0, 80)}`);
    }
  }
  pass("docs_fetch finds a page with a trailing slash, anchor or query on its address");
}

async function testFetchUnknownStaysNotFound() {
  const misses = {
    "unknown path": `${DOCS_ORIGIN}/business/nope/`,
    "other host": "https://example.com/business/users-and-access",
  };
  for (const [label, url] of Object.entries(misses)) {
    const text = await callTool("docs_fetch", { url });
    if (!text.includes("Page not found")) {
      return fail(`docs_fetch ${label}`, `expected not found, got: ${text.slice(0, 80)}`);
    }
  }
  pass("docs_fetch still answers not found for unknown paths and other hosts");
}

async function testSearchSurvivesMissingAndCommonWords() {
  const cases = {
    // "forgotten" is on no page; "dashboard" is on every page
    "forgotten dashboard password reset": "/business/users-and-access/password",
    "merchant dashboard list users": "/business/users-and-access",
    "merchant export transactions dashboard": "/business/payment-management/export-transactions",
    // already worked before: several words, all on the page
    "password reset": "/business/users-and-access/password",
    // one word goes to the plugin unchanged
    settlements: "/business/payment-management/settlements",
    // only the first eight words are searched; the rest, which point at the
    // home page, are ignored
    "export transactions csv file merchant dashboard your to welcome open start docs home here": "/business/payment-management/export-transactions",
  };
  for (const [query, route] of Object.entries(cases)) {
    const text = await callTool("docs_search", { query });
    const first = firstUrl(text);
    if (first !== `${DOCS_ORIGIN}${route}`) {
      return fail(`docs_search "${query}"`, `first result ${first}, expected ${route}`);
    }
  }
  pass("docs_search ranks the right page first despite missing or common words");
}

async function testSearchNoMatch() {
  const text = await callTool("docs_search", { query: "zebra xylophone" });
  if (firstUrl(text)) return fail("docs_search no match", `got ${firstUrl(text)}`);
  pass("docs_search returns no page when no word matches");
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
  await testFetchAcceptsAddressSpellings();
  await testFetchUnknownStaysNotFound();
  await testSearchSurvivesMissingAndCommonWords();
  await testSearchNoMatch();
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
