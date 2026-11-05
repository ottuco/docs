// One endpoint, Stripe style: what to send and what comes back on the left,
// a request you can run and its response on the right.
//
// Usage in MDX:
//   <ApiReference api="autopay-subscription-detail" run="retrieve" tabGroup="autopay-api" />
// `api` is the slug of a generated page in docs/developers/apis/ (listed in
// sources.ts); `run` is the ApiExecute endpoint that runs it on the sandbox.
//
// The left column renders on the server, so search and the MCP server see the
// fields. Only the run panel is browser-only.
import React, { useEffect, useRef } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import useBrokenLinks from "@docusaurus/useBrokenLinks";
import Markdown from "docusaurus-theme-openapi-docs/lib/theme/Markdown";
import ApiExecute, {
  type EndpointKey,
  type ResponseExamples,
} from "@site/src/components/ApiExecute";
import FieldList, { Children } from "./Fields";
import {
  examplesOf,
  fieldId,
  fieldsOf,
  forMarkdown,
  jsonOf,
  normalize,
  statusText,
  successCode,
  variantsOf,
  variantId,
  type Field,
  type Param,
  type Response,
  type Variant,
} from "./schema";
import { endpointOf, type ApiSlug } from "./sources";
import { useHashNavigation } from "./useHash";
import styles from "./styles.module.css";
// The GET / POST badge looks the same in both columns: one definition.
import runStyles from "@site/src/components/ApiExecute/styles.module.css";

const AUTHORIZATION: Field = {
  name: "Authorization",
  schema: {
    type: "string",
    description:
      "`Api-Key <your API key>`. Find or create your key in the dashboard; see [Authentication](/developers/getting-started/authentication).",
  },
  required: true,
  nullable: false,
  children: [],
  variants: [],
};

function paramFields(params: Param[], where: Param["in"]): Field[] {
  return params
    .filter((param) => param.in === where)
    .map((param) => {
      const { schema, nullable } = normalize(param.schema);
      return {
        name: param.name,
        schema: {
          ...schema,
          description: param.description ?? schema.description,
        },
        required: Boolean(param.required),
        nullable,
        children: [],
        variants: [],
      };
    });
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <Heading as="h4" id={id} className={styles.sectionTitle}>
        {title}
      </Heading>
      {children}
    </section>
  );
}

type OtherResponse = {
  code: string;
  summaries: string[];
  fields: Field[];
  /** When the body is one of several shapes (oneOf). */
  variants: Variant[];
};

