import {
  callPaymentMethods,
  createSandboxSession,
  extractPgCodes,
  paymentMethodsBody,
  sandboxSessionBody,
  type PaymentMethodsOptions,
} from "@site/src/utils/sandbox";
import { AUTOPAY_PLUGIN, buildAutoPayRequest } from "@site/src/utils/autoPayRequest";
import { send, type ExecuteResult } from "../../send";
import type { StepRun } from "../../scenario";

export const SUBSCRIPTIONS = "/b/pbl/v2/subscriptions";
const POLL_MS = 5000;
const MAX_POLLS = 60;

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

// One in-flight call per step: a second Run (or a reopened dialog) waits for
// the first instead of creating a second gateway lookup or subscription.
let findingGateway: Promise<StepRun> | null = null;
let creatingSubscription: Promise<StepRun> | null = null;

export function findGateway(): Promise<StepRun> {
  if (!findingGateway) {
    const call: Promise<StepRun> = lookUpGateway().finally(() => {
      if (findingGateway === call) findingGateway = null; // not a newer one
    });
    findingGateway = call;
  }
  return findingGateway;
}

// The demo merchant's auto-debit gateways for the AutoPay plugin.
const GATEWAY_QUERY: PaymentMethodsOptions = {
  plugin: AUTOPAY_PLUGIN,
  currencies: ["KWD"],
  auto_debit: true,
  type: "sandbox",
  tags: ["demo"],
};

async function lookUpGateway(): Promise<StepRun> {
  const methods = await callPaymentMethods(GATEWAY_QUERY);
  const pgCodes = extractPgCodes(methods);
  if (pgCodes.length === 0) {
    throw new Error("No auto-debit gateway is enabled for the demo merchant.");
  }
  patchSession({ pgCodes });
  return { body: paymentMethodsBody(GATEWAY_QUERY), response: methods };
}

export function newAutoPayRequest(pgCodes: string[]) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return buildAutoPayRequest(`docs-${suffix}`, `cust_docs_${suffix}`, pgCodes);
}

// Bumped by Start over: a create that was in flight then must not come back.
let epoch = 0;
/** The current session epoch; pass it to rememberSubscription after an await. */
export const sessionEpoch = () => epoch;

/**
 * The fields read from a response body: the Checkout API (with AutoPay) and
 * the subscription endpoints.
 */
export type ResponseFields = {
  id?: string;
  status?: string;
  pageUrl?: string;
  checkoutUrl?: string;
  subscriptionId?: string;
};

type Json = Record<string, unknown>;
const objectOf = (value: unknown): Json =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Json) : {};
const textOf = (value: unknown) => (typeof value === "string" ? value : undefined);
const idOf = (value: unknown) =>
  typeof value === "number" ? String(value) : textOf(value);

/** The fields this file reads, as text: a body that is not JSON (an error page), a list or an odd shape gives none. */
function readResponse(body: unknown): ResponseFields {
  const data = objectOf(body);
  return {
    // The spec names a subscription's id `id`; the sandbox sends
    // `subscription_id`. Prefer it: an `id` next to it would be another key.
    id: idOf(data.subscription_id ?? data.id),
    status: textOf(data.status),
    pageUrl: textOf(data.page_url),
    checkoutUrl: textOf(data.checkout_url),
    subscriptionId: idOf(objectOf(objectOf(data.extra).autopay).subscription_id),
  };
}

/** readResponse for a call's result: an error response (not 2xx) gives none. */
export function readResult({ status, body }: ExecuteResult): ResponseFields {
  return status >= 200 && status < 300 ? readResponse(body) : {};
}

export function rememberSubscription(
  request: { customer_id: string },
  response: ResponseFields,
  /** sessionEpoch() from before the call: a subscription created across Start over is canceled. */
  startedIn: number,
): void {
  const { subscriptionId } = response;
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
    checkoutUrl: response.checkoutUrl,
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
    .then((result) => {
      const { pageUrl } = readResult(result);
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
      const { status } = readResult(await send("GET", `${SUBSCRIPTIONS}/${subscriptionId}/`));
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

export function createSubscription(pgCodes: string[]): Promise<StepRun> {
  if (!creatingSubscription) {
    const call: Promise<StepRun> = newSubscription(pgCodes).finally(() => {
      if (creatingSubscription === call) creatingSubscription = null;
    });
    creatingSubscription = call;
  }
  return creatingSubscription;
}

async function newSubscription(pgCodes: string[]): Promise<StepRun> {
  const startedIn = epoch;
  const request = newAutoPayRequest(pgCodes);
  const { type, pg_codes, ...extra } = request;
  const options = { type, pg_codes, extra };
  // Built here so the dialog shows the body that was sent (it has a random customer).
  const body = sandboxSessionBody(options);
  const created = await createSandboxSession(options, body);
  const response = readResponse(created);
  // A checkout without the autopay block created no subscription: fail the
  // step, or the next call would run against {subscription_id}.
  if (!response.subscriptionId) {
    throw new Error("The sandbox created no subscription for this checkout.");
  }
  rememberSubscription(request, response, startedIn); // cancels it if stale
  // Tell the dialog this step did not give it a subscription to use.
  if (startedIn !== epoch) throw new Error("Started over while this was being created.");
  return { body, response: created };
}

// Each run leaves a monthly subscription on the sandbox merchant. Cancel it immediately, best effort.
function cancelSubscription(subscriptionId: string): void {
  send("POST", `${SUBSCRIPTIONS}/${subscriptionId}/cancel/`, {
    body: { mode: "immediate" },
    headers: { "Idempotency-Key": crypto.randomUUID() },
    keepalive: true, // lets the request outlive a page unload
  }).catch((err) => console.warn("ApiExecute: could not cancel the test subscription", err));
}

/** Cancels the live test subscription, if there is one; tells whether it did. */
export function cancelLiveSubscription(): boolean {
  const { live, subscriptionId } = session;
  if (!live || !subscriptionId) return false;
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
  return true;
}

// Each run leaves a subscription on the shared sandbox merchant, so it is
// canceled when the reader leaves: on pagehide (tab closed, link to another
// site), and when the last run panel unmounts (moving to another docs page).
// pagehide also fires when the page goes into the back/forward cache, and
// the page may never come back, so it cancels then too. If it does come back
// (pageshow, persisted) after that cancel, the panels would show responses
// about a subscription that is gone, so the session starts over.
let leaveListener = false;
let canceledOnHide = false;
function listenForLeave(): void {
  if (leaveListener) return;
  leaveListener = true;
  window.addEventListener("pagehide", () => {
    canceledOnHide = cancelLiveSubscription();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && canceledOnHide) resetSession();
    canceledOnHide = false;
  });
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
