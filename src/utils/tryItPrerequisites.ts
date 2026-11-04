/**
 * Try-it prerequisites: setup requests the API explorer can run before Execute.
 *
 * Some endpoints act on an object that has to exist first (Retrieve, Cancel… a
 * subscription). A chain lists the setup requests, what to read from each
 * response, and which explorer parameters to fill with it. The explorer shows the
 * chain above its Request form (src/theme/ApiExplorer/Request), runs it with the
 * public demo key, and the reader then presses Send as usual.
 *
 * Chains are keyed by operationId, so any API can add one here.
 *
 * Sandbox only: every request goes to ACTIVE_CONNECT, and runChain refuses a base
 * URL that is not one of the demo merchants in src/utils/sandbox.ts.
 */

import { ACTIVE_CONNECT, KSA, SANDBOX } from "@site/src/utils/sandbox";

export type PrereqContext = Record<string, unknown>;

export interface PrereqStep {
  title: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** May hold `{name}` placeholders, filled from earlier steps' outputs. */
  path: string;
  /** Built at run time from the earlier steps' outputs (dates, unique ids). */
  body?: (ctx: PrereqContext) => unknown;
  /**
   * What to keep from the JSON response: context key -> dotted path.
   * `[]` maps over an array: `payment_methods[].code`. Every output is required;
   * a missing one fails the step.
   */
  outputs: Record<string, string>;
}

export interface PrereqFill {
  in: "path" | "query" | "header";
  /** The explorer parameter's name. */
  name: string;
  /** Context key whose value fills the parameter. */
  from?: string;
  /** Or a fresh value, e.g. an Idempotency-Key. */
  generate?: "uuid";
}

export interface PrereqChain {
  /** One line on what the chain creates, shown above the Run button. */
  summary: string;
  steps: PrereqStep[];
  fills: PrereqFill[];
}

export interface PrereqStepResult {
  title: string;
  method: string;
  url: string;
  body?: unknown;
  status?: number;
  response?: unknown;
  error?: string;
}

