/**
 * Extract and dereference named schemas from the enriched OpenAPI spec.
 *
 * Usage:
 *   npx ts-node scripts/extract-schema.ts SchemaWebhook PaymentOperationResponses
 *
 * Reads static/Ottu_API_enriched.yaml, resolves all $ref references recursively,
 * and writes each schema to static/schemas/{Name}.json.
 *
 * Integrated into the gen-api pipeline so schemas stay in sync with the spec.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import { resolveRefs } from "./lib/resolve-refs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENRICHED_SPEC_PATH = path.join(
  __dirname,
  "..",
  "static",
  "Ottu_API_enriched.yaml"
);
const OUTPUT_DIR = path.join(__dirname, "..", "static", "schemas");

interface OpenAPISpec {
  components?: {
    schemas?: Record<string, any>;
  };
  [key: string]: any;
}

function loadSpec(): OpenAPISpec {
  const content = fs.readFileSync(ENRICHED_SPEC_PATH, "utf-8");
  return yaml.load(content) as OpenAPISpec;
}

/**
 * Recursively sort all `properties` objects alphabetically by key.
 */
function sortProperties(node: any): any {
  if (node === null || node === undefined || typeof node !== "object") return node;

  if (Array.isArray(node)) {
    return node.map(sortProperties);
  }

  const result: any = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === "properties" && typeof value === "object" && !Array.isArray(value)) {
      const sorted: any = {};
      for (const propKey of Object.keys(value as object).sort()) {
        sorted[propKey] = sortProperties((value as any)[propKey]);
      }
      result[key] = sorted;
    } else {
      result[key] = sortProperties(value);
    }
  }
  return result;
}

function main() {
  const schemaNames = process.argv.slice(2);
  if (schemaNames.length === 0) {
    console.error(
      "Usage: npx ts-node scripts/extract-schema.ts <SchemaName> [<SchemaName2> ...]"
    );
    process.exit(1);
  }

  if (!fs.existsSync(ENRICHED_SPEC_PATH)) {
    console.error(
      `Enriched spec not found at ${ENRICHED_SPEC_PATH}. Run 'npm run enrich-api' first.`
    );
    process.exit(1);
  }

  console.log("Loading enriched spec...");
  const spec = loadSpec();
  const allSchemas = spec.components?.schemas || {};

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const name of schemaNames) {
    const schema = allSchemas[name];
    if (!schema) {
      console.error(`Schema '${name}' not found in spec. Available schemas:`);
      console.error(
        "  " + Object.keys(allSchemas).slice(0, 20).join(", ") + "..."
      );
      process.exit(1);
    }

    console.log(`Extracting '${name}'...`);
    const resolved = resolveRefs(
      JSON.parse(JSON.stringify(schema)),
      allSchemas
    );
    const sorted = sortProperties(resolved);

    const outputPath = path.join(OUTPUT_DIR, `${name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(sorted, null, 2));
    const size = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`  → ${outputPath} (${size}KB)`);
  }

  console.log("Done.");
}

main();
