/**
 * OpenAPI Spec Enrichment Engine
 *
 * Reads the raw OpenAPI spec and enrichment overlay files,
 * merges them, resolves template variables, and writes the enriched spec.
 *
 * Sources are configured in static/api-sources.yaml.
 *
 * Usage:
 *   tsx scripts/enrich-api-spec.ts                    # Enrich all sources
 *   tsx scripts/enrich-api-spec.ts --source=payments  # Enrich one source
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as yaml from "js-yaml";

// ── Paths ────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, "..");
const SOURCES_FILE = path.join(ROOT, "static", "api-sources.yaml");

// ── Source Config ────────────────────────────────────────────────────────────

interface SourceConfig {
  url: string;
  output: string;
  enrichedOutput: string;
  enrichments: string;
  pluginId: string;
}

interface ApiSourcesConfig {
  sources: Record<string, SourceConfig>;
  defaults: { schemaUrl: string };
}

function loadSources(): Array<{ name: string; config: SourceConfig }> {
  const args = process.argv.slice(2);
  let sourceFilter: string | undefined;
  for (const arg of args) {
    if (arg.startsWith("--source=")) {
      sourceFilter = arg.slice("--source=".length);
    }
  }

  if (!fs.existsSync(SOURCES_FILE)) {
    // Fallback to hardcoded paths for backwards compatibility
    return [
      {
        name: "payments",
        config: {
          url: "",
          output: "static/Ottu_API.yaml",
          enrichedOutput: "static/Ottu_API_enriched.yaml",
          enrichments: "static/api-enrichments",
          pluginId: "ottuApi",
        },
      },
    ];
  }

  const raw = yaml.load(fs.readFileSync(SOURCES_FILE, "utf-8")) as ApiSourcesConfig;
  return Object.entries(raw.sources)
    .filter(([name]) => !sourceFilter || sourceFilter === name)
    .map(([name, config]) => ({ name, config }));
}

// ── Types ────────────────────────────────────────────────────────────────────

interface PermissionBlock {
  auth_method: string;
  permissions: string;
  extra?: string;
}

interface OperationEnrichment {
  permissions?: Array<string | PermissionBlock>;
  description_append?: string;
  description_prepend?: string;
  description_replace?: string;
}

interface OperationsFile {
  operations: Record<string, OperationEnrichment>;
}

interface SchemaPropertyOverride {
  description?: string;
  properties?: Record<string, SchemaPropertyOverride | string>;
}

interface SchemaFile {
  properties: Record<string, SchemaPropertyOverride | string>;
}

interface SharedFieldsFile {
  [fieldName: string]: { description: string };
}

// ── Logging ──────────────────────────────────────────────────────────────────

let warnings = 0;
let errors = 0;

function warn(msg: string): void {
  console.warn(`  WARN: ${msg}`);
  warnings++;
}

function error(msg: string): void {
  console.error(`  ERROR: ${msg}`);
  errors++;
}

function info(msg: string): void {
  console.log(`  ${msg}`);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadYaml<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  return yaml.load(content) as T;
}

function listYamlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map((f) => path.join(dir, f));
}

/**
 * Find an operation in the spec by operationId.
 * Returns the operation object or null.
 */
function findOperation(
  spec: any,
  operationId: string
): { operation: any; path: string; method: string } | null {
  const paths = spec.paths || {};
  for (const [pathStr, pathItem] of Object.entries<any>(paths)) {
    for (const method of [
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "options",
      "head",
    ]) {
      const op = pathItem[method];
      if (op && op.operationId === operationId) {
        return { operation: op, path: pathStr, method };
      }
    }
  }
  return null;
}

/**
 * Resolve template variables in a string: {{varName}} → value
 */
function resolveVariables(
  text: string,
  variables: Record<string, string>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    if (varName in variables) {
      return variables[varName];
    }
    warn(`Unresolved variable: {{${varName}}}`);
    return match;
  });
}

/**
 * Recursively resolve template variables in all string values of an object.
 */
function resolveVariablesDeep(
  obj: any,
  variables: Record<string, string>
): any {
  if (typeof obj === "string") {
    return resolveVariables(obj, variables);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => resolveVariablesDeep(item, variables));
  }
  if (obj && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = resolveVariablesDeep(value, variables);
    }
    return result;
  }
  return obj;
}

// ── Permissions Table Generator ──────────────────────────────────────────────

