// The OpenAPI operation an ApiReference shows. The remark plugin
// src/remark/apiReferenceData.ts imports it from the generated page
// (docs/developers/apis/<slug>.api.mdx, its `api` front matter) and passes it
// in as the `source` prop; this file decodes it.
import { ungzip } from "pako";
import type { Param, Response, Schema } from "./schema";

/** The slug of a generated page in docs/developers/apis/. */
export type ApiSlug = string;

/** What src/remark/apiOperationLoader.cjs exports for a generated page. */
export type GeneratedPage = { operation: string; title?: string };

export type Operation = {
  method: string;
  path: string;
  description?: string;
};

export type Endpoint = {
  operation: Operation;
  params: Param[];
  bodySchema?: Schema;
  responses: Record<string, Response>;
};

/**
 * The page's `api` front matter is the whole operation (dereferenced: method,
 * path, parameters, request body, responses), gzipped and base64-encoded.
 */
function decode(encoded: string): Endpoint {
  const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
  const op = JSON.parse(new TextDecoder().decode(ungzip(bytes)));
  return {
    operation: {
      method: op.method,
      path: op.path,
      description: op.description,
    },
    params: op.parameters ?? [],
    bodySchema: op.requestBody?.content?.["application/json"]?.schema,
    responses: op.responses ?? {},
  };
}

/** Everything ApiReference shows for one endpoint. */
export function endpointOf(source: GeneratedPage): Endpoint {
  return decode(source.operation);
}
