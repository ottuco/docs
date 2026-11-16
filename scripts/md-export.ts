// Rewrites build/<route>/intro.md, the markdown copy of every docs page that
// AI tools, llms-full.txt and the "Open Markdown" button read. Runs after
// `docusaurus build` and replaces what docusaurus-markdown-source-plugin wrote,
// because the plugin cleans MDX with regexes that do not know where code is:
//   - `<[A-Z]...(/>|</X>)` read `ResponseEntity<String>` in a Java sample as a
//     component and deleted everything up to a later `/>` (whole sections lost);
//   - it deleted `import` lines inside code blocks (JS samples lost imports);
//   - it stripped 4 spaces from every line inside tabs (Python broke).
// Here fenced code is copied byte for byte, tags are read as JSX (quotes and
// braces respected), and the components that carry content are rendered:
// tabs as labelled sections, FAQs as questions, the webhook event object as a
// field table plus every example body, the agent prompt as its text.
//   tsx scripts/md-export.ts build
import fs from "node:fs";
import path from "node:path";
import { EVENT_SCHEMA } from "../src/components/EventObject/schema";
import { WEBHOOKS_PROMPT } from "../src/components/AgentPrompt/prompts/webhooks";
import { OTTU_CONNECT_BASE_URL } from "../src/constants/api";

type Schema = {
  type?: string | string[];
  enum?: unknown[];
  description?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
};

const SITE = "https://docs.ottu.com";
const DOCS = path.resolve("docs");
const OUT = path.resolve(process.argv[2] ?? "build");
const EXAMPLES_DIR = path.resolve("src/components/EventObject/examples");

// ── Routes ────────────────────────────────────────────────────────────────
function frontMatter(source: string): { data: Record<string, string>; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { data: {}, body: source };
  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, "").trim();
  }
  return { data, body: source.slice(match[0].length) };
}

function routeOf(file: string, slug?: string, id?: string): string {
  const rel = path.relative(DOCS, file).replace(/\.(md|mdx)$/, "").split(path.sep);
  // An `id` in the front matter replaces the file name in the route (the API pages: x.api.mdx, id: x).
  if (id && !slug) rel[rel.length - 1] = id;
  if (rel[rel.length - 1] === "index") rel.pop();
  const dir = rel.slice(0, -1).join("/");
  if (slug) return slug.startsWith("/") ? slug.replace(/\/?$/, "/") : `/${dir ? `${dir}/` : ""}${slug}/`;
  return `/${rel.join("/")}${rel.length ? "/" : ""}`;
}

function walk(dir: string, found: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, found);
    else if (/\.(md|mdx)$/.test(entry.name) && !entry.name.startsWith("_") && entry.name !== "CLAUDE.md") found.push(full);
  }
  return found;
}

// ── Components that carry content ─────────────────────────────────────────
function typeLabel(schema: Schema): string {
  if (schema.enum) return `enum: ${schema.enum.filter((v) => v !== null).map((v) => `\`${v}\``).join(", ")}`;
  const types = Array.isArray(schema.type) ? schema.type : [schema.type ?? (schema.properties ? "object" : "any")];
  return types.join(" or ");
}

function fieldRows(schema: Schema, prefix = ""): string[] {
  const rows: string[] = [];
  const target = schema.type === "array" && schema.items ? schema.items : schema;
  for (const [name, child] of Object.entries(target.properties ?? {})) {
    const key = `${prefix}${name}`;
    const type = child.type === "array" ? `array${child.items?.type ? ` of ${child.items.type}` : ""}` : typeLabel(child);
    rows.push(`| \`${key}\` | ${type} | ${(child.description ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ")} |`);
    const nested = child.type === "array" ? child.items : child;
    if (nested?.properties) rows.push(...fieldRows(nested, `${key}${child.type === "array" ? "[]" : ""}.`));
  }
  return rows;
}