// ---------------------------------------------------------------------------
// AutoPay

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const uniqueRef = () => `tryit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** A gateway that can auto-debit, then a subscription on it (the request in the AutoPay guide). */
const AUTOPAY_SUBSCRIPTION_STEPS: PrereqStep[] = [
  {
    title: "Find a gateway that can auto-debit",
    method: "POST",
    path: "/b/pbl/v2/payment-methods/",
    body: () => ({
      plugin: "e_commerce",
      operation: "purchase",
      currencies: ["KWD"],
      auto_debit: true,
      type: "sandbox",
      tags: ["demo"],
    }),
    outputs: { pg_codes: "payment_methods[].code" },
  },
  {
    title: "Create a subscription",
    method: "POST",
    path: "/b/checkout/v1/pymt-txn/",
    body: (ctx) => {
      const ref = uniqueRef();
      const today = new Date();
      const expiry = new Date(today);
      expiry.setUTCFullYear(today.getUTCFullYear() + 1);
      return {
        type: "e_commerce",
        // One gateway: checkout rejects the whole list if any code in it is not valid for the session.
        pg_codes: (ctx.pg_codes as string[]).slice(0, 1),
        amount: "9.900",
        currency_code: "KWD",
        customer_id: `cust_${ref}`,
        customer_email: `${ref}@example.com`,
        payment_type: "auto_pay",
        order_no: ref,
        agreement: {
          id: `AGR-${ref}`,
          type: "recurring",
          frequency: "monthly",
          amount_variability: "fixed",
          cycle_interval_days: 30,
          total_cycles: 12,
          expiry_date: isoDate(expiry),
        },
        autopay: {
          frequency: "monthly",
          recurring_amount: "9.900",
          start_date: isoDate(today),
          description: "Try-it plan - monthly",
        },
      };
    },
    outputs: { subscription_id: "extra.autopay.subscription_id" },
  },
];

const AUTOPAY_SUMMARY =
  "Creates a sandbox subscription (status pending_setup, no payment is taken) and fills its ID in below.";

const autopaySubscription = (extraFills: PrereqFill[] = []): PrereqChain => ({
  summary: AUTOPAY_SUMMARY,
  steps: AUTOPAY_SUBSCRIPTION_STEPS,
  fills: [{ in: "path", name: "subscription_id", from: "subscription_id" }, ...extraFills],
});

const IDEMPOTENCY_KEY: PrereqFill = { in: "header", name: "Idempotency-Key", generate: "uuid" };

export const TRY_IT_PREREQUISITES: Record<string, PrereqChain> = {
  autopay_subscription_detail: autopaySubscription(),
  autopay_subscription_cycles: autopaySubscription(),
  autopay_subscription_page_link: autopaySubscription(),
  autopay_subscription_cancel: autopaySubscription([IDEMPOTENCY_KEY]),
  autopay_subscription_regenerate_page_token: autopaySubscription([IDEMPOTENCY_KEY]),
};

// ---------------------------------------------------------------------------
// Runner

const DEMO_HOSTS = [SANDBOX.connectBaseUrl, KSA.connectBaseUrl];

/** Reads a dotted path; `key[]` maps the rest of the path over an array. */
export function pick(value: unknown, path: string): unknown {
  const [head, ...rest] = path.split(".");
  if (value == null || head === undefined) return value;
  if (head.endsWith("[]")) {
    const list = (value as any)[head.slice(0, -2)];
    if (!Array.isArray(list)) return undefined;
    return rest.length ? list.map((item) => pick(item, rest.join("."))) : list;
  }
  const next = (value as any)[head];
  return rest.length ? pick(next, rest.join(".")) : next;
}

function isMissing(value: unknown): boolean {
  return value == null || value === "" || (Array.isArray(value) && value.length === 0);
}

/**
 * Runs the chain's steps in order. Calls onStep after each request so the UI can
 * show it. Resolves with the context, or with null when a step failed.
 */
export async function runChain(
  chain: PrereqChain,
  onStep: (index: number, result: PrereqStepResult) => void,
): Promise<PrereqContext | null> {
  const base = ACTIVE_CONNECT.connectBaseUrl;
  if (!DEMO_HOSTS.includes(base)) {
    throw new Error(`Prerequisites run only against a demo merchant, not ${base}.`);
  }

  const ctx: PrereqContext = {};
  for (const [index, step] of chain.steps.entries()) {
    const path = step.path.replace(/{([^}]+)}/g, (_, name) => encodeURIComponent(String(ctx[name] ?? "")));
    const body = step.body?.(ctx);
    const result: PrereqStepResult = { title: step.title, method: step.method, url: `${base}${path}`, body };
    onStep(index, result);

    let response: Response;
    try {
      response = await fetch(`${base}${path}`, {
        method: step.method,
        headers: {
          Authorization: `Api-Key ${ACTIVE_CONNECT.connectApiKey}`,
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      onStep(index, { ...result, error: err instanceof Error ? err.message : "The request failed." });
      return null;
    }

    const text = await response.text();
    let json: unknown = text;
    try {
      json = JSON.parse(text);
    } catch {
      // not JSON: show the text as it came
    }
    result.status = response.status;
    result.response = json;
    if (!response.ok) {
      onStep(index, { ...result, error: `The setup request returned ${response.status}.` });
      return null;
    }

    for (const [key, outputPath] of Object.entries(step.outputs)) {
      const value = pick(json, outputPath);
      if (isMissing(value)) {
        onStep(index, { ...result, error: `The response has no \`${outputPath}\`.` });
        return null;
      }
      ctx[key] = value;
    }
    onStep(index, result);
  }
  return ctx;
}

/** The value a fill puts into its parameter. */
export function fillValue(fill: PrereqFill, ctx: PrereqContext): string | undefined {
  if (fill.generate === "uuid") return crypto.randomUUID();
  const value = fill.from ? ctx[fill.from] : undefined;
  return value == null ? undefined : String(value);
}