function OtherResponses({
  id,
  others,
}: {
  id: string;
  others: OtherResponse[];
}) {
  const brokenLinks = useBrokenLinks();
  others.forEach(({ code }) => brokenLinks.collectAnchor(fieldId(id, code)));
  if (others.length === 0) return null;
  return (
    <Section id={id} title="Other responses">
      <ul className={styles.codes}>
        {others.map(({ code, summaries, fields, variants }) => (
          <li key={code} id={fieldId(id, code)}>
            <div className={styles.codeHead}>
              <span className={styles.code} data-code={code[0]}>
                {code}
              </span>
              <span className={styles.codeText}>
                {statusText(code)}
                {summaries.length > 0 && ": " + summaries.join(", ")}
              </span>
            </div>
            {fields.length > 0 && (
              <Children
                id={fieldId(id, code)}
                fields={fields}
                label="response fields"
              />
            )}
            {variants.map((variant) => (
              <Children
                key={variant.label}
                id={variantId(fieldId(id, code), variant.label)}
                anchored
                fields={variant.children}
                label={`response fields when ${variant.label}`}
              />
            ))}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Everything one endpoint shows, built once per page load (stable for React.memo). */
type View = ReturnType<typeof buildView>;
const views = new Map<ApiSlug, View>();

function buildView(api: ApiSlug) {
  const { operation, params, bodySchema, responses } = endpointOf(api);
  const ok = successCode(responses);
  const okSchema = jsonOf(responses[ok ?? ""])?.schema;
  const responseFields = fieldsOf(okSchema, "response");
  return {
    operation,
    responses,
    ok,
    okIsArray: okSchema ? normalize(okSchema).schema.type === "array" : false,
    pathFields: paramFields(params, "path"),
    queryFields: paramFields(params, "query"),
    // Authorization is added by hand (it comes from the security scheme);
    // skip it if the spec also declares it as a header parameter.
    headerFields: [
      AUTHORIZATION,
      ...paramFields(params, "header").filter(
        (field) => field.name.toLowerCase() !== "authorization",
      ),
    ],
    bodyFields: fieldsOf(bodySchema, "request"),
    bodyVariants: variantsOf(bodySchema, "request"),
    responseFields,
    // Shared fields and alternative shapes can both be there: show both.
    responseVariants: variantsOf(okSchema, "response"),
    others: Object.keys(responses)
      .filter((code) => code !== ok)
      .map((code) => ({
        code,
        summaries: examplesOf(responses[code]).map(
          (example) => example.summary,
        ),
        fields: fieldsOf(jsonOf(responses[code])?.schema, "response"),
        variants: variantsOf(jsonOf(responses[code])?.schema, "response"),
      })) as OtherResponse[],
    examples: Object.keys(responses)
      .map((code) => ({ code, examples: examplesOf(responses[code]) }))
      .filter((entry) => entry.examples.length > 0) as ResponseExamples,
  };
}

function viewOf(api: ApiSlug): View {
  let view = views.get(api);
  if (!view) {
    view = buildView(api);
    views.set(api, view);
  }
  return view;
}

/**
 * A link to a field of this endpoint while another tab is showing: switch the
 * page's tabs to this one (the tab is kept in the query string, like Docusaurus
 * tabs do). sidebarHashActiveLink scrolls to the field once it is visible.
 */
function useShowTabForHash(id: string, run: string, tabGroup?: string) {
  const { hash, visit } = useHashNavigation();
  const location = useLocation();
  const history = useHistory();
  const targeted = hash === id || hash.startsWith(`${id}-`);
  // Act on the first render and on each visit to a hash, not on every
  // location change: a tab click rewrites the query string, and acting then
  // would pull the reader back to this tab while the hash still points here.
  const handled = useRef<number | null>(null);

  useEffect(() => {
    if (handled.current === visit) return;
    // The effect can run late (a slow render): if the URL has moved on since,
    // this visit is stale. Leave it unhandled; the next render decides.
    if (window.location.hash !== location.hash) return;
    handled.current = visit;
    if (!tabGroup || !targeted) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get(tabGroup) === run) return;
    params.set(tabGroup, run);
    history.replace({
      pathname: window.location.pathname,
      search: `?${params}`,
      hash: window.location.hash,
    });
  }, [visit, targeted, run, tabGroup, location, history]);
}

export default function ApiReference({
  api,
  run,
  tabGroup,
}: {
  api: ApiSlug;
  run: EndpointKey;
  /**
   * The `groupId` of the query-string `<Tabs>` this sits in, so a deep link to
   * one of its fields can open its tab. The `<TabItem value>` must equal `run`.
   */
  tabGroup?: string;
}): React.JSX.Element {
  const {
    operation,
    responses,
    ok,
    okIsArray,
    pathFields,
    queryFields,
    headerFields,
    bodyFields,
    bodyVariants,
    responseFields,
    responseVariants,
    others,
    examples,
  } = viewOf(api);
  const id = `${run}-api`;
  useShowTabForHash(id, run, tabGroup);
  // The shape anchors of the body and the response, for the broken-anchor check.
  const brokenLinks = useBrokenLinks();
  bodyVariants.forEach((variant) =>
    brokenLinks.collectAnchor(variantId(`${id}-body`, variant.label)),
  );
  responseVariants.forEach((variant) =>
    brokenLinks.collectAnchor(variantId(`${id}-response`, variant.label)),
  );

  return (
    <div className={styles.reference}>
      <div className={styles.left}>
        <Heading as="h3" id={id} className={styles.title}>
          {operation.title}
        </Heading>
        <div className={styles.endpoint}>
          <span
            className={runStyles.method}
            data-method={operation.method.toUpperCase()}
          >
            {operation.method.toUpperCase()}
          </span>
          <code>{operation.path}</code>
        </div>
        {operation.description && (
          <div className={styles.description}>
            <Markdown>{forMarkdown(operation.description)}</Markdown>
          </div>
        )}

        {pathFields.length > 0 && (
          <Section id={`${id}-path`} title="Path parameters">
            <FieldList fields={pathFields} prefix={`${id}-path`} />
          </Section>
        )}
        {queryFields.length > 0 && (
          <Section id={`${id}-query`} title="Query parameters">
            <FieldList fields={queryFields} prefix={`${id}-query`} />
          </Section>
        )}
        <Section id={`${id}-headers`} title="Headers">
          <FieldList fields={headerFields} prefix={`${id}-headers`} />
        </Section>
        {(bodyFields.length > 0 || bodyVariants.length > 0) && (
          <Section id={`${id}-body`} title="Request body">
            <FieldList fields={bodyFields} prefix={`${id}-body`} />
            {bodyVariants.map((variant) => (
              <div
                key={variant.label}
                id={variantId(`${id}-body`, variant.label)}
                className={styles.variant}
              >
                <p className={styles.variantTitle}>
                  When the body is a {variant.label}
                </p>
                <FieldList
                  fields={variant.children}
                  prefix={variantId(`${id}-body`, variant.label)}
                />
              </div>
            ))}
          </Section>
        )}
        {ok && (
          <Section id={`${id}-response`} title={`Response ${ok}`}>
            {okIsArray && (
              <p className={styles.muted}>
                A list. Each item has these fields.
              </p>
            )}
            {responseFields.length > 0 && (
              <FieldList fields={responseFields} prefix={`${id}-response`} />
            )}
            {responseVariants.map((variant) => (
              <div
                key={variant.label}
                id={variantId(`${id}-response`, variant.label)}
                className={styles.variant}
              >
                <p className={styles.variantTitle}>
                  When the response is a {variant.label}
                </p>
                <FieldList
                  fields={variant.children}
                  prefix={variantId(`${id}-response`, variant.label)}
                />
              </div>
            ))}
            {responseFields.length === 0 && responseVariants.length === 0 && (
              <p className={styles.muted}>
                {responses[ok].description || statusText(ok)}
              </p>
            )}
          </Section>
        )}
        <OtherResponses id={`${id}-errors`} others={others} />
        <p className={styles.muted}>
          Full generated reference:{" "}
          <Link to={`/developers/apis/${api}`}>{operation.title}</Link>.
        </p>
      </div>

      <div className={styles.right}>
        <ApiExecute endpoint={run} examples={examples} />
      </div>
    </div>
  );
}
