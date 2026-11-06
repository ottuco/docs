/**
 * Extract dereferenced operations from the enriched OpenAPI spec for <EndpointReference>.
 *
 * Usage:
 *   npx tsx scripts/extract-endpoints.ts <operationId> [<operationId2> ...]
 *
 * Writes static/endpoints/{operationId}.json with the method, path, description,
 * parameters, JSON request body and every response, each schema fully resolved.
 * Integrated into the gen-api pipeline so the fields stay in sync with the spec.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import { resolveRefs } from "./lib/resolve-refs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENRICHED_SPEC_PATH = path.join(__dirname, "..", "static", "Ottu_API_enriched.yaml");
const OUTPUT_DIR = path.join(__dirname, "..", "static", "endpoints");
const METHODS = ["get", "post", "put", "patch", "delete"];

interface Example {
  name: string;
  summary?: string;
  value: unknown;
}

function examplesOf(media: any): Example[] {
  if (!media) return [];
  if (media.examples) {
    return Object.entries(media.examples).map(([name, ex]: [string, any]) => ({
      name,
      summary: ex.summary,
      value: ex.value,
    }));
  }
  return media.example === undefined ? [] : [{ name: "Example", value: media.example }];
}

function main() {
  const operationIds = process.argv.slice(2);
  if (operationIds.length === 0) {
    console.error("Usage: npx tsx scripts/extract-endpoints.ts <operationId> [<operationId2> ...]");
    process.exit(1);
  }
  if (!fs.existsSync(ENRICHED_SPEC_PATH)) {
    console.error(`Enriched spec not found at ${ENRICHED_SPEC_PATH}. Run 'npm run enrich-api' first.`);
    process.exit(1);
  }

  const spec = yaml.load(fs.readFileSync(ENRICHED_SPEC_PATH, "utf-8")) as any;
  const schemas = spec.components?.schemas || {};
  const resolve = (node: any) => resolveRefs(JSON.parse(JSON.stringify(node)), schemas);

  const byId = new Map<string, { method: string; path: string; op: any }>();
  for (const [p, item] of Object.entries<any>(spec.paths || {})) {
    for (const method of METHODS) {
      if (item[method]?.operationId) byId.set(item[method].operationId, { method, path: p, op: item[method] });
    }
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  for (const id of operationIds) {
    const found = byId.get(id);
    if (!found) {
      console.error(`Operation '${id}' not found in the spec.`);
      process.exit(1);
    }
    const { method, path: apiPath, op } = found;
    const body = op.requestBody?.content?.["application/json"];
    const responses = Object.entries<any>(op.responses || {}).map(([status, r]) => {
      const media = r.content?.["application/json"];
      return {
        status,
        description: r.description ?? "",
        schema: media?.schema ? resolve(media.schema) : null,
        examples: examplesOf(media),
      };
    });

    const out = {
      operationId: id,
      method: method.toUpperCase(),
      path: apiPath,
      summary: op.summary ?? "",
      description: op.description ?? "",
      parameters: resolve(op.parameters || []),
      requestBody: body
        ? { required: Boolean(op.requestBody.required), schema: resolve(body.schema), examples: examplesOf(body) }
        : null,
      responses,
    };
    const outputPath = path.join(OUTPUT_DIR, `${id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(out, null, 2) + "\n");
    console.log(`  → ${path.relative(process.cwd(), outputPath)}`);
  }
}

main();
