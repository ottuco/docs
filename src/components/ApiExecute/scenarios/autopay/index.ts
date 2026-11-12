// AutoPay on the sandbox: every tab shares one test subscription, created
// through the Checkout API, and canceled when the reader leaves (session.ts).
import { isoDate } from "@site/src/utils/autoPayRequest";
import type { Endpoint, Scenario } from "../../scenario";
import SubscriptionBar from "./Bar";
import {
  SUBSCRIPTIONS,
  createSubscription,
  findGateway,
  getSession,
  holdSession,
  newAutoPayRequest,
  patchSession,
  readResult,
  rememberSubscription,
  sessionEpoch,
  subscribe,
  type Session,
} from "./session";

// A test subscription in a final state (canceled on the Cancel tab, setup
// failed after an abandoned checkout, expired) no longer counts: the other
// calls need a working one, so Run sets up a new one.
const FINAL_STATES = new Set(["canceled", "setup_failed", "expired"]);

const subscriptionPath = (session: Session, suffix = "") =>
  `${SUBSCRIPTIONS}/${session.subscriptionId ?? "<SUBSCRIPTION_ID>"}/${suffix}`;

const CREATE_PATH = "/b/checkout/v1/pymt-txn/";

type StepKey = "gateway" | "subscription";
// The endpoints, by name: afterRun below picks what to update by name, so a
// renamed endpoint must fail the typecheck there too.
type EndpointName =
  | "create"
  | "list"
  | "retrieve"
  | "cancel"
  | "cycles"
  | "page-link"
  | "regenerate-page-token";

// Calls whose response is the subscription itself: its status is the
// subscription's (another body's `status` may be a token's or a cycle's).
const RETURNS_SUBSCRIPTION = new Set<string>([
  "retrieve",
  "cancel",
] satisfies EndpointName[]);
// The call that creates the test subscription (to remember, and cancel later).
const CREATE: EndpointName = "create";

// Every call but Create works on the test subscription.
const NEEDS_SUBSCRIPTION: StepKey[] = [
  "gateway",
  "subscription",
];
const subscriptionInputs = (session: Session) =>
  `${session.pgCodes}|${session.subscriptionId}|${session.customerId}`;

const autopay: Scenario<Session, StepKey> = {
  steps: {
    gateway: {
      title: "Find an auto-debit gateway",
      method: "POST",
      path: "/b/pbl/v2/payment-methods/",
      done: (session) => Boolean(session.pgCodes),
      run: findGateway,
    },
    subscription: {
      title: "Create a subscription",
      method: "POST",
      path: CREATE_PATH,
      done: (session) =>
        Boolean(session.subscriptionId) &&
        !FINAL_STATES.has(session.subscriptionStatus ?? ""),
      run: () => createSubscription(getSession().pgCodes ?? []),
    },
  },

  // The request each tab's Run sends, and the cURL / Python / Node.js / PHP
  // code built from it (snippets.ts), are written here by hand: they chain
  // live ids (gateway, customer, subscription) that the OpenAPI examples
  // don't have. Unlike the fields on the left and the response examples, they
  // do NOT follow the schema: when a request field, a required field or a
  // path changes, update this map, Create's body in
  // src/utils/autoPayRequest.ts and the Create cURL in
  // docs/developers/payments/autopay/index.mdx.
  endpoints: {
    create: {
      needs: ["gateway"],
      request: (session) => ({
        method: "POST",
        path: CREATE_PATH,
        body: newAutoPayRequest(session.pgCodes ?? ["<AUTO_DEBIT_PG_CODE>"]),
      }),
      // Only the gateway: a subscription made on another tab does not change
      // its code. Its start_date is relative to today: rebuild on a new UTC day.
      inputs: (session) => `${session.pgCodes}|${isoDate(new Date())}`,
      // order_no and customer_id must not repeat.
      newEachRun: true,
    },
    // Filtered to this visit's customer: the sandbox merchant is shared.
    list: {
      needs: NEEDS_SUBSCRIPTION,
      request: (session) => ({
        method: "POST",
        path: `${SUBSCRIPTIONS}/`,
        body: { customer_id: session.customerId ?? "<CUSTOMER_ID>", limit: 10 },
      }),
      inputs: subscriptionInputs,
    },
    retrieve: {
      needs: NEEDS_SUBSCRIPTION,
      request: (session) => ({ method: "GET", path: subscriptionPath(session) }),
      inputs: subscriptionInputs,
    },
    cancel: {
      needs: NEEDS_SUBSCRIPTION,
      request: (session) => ({
        method: "POST",
        path: subscriptionPath(session, "cancel/"),
        body: { mode: "immediate" },
        idempotent: true,
      }),
      inputs: subscriptionInputs,
    },
    cycles: {
      needs: NEEDS_SUBSCRIPTION,
      request: (session) => ({
        method: "GET",
        path: subscriptionPath(session, "cycles/"),
      }),
      inputs: subscriptionInputs,
    },
    "page-link": {
      needs: NEEDS_SUBSCRIPTION,
      request: (session) => ({
        method: "GET",
        path: subscriptionPath(session, "page-link/"),
      }),
      inputs: subscriptionInputs,
    },
    "regenerate-page-token": {
      needs: NEEDS_SUBSCRIPTION,
      request: (session) => ({
        method: "POST",
        path: subscriptionPath(session, "regenerate-page-token/"),
        idempotent: true,
      }),
      inputs: subscriptionInputs,
    },
  } satisfies Record<EndpointName, Endpoint<Session, StepKey>>,

  getState: getSession,
  subscribe,
  epoch: sessionEpoch,
  hold: holdSession,

  afterRun({ endpoint, request, result, before, startedIn }) {
    const data = readResult(result);
    if (endpoint === CREATE) {
      // Cancels the subscription it created if the reader started over meanwhile.
      rememberSubscription(
        request.body as { customer_id: string },
        data,
        startedIn,
      );
      return;
    }
    if (startedIn !== sessionEpoch()) return;
    // Only about the subscription the call was for, and only while the
    // session still holds it: a Create elsewhere may have replaced it.
    const { subscriptionId } = before;
    if (!subscriptionId || getSession().subscriptionId !== subscriptionId)
      return;
    const patch: Partial<Session> = {};
    if (data.pageUrl) patch.pageUrl = data.pageUrl;
    if (
      RETURNS_SUBSCRIPTION.has(endpoint) &&
      data.id === subscriptionId &&
      data.status
    ) {
      patch.subscriptionStatus = data.status;
      patch.live = getSession().live && !FINAL_STATES.has(data.status);
    }
    if (Object.keys(patch).length > 0) patchSession(patch);
  },

  Bar: SubscriptionBar,
};

export default autopay;
