/**
 * Fetch API Schema from Ottu Core
 *
 * Downloads OpenAPI schemas from Ottu core endpoints and saves them
 * as YAML files. Reads source configuration from static/api-sources.yaml.
 *
 * Usage:
 *   tsx scripts/fetch-api-schema.ts                    # Fetch all sources
 *   tsx scripts/fetch-api-schema.ts --source=payments  # Fetch one source
 *
 * Environment variables:
 *   OTTU_SCHEMA_URL  — Base URL of the Ottu core instance
 *   OTTU_API_KEY     — API key for authentication (optional)
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";

// ── Paths ────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, "..");
const SOURCES_FILE = path.join(ROOT, "static", "api-sources.yaml");

// ── Types ────────────────────────────────────────────────────────────────────

interface Source {
  url: string;
  output: string;
  enrichedOutput: string;
  enrichments: string;
  pluginId: string;
}

interface ApiSourcesConfig {
  sources: Record<string, Source>;
  defaults: {
    schemaUrl: string;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve ${ENV_VAR} placeholders in a string.
 * Falls back to defaults for known variables.
 */
function resolveEnvVars(text: string, defaults: Record<string, string>): string {
  return text.replace(/\$\{(\w+)\}/g, (match, varName) => {
    if (process.env[varName]) {
      return process.env[varName]!;
    }
    // Map known env vars to defaults
    if (varName === "OTTU_SCHEMA_URL" && defaults.schemaUrl) {
      return defaults.schemaUrl;
    }
    console.warn(`  WARN: Environment variable ${varName} not set, no default available`);
    return match;
  });
}

/**
 * Parse CLI arguments for --source=name
 */
function parseArgs(): { source?: string } {
  const args: { source?: string } = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--source=")) {
      args.source = arg.slice("--source=".length);
    }
  }
  return args;
}

/**
 * Validate that the fetched data looks like a valid OpenAPI spec.
 */
function validateSpec(data: any, sourceName: string): boolean {
  if (!data.openapi) {
    console.error(`  ERROR: [${sourceName}] Missing 'openapi' version field`);
    return false;
  }
  if (!data.paths || typeof data.paths !== "object") {
    console.error(`  ERROR: [${sourceName}] Missing or invalid 'paths' field`);
    return false;
  }
  return true;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("\nFetch API Schema\n");

  // Load config
  if (!fs.existsSync(SOURCES_FILE)) {
    console.error(`ERROR: Sources config not found: ${SOURCES_FILE}`);
    process.exit(1);
  }
  const config = yaml.load(
    fs.readFileSync(SOURCES_FILE, "utf-8")
  ) as ApiSourcesConfig;

  const args = parseArgs();
  let errors = 0;
  let fetched = 0;

  // Determine which sources to fetch
  const sourceEntries = Object.entries(config.sources).filter(
    ([name]) => !args.source || args.source === name
  );

  if (sourceEntries.length === 0) {
    if (args.source) {
      console.error(`ERROR: Source '${args.source}' not found in api-sources.yaml`);
      console.error(`  Available sources: ${Object.keys(config.sources).join(", ")}`);
    } else {
      console.error("ERROR: No sources defined in api-sources.yaml");
    }
    process.exit(1);
  }

  // Build defaults map for env var resolution
  const defaults: Record<string, string> = {
    schemaUrl: config.defaults?.schemaUrl || "http://localhost:8000",
  };

  for (const [name, source] of sourceEntries) {
    const url = resolveEnvVars(source.url, defaults);
    const outputPath = path.resolve(ROOT, source.output);

    console.log(`  [${name}] Fetching from ${url}`);

    try {
      // Build request headers
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (process.env.OTTU_API_KEY) {
        headers["Authorization"] = `Api-Key ${process.env.OTTU_API_KEY}`;
      }

      // Fetch
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error(
          `  ERROR: [${name}] HTTP ${response.status} ${response.statusText}`
        );
        if (body) console.error(`         ${body.slice(0, 200)}`);
        errors++;
        continue;
      }

      // Parse response
      const contentType = response.headers.get("content-type") || "";
      let data: any;

      if (contentType.includes("json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = yaml.load(text);
      }

      // Validate
      if (!validateSpec(data, name)) {
        errors++;
        continue;
      }

      // Write as YAML
      const yamlContent = yaml.dump(data, {
        lineWidth: -1,
        noRefs: true,
        quotingType: '"',
        forceQuotes: false,
        sortKeys: false,
      });

      fs.writeFileSync(outputPath, yamlContent, "utf-8");

      const pathCount = Object.keys(data.paths || {}).length;
      const schemaCount = Object.keys(data.components?.schemas || {}).length;
      console.log(
        `  [${name}] Saved: ${pathCount} paths, ${schemaCount} schemas → ${source.output}`
      );
      fetched++;
    } catch (err: any) {
      console.error(`  ERROR: [${name}] ${err.message}`);
      if (err.cause) console.error(`         Cause: ${err.cause.message || err.cause}`);
      errors++;
    }
  }

  // Summary
  console.log(`\n  Done: ${fetched} source(s) fetched`);
  if (errors > 0) {
    console.log(`  ${errors} error(s)\n`);
    process.exit(1);
  }
  console.log("");
}

main();
