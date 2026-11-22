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
import v8 from "v8";
import vm from "vm";
import { loadIndexer } from "docusaurus-plugin-mcp-server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 9876;
const BASE_URL = `http://localhost:${PORT}`;
// Test value only: the spawned server requires it on POST /refresh.
const REFRESH_TOKEN = "test-refresh-token";

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
      env: { ...process.env, PORT: String(PORT), BASE_URL: DOCS_ORIGIN, MCP_REFRESH_TOKEN: REFRESH_TOKEN },
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

// ── Security limits (#161374) ────────────────────────────────────────────────
// In-process checks of the seed-wallet proxy, the webhook store and the rate
// limit key. They import server.mjs, which must not listen when imported.

let lib = null;
async function loadServerModule() {
  if (lib) return lib;
  // Point a module that still listens on import at harmless local values.
  process.env.PORT = process.env.PORT || "9878";
  process.env.BASE_URL = process.env.BASE_URL || DOCS_ORIGIN;
  lib = await import("./server.mjs");
  return lib;
}

// Stand-ins for Keycloak and the wallet service. Nothing leaves the machine.
function fakeUpstream({ status = 200, body = '{"balance":"10.00","currency":"USD","account_uuid":"acc-1"}', throwOn } = {}) {
  const calls = [];
  return {
    calls,
    getToken: async () => {
      if (throwOn === "token") throw new Error("Keycloak said: internal detail 42");
      return "test-token";
    },
    fetch: async (url, init) => {
      calls.push({ url, init });
      if (throwOn === "fetch") throw new Error("connect ECONNREFUSED 10.1.2.3:443");
      return new Response(body, { status, headers: { "Content-Type": "application/json" } });
    },
  };
}

// Runs one handler on one request through a real local HTTP server and returns
// { status, body }.
async function runHandler(handler, { headers = {}, body }) {
  const srv = http.createServer((req, res) => handler(req, res));
  await new Promise((r) => srv.listen(0, r));
  const { port } = srv.address();
  try {
    const res = await fetch(`http://localhost:${port}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ottu-demo": "seed-wallet", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
    return { status: res.status, body: await res.text() };
  } finally {
    srv.close();
  }
}

const DEMO_SEED = { customer_id: "demo_ab12cd34", currency: "USD", amount: "10.00", pg_code: "ottu-sandbox-usd" };

// The seed handler as it was on main before #161374, kept here word for word
// (only fetch and the token call are passed in, and the masked random tag
// comes from crypto) so the test can run the old
// path next to the new one.
function legacySeedHandler({ fetch: fetchImpl, getToken, merchant }) {
  return async function handleSeedWallet(req, res) {
    let body;
    try {
      body = await new Promise((resolve, reject) => {
        let b = "";
        req.on("data", (c) => (b += c));
        req.on("end", () => { try { resolve(JSON.parse(b)); } catch { reject(new Error("Invalid JSON")); } });
        req.on("error", reject);
      });
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
    let token;
    try {
      token = await getToken({});
    } catch (err) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "keycloak_error", message: err.message }));
      return;
    }
    const idempotencyKey = crypto.randomUUID();
    // The old code used Math.random here; the tag is masked before comparing,
    // so the frozen copy takes it from crypto (CodeQL js/insecure-randomness).
    const demoTag = `demo_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
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
          customer_id, currency, amount,
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
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "upstream_unreachable", message: err.message }));
      return;
    }
    const text = await upstream.text();
    res.writeHead(upstream.status, { "Content-Type": "application/json" });
    res.end(text);
  };
}

// Drops the per-call random parts so two runs can be compared.
function normalizeWalletCall(call) {
  const body = JSON.parse(call.init.body);
  for (const k of ["session_id", "reference_number", "order_no"]) body[k] = body[k].replace(/demo_\d+_[a-z0-9]+/, "demo_TAG");
  const headers = { ...call.init.headers, "Idempotency-Key": "KEY" };
  return JSON.stringify({ url: call.url, method: call.init.method, headers, body });
}

