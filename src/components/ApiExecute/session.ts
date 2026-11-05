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

// One in-flight call per step: a second Run (or a reopened dialog) waits for
// the first instead of creating a second gateway lookup or subscription.
let findingGateway: Promise<unknown> | null = null;
let creatingSubscription: Promise<unknown> | null = null;

export function findGateway(): Promise<unknown> {
  if (!findingGateway) {
    const call: Promise<unknown> = lookUpGateway().finally(() => {
      if (findingGateway === call) findingGateway = null; // not a newer one
    });
    findingGateway = call;
  }
  return findingGateway;
}

async function lookUpGateway(): Promise<unknown> {
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

// Bumped by Start over: a create that was in flight then must not come back.
let epoch = 0;
/** The current session epoch; pass it to rememberSubscription after an await. */
export const sessionEpoch = () => epoch;

export function rememberSubscription(
  request: { customer_id: string },
  response: any,
  /** sessionEpoch() from before the call: a subscription created across Start over is canceled. */
  startedIn: number,
): void {
  const subscriptionId = response?.extra?.autopay?.subscription_id;
  if (!subscriptionId) return;
  if (startedIn !== epoch) {
    // The reader pressed Start over while this was being created: drop it.
    cancelSubscription(subscriptionId);
    return;
  }
  cancelLiveSubscription();
  listenForLeave();
  patchSession({
    customerId: request.customer_id,
    subscriptionId,
    subscriptionStatus: "pending_setup",
    checkoutUrl: response.checkout_url,
    pageUrl: undefined,
    watchingPayment: false,
    live: true,
  });
  // The reader may have left (no run panel mounted) while this was in flight.
  if (panels === 0) {
    cancelLiveSubscription();
    return;
  }
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
        cancelIfLeft();
        return;
      }
    } catch (err) {
      console.warn("ApiExecute: could not read the subscription", err);
    }
    if (count + 1 < MAX_POLLS) poll(count + 1);
    else {
      patchSession({ watchingPayment: false });
      cancelIfLeft();
    }
  };
  poll(0);
}

export function createSubscription(pgCodes: string[]): Promise<unknown> {
  if (!creatingSubscription) {
    const call: Promise<unknown> = newSubscription(pgCodes).finally(() => {
      if (creatingSubscription === call) creatingSubscription = null;
    });
    creatingSubscription = call;
  }
  return creatingSubscription;
}

async function newSubscription(pgCodes: string[]): Promise<unknown> {
  const startedIn = epoch;
  const request = newAutoPayRequest(pgCodes);
  const { type, pg_codes, ...extra } = request;
  const response: any = await createSandboxSession({ type, pg_codes, extra });
  // A checkout without the autopay block created no subscription: fail the
  // step, or the next call would run against <SUBSCRIPTION_ID>.
  if (!response?.extra?.autopay?.subscription_id) {
    throw new Error("The sandbox created no subscription for this checkout.");
  }
  rememberSubscription(request, response, startedIn); // cancels it if stale
  // Tell the dialog this step did not give it a subscription to use.
  if (startedIn !== epoch) throw new Error("Started over while this was being created.");
  return response;
}

// Each run leaves a monthly subscription on the sandbox merchant. Cancel it immediately, best effort.
function cancelSubscription(subscriptionId: string): void {
  send("POST", `${SUBSCRIPTIONS}/${subscriptionId}/cancel/`, {
    body: { mode: "immediate" },
    headers: { "Idempotency-Key": crypto.randomUUID() },
    keepalive: true, // lets the request outlive a page unload
  }).catch((err) => console.warn("ApiExecute: could not cancel the test subscription", err));
}

export function cancelLiveSubscription(): void {
  const { live, subscriptionId } = session;
  if (!live || !subscriptionId) return;
  // Forget it too: the bar and the next calls must not use a canceled one.
  patchSession({
    live: false,
    customerId: undefined,
    subscriptionId: undefined,
    subscriptionStatus: undefined,
    checkoutUrl: undefined,
    pageUrl: undefined,
    watchingPayment: false,
  });
  cancelSubscription(subscriptionId);
}

// Each run leaves a subscription on the shared sandbox merchant, so it is
// canceled when the reader leaves: on pagehide (tab closed, link to another
// site), and when the last run panel unmounts (moving to another docs page).
let leaveListener = false;
function listenForLeave(): void {
  if (leaveListener) return;
  leaveListener = true;
  window.addEventListener("pagehide", cancelLiveSubscription);
}

let panels = 0;

/** The reader left the page while paying: cancel now that the payment is done. */
function cancelIfLeft(): void {
  if (panels === 0) cancelLiveSubscription();
}
/** Called by each run panel on mount; the returned function on unmount. */
export function holdSession(): () => void {
  panels += 1;
  return () => {
    panels -= 1;
    // Re-check on the next tick: a remount (hot reload) unmounts and mounts
    // every panel in one commit, and must not cancel the subscription.
    // Not while the reader is paying in the checkout tab: they may have just
    // followed a docs link (say, to the test cards). Closing the tab
    // (pagehide) still cancels it.
    setTimeout(() => {
      if (panels === 0 && !session.watchingPayment) cancelLiveSubscription();
    });
  };
}

export function resetSession(): void {
  epoch += 1;
  // A Run after this must start its own steps, not join the old ones.
  findingGateway = null;
  creatingSubscription = null;
  cancelLiveSubscription();
  session = { pgCodes: session.pgCodes, live: false };
  listeners.forEach((listener) => listener());
}
