import {
  ACTIVE_CONNECT,
  callPaymentMethods,
  createSandboxSession,
  extractPgCodes,
} from "@site/src/utils/sandbox";
import { AUTOPAY_PLUGIN, buildAutoPayRequest } from "@site/src/utils/autoPayRequest";

export const SUBSCRIPTIONS = "/b/pbl/v2/subscriptions";
const POLL_MS = 5000;
const MAX_POLLS = 60;

export interface ExecuteResult {
  status: number;
  ms: number;
  body: unknown;
}

export interface Session {
  pgCodes?: string[];
  customerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  checkoutUrl?: string;
  pageUrl?: string;
  watchingPayment?: boolean;
  /** True while the subscription still has to be canceled when the reader leaves. */
  live: boolean;
}

// Every tab shares one test subscription, so prerequisites run once per visit.
let session: Session = { live: false };
const listeners = new Set<() => void>();

export const getSession = (): Session => session;

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function patchSession(patch: Partial<Session>): void {
  session = { ...session, ...patch };
  listeners.forEach((listener) => listener());
}

export async function send(
  method: "GET" | "POST",
  path: string,
  options: { body?: unknown; headers?: Record<string, string>; keepalive?: boolean } = {},
): Promise<ExecuteResult> {
  const started = performance.now();
  const response = await fetch(`${ACTIVE_CONNECT.connectBaseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Api-Key ${ACTIVE_CONNECT.connectApiKey}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    keepalive: options.keepalive,
  });
  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Not JSON: show the raw text.
  }
  return { status: response.status, ms: Math.round(performance.now() - started), body };
}

export async function findGateway(): Promise<unknown> {
  const methods = await callPaymentMethods({
    plugin: AUTOPAY_PLUGIN,
    currencies: ["KWD"],
    auto_debit: true,
    type: "sandbox",
    tags: ["demo"],
  });
  const pgCodes = extractPgCodes(methods);
  if (pgCodes.length === 0) {
    throw new Error("No auto-debit gateway is enabled for the demo merchant.");
  }
  patchSession({ pgCodes });
  return methods;
}

export function newAutoPayRequest(pgCodes: string[]) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return buildAutoPayRequest(`docs-${suffix}`, `cust_docs_${suffix}`, pgCodes);
}

export function rememberSubscription(request: { customer_id: string }, response: any): void {
  const subscriptionId = response?.extra?.autopay?.subscription_id;
  if (!subscriptionId) return;
  cancelLiveSubscription();
  patchSession({
    customerId: request.customer_id,
    subscriptionId,
    subscriptionStatus: "pending_setup",
    checkoutUrl: response.checkout_url,
    pageUrl: undefined,
    watchingPayment: false,
    live: true,
  });
  send("GET", `${SUBSCRIPTIONS}/${subscriptionId}/page-link/`)
    .then(({ body }) => {
      const pageUrl = (body as any)?.page_url;
      if (pageUrl && session.subscriptionId === subscriptionId) patchSession({ pageUrl });
    })
    .catch((err) => console.warn("ApiExecute: could not read the page link", err));
}

// The checkout tab is outside this page, so read the status until the first payment lands.
export function watchPayment(): void {
  const { subscriptionId, watchingPayment } = session;
  if (!subscriptionId || watchingPayment) return;
  patchSession({ watchingPayment: true });
  const poll = async (count: number) => {
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    if (session.subscriptionId !== subscriptionId || !session.watchingPayment) return;
    try {
      const status = ((await send("GET", `${SUBSCRIPTIONS}/${subscriptionId}/`)).body as any)?.status;
      if (session.subscriptionId !== subscriptionId) return;
      if (status && status !== "pending_setup") {
        patchSession({ subscriptionStatus: status, watchingPayment: false });
        return;
      }
    } catch (err) {
      console.warn("ApiExecute: could not read the subscription", err);
    }
    if (count + 1 < MAX_POLLS) poll(count + 1);
    else patchSession({ watchingPayment: false });
  };
  poll(0);
}

export async function createSubscription(pgCodes: string[]): Promise<unknown> {
  const request = newAutoPayRequest(pgCodes);
  const { type, pg_codes, ...extra } = request;
  const response = await createSandboxSession({ type, pg_codes, extra });
  rememberSubscription(request, response);
  return response;
}

// Each run leaves a monthly subscription on the sandbox merchant. Cancel it immediately, best effort.
export function cancelLiveSubscription(): void {
  const { live, subscriptionId } = session;
  if (!live || !subscriptionId) return;
  patchSession({ live: false });
  send("POST", `${SUBSCRIPTIONS}/${subscriptionId}/cancel/`, {
    body: { mode: "immediate" },
    headers: { "Idempotency-Key": crypto.randomUUID() },
    keepalive: true, // lets the request outlive a page unload
  }).catch((err) => console.warn("ApiExecute: could not cancel the test subscription", err));
}

export function resetSession(): void {
  cancelLiveSubscription();
  session = { pgCodes: session.pgCodes, live: false };
  listeners.forEach((listener) => listener());
}
