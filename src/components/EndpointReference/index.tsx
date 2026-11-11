/**
 * One API endpoint as a Stripe-style section: fields on the left, the request and
 * its response on the right.
 *
 * Usage in MDX (the heading stays in MDX so it lands in the table of contents):
 *   ### Cancel a subscription {#api-cancel}
 *   <EndpointReference operationId="autopay_subscription_cancel" />
 *
 * The data comes from static/endpoints/{operationId}.json, generated from the
 * OpenAPI spec by scripts/extract-endpoints.ts (part of `npm run gen-api`).
 */

import React from "react";
import CodeBlock from "@theme/CodeBlock";
import ParamsDetails from "@site/src/theme/ParamsDetails";
import Markdown from "docusaurus-theme-openapi-docs/lib/theme/Markdown";
import SchemaNode from "@site/src/theme/Schema";
import { OTTU_CONNECT_BASE_URL } from "@site/src/constants/api";
import styles from "./styles.module.css";

interface Example {
  name: string;
  summary?: string;
  value: unknown;
}

interface Parameter {
  in: string;
  name: string;
  required?: boolean;
  example?: unknown;
  schema?: { format?: string };
}

interface EndpointResponse {
  status: string;
  description: string;
  schema: any;
  examples: Example[];
}

interface Endpoint {
  operationId: string;
  method: string;
  path: string;
  description: string;
  parameters: Parameter[];
  requestBody: { required: boolean; schema: any; examples: Example[] } | null;
  responses: EndpointResponse[];
}

interface EndpointReferenceProps {
  operationId: string;
  /** Show only these request fields, for an endpoint shared with other products (Checkout). */
  requestFields?: string[];
  /** Show only these response fields. */
  responseFields?: string[];
  /** Request body for the example, when the spec has none for this use. */
  requestExample?: unknown;
  /** Replaces the spec's description; the MDX text around the section can carry it instead. */
  hideDescription?: boolean;
}

const METHOD_BADGE: Record<string, string> = {
  GET: "primary",
  POST: "success",
  PUT: "info",
  PATCH: "warning",
  DELETE: "danger",
};

// Keep `names` (in that order) in an object schema, or in each branch of a oneOf/anyOf.
function pickFields(schema: any, names?: string[]): any {
  if (!schema || !names) return schema;
  for (const key of ["oneOf", "anyOf"] as const) {
    if (Array.isArray(schema[key])) {
      return { ...schema, [key]: schema[key].map((s: any) => pickFields(s, names)) };
    }
  }
  if (!schema.properties) return schema;
  const properties: Record<string, any> = {};
  for (const name of names) {
    if (schema.properties[name]) properties[name] = schema.properties[name];
  }
  return {
    ...schema,
    properties,
    required: (schema.required ?? []).filter((r: string) => r in properties),
  };
}

function placeholder(name: string): string {
  return `<${name.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase()}>`;
}

function curlFor(endpoint: Endpoint, body: unknown): string {
  const url = endpoint.path.replace(/{([^}]+)}/g, (_, name) => placeholder(name));
  const lines = [`curl --location${endpoint.method === "GET" ? "" : ` --request ${endpoint.method}`} '${OTTU_CONNECT_BASE_URL}${url}'`];
  lines.push(`--header 'Authorization: Api-Key <YOUR_API_KEY>'`);
  for (const p of endpoint.parameters) {
    if (p.in !== "header" || p.name.toLowerCase() === "authorization") continue;
    const value = typeof p.example === "string" ? p.example : placeholder(p.schema?.format === "uuid" ? "uuid_v4" : p.name);
    lines.push(`--header '${p.name}: ${value}'`);
  }
  if (body !== undefined) {
    lines.push(`--header 'Content-Type: application/json'`);
    lines.push(`--data-raw '${JSON.stringify(body, null, 2).replace(/\n/g, "\n  ")}'`);
  }
  return lines.join(" \\\n  ");
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>{title}</h4>
      {children}
    </div>
  );
}

export default function EndpointReference({
  operationId,
  requestFields,
  responseFields,
  requestExample,
  hideDescription = false,
}: EndpointReferenceProps): React.JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const endpoint: Endpoint = require(`@site/static/endpoints/${operationId}.json`);

  const success = endpoint.responses.find((r) => r.status.startsWith("2"));
  const errors = endpoint.responses.filter((r) => !r.status.startsWith("2"));
  const body = requestExample ?? endpoint.requestBody?.examples[0]?.value;
  const responseExample = success?.examples[0];

  return (
    <div className={styles.endpoint}>
      <div className={styles.fields}>
        <div className="openapi__method-endpoint">
          <span className={`badge badge--${METHOD_BADGE[endpoint.method] ?? "secondary"}`}>{endpoint.method}</span>
          <code className={styles.path}>{endpoint.path}</code>
        </div>

        {!hideDescription && endpoint.description ? <Markdown>{endpoint.description}</Markdown> : null}

        <div className={styles.params}>
          <ParamsDetails parameters={endpoint.parameters} />
        </div>

        {endpoint.requestBody ? (
          <Section title="Request body">
            <SchemaNode
              schema={pickFields(endpoint.requestBody.schema, requestFields)}
              schemaType="request"
              parentSchemaName={`${operationId}-request`}
            />
          </Section>
        ) : null}

        {success?.schema ? (
          <Section title={`Response ${success.status}`}>
            {success.description ? <Markdown>{success.description}</Markdown> : null}
            <SchemaNode
              schema={pickFields(success.schema, responseFields)}
              schemaType="response"
              parentSchemaName={`${operationId}-response`}
            />
          </Section>
        ) : null}

        {errors.length > 0 ? (
          <Section title="Errors">
            <ul className={styles.errors}>
              {errors.map((r) => (
                <li key={r.status} className={styles.error}>
                  <code className={styles.status}>{r.status}</code>
                  <div className={styles.errorBody}>
                    <Markdown>{r.description}</Markdown>
                    {r.examples.map((ex) => (
                      <details key={ex.name} className={styles.errorExample}>
                        <summary>{ex.summary ?? ex.name}</summary>
                        <CodeBlock language="json">{JSON.stringify(ex.value, null, 2)}</CodeBlock>
                      </details>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </div>

      <div className={styles.samples}>
        <div className={styles.sticky}>
          <CodeBlock language="bash" title="Request">
            {curlFor(endpoint, body)}
          </CodeBlock>
          {responseExample ? (
            <CodeBlock language="json" title={`Response ${success!.status}${responseExample.summary ? ` · ${responseExample.summary}` : ""}`}>
              {JSON.stringify(responseExample.value, null, 2)}
            </CodeBlock>
          ) : null}
        </div>
      </div>
    </div>
  );
}
