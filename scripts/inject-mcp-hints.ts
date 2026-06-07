/**
 * MCP Hint Injector
 *
 * Reads mcp_hint fields from the enriched OpenAPI spec and injects hidden JSX
 * spans into the corresponding generated .api.mdx files so the MCP server
 * indexes the hint text without it being visible to users.
 *
 * Runs after docusaurus gen-api-docs as part of npm run gen-api.
 * Reads from: static/Ottu_API_enriched.yaml  (written by npm run enrich-api)
 * Patches:    docs/developers/apis/*.api.mdx  (written by docusaurus gen-api-docs)
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";

const ROOT = path.resolve(__dirname, "..");
const SOURCES_FILE = path.join(ROOT, "static", "api-sources.yaml");
const API_DOCS_DIR = path.join(ROOT, "docs", "developers", "apis");

const INJECTION_ANCHOR = /^<Heading\s*\n\s*id=\{"request"\}/m;

interface SourceConfig {
  enrichedOutput: string;
}

interface ApiSourcesConfig {
  sources: Record<string, SourceConfig>;
}

function operationIdToFilename(operationId: string): string {
  return operationId.replace(/_/g, "-") + ".api.mdx";
}

function injectHint(mdxContent: string, hint: string): string {
  const span = `<span style={{display:"none"}}>${hint}</span>\n\n`;
  const match = INJECTION_ANCHOR.exec(mdxContent);
  if (!match) return mdxContent;
  return mdxContent.slice(0, match.index) + span + mdxContent.slice(match.index);
}

function processSource(enrichedSpecPath: string): number {
  if (!fs.existsSync(enrichedSpecPath)) {
    console.error(`  ERROR: Enriched spec not found: ${enrichedSpecPath}`);
    console.error(`  Run "npm run enrich-api" first.`);
    process.exit(1);
  }

  const spec = yaml.load(fs.readFileSync(enrichedSpecPath, "utf-8")) as any;
  const paths = spec.paths || {};
  let injected = 0;

  for (const pathItem of Object.values<any>(paths)) {
    for (const method of ["get", "post", "put", "patch", "delete", "options", "head"]) {
      const op = pathItem[method];
      if (!op?.mcp_hint || !op?.operationId) continue;

      const filename = operationIdToFilename(op.operationId);
      const mdxPath = path.join(API_DOCS_DIR, filename);

      if (!fs.existsSync(mdxPath)) {
        console.warn(`  WARN: No .api.mdx found for ${op.operationId} (expected ${filename})`);
        continue;
      }

      const original = fs.readFileSync(mdxPath, "utf-8");
      const patched = injectHint(original, op.mcp_hint);

      if (patched === original) {
        console.warn(`  WARN: Injection anchor not found in ${filename}`);
        continue;
      }

      fs.writeFileSync(mdxPath, patched, "utf-8");
      console.log(`  Injected hint into ${filename}`);
      injected++;
    }
  }

  return injected;
}

function main(): void {
  console.log("\nMCP Hint Injector");

  const config = yaml.load(fs.readFileSync(SOURCES_FILE, "utf-8")) as ApiSourcesConfig;
  let total = 0;

  for (const [name, source] of Object.entries(config.sources)) {
    console.log(`\n  ── ${name} ──`);
    const enrichedSpecPath = path.resolve(ROOT, source.enrichedOutput);
    total += processSource(enrichedSpecPath);
  }

  console.log(`\n  Done — ${total} file(s) patched\n`);
}

main();
