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

async function fetchArtifacts() {
  console.log(`Fetching MCP artifacts from ${BASE_URL}...`);

  const [docsRes, indexRes] = await Promise.all([
    fetch(`${BASE_URL}/mcp/docs.json`),
    fetch(`${BASE_URL}/mcp/search-index.json`),
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
  console.log(`Artifacts loaded: docs.json (${docsSize}KB), search-index.json (${indexSize}KB)`);
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

async function start() {
  // Start the HTTP server first so health checks pass while artifacts load
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

    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: ready ? "ok" : "loading", baseUrl: BASE_URL }));
      return;
    }

    if (req.method === "POST" && req.url === "/refresh") {
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

    if (!ready || !mcpServer) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "MCP server is loading artifacts, please retry shortly" }));
      return;
    }

    if (req.method !== "POST") {
      res.writeHead(405);
      res.end();
      return;
    }

    await mcpServer.handleHttpRequest(req, res);
  });

  httpServer.listen(PORT, () => {
    console.log(`HTTP server listening on port ${PORT}`);
    console.log(`Base URL: ${BASE_URL}`);
  });

  // Fetch artifacts with retry (static site may still be deploying)
  await fetchWithRetry();

  mcpServer = new McpDocsServer({
    docsPath: DOCS_PATH,
    indexPath: INDEX_PATH,
    name: "ottu-docs",
    baseUrl: BASE_URL,
  });

  ready = true;
  console.log("MCP server ready.");
}

start().catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});
