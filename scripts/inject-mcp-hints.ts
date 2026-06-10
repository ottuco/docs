/**
 * MCP Curl Example Injector
 *
 * Auto-generates a runnable curl example for every API operation in the
 * enriched OpenAPI spec — using the same conversion and snippet-generation
 * pipeline the interactive ApiExplorer uses under the hood (openapi-to-postmanv2
 * to build a Postman collection, postman-code-generators to render the curl,
 * and the openapi-docs plugin's own sampleRequestFromSchema for body examples)
 * — and injects each one as a visually-hidden <span> into the matching
 * generated .api.mdx file.
 *
 * The ApiExplorer already renders an interactive curl example for human
 * readers, so this hidden copy exists purely so the MCP server's static-HTML
 * indexer can return a usable request example via docs_fetch, without
 * duplicating it visibly on the page.
 *
 * Runs after docusaurus gen-api-docs as part of npm run gen-api.
 * Reads from: static/Ottu_API_enriched.yaml  (written by npm run enrich-api)
 * Patches:    docs/developers/apis/*.api.mdx  (written by docusaurus gen-api-docs)
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";
import RefParser from "@apidevtools/json-schema-ref-parser";
import openapiToPostman from "openapi-to-postmanv2";
// @ts-expect-error — no published type declarations
import sdk from "postman-collection";
// @ts-expect-error — no published type declarations
import codegen from "postman-code-generators";
import { sampleRequestFromSchema } from "docusaurus-plugin-openapi-docs/lib/openapi/createRequestExample.js";

const ROOT = path.resolve(__dirname, "..");
const SOURCES_FILE = path.join(ROOT, "static", "api-sources.yaml");
const API_DOCS_DIR = path.join(ROOT, "docs", "developers", "apis");

// Whitespace/indentation-agnostic: matches `<Heading` ... `id={"request"}`
// regardless of how docusaurus-plugin-openapi-docs formats the JSX between them.
const INJECTION_ANCHOR = /<Heading\s+id=\{"request"\}/;

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "options", "head"] as const;

// Mirrors the default values of the "cURL" variant options the ApiExplorer
// uses (docusaurus-theme-openapi-docs CodeSnippets/languages.json).
const CURL_OPTIONS = {
  multiLine: true,
  longFormat: true,
  lineContinuationCharacter: "\\",
  quoteType: "single",
  requestTimeoutInSeconds: 0,
  followRedirect: true,
  trimRequestBody: false,
  silent: false,
};

interface SourceConfig {
  enrichedOutput: string;
}

interface ApiSourcesConfig {
  sources: Record<string, SourceConfig>;
}

interface OperationMatcher {
  operationId: string;
  method: string;
  pathRegex: RegExp;
  operation: any;
}

function operationIdToFilename(operationId: string): string {
  return operationId.replace(/_/g, "-") + ".api.mdx";
}

// Same templating as the openapi-docs plugin's bindCollectionToApiItems —
// turns "/foo/{id}/bar" into a regex that matches "/foo/<anything>/bar".
function pathTemplateToRegex(pathTemplate: string): RegExp {
  const withTokens = pathTemplate.replace(/\{[^}]+\}/g, "__OPENAPI_PATH_PARAM__");
  const escaped = withTokens.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = escaped.replace(/__OPENAPI_PATH_PARAM__/g, "[^/]+");
  return new RegExp(`^${pattern}$`);
}

function buildOperationMatchers(spec: any): OperationMatcher[] {
  const matchers: OperationMatcher[] = [];
  for (const [pathTemplate, pathItem] of Object.entries<any>(spec.paths || {})) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (operation?.operationId) {
        matchers.push({
          operationId: operation.operationId,
          method,
          pathRegex: pathTemplateToRegex(pathTemplate),
          operation,
        });
      }
    }
  }
  return matchers;
}

// Mirrors the openapi-docs plugin's createPostmanCollection: strip servers
// (they break the conversion) and run the spec through openapi-to-postmanv2.
async function buildPostmanCollection(spec: any): Promise<any> {
  const data = JSON.parse(JSON.stringify(spec));
  delete data.servers;
  for (const pathItem of Object.values<any>(data.paths || {})) {
    delete pathItem.servers;
    for (const method of HTTP_METHODS) delete pathItem[method]?.servers;
  }
  return new Promise((resolve, reject) => {
    const schemaPack = new openapiToPostman.SchemaPack({ type: "json", data }, { schemaFaker: false });
    schemaPack.convert((err: any, result: any) => {
      if (err || !result?.result) return reject(err || result?.reason);
      resolve(new sdk.Collection(result.output[0].data));
    });
  });
}

function collectionItems(collection: any): any[] {
  const items: any[] = [];
  collection.forEachItem((item: any) => items.push(item));
  return items;
}

// Point the request at the real sandbox host, turn placeholder path/query
// values into readable {param} templates, and attach the API key header —
// the same masked-credential placeholder shape the ApiExplorer shows.
function applyServerAndAuth(request: any, baseUrl: string): void {
  const parsed = new URL(`https://${baseUrl.replace(/^https?:\/\//, "")}`);
  request.url.protocol = parsed.protocol.replace(":", "");
  request.url.host = parsed.hostname.split(".");
  request.url.variables.each((variable: any) => {
    variable.value = `{${variable.key}}`;
  });
  request.url.query.each((param: any) => {
    param.value = `{${param.key}}`;
  });
  request.headers.add({ key: "Authorization", value: "Api-Key YOUR_API_KEY" });
}

// Reuse the plugin's own example generator so the body in the curl matches
// the example shown in the page's request schema — only handles JSON bodies,
// which covers every write endpoint that matters for an MCP example.
function applyJsonBody(request: any, operation: any): void {
  const jsonContent = operation.requestBody?.content?.["application/json"];
  if (!jsonContent?.schema) return;
  const example = sampleRequestFromSchema(jsonContent.schema);
  if (example === undefined) return;
  request.body = new sdk.RequestBody({
    mode: "raw",
    raw: JSON.stringify(example, null, 2),
    options: { raw: { language: "json" } },
  });
  request.headers.upsert({ key: "Content-Type", value: "application/json" });
}

function generateCurl(request: any): Promise<string> {
  return new Promise((resolve, reject) => {
    codegen.convert("curl", "cURL", request, CURL_OPTIONS, (err: any, snippet: string) => {
      if (err) return reject(err);
      resolve(snippet);
    });
  });
}

function injectSpan(mdxContent: string, curl: string): string | null {
  // Curl text contains literal `{`/`}` (path templates, JSON bodies), which
  // MDX would otherwise try to parse as JS expressions in raw text. Wrapping
  // it as a JS string expression — {"..."} — sidesteps that entirely.
  //
  // <pre>, not <span>: the MCP plugin converts page HTML to Markdown via
  // rehype-remark/remark-stringify, which escapes `_` and `:` in plain text
  // nodes (CommonMark rules) — turning `session_id` and `https://` into
  // `session\_id` and `https\://` in the docs_fetch output. Code blocks are
  // emitted verbatim, so <pre> keeps the curl copy-paste-safe.
  const span = `<pre style={{display:"none"}}>{${JSON.stringify(curl)}}</pre>\n\n`;
  const match = INJECTION_ANCHOR.exec(mdxContent);
  if (!match) return null;
  return mdxContent.slice(0, match.index) + span + mdxContent.slice(match.index);
}

interface SourceResult {
  injected: number;
  failures: string[];
  // Set when the whole source couldn't be processed at all — distinct from
  // `failures`, which are per-operation. One bad source means every
  // operation in it was skipped, not "N operations failed."
  error?: string;
}

async function processSource(enrichedSpecPath: string): Promise<SourceResult> {
  if (!fs.existsSync(enrichedSpecPath)) {
    console.error(`  ERROR: Enriched spec not found: ${enrichedSpecPath}`);
    console.error(`  Run "npm run enrich-api" first.`);
    process.exit(1);
  }

  const spec = yaml.load(fs.readFileSync(enrichedSpecPath, "utf-8")) as any;
  const baseUrl = spec.servers?.[0]?.url;
  if (!baseUrl) {
    return { injected: 0, failures: [], error: "Spec has no servers[0].url — skipping curl generation for all operations" };
  }

  // Dereferenced copy: operation matching and body example generation both
  // need resolved $refs (sampleRequestFromSchema can't fake a bare $ref).
  const dereferenced = await RefParser.dereference(JSON.parse(JSON.stringify(spec)), {
    mutateInputSchema: false,
  });
  const matchers = buildOperationMatchers(dereferenced);
  const collection = await buildPostmanCollection(spec);

  let injected = 0;
  const failures: string[] = [];

  for (const item of collectionItems(collection)) {
    const request = item.request;
    const method = request.method.toLowerCase();
    const requestPath = request.url.getPath({ unresolved: true });
    const matcher = matchers.find((m) => m.method === method && m.pathRegex.test(requestPath));
    if (!matcher) continue;

    applyServerAndAuth(request, baseUrl);
    applyJsonBody(request, matcher.operation);

    let curl: string;
    try {
      curl = await generateCurl(request);
    } catch (err) {
      failures.push(`Failed to generate curl for ${matcher.operationId}: ${err}`);
      continue;
    }

    const filename = operationIdToFilename(matcher.operationId);
    const mdxPath = path.join(API_DOCS_DIR, filename);
    if (!fs.existsSync(mdxPath)) {
      failures.push(`No .api.mdx found for ${matcher.operationId} (expected ${filename})`);
      continue;
    }

    const original = fs.readFileSync(mdxPath, "utf-8");
    const patched = injectSpan(original, curl);
    if (patched === null) {
      failures.push(`Injection anchor not found in ${filename}`);
      continue;
    }

    fs.writeFileSync(mdxPath, patched, "utf-8");
    console.log(`  Injected curl example into ${filename}`);
    injected++;
  }

  return { injected, failures };
}

async function main(): Promise<void> {
  console.log("\nMCP Curl Example Injector");

  const config = yaml.load(fs.readFileSync(SOURCES_FILE, "utf-8")) as ApiSourcesConfig;
  let total = 0;
  const failures: string[] = [];
  const sourceErrors: string[] = [];

  for (const [name, source] of Object.entries(config.sources)) {
    console.log(`\n  ── ${name} ──`);
    const enrichedSpecPath = path.resolve(ROOT, source.enrichedOutput);
    const result = await processSource(enrichedSpecPath);
    total += result.injected;
    failures.push(...result.failures);
    if (result.error) sourceErrors.push(`${name}: ${result.error}`);
  }

  if (sourceErrors.length > 0) {
    console.error(`\n  ${sourceErrors.length} source(s) could not be processed:`);
    for (const error of sourceErrors) console.error(`    - ${error}`);
  }

  if (failures.length > 0) {
    console.error(`\n  ${failures.length} curl example(s) failed to inject:`);
    for (const failure of failures) console.error(`    - ${failure}`);
  }

  if (sourceErrors.length > 0 || failures.length > 0) {
    process.exit(1);
  }

  console.log(`\n  Done — ${total} file(s) patched\n`);
}

main();
