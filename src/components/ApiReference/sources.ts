// The generated pages ApiReference reads, listed by hand. Static requires keep
// the bundle to these endpoints: a template-literal require would pull in
// every page in docs/developers/apis/.
//
// To use ApiReference for another endpoint, add its slug here.
import { ungzip } from "pako";
import type { Param, Response, Schema } from "./schema";

type Page = { frontMatter: { api: string; title?: string } };

const SOURCES = {
  "create-payment-transaction-checkout": require("@site/docs/developers/apis/create-payment-transaction-checkout.api.mdx"),
  "autopay-subscription-list": require("@site/docs/developers/apis/autopay-subscription-list.api.mdx"),
  "autopay-subscription-detail": require("@site/docs/developers/apis/autopay-subscription-detail.api.mdx"),
  "autopay-subscription-cancel": require("@site/docs/developers/apis/autopay-subscription-cancel.api.mdx"),
  "autopay-subscription-cycles": require("@site/docs/developers/apis/autopay-subscription-cycles.api.mdx"),
  "autopay-subscription-page-link": require("@site/docs/developers/apis/autopay-subscription-page-link.api.mdx"),
  "autopay-subscription-regenerate-page-token": require("@site/docs/developers/apis/autopay-subscription-regenerate-page-token.api.mdx"),
} satisfies Record<string, Page>;

export type ApiSlug = keyof typeof SOURCES;

export type Operation = {
  method: string;
  path: string;
  description?: string;
  /** The operation summary, or the page title when there is none. */
  title: string;
};

export type Endpoint = {
  operation: Operation;
  params: Param[];
  bodySchema?: Schema;
  responses: Record<string, Response>;
};

const cache = new Map<ApiSlug, Endpoint>();

/**
 * The page's `api` front matter is the whole operation (dereferenced: method,
 * path, parameters, request body, responses), gzipped and base64-encoded.
 */
function decode(page: Page, slug: string): Endpoint {
  const bytes = Uint8Array.from(atob(page.frontMatter.api), (char) =>
    char.charCodeAt(0),
  );
  const op = JSON.parse(new TextDecoder().decode(ungzip(bytes)));
  return {
    operation: {
      method: op.method,
      path: op.path,
      description: op.description,
      title: op.summary ?? page.frontMatter.title ?? slug,
    },
    params: op.parameters ?? [],
    bodySchema: op.requestBody?.content?.["application/json"]?.schema,
    responses: op.responses ?? {},
  };
}

/** Everything ApiReference shows for one endpoint, decoded once per page load. */
export function endpointOf(slug: ApiSlug): Endpoint {
  let endpoint = cache.get(slug);
  if (!endpoint) {
    endpoint = decode(SOURCES[slug], slug);
    cache.set(slug, endpoint);
  }
  return endpoint;
}