function eventObject(part: string | undefined): string {
  const data = part === "data";
  const schema = data ? (EVENT_SCHEMA.properties as Record<string, Schema>).data : (EVENT_SCHEMA as Schema);
  // The envelope lists data's own fields once, under its data section (<EventObject part="data" />), not twice.
  const rows = fieldRows(schema, data ? "data." : "").filter((row) => data || !row.startsWith("| `data."));
  if (!data) rows.push("| `data.*` | | Every key of `data` is in the data object table on this page (#data-keys). |");
  const table = ["| Field | Type | Description |", "|---|---|---|", ...rows].join("\n");
  if (data) return table;
  const examples = fs
    .readdirSync(EXAMPLES_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => {
      const label = name.replace(/\.json$/, "").replace(/\.capture$/, " (capture)");
      return `#### Example: \`${label}\`\n\n\`\`\`json\n${fs.readFileSync(path.join(EXAMPLES_DIR, name), "utf8").trim()}\n\`\`\``;
    });
  return `${table}\n\n### Example bodies, one per event\n\n${examples.join("\n\n")}`;
}

type PGParam = { name: string; category: string; description: string; example?: string; notes?: string };
const PG_CATEGORIES: Record<string, string> = {
  card: "Card Information",
  identifier: "Transaction Identifiers",
  status: "Transaction Status",
  dcc: "Currency Conversion",
};

function pgParams(): string {
  const params = JSON.parse(fs.readFileSync(path.resolve("static/data/pg-params.json"), "utf8")) as PGParam[];
  const cell = (text = "") => text.replace(/\|/g, "\\|").replace(/\n/g, " ");
  const rows = params.map(
    (p) => `| \`${p.name}\` | ${PG_CATEGORIES[p.category] ?? p.category} | ${cell(p.description)}${p.notes ? ` ${cell(p.notes)}` : ""} | ${p.example ? `\`${cell(p.example)}\`` : ""} |`,
  );
  return ["| Field | Category | Description | Example |", "|---|---|---|---|", ...rows].join("\n");
}

/** A schema the page renders with SchemaEmbed (static/schemas/<path>): its fields as a table. */
function schemaTable(file: string): string {
  const schema = JSON.parse(fs.readFileSync(path.resolve("static/schemas", file), "utf8")) as Schema & { allOf?: Schema[] };
  const merged: Schema = schema.allOf ? { properties: Object.assign({}, ...schema.allOf.map((s) => s.properties ?? {})) } : schema;
  return ["| Field | Type | Description |", "|---|---|---|", ...fieldRows(merged)].join("\n");
}

function render(name: string, attrs: Record<string, string>, route: string): string | null {
  if (diagramNames.has(name)) {
    return `_Interactive diagram "${name.replace(/([a-z])([A-Z])/g, "$1 $2")}": open ${SITE}${route} to step through it._`;
  }
  switch (name) {
    case "PGParamsReference":
      return pgParams();
    case "SchemaEmbed":
      return attrs.path ? schemaTable(attrs.path) : null;
    case "EventObject":
      return eventObject(attrs.part);
    case "AgentPrompt":
      // The full prompt once (on the quickstart); other pages point to it, so llms-full.txt carries it once.
      return route === "/developers/webhooks/quickstart/"
        ? `**Prompt for your coding agent** (copy it into Claude Code, Cursor or Copilot):\n\n\`\`\`text\n${WEBHOOKS_PROMPT}\n\`\`\``
        : `_A ready prompt for your coding agent (Claude Code, Cursor, Copilot) is on ${SITE}/developers/webhooks/quickstart/ ._`;
    case "SignatureLab":
      return `_Interactive signature lab (sign a body, check a header, copy a signed curl): ${SITE}${route}#signature-lab. It needs a browser; to check offline, use the test vectors on ${SITE}/developers/webhooks/verify-signatures#test-vectors._`;
    default:
      return null;
  }
}