function generatePermissionsTable(
  permissions: Array<string | PermissionBlock>,
  permissionsMap: Record<string, PermissionBlock>
): string {
  const resolved: PermissionBlock[] = [];
  const extras: string[] = [];

  for (const entry of permissions) {
    if (typeof entry === "string" && entry.startsWith("$perm:")) {
      const key = entry.slice(6);
      if (key in permissionsMap) {
        resolved.push(permissionsMap[key]);
      } else {
        error(`Missing permission reference: $perm:${key}`);
      }
    } else if (typeof entry === "object") {
      resolved.push(entry as PermissionBlock);
    } else {
      warn(`Invalid permission entry: ${JSON.stringify(entry)}`);
    }
  }

  if (resolved.length === 0) return "";

  const lines: string[] = [
    "",
    "### Permissions",
    "",
    "| Auth Method | Required Permissions |",
    "|---|---|",
  ];

  for (const perm of resolved) {
    const authMethod = perm.auth_method.replace(/\n/g, " ").trim();
    const permissions = perm.permissions.replace(/\n/g, " ").trim();
    lines.push(`| ${authMethod} | ${permissions} |`);
    if (perm.extra) {
      extras.push(perm.extra.trim());
    }
  }

  if (extras.length > 0) {
    lines.push("");
    for (const extra of extras) {
      lines.push(`> **Gateway permission**: ${extra}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

// ── Operation Enrichment ─────────────────────────────────────────────────────

function enrichOperations(
  spec: any,
  operationsDir: string,
  permissionsMap: Record<string, PermissionBlock>
): number {
  let count = 0;
  const files = listYamlFiles(operationsDir);

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const data = loadYaml<OperationsFile>(filePath);
    if (!data?.operations) {
      warn(`No 'operations' key in ${fileName}`);
      continue;
    }

    for (const [opId, enrichment] of Object.entries(data.operations)) {
      const found = findOperation(spec, opId);
      if (!found) {
        warn(`Operation '${opId}' not found in spec (from ${fileName})`);
        continue;
      }

      const { operation } = found;
      let description = operation.description || "";

      // Generate and append permissions table
      if (enrichment.permissions && enrichment.permissions.length > 0) {
        const table = generatePermissionsTable(
          enrichment.permissions,
          permissionsMap
        );
        description += table;
      }

      // Apply description modifications
      if (enrichment.description_replace !== undefined) {
        description = enrichment.description_replace;
      }
      if (enrichment.description_prepend) {
        description = enrichment.description_prepend + "\n" + description;
      }
      if (enrichment.description_append) {
        description += "\n" + enrichment.description_append;
      }

      operation.description = description;
      count++;
    }
  }

  return count;
}

// ── Schema Enrichment ────────────────────────────────────────────────────────

function enrichSchemaProperties(
  schemaProps: any,
  overrides: Record<string, SchemaPropertyOverride | string>,
  sharedFields: SharedFieldsFile,
  schemaName: string,
  parentPath: string = ""
): number {
  let count = 0;

  for (const [propName, override] of Object.entries(overrides)) {
    const fullPath = parentPath ? `${parentPath}.${propName}` : propName;

    // Handle $shared marker
    if (override === "$shared") {
      if (propName in sharedFields) {
        if (schemaProps[propName]) {
          schemaProps[propName].description =
            sharedFields[propName].description;
          count++;
        } else {
          warn(
            `Property '${fullPath}' not found in schema '${schemaName}' (shared field)`
          );
        }
      } else {
        error(`Shared field '${propName}' not found in _shared/fields.yaml`);
      }
      continue;
    }

    if (typeof override !== "object") continue;

    const overrideObj = override as SchemaPropertyOverride;

    // Direct description override
    if (overrideObj.description) {
      if (schemaProps[propName]) {
        schemaProps[propName].description = overrideObj.description;
        count++;
      } else {
        warn(
          `Property '${fullPath}' not found in schema '${schemaName}'`
        );
      }
    }

    // Nested properties override
    if (overrideObj.properties && schemaProps[propName]) {
      const nestedSchema = schemaProps[propName];
      // Handle both direct properties and $ref-resolved properties
      const nestedProps =
        nestedSchema.properties ||
        nestedSchema.allOf?.[0]?.properties ||
        null;
      if (nestedProps) {
        count += enrichSchemaProperties(
          nestedProps,
          overrideObj.properties,
          sharedFields,
          schemaName,
          fullPath
        );
      } else {
        warn(
          `No nested properties found at '${fullPath}' in schema '${schemaName}'`
        );
      }
    }
  }

  return count;
}

function enrichSchemas(
  spec: any,
  schemasDir: string,
  sharedFields: SharedFieldsFile
): number {
  let count = 0;
  const files = listYamlFiles(schemasDir);
  const schemas = spec.components?.schemas || {};

  for (const filePath of files) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const data = loadYaml<SchemaFile>(filePath);

    if (!data?.properties) {
      warn(`No 'properties' key in ${path.basename(filePath)}`);
      continue;
    }

    if (!(fileName in schemas)) {
      warn(
        `Schema '${fileName}' not found in spec (from ${path.basename(filePath)})`
      );
      continue;
    }

    const schemaProps = schemas[fileName].properties;
    if (!schemaProps) {
      warn(`Schema '${fileName}' has no properties in spec`);
      continue;
    }

    count += enrichSchemaProperties(
      schemaProps,
      data.properties,
      sharedFields,
      fileName
    );
  }

  return count;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function processSource(name: string, config: SourceConfig): void {
  const specInput = path.resolve(ROOT, config.output);
  const specOutput = path.resolve(ROOT, config.enrichedOutput);
  const enrichmentsDir = path.resolve(ROOT, config.enrichments);
  const variablesFile = path.join(enrichmentsDir, "_variables.yaml");
  const sharedDir = path.join(enrichmentsDir, "_shared");
  const operationsDir = path.join(enrichmentsDir, "operations");
  const schemasDir = path.join(enrichmentsDir, "schemas");

  console.log(`\n  ── ${name} ──`);

  // 1. Load base spec
  info("Loading base spec...");
  if (!fs.existsSync(specInput)) {
    error(`Base spec not found: ${specInput}`);
    return;
  }
  const specContent = fs.readFileSync(specInput, "utf-8");
  const spec = yaml.load(specContent) as any;
  info(
    `Loaded ${Object.keys(spec.paths || {}).length} paths, ${Object.keys(spec.components?.schemas || {}).length} schemas`
  );

  // 2. Check if enrichments directory exists
  if (!fs.existsSync(enrichmentsDir)) {
    info(`No enrichments directory at ${config.enrichments}, copying spec as-is`);
    fs.copyFileSync(specInput, specOutput);
    return;
  }

  // 3. Load template variables
  const variables = loadYaml<Record<string, string>>(variablesFile) || {};
  info(`Loaded ${Object.keys(variables).length} template variables`);

  // 4. Load shared permissions
  const permissionsFile = path.join(sharedDir, "permissions.yaml");
  const permissionsMap =
    loadYaml<Record<string, PermissionBlock>>(permissionsFile) || {};
  info(`Loaded ${Object.keys(permissionsMap).length} shared permission blocks`);

  // 5. Load shared fields
  const fieldsFile = path.join(sharedDir, "fields.yaml");
  const sharedFields = loadYaml<SharedFieldsFile>(fieldsFile) || {};
  info(`Loaded ${Object.keys(sharedFields).length} shared field descriptions`);

  // 6. Enrich operations
  info("Enriching operations...");
  const opsCount = enrichOperations(spec, operationsDir, permissionsMap);
  info(`Enriched ${opsCount} operations`);

  // 7. Enrich schemas
  info("Enriching schema fields...");
  const schemasCount = enrichSchemas(spec, schemasDir, sharedFields);
  info(`Overrode ${schemasCount} schema field descriptions`);

  // 8. Resolve template variables in the entire spec
  info("Resolving template variables...");
  const enrichedSpec = resolveVariablesDeep(spec, variables);

  // 9. Write output
  info("Writing enriched spec...");
  const output = yaml.dump(enrichedSpec, {
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
    sortKeys: false,
  });
  fs.writeFileSync(specOutput, output, "utf-8");

  info(
    `Done: ${opsCount} operations enriched, ${schemasCount} schema fields overridden → ${path.relative(ROOT, specOutput)}`
  );
}

function main(): void {
  console.log("\nOpenAPI Spec Enrichment Engine");

  const sources = loadSources();
  if (sources.length === 0) {
    console.error("  ERROR: No matching sources found");
    process.exit(1);
  }

  for (const { name, config } of sources) {
    processSource(name, config);
  }

  // Summary
  if (warnings > 0) console.log(`\n  ${warnings} warning(s)`);
  if (errors > 0) console.log(`  ${errors} error(s)`);
  console.log("");

  if (errors > 0) process.exit(1);
}

main();