async function testSeedNormalRunUnchanged() {
  const name = "Seed wallet: a normal demo run is the same as before";
  try {
    const { handleSeedWallet, SANDBOX_MERCHANT } = await loadServerModule();
    if (typeof handleSeedWallet !== "function") return fail(name, "server.mjs does not export handleSeedWallet");
    const oldUp = fakeUpstream();
    const newUp = fakeUpstream();
    const before = await runHandler(legacySeedHandler({ ...oldUp, merchant: SANDBOX_MERCHANT }), { body: DEMO_SEED });
    const after = await runHandler((req, res) => handleSeedWallet(req, res, newUp), { body: DEMO_SEED });
    if (before.status !== after.status || before.body !== after.body) {
      return fail(name, `client answer differs: ${before.status} ${before.body} vs ${after.status} ${after.body}`);
    }
    if (oldUp.calls.length !== 1 || newUp.calls.length !== 1) return fail(name, "wallet not called once");
    if (normalizeWalletCall(oldUp.calls[0]) !== normalizeWalletCall(newUp.calls[0])) {
      return fail(name, `wallet request differs:\n${normalizeWalletCall(oldUp.calls[0])}\n${normalizeWalletCall(newUp.calls[0])}`);
    }
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

async function testSeedRejectsOutOfRangeValues() {
  const name = "Seed wallet: amount over the cap, unknown currency, odd ids get 400";
  try {
    const { handleSeedWallet } = await loadServerModule();
    if (typeof handleSeedWallet !== "function") return fail(name, "server.mjs does not export handleSeedWallet");
    const cases = {
      "big amount": { ...DEMO_SEED, amount: "999999999" },
      "amount over cap": { ...DEMO_SEED, amount: "100.01" },
      "zero amount": { ...DEMO_SEED, amount: "0" },
      "amount not a number": { ...DEMO_SEED, amount: "ten" },
      "currency": { ...DEMO_SEED, currency: "EUR" },
      "customer without demo prefix": { ...DEMO_SEED, customer_id: "x" },
      "customer with odd characters": { ...DEMO_SEED, customer_id: "demo_<b>hi</b>" },
      "pg_code with odd characters": { ...DEMO_SEED, pg_code: "a/b" },
    };
    for (const [label, body] of Object.entries(cases)) {
      // The old handler sent each of these to the wallet.
      const oldUp = fakeUpstream();
      const old = await runHandler(legacySeedHandler({ ...oldUp, merchant: lib.SANDBOX_MERCHANT }), { body });
      if (old.status !== 200 || oldUp.calls.length !== 1) return fail(name, `${label}: the old handler did not accept it`);
      const up = fakeUpstream();
      const r = await runHandler((req, res) => handleSeedWallet(req, res, up), { body });
      if (r.status !== 400) return fail(name, `${label}: expected 400, got ${r.status}`);
      if (up.calls.length !== 0) return fail(name, `${label}: wallet was called`);
    }
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

async function testSeedErrorsHideUpstreamText() {
  const name = "Seed wallet: errors give a fixed code, never the upstream text";
  try {
    const { handleSeedWallet } = await loadServerModule();
    if (typeof handleSeedWallet !== "function") return fail(name, "server.mjs does not export handleSeedWallet");
    const cases = [
      ["token", fakeUpstream({ throwOn: "token" }), 502, "keycloak_error"],
      ["fetch", fakeUpstream({ throwOn: "fetch" }), 502, "upstream_unreachable"],
      ["wallet 500", fakeUpstream({ status: 500, body: '{"detail":"internal detail 42"}' }), 500, "wallet_error"],
    ];
    for (const [label, up, status, code] of cases) {
      const r = await runHandler((req, res) => handleSeedWallet(req, res, up), { body: DEMO_SEED });
      if (r.status !== status) return fail(name, `${label}: expected ${status}, got ${r.status}`);
      if (r.body !== JSON.stringify({ error: code })) return fail(name, `${label}: body ${r.body}`);
    }
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

async function testRateLimitKeyIgnoresCallerHeader() {
  const name = "Seed rate limit keys on the proxy's address, not the caller's X-Forwarded-For";
  try {
    const { clientIp } = await loadServerModule();
    if (typeof clientIp !== "function") return fail(name, "server.mjs does not export clientIp");
    const sock = { remoteAddress: "10.0.0.9" };
    const checks = [
      // caller wrote 1.1.1.1 first; the proxy appended the real address last
      [{ headers: { "x-forwarded-for": "1.1.1.1, 203.0.113.7" }, socket: sock }, "203.0.113.7"],
      [{ headers: { "do-connecting-ip": "198.51.100.4", "x-forwarded-for": "1.1.1.1" }, socket: sock }, "198.51.100.4"],
      [{ headers: {}, socket: sock }, "10.0.0.9"],
    ];
    for (const [req, want] of checks) {
      const got = clientIp(req);
      if (got !== want) return fail(name, `expected ${want}, got ${got}`);
    }
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

async function testRateLimitMapIsPruned() {
  const name = "Seed rate limit counters are pruned";
  try {
    const { checkSeedRateLimit, pruneSeedRateLimits, seedRateLimits } = await loadServerModule();
    if (typeof pruneSeedRateLimits !== "function") return fail(name, "server.mjs does not export pruneSeedRateLimits");
    seedRateLimits.clear();
    const t0 = 1_000_000;
    for (let i = 0; i < 50; i++) {
      checkSeedRateLimit({ headers: { "do-connecting-ip": `192.0.2.${i}` }, socket: {} }, t0);
    }
    if (seedRateLimits.size === 0) return fail(name, "no counters were recorded");
    pruneSeedRateLimits(t0 + 120_000);
    if (seedRateLimits.size !== 0) return fail(name, `${seedRateLimits.size} stale counters left`);
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

async function testPollDoesNotCreateEntries() {
  const name = "Polling an unknown order id stores nothing";
  try {
    const { webhookStore } = await loadServerModule();
    if (!(webhookStore instanceof Map)) return fail(name, "server.mjs does not export webhookStore");
    const before = webhookStore.size;
    // the spawned server is a different process; use the in-process handler
    const { handleWebhookPoll } = lib;
    const srv = http.createServer((req, res) => handleWebhookPoll("never-posted-1", req, res));
    await new Promise((r) => srv.listen(0, r));
    const r = await fetch(`http://localhost:${srv.address().port}/never-posted-1/events.json`).then((x) => x.json());
    srv.close();
    if (JSON.stringify(r) !== JSON.stringify({ events: [], lastId: -1 })) return fail(name, `answer ${JSON.stringify(r)}`);
    if (webhookStore.size !== before) return fail(name, "poll created a store entry");
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

async function testSeedBodyCap() {
  const name = "Seed wallet: a body over 4 KB gets 413 and the wallet is not called";
  try {
    const { handleSeedWallet } = await loadServerModule();
    const up = fakeUpstream();
    const r = await runHandler((req, res) => handleSeedWallet(req, res, up), { body: { ...DEMO_SEED, pad: "x".repeat(5 * 1024) } });
    if (r.status !== 413) return fail(name, `expected 413, got ${r.status}`);
    if (up.calls.length !== 0) return fail(name, "wallet was called");
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

async function testSeedWalletCallOptions() {
  const name = "Seed wallet: the wallet call refuses redirects and has a timeout";
  try {
    const { handleSeedWallet } = await loadServerModule();
    const up = fakeUpstream();
    await runHandler((req, res) => handleSeedWallet(req, res, up), { body: DEMO_SEED });
    const init = up.calls[0]?.init;
    if (!init) return fail(name, "wallet not called");
    if (init.redirect !== "error") return fail(name, `redirect is ${init.redirect}`);
    if (!(init.signal instanceof AbortSignal)) return fail(name, "no timeout signal");
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

// CodeQL js/insecure-randomness: the demo tag must not come from Math.random.
async function testSeedTagNotFromMathRandom() {
  const name = "Seed wallet: demo tags differ even when Math.random repeats";
  const realRandom = Math.random;
  const realNow = Date.now;
  try {
    const { handleSeedWallet } = await loadServerModule();
    Math.random = () => 0.123456789;
    Date.now = () => 1_700_000_000_000;
    const up = fakeUpstream();
    for (let i = 0; i < 2; i++) {
      await runHandler((req, res) => handleSeedWallet(req, res, up), { body: DEMO_SEED });
    }
    Math.random = realRandom;
    Date.now = realNow;
    if (up.calls.length !== 2) return fail(name, `wallet called ${up.calls.length} times`);
    const [a, b] = up.calls.map((c) => JSON.parse(c.init.body).session_id);
    if (!/^sess_demo_\d+_[a-z0-9]{8}$/.test(a)) return fail(name, `tag shape changed: ${a}`);
    if (a === b) return fail(name, "two seeds got the same tag");
    pass(name);
  } catch (err) {
    fail(name, err.message);
  } finally {
    Math.random = realRandom;
    Date.now = realNow;
  }
}

// Runs last among the seed checks: it fills the shared global counter.
async function testSeedGlobalLimit() {
  const name = "Seed rate limit: 300 a minute for all callers together";
  try {
    const { checkSeedRateLimit } = await loadServerModule();
    // A minute ahead, so the counts of the checks above have expired.
    const t = Date.now() + 10 * 60_000;
    const req = (i) => ({ headers: { "do-connecting-ip": `198.18.${i >> 8}.${i & 255}` }, socket: {} });
    for (let i = 0; i < 300; i++) {
      if (!checkSeedRateLimit(req(i), t)) return fail(name, `call ${i + 1} refused`);
    }
    if (checkSeedRateLimit(req(300), t)) return fail(name, "301st call from a new address allowed");
    if (!checkSeedRateLimit(req(301), t + 61_000)) return fail(name, "still refused a minute later");
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

// Posts each [orderId, text] to the in-process relay handler; returns the statuses.
async function postToRelay(pairs) {
  const { handleWebhookPost } = lib;
  const srv = http.createServer((req, res) => handleWebhookPost(decodeURIComponent(req.url.slice(1)), req, res));
  await new Promise((r) => srv.listen(0, r));
  const statuses = [];
  try {
    for (const [orderId, text] of pairs) {
      const res = await fetch(`http://localhost:${srv.address().port}/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });
      await res.text();
      statuses.push(res.status);
    }
  } finally {
    srv.close();
  }
  return statuses;
}

async function pollRelay(orderId, query = "") {
  const { handleWebhookPoll } = lib;
  const srv = http.createServer((req, res) => handleWebhookPoll(orderId, req, res));
  await new Promise((r) => srv.listen(0, r));
  try {
    return await fetch(`http://localhost:${srv.address().port}/${orderId}/events.json${query}`).then((r) => r.text());
  } finally {
    srv.close();
  }
}

function heapAfterGc() {
  v8.setFlagsFromString("--expose-gc");
  const gc = vm.runInNewContext("gc");
  gc();
  gc();
  return process.memoryUsage().heapUsed;
}

async function testRelayMemoryFollowsBytes() {
  const name = "Webhook relay: what it keeps costs about the bytes it was sent";
  try {
    const { handleWebhookPost } = await loadServerModule();
    if (typeof handleWebhookPost !== "function") return fail(name, "server.mjs does not export handleWebhookPost");
    // 63 KB of empty objects: small as text, large as parsed objects.
    const body = `[${new Array(21000).fill("{}").join(",")}]`;
    const pairs = Array.from({ length: 40 }, (_, i) => [`mem-${Date.now()}-${i}`, body]);
    const before = heapAfterGc();
    const statuses = await postToRelay(pairs);
    const grew = heapAfterGc() - before;
    if (statuses.some((s) => s !== 200)) return fail(name, `not all accepted: ${statuses.join(",")}`);
    const sent = body.length * pairs.length;
    const mb = (n) => (n / 1048576).toFixed(1);
    if (grew > sent * 4) return fail(name, `heap grew ${mb(grew)} MB for ${mb(sent)} MB of bodies`);
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

async function testRelayBytesPerOrderCap() {
  const name = "Webhook relay: one order id keeps at most about 2 MB";
  try {
    const { handleWebhookPost } = await loadServerModule();
    if (typeof handleWebhookPost !== "function") return fail(name, "server.mjs does not export handleWebhookPost");
    const orderId = `order-bytes-${Date.now()}`;
    const body = JSON.stringify({ pad: "x".repeat(60 * 1024) });
    const statuses = await postToRelay(Array.from({ length: 20 }, () => [orderId, body]));
    if (statuses[0] !== 200) return fail(name, `first event got ${statuses[0]}`);
    if (statuses[19] !== 429) return fail(name, `20th event of 60 KB: expected 429, got ${statuses[19]}`);
    const answer = await pollRelay(orderId);
    if (answer.length > 2 * 1024 * 1024) return fail(name, `poll answer is ${answer.length} bytes`);
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

// The relay as it was on main before #161374 (store and poll), kept word for
// word so the poll answers can be compared byte for byte.
function legacyRelay() {
  const webhookStore = new Map();
  return {
    post(orderId, text) {
      const payload = JSON.parse(text);
      if (!webhookStore.has(orderId)) webhookStore.set(orderId, { webhooks: [], createdAt: Date.now() });
      webhookStore.get(orderId).webhooks.push({ payload, receivedAt: new Date().toISOString() });
    },
    poll(orderId, url) {
      const webhooks = webhookStore.get(orderId)?.webhooks ?? [];
      const sinceParam = new URL(url, "http://x").searchParams.get("since");
      const since = Number.parseInt(sinceParam ?? "-1", 10);
      const startIdx = Number.isFinite(since) ? since + 1 : 0;
      const events = [];
      for (let i = startIdx; i < webhooks.length; i++) {
        events.push({ id: i, ...webhooks[i] });
      }
      return JSON.stringify({ events, lastId: webhooks.length - 1 });
    },
  };
}

async function testRelayPollAnswerUnchanged() {
  const name = "Webhook relay: poll answers are byte for byte the same as before";
  try {
    const { handleWebhookPost } = await loadServerModule();
    if (typeof handleWebhookPost !== "function") return fail(name, "server.mjs does not export handleWebhookPost");
    const texts = [
      JSON.stringify({ result: "success", session_id: "s1", state: "paid", amount: "10.000", token: { token: "tok_1" } }),
      '{ "spaced" : [1, 2.50, -0, 1e3, null, true], "nested": {"a": {"b": []}} }',
      JSON.stringify({ quote: 'say "hi"', slash: "a\\b", line: "a b", arabic: "مرحبا", emoji: "\u{1F600}" }),
      '"just a string"',
      "null",
      "42",
      "[]",
    ];
    const orderId = `same-${Date.now()}`;
    const old = legacyRelay();
    for (const t of texts) old.post(orderId, t);
    const statuses = await postToRelay(texts.map((t) => [orderId, t]));
    if (statuses.some((s) => s !== 200)) return fail(name, `not all accepted: ${statuses.join(",")}`);
    const stamp = (s) => s.replace(/"receivedAt":"[^"]+"/g, '"receivedAt":"T"');
    // A `since` below -1 is left out on purpose: it now answers like -1 (see
    // testRelayPollNegativeSince); the demo never sends one.
    for (const q of ["", "?since=-1", "?since=0", "?since=3", "?since=99", "?since=abc"]) {
      const before = stamp(old.poll(orderId, `/${orderId}/events.json${q}`));
      const after = stamp(await pollRelay(orderId, q));
      if (before !== after) return fail(name, `since ${q || "(none)"} differs:\n${before}\n${after}`);
    }
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

async function testRelayPollNegativeSince() {
  const name = "Webhook relay: a `since` below -1 answers like -1, fast and small";
  try {
    await loadServerModule();
    const unknown = `never-posted-neg-${Date.now()}`;
    const empty = '{"events":[],"lastId":-1}';
    // Cheap values first, so the old code fails here before the big one.
    for (const q of ["?since=-2", "?since=-100000"]) {
      const answer = await pollRelay(unknown, q);
      if (answer !== empty) return fail(name, `unknown id ${q}: ${answer.length} bytes, expected ${empty}`);
    }
    const t0 = Date.now();
    const big = await pollRelay(unknown, "?since=-100000000");
    const ms = Date.now() - t0;
    if (big !== empty) return fail(name, `unknown id since=-100000000: ${big.length} bytes`);
    if (ms > 1000) return fail(name, `unknown id since=-100000000 took ${ms} ms`);
    // On an id with events, a negative `since` gives the same answer as -1.
    const orderId = `neg-${Date.now()}`;
    const statuses = await postToRelay([[orderId, '{"a":1}'], [orderId, '{"b":2}']]);
    if (statuses.some((s) => s !== 200)) return fail(name, `not all accepted: ${statuses.join(",")}`);
    const fromStart = await pollRelay(orderId, "?since=-1");
    for (const q of ["?since=-3", "?since=-100000000"]) {
      const answer = await pollRelay(orderId, q);
      if (answer !== fromStart) return fail(name, `${q} differs from since=-1:\n${answer.slice(0, 200)}\n${fromStart}`);
    }
    pass(name);
  } catch (err) {
    fail(name, err.message);
  }
}

// Spawned-server checks: the real routes.

async function testWebhookBodyCap() {
  const res = await fetch(`${BASE_URL}/big-body-${Date.now()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pad: "x".repeat(70 * 1024) }),
  }).catch((e) => ({ status: `error ${e.message}` }));
  if (res.status !== 413) return fail("Webhook body cap", `expected 413, got ${res.status}`);
  pass("Webhook POST over 64 KB gets 413");
}

async function testWebhookOrderIdFormat() {
  for (const id of ["a".repeat(65), "bad.id", "bad%20id"]) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (res.status !== 400) return fail("Webhook order id format", `${id.slice(0, 12)}: expected 400, got ${res.status}`);
  }
  pass("Webhook POST with a malformed order id gets 400");
}

async function testWebhookEventsPerOrderCap() {
  const orderId = `cap-${Date.now()}`;
  let last;
  for (let i = 0; i < 101; i++) {
    last = await fetch(`${BASE_URL}/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seq: i }),
    });
  }
  if (last.status !== 429) return fail("Webhook events cap", `101st event: expected 429, got ${last.status}`);
  const poll = await fetch(`${BASE_URL}/${orderId}/events.json`).then((r) => r.json());
  if (poll.events.length !== 100) return fail("Webhook events cap", `stored ${poll.events.length}`);
  pass("Webhook relay keeps at most 100 events per order id");
}

async function testRefreshNeedsToken() {
  const noToken = await fetch(`${BASE_URL}/refresh`, { method: "POST" });
  if (noToken.status !== 401) return fail("Refresh token", `no token: expected 401, got ${noToken.status}`);
  const wrong = await fetch(`${BASE_URL}/refresh`, { method: "POST", headers: { "x-mcp-refresh-token": "wrong" } });
  if (wrong.status !== 401) return fail("Refresh token", `wrong token: expected 401, got ${wrong.status}`);
  const ok = await fetch(`${BASE_URL}/refresh`, { method: "POST", headers: { "x-mcp-refresh-token": REFRESH_TOKEN } });
  if (ok.status !== 200) return fail("Refresh token", `right token: expected 200, got ${ok.status}`);
  const again = await fetch(`${BASE_URL}/refresh`, { method: "POST", headers: { "x-mcp-refresh-token": REFRESH_TOKEN } });
  if (again.status !== 429) return fail("Refresh cooldown", `second run within a minute: expected 429, got ${again.status}`);
  pass("POST /refresh needs the token when one is set, and runs at most once a minute");
}

const MCP_HEADERS = { "Content-Type": "application/json", Accept: "application/json, text/event-stream" };
const paddedToolsList = (bytes) =>
  JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: { _meta: { pad: "x".repeat(bytes) } } });

async function testMcpBodyCap() {
  const res = await fetch(`${BASE_URL}/`, { method: "POST", headers: MCP_HEADERS, body: paddedToolsList(300 * 1024) })
    .catch((e) => ({ status: `error ${e.message}` }));
  if (res.status !== 413) return fail("MCP body cap", `300 KB request: expected 413, got ${res.status}`);
  pass("MCP POST over 256 KB gets 413");
}

async function testMcpUnderCapUnchanged() {
  const big = await fetch(`${BASE_URL}/`, { method: "POST", headers: MCP_HEADERS, body: paddedToolsList(200 * 1024) });
  const raw = await big.text();
  if (big.status !== 200 || !raw.includes("docs_search")) return fail("MCP under the cap", `200 KB request: ${big.status}`);
  // A body that is not JSON still gets the MCP SDK's own answer.
  const bad = await fetch(`${BASE_URL}/`, { method: "POST", headers: MCP_HEADERS, body: "not json" });
  const badBody = await bad.json().catch(() => null);
  if (bad.status !== 400 || badBody?.error?.code !== -32700 || badBody?.error?.message !== "Parse error: Invalid JSON") {
    return fail("MCP under the cap", `invalid JSON: ${bad.status} ${JSON.stringify(badBody)}`);
  }
  pass("MCP POST under 256 KB and invalid JSON are answered as before");
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
  await testWebhookBodyCap();
  await testWebhookOrderIdFormat();
  await testWebhookEventsPerOrderCap();
  await testRefreshNeedsToken();
  await testMcpBodyCap();
  await testMcpUnderCapUnchanged();

  console.log("\nIn-process security checks:\n");
  await testSeedNormalRunUnchanged();
  await testSeedRejectsOutOfRangeValues();
  await testSeedErrorsHideUpstreamText();
  await testRateLimitKeyIgnoresCallerHeader();
  await testRateLimitMapIsPruned();
  await testPollDoesNotCreateEntries();
  await testSeedBodyCap();
  await testSeedWalletCallOptions();
  await testSeedTagNotFromMathRandom();
  await testSeedGlobalLimit();
  await testRelayMemoryFollowsBytes();
  await testRelayBytesPerOrderCap();
  await testRelayPollAnswerUnchanged();
  await testRelayPollNegativeSince();

  console.log(`\n  ${passed} passed, ${failed} failed\n`);

  stopServer();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test runner failed:", err);
  stopServer();
  process.exit(1);
});