// ── MDX to markdown ───────────────────────────────────────────────────────
/** One JSX tag starting at `at` ("<Name ..." or "</Name>"): its end, name, attributes, kind. */
function readTag(text: string, at: number) {
  const match = text.slice(at).match(/^<(\/?)([A-Z][A-Za-z0-9.]*)/);
  if (!match) return null;
  let i = at + match[0].length;
  let quote = "";
  let depth = 0;
  for (; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === quote && text[i - 1] !== "\\") quote = "";
    } else if (ch === '"' || ch === "'" || (ch === "`" && depth > 0)) quote = ch;
    else if (ch === "{") depth += 1;
    else if (ch === "}") depth -= 1;
    else if (ch === ">" && depth === 0) break;
  }
  if (i >= text.length) return null;
  const raw = text.slice(at, i + 1);
  const attrs: Record<string, string> = {};
  for (const a of raw.matchAll(/([A-Za-z_]+)=(?:"([^"]*)"|'([^']*)'|\{"([^"]*)"\})/g)) attrs[a[1]] = a[2] ?? a[3] ?? a[4] ?? "";
  return { end: i + 1, name: match[2], closing: match[1] === "/", selfClosing: raw.endsWith("/>"), attrs };
}

/** Components imported from src/diagrams on the page being converted (set per page in toMarkdown). */
let diagramNames = new Set<string>();

const CODE_BLOCK = /<CodeBlock([^>]*)>\s*\{`([\s\S]*?)`\}\s*<\/CodeBlock>/g;

