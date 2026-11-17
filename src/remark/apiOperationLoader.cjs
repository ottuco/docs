// Webpack / Rspack loader for a generated API page
// (docs/developers/apis/<slug>.api.mdx): exports only what <ApiReference>
// needs from its front matter, `{ operation, title }`. `operation` is the
// page's `api` value, the whole OpenAPI operation gzipped and base64-encoded.
//
// src/remark/apiReferenceData.ts imports each page through this loader, so the
// bundler tracks the generated page as a dependency of the doc: regenerating
// it (`npm run gen-api`) rebuilds the doc, in `npm start` and in the cache.
const yaml = require("js-yaml");

module.exports = function apiOperationLoader(source) {
  // Front matter: the block between the `---` lines at the very top.
  const block = /^---\r?\n([\s\S]*?)\r?\n---\r?(?:\n|$)/.exec(source)?.[1];
  const frontMatter = block ? yaml.load(block) : undefined;
  const text = (value) => (typeof value === "string" ? value : undefined);
  const operation = text(frontMatter?.api)?.replace(/\s/g, "");
  if (!operation)
    throw new Error(`${this.resourcePath}: no \`api\` front matter to read.`);
  const title = text(frontMatter?.title);
  return `export default ${JSON.stringify({ operation, title })};`;
};
