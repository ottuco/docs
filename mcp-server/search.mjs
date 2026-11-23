// Search provider for the docs MCP server on dev.
//
// dev runs docusaurus-plugin-mcp-server 0.11.0, which takes a search provider
// only as a module to import (the `search` option of McpDocsServer). This
// module is the plugin's own FlexSearch provider with one change, the same as
// in main's search.mjs (#161374, cloud review of PR 274):
//
// docs_search reads only the first 1000 characters of a query, cut at a
// word's end. The /mcp route is public. One long query (a word said 27,000
// times in the 256 KB body) kept the index busy for most of a second, and the
// plugin also builds each result's snippet from every word of the query. Real
// queries are a few words, so they reach the plugin unchanged.
import { FlexSearchProvider } from "docusaurus-plugin-mcp-server";

const MAX_QUERY_CHARS = 1000;

export function cutQuery(query) {
  const text = String(query ?? "");
  if (text.length <= MAX_QUERY_CHARS) return query;
  // Cut at a word's end, so a half word does not empty the result.
  const cut = text.slice(0, MAX_QUERY_CHARS);
  return /\s/.test(text[MAX_QUERY_CHARS]) ? cut : cut.replace(/\S+$/, "");
}

export default class CutQueryProvider extends FlexSearchProvider {
  async search(query, options) {
    return super.search(cutQuery(query), options);
  }
}
