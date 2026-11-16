// Writes build/llms.txt and build/llms-full.txt (https://llmstxt.org), so an AI
// tool finds every page without crawling. Runs after `docusaurus build` (see
// package.json "build"): docusaurus-markdown-source-plugin writes each page's
// markdown as <route>/intro.md in its postBuild, and Docusaurus runs plugins'
// postBuild hooks at the same time, so a plugin here could read half the files.
//   llms.txt       one line per page: title, .md link, first paragraph
//   llms-full.txt  every page's markdown, one after the other
import fs from "node:fs";
import path from "node:path";

const SITE = "https://docs.ottu.com";
const TITLE = "Ottu Documentation";
const TAGLINE = "Payment processing made simple";
const OUT = path.resolve(process.argv[2] ?? "build");

type Page = { route: string; title: string; description: string; markdown: string };

// The same pages the MCP server leaves out, plus the API reference pages, which
// the developer guides already link.
const SKIP = [/^\/404/, /^\/search/, /^\/diagrams\//, /^\/developers\/apis\//];

const SECTIONS: [string, RegExp][] = [
  ["Developers: webhooks", /^\/developers\/webhooks\//],
  ["Developers: payments", /^\/developers\/payments\//],
  ["Developers: operations", /^\/developers\/operations/],
  ["Developers", /^\/developers\//],
  ["Business", /^\/business\//],
  ["Other", /./],
];

function walk(dir: string, found: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, found);
    else if (entry.name === "intro.md") found.push(full);
  }
  return found;
}

function pageOf(outDir: string, file: string): Page {
  const markdown = fs.readFileSync(file, "utf8");
  const route = `/${path.relative(outDir, path.dirname(file)).split(path.sep).join("/")}/`;
  const title = markdown.match(/^#\s+(.+)$/m)?.[1].trim() ?? route;
  // The first paragraph after the title: one line a reader can choose by.
  const body = markdown.replace(/^#\s+.+$/m, "");
  const paragraph = body.split(/\n\s*\n/).map((part) => part.trim()).find((part) => /^[A-Za-z*`[]/.test(part)) ?? "";
  const description = paragraph.replace(/\s+/g, " ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const short = description.length > 200 ? `${description.slice(0, 200).replace(/\s+\S*$/, "")}…` : description;
  return { route, title, description: short, markdown };
}

const pages = walk(OUT)
  .map((file) => pageOf(OUT, file))
  .filter((page) => !SKIP.some((skip) => skip.test(page.route)))
  .sort((a, b) => a.route.localeCompare(b.route));

const lines = [
  `# ${TITLE}`,
  "",
  `> ${TAGLINE}. Ottu is a payment platform: Checkout API and SDKs, payment operations (refund, capture, void), webhooks, cards and tokenization. Every link below is the page's markdown.`,
  "",
  "Start with the webhooks event catalogue for format 3 events, and Verify Signatures for Ottu-Signature v2.",
  "",
];
for (const [name, pattern] of SECTIONS) {
  const inSection = pages.filter(
    (page) => pattern.test(page.route) && SECTIONS.find(([, p]) => p.test(page.route))?.[0] === name,
  );
  if (inSection.length === 0) continue;
  lines.push(`## ${name}`, "");
  for (const page of inSection) {
    const text = page.description ? `: ${page.description}` : "";
    lines.push(`- [${page.title}](${SITE}${page.route}intro.md)${text}`);
  }
  lines.push("");
}
fs.writeFileSync(path.join(OUT, "llms.txt"), lines.join("\n"));
const full = pages.map((page) => `<!-- ${SITE}${page.route} -->\n\n${page.markdown.trim()}\n`).join("\n---\n\n");
fs.writeFileSync(path.join(OUT, "llms-full.txt"), full);
console.log(`llms.txt: ${pages.length} pages`);
