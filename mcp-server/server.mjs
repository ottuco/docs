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

async function start() {
  await fetchArtifacts();

  const mcpServer = new McpDocsServer({
    docsPath: DOCS_PATH,
    indexPath: INDEX_PATH,
    name: "ottu-docs",
    baseUrl: BASE_URL,
  });

  const httpServer = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", baseUrl: BASE_URL }));
      return;
    }

    // Refresh artifacts on demand
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

    if (req.method !== "POST") {
      res.writeHead(405);
      res.end();
      return;
    }

    // MCP protocol handler
    await mcpServer.handleHttpRequest(req, res);
  });

  httpServer.listen(PORT, () => {
    console.log(`MCP server listening on port ${PORT}`);
    console.log(`Base URL: ${BASE_URL}`);
  });
}

start().catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});