function prose(text: string, route: string): string {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const lt = text.indexOf("<", i);
    if (lt === -1) {
      out += text.slice(i);
      break;
    }
    out += text.slice(i, lt);
    // Inline code keeps `<String>` and friends as written.
    const tag = isInsideInlineCode(text, lt) ? null : readTag(text, lt);
    if (!tag) {
      out += "<";
      i = lt + 1;
      continue;
    }
    i = tag.end;
    if (tag.closing) continue;
    const rendered = render(tag.name, tag.attrs, route);
    if (rendered !== null) out += `\n${rendered}\n`;
    else if (tag.name === "TabItem") out += `\n**${tag.attrs.label ?? tag.attrs.value ?? ""}**\n`;
    else if (tag.name === "FAQItem") out += `\n**Q: ${tag.attrs.question ?? ""}**\n`;
    else if (tag.name === "Admonition") out += `\n> **${tag.attrs.title ?? tag.attrs.type ?? "Note"}**\n`;
    // Every other component: self-closing ones are UI with nothing to read,
    // paired ones are unwrapped so their text stays.
  }
  return out
    .replace(/^\s*(import|export)\s.+$/gm, "")
    .replace(/\{OTTU_(CONNECT|DEV)_BASE_URL\}/g, OTTU_CONNECT_BASE_URL)
    .replace(/<\/?(details|summary|div|span|br)\b[^>]*>/g, "")
    .replace(/&#x20;/g, " ")
    // Keep explicit heading ids as anchors, so links like #catalogue still land in the markdown.
    .replace(/^(#{1,6}\s.*?)\s*\{#([\w-]+)\}\s*$/gm, '$1 <a id="$2"></a>')
    .replace(/\]\((\.\.?\/[^)]+?)\.mdx?(#[^)]*)?\)/g, (_m, link: string, hash = "") => `](${resolveLink(route, link)}${hash})`);
}

function isInsideInlineCode(text: string, at: number): boolean {
  const lineStart = text.lastIndexOf("\n", at) + 1;
  const ticks = (text.slice(lineStart, at).match(/`/g) ?? []).length;
  return ticks % 2 === 1;
}

/** Set per page: an index page (docs/x/index.md, route /x/) resolves ./y from /x/, a leaf page from its parent. */
let currentIsIndex = false;

function resolveLink(route: string, rel: string): string {
  const base = route.endsWith("/") ? route : `${route}/`;
  const parent = currentIsIndex ? base : base.split("/").slice(0, -2).join("/") + "/";
  const resolved = path.posix.normalize(path.posix.join(parent, rel)).replace(/\/index$/, "");
  return resolved.replace(/\/?$/, "/");
}

/** The text inside a tab, FAQ answer or admonition component is indented in the MDX source; as markdown that
 *  indent would turn it into a code block. Remove the block's common indent (fences inside move with it). */
function dedentComponents(body: string): string {
  return body.replace(/(<(FAQItem|TabItem|Admonition)\b[^>]*>)([\s\S]*?)(<\/\2>)/g, (_m, open: string, _n, inner: string, close: string) => {
    const lines = inner.split("\n");
    const indents = lines.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length);
    const common = indents.length ? Math.min(...indents) : 0;
    return open + lines.map((l) => l.slice(Math.min(common, l.length - l.trimStart().length))).join("\n") + close;
  });
}

function toMarkdown(body: string, route: string): string {
  diagramNames = new Set(
    [...body.matchAll(/^import\s+(\w+)\s+from\s+["']@site\/src\/diagrams\/[^"']+["']/gm)].map((m) => m[1]),
  );
  body = dedentComponents(body);
  body = body.replace(CODE_BLOCK, (_m, attrs: string, code: string) => {
    const lang = attrs.match(/language=["']([^"']+)["']/)?.[1] ?? "";
    const title = attrs.match(/title=["']([^"']+)["']/)?.[1];
    const text = code.replace(/\$\{OTTU_(CONNECT|DEV)_BASE_URL\}/g, OTTU_CONNECT_BASE_URL).replace(/\\`/g, "`");
    return `\n\`\`\`${lang}${title ? ` title="${title}"` : ""}\n${text.replace(/^\n/, "").replace(/\s+$/, "")}\n\`\`\`\n`;
  });
  // Split on fenced code (``` or ~~~, any indent); fences are copied as written.
  const parts: string[] = [];
  const lines = body.split("\n");
  let buffer: string[] = [];
  let fence: string | null = null;
  let fenceIndent = 0;
  const flush = (asCode: boolean) => {
    const chunk = buffer.join("\n");
    parts.push(asCode ? chunk : prose(chunk, route));
    buffer = [];
  };
  for (const line of lines) {
    const opener = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence === null && opener) {
      flush(false);
      fence = opener[1];
      fenceIndent = line.length - line.trimStart().length;
      buffer.push(line.trimStart());
    } else if (fence !== null && line.trim().startsWith(fence) && line.trim().replace(/[`~]/g, "") === "") {
      buffer.push(line.replace(/^\s+/, ""));
      flush(true);
      fence = null;
    } else buffer.push(fence !== null ? dedent(line, fenceIndent) : line);
  }
  flush(fence !== null);
  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

/** A fence indented as a whole (inside a list item): remove the fence's own indent, keep the rest. */
function dedent(line: string, indent: number): string {
  const lead = line.length - line.trimStart().length;
  return line.slice(Math.min(lead, indent));
}

// ── Main ──────────────────────────────────────────────────────────────────
let written = 0;
const meta: Record<string, { title: string; description: string }> = {};
const skipped: string[] = [];
for (const file of walk(DOCS)) {
  const { data, body } = frontMatter(fs.readFileSync(file, "utf8"));
  if (data.draft === "true" || data.unlisted === "true") continue;
  const route = routeOf(file, data.slug, data.id);
  const target = path.join(OUT, route, "intro.md");
  if (!fs.existsSync(path.dirname(target)) || !fs.existsSync(path.join(OUT, route, "index.html"))) {
    skipped.push(route);
    continue;
  }
  currentIsIndex = path.basename(file).replace(/\.(md|mdx)$/, "") === "index";
  let markdown = toMarkdown(body, route);
  meta[route] = { title: data.title ?? "", description: data.description ?? "" };
  if (!/^#\s/m.test(markdown) && data.title) markdown = `# ${data.title}\n\n${markdown}`;
  fs.writeFileSync(target, markdown);
  written += 1;
}
fs.writeFileSync(path.join(OUT, ".md-meta.json"), JSON.stringify(meta));
console.log(`md-export: ${written} pages written${skipped.length ? `, ${skipped.length} without a built page` : ""}`);
if (process.env.MD_EXPORT_VERBOSE) console.log(skipped.join("\n"));
