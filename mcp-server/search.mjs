// Search provider for the docs MCP server.
//
// Wraps the FlexSearch provider that ships with docusaurus-plugin-mcp-server
// and changes two behaviours that made MCP clients fail:
//
// 1. docs_fetch: the plugin looks a page up by its exact address. The site's
//    own sitemap writes addresses with a trailing slash, which never matched.
//    Here a trailing slash, an #anchor or a ?query on the address resolve.
//    (The tool itself only accepts a full URL, so a bare path never arrives.)
//
// 2. docs_search: the plugin only returns pages that hold every word of the
//    query in one field, so one word the page lacks ("merchant", "dashboard")
//    emptied the result. Here a query of several words is scored word by
//    word, and a rare word counts for more than a word found on most pages.
//    A one-word query goes to the plugin unchanged.
//
// Verified against docusaurus-plugin-mcp-server 0.13.0. It reads two things
// the plugin does not document, `provider.docs` and `provider.getDocCount()`;
// initialize() warns if a later version drops them.
import { loadSearchProvider } from "docusaurus-plugin-mcp-server";

const stripSlash = (s) => s.replace(/\/+$/, "");
const cleanPath = (s) => stripSlash(s.replace(/[#?].*$/, "")) || "/";
const originOf = (s) => {
  try {
    return new URL(s).origin;
  } catch {
    return null;
  }
};

// A pasted paragraph must not turn into dozens of index searches.
const MAX_WORDS = 8;
// The /mcp route is public. One long query (a word said 27,000 times in the
// 256 KB body) kept the index busy for most of a second, and the one-word path
// sends the query to the plugin as it is. Real queries are a few words (#161374).
const MAX_QUERY_CHARS = 1000;

// One-letter tokens are dropped. If that leaves fewer than two words, the
// query goes to the plugin as typed.
function splitWords(query) {
  const words = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 1);
  return [...new Set(words)].slice(0, MAX_WORDS);
}

export function createProvider({ flexsearch, baseUrl = "" } = {}) {
  let inner = null;
  const keyByRoute = new Map();
  const origins = new Set();
  let total = 0; // pages in the index

  return {
    name: "ottu-flexsearch",

    async initialize(context, initData) {
      const provider = await loadSearchProvider("flexsearch", { flexsearch });
      await provider.initialize(context, initData);
      keyByRoute.clear();
      origins.clear();
      for (const [key, doc] of Object.entries(provider.docs ?? {})) {
        if (doc?.route) keyByRoute.set(cleanPath(doc.route), key);
        const origin = originOf(key);
        if (origin) origins.add(origin);
      }
      const own = originOf(baseUrl);
      if (own) origins.add(own);
      total = keyByRoute.size || provider.getDocCount?.() || 0;
      if (keyByRoute.size === 0) {
        console.warn(
          "search provider: the plugin exposes no page list; addresses with a trailing slash resolve only through BASE_URL"
        );
      }
      if (total === 0) {
        console.warn(
          "search provider: page count unknown; multi-word search falls back to the plugin's own search"
        );
      }
      inner = provider;
    },

    isReady() {
      return Boolean(inner?.isReady());
    },

    async healthCheck() {
      return inner
        ? inner.healthCheck()
        : { healthy: false, message: "search provider not initialized" };
    },

    // Accepts the page's address as indexed, or the same address with a
    // trailing slash, #anchor or ?query. Addresses on another host stay
    // "not found".
    async getDocument(url) {
      if (!inner || typeof url !== "string") return null;
      const given = url.trim();
      const exact = await inner.getDocument(given);
      if (exact) return exact;

      let parsed;
      try {
        parsed = new URL(given);
      } catch {
        return null;
      }
      if (!origins.has(parsed.origin)) return null;
      const path = cleanPath(parsed.pathname);
      const key = keyByRoute.get(path) ?? `${stripSlash(baseUrl)}${path}`;
      return inner.getDocument(key);
    },

    async search(query, options) {
      const limit = options?.limit ?? 16;
      const text = String(query ?? "");
      if (text.length > MAX_QUERY_CHARS) {
        // Cut at a word's end, so a half word does not empty the result.
        const cut = text.slice(0, MAX_QUERY_CHARS);
        query = /\s/.test(text[MAX_QUERY_CHARS]) ? cut : cut.replace(/\S+$/, "");
      }
      const words = splitWords(String(query ?? ""));
      if (words.length < 2 || total === 0) return inner.search(query, options);

      const all = { limit: total };
      const pages = new Map(); // url -> { result, score, best }

      // Each word on its own. A word found on few pages weighs more than one
      // found on most, and a word found nowhere adds nothing. Within a word,
      // the plugin's own score (title and heading hits rank first) decides
      // how much of the weight a page gets; FLOOR is what a bare mention in
      // the body is worth. Tuned on the real index against queries with a
      // known right page: 22 of 26 first, against 14 for the plugin alone.
      const FLOOR = 0.1;
      for (const word of words) {
        const hits = await inner.search(word, all);
        if (hits.length === 0) continue;
        const weight = Math.log(1 + total / hits.length);
        const top = Number(hits[0].score) || 1;
        for (const hit of hits) {
          const own = Number(hit.score) || 0;
          const points = weight * (FLOOR + ((1 - FLOOR) * own) / top);
          const page = pages.get(hit.url);
          if (!page) {
            pages.set(hit.url, { result: hit, score: points, best: points });
            continue;
          }
          page.score += points;
          if (points > page.best) {
            // keep the snippet of the word that says most about this page
            page.best = points;
            page.result = hit;
          }
        }
      }

      return [...pages.values()]
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ result, score }) => ({ ...result, score }));
    },
  };
}
