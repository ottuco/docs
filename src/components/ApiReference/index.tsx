// One endpoint, Stripe style: what to send and what comes back on the left,
// a request you can run and its response on the right.
//
// Usage in MDX:
//   <ApiReference api="autopay-subscription-detail" />
//   <ApiReference api="autopay-subscription-detail" scenario="autopay" run="retrieve" tabGroup="autopay-api" />
// `api` is the slug of a generated page in docs/developers/apis/ (any of them:
// src/remark/apiReferenceData.ts passes its operation in at build time).
// Without `run` the right column shows the documented response examples; with
// it, the request and Run: `scenario` and `run` name the ApiExecute scenario
// and its endpoint that run it on the sandbox
// (src/components/ApiExecute/scenarios/).
//
// The left column renders on the server, so search and the MCP server see the
// fields. Only the run panel is browser-only.
import React, { useEffect, useRef } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import Heading from "@theme/Heading";
import useBrokenLinks from "@docusaurus/useBrokenLinks";
import Markdown from "docusaurus-theme-openapi-docs/lib/theme/Markdown";
import ApiExecute, { type ResponseExamples } from "@site/src/components/ApiExecute";
import ResponseExamplesBox from "@site/src/components/ApiExecute/ResponseExamples";
import { runOf, type ScenarioKey } from "@site/src/components/ApiExecute/scenarios";
import FieldList from "./Fields";
import {
  examplesOf,
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
import { endpointOf, type ApiSlug, type GeneratedPage } from "./sources";
import { useHashNavigation } from "./useHash";
import styles from "./styles.module.css";
// The GET / POST badge looks the same in both columns: one definition.
import runStyles from "@site/src/components/ApiExecute/styles.module.css";

const AUTHORIZATION: Field = {
  name: "Authorization",
  schema: {
    type: "string",
    description:
      "`Api-Key {your_api_key}`. Find or create your key in the dashboard; see [Authentication](/developers/getting-started/authentication).",
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

/** Everything one endpoint shows, built once per page load (stable for React.memo). */
type View = ReturnType<typeof buildView>;
// Keyed by the generated page's data: a regenerated page is a new object.
const views = new WeakMap<GeneratedPage, View>();

function buildView(source: GeneratedPage) {
  const { operation, params, bodySchema, responses } = endpointOf(source);
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
    examples: Object.keys(responses)
      .map((code) => ({ code, examples: examplesOf(responses[code]) }))
      .filter((entry) => entry.examples.length > 0) as ResponseExamples,
  };
}

function viewOf(api: ApiSlug, source?: GeneratedPage): View {
  if (!source)
    throw new Error(
      `ApiReference api="${api}" has no operation: src/remark/apiReferenceData.ts passes it in when a docs page builds.`,
    );
  let view = views.get(source);
  if (!view) {
    view = buildView(source);
    views.set(source, view);
  }
  return view;
}

/**
 * A link to a field of this endpoint while another tab is showing: switch the
 * page's tabs to this one (the tab is kept in the query string, like Docusaurus
 * tabs do). sidebarHashActiveLink scrolls to the field once it is visible.
 */
function useShowTabForHash(id: string, tab: string, tabGroup?: string) {
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
    if (params.get(tabGroup) === tab) return;
    params.set(tabGroup, tab);
    history.replace({
      pathname: window.location.pathname,
      search: `?${params}`,
      hash: window.location.hash,
    });
  }, [visit, targeted, tab, tabGroup, location, history]);
}

/**
 * In development, report an endpoint shown twice on one page: both copies get
 * the same anchors, so links to its fields reach only the first.
 */
function useWarnDuplicateAnchor(id: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const copies = document.querySelectorAll(`[id="${CSS.escape(id)}"]`).length;
    if (copies > 1)
      console.error(
        `ApiReference: the anchor "${id}" is on this page ${copies} times; show each endpoint once per page, or give it a different run name.`,
      );
  }, [id]);
}

export default function ApiReference({
  api,
  source,
  scenario,
  run,
  tabGroup,
  object,
}: {
  api: ApiSlug;
  /** The generated page's data: added by src/remark/apiReferenceData.ts, not written by hand. */
  source?: GeneratedPage;
  /** The ApiExecute scenario that runs `run`; both or neither. */
  scenario?: ScenarioKey;
  /** The scenario's endpoint Run sends. Without it, no Run: the response examples only. */
  run?: string;
  /**
   * The `groupId` of the query-string `<Tabs>` this sits in, so a deep link to
   * one of its fields can open its tab. The `<TabItem value>` must equal `run`
   * (or `api` when there is no `run`).
   */
  tabGroup?: string;
  /**
   * Show only the object the endpoint returns, Stripe style ("The
   * Subscription object"): its attributes on the left, one example on the
   * right, under its own title and anchor. Not listed in <ApiShortcuts>.
   */
  object?: { id: string; title: string; intro?: string };
}): React.JSX.Element {
  if (Boolean(scenario) !== Boolean(run))
    throw new Error(
      `ApiReference api="${api}": give both scenario and run, or neither.`,
    );
  // Fails the build on an unknown scenario or endpoint, not only the browser.
  if (scenario && run) runOf(scenario, run);
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
    examples,
  } = viewOf(api, source);
  const heading = source?.title ?? api;
  // The anchor of the endpoint and the prefix of its fields' anchors.
  const name = run ?? api;
  const id = object?.id ?? `${name}-api`;
  useShowTabForHash(id, name, tabGroup);
  useWarnDuplicateAnchor(id);
  // The shape anchors of the body and the response, for the broken-anchor check.
  const brokenLinks = useBrokenLinks();
  bodyVariants.forEach((variant) =>
    brokenLinks.collectAnchor(variantId(`${id}-body`, variant.label)),
  );
  responseVariants.forEach((variant) =>
    brokenLinks.collectAnchor(variantId(`${id}-response`, variant.label)),
  );

  if (object)
    return (
      <div className={styles.reference}>
        <div className={styles.left}>
          <Heading as="h3" id={id} className={styles.title}>
            {object.title}
          </Heading>
          {object.intro && (
            <div className={styles.description}>
              <Markdown>{forMarkdown(object.intro)}</Markdown>
            </div>
          )}
          <Section id={`${id}-attributes`} title="Attributes">
            <FieldList fields={responseFields} prefix={id} />
          </Section>
        </div>
        <div className={styles.right}>
          <ResponseExamplesBox
            examples={examples.filter((example) => example.code === ok)}
          />
        </div>
      </div>
    );

  // Checked above: both or neither.
  const runnable = scenario && run ? { scenario, run } : undefined;
  // Nothing to show on the right: the fields take the whole width.
  const single = !runnable && examples.length === 0;

  return (
    <div className={single ? `${styles.reference} ${styles.single}` : styles.reference}>
      <div className={styles.left}>
        <Heading as="h3" id={id} className={styles.title}>
          {heading}
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
      </div>

      {!single && (
        <div className={styles.right}>
          {runnable ? (
            <ApiExecute
              scenario={runnable.scenario}
              endpoint={runnable.run}
              examples={examples}
            />
          ) : (
            <ResponseExamplesBox examples={examples} />
          )}
        </div>
      )}
    </div>
  );
}
