import React, { useReducer, useCallback, useEffect, useMemo, useRef } from "react";
import Icon from "@mdi/react";
import { mdiCheck, mdiAlertCircleOutline, mdiChevronDown, mdiOpenInNew } from "@mdi/js";
import {
  ACTIVE_CONNECT,
  callPaymentMethods,
  createSandboxSession,
  extractPgCodes,
  getWebhookBaseUrl,
  type PaymentPlugin,
} from "@site/src/utils/sandbox";
import { createDemoCallbacks } from "@site/src/utils/checkoutSdk";
import ApiPanel from "@site/src/components/ApiPanel";
import CheckoutSDKEmbed from "@site/src/components/CheckoutSDKEmbed";
import TestCardCallout from "@site/src/components/TestCardCallout";
import WebhookViewer from "@site/src/components/RecurringDemo/WebhookViewer";
import styles from "@site/src/components/RecurringDemo/styles.module.css";

// Gateway discovery and session creation must name the same plugin (#159191).
const PLUGIN: PaymentPlugin = "e_commerce";
const POLL_MS = 5000;
const MAX_POLLS = 60;
const SUBSCRIPTIONS = "/b/pbl/v2/subscriptions";

const STEPS = [
  { num: 1, title: "Create the subscription", subtitle: "Checkout API · payment_type: auto_pay" },
  { num: 2, title: "Your customer pays the first charge", subtitle: "Checkout SDK · test card" },
  { num: 3, title: "The webhook arrives", subtitle: "Your webhook_url" },
  { num: 4, title: "Retrieve the subscription", subtitle: "GET /b/pbl/v2/subscriptions/{id}/" },
  { num: 5, title: "Open the customer's page", subtitle: "GET …/page-link/" },
  { num: 6, title: "Cancel at period end (optional)", subtitle: "POST …/cancel/" },
];

const COMPLETE = STEPS.length + 1;

interface State {
  step: number; // 0 = idle, 1..6 = active step, 7 = complete
  busy: boolean;
  error?: string;
  orderId: string;
  customerId: string;
  pgCodes: string[];
  createReq?: any;
  createRes?: any;
  subscriptionId?: string;
  webhook?: any;
  sub?: any;
  polls: number;
  link?: any;
  cancelReq?: any;
  cancelRes?: any;
  expanded: Set<number>;
}

type Action =
  | { type: "SET"; patch: Partial<State> }
  | { type: "TOGGLE"; num: number }
  | { type: "RESET" };

const initialState: State = {
  step: 0,
  busy: false,
  orderId: "",
  customerId: "",
  pgCodes: [],
  polls: 0,
  expanded: new Set(),
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET":
      return { ...state, ...action.patch };
    case "TOGGLE": {
      const expanded = new Set(state.expanded);
      if (expanded.has(action.num)) expanded.delete(action.num);
      else expanded.add(action.num);
      return { ...state, expanded };
    }
    case "RESET":
      return { ...initialState, expanded: new Set() };
  }
}

async function connectCall(
  method: "GET" | "POST",
  path: string,
  options: { body?: unknown; headers?: Record<string, string>; keepalive?: boolean } = {},
): Promise<any> {
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
  if (!response.ok) {
    throw new Error(`${method} ${path} failed (${response.status}): ${text || response.statusText}`);
  }
  return JSON.parse(text);
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

function buildAutoPayRequest(orderId: string, customerId: string, pgCodes: string[]) {
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setUTCFullYear(today.getUTCFullYear() + 1);
  return {
    type: PLUGIN,
    pg_codes: pgCodes,
    amount: "9.900",
    currency_code: "KWD",
    customer_id: customerId,
    customer_first_name: "Demo",
    customer_phone: "50000000",
    customer_email: `demo.${orderId}@example.com`,
    payment_type: "auto_pay",
    include_sdk_setup_preload: true,
    order_no: orderId,
    webhook_url: `${getWebhookBaseUrl()}/webhook/${orderId}`,
    // AutoPay needs the full recurring agreement; the autopay block repeats the schedule.
    agreement: {
      id: `AGR-${orderId}`,
      type: "recurring",
      frequency: "monthly",
      amount_variability: "fixed",
      cycle_interval_days: 30,
      total_cycles: 12,
      expiry_date: isoDate(nextYear),
    },
    autopay: {
      frequency: "monthly",
      recurring_amount: "9.900",
      start_date: isoDate(today),
      description: "Demo plan - monthly",
    },
  };
}

export default function AutoPayDemoInner() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const set = useCallback((patch: Partial<State>) => dispatch({ type: "SET", patch }), []);
  const mounted = useRef(true);
  // The subscription this run created and has not canceled. A ref, so the unmount and pagehide handlers see the current value.
  const liveSubscription = useRef<string | undefined>(undefined);

  // Each run leaves a monthly subscription on the sandbox merchant. Cancel it immediately, best effort.
  const cleanUp = useCallback(() => {
    const id = liveSubscription.current;
    if (!id) return;
    liveSubscription.current = undefined;
    connectCall("POST", `${SUBSCRIPTIONS}/${id}/cancel/`, {
      body: { mode: "immediate" },
      headers: { "Idempotency-Key": crypto.randomUUID() },
      keepalive: true, // lets the request outlive a page unload
    }).catch((err) => console.warn("AutoPay demo: could not cancel the demo subscription", err));
  }, []);

  useEffect(() => {
    mounted.current = true;
    window.addEventListener("pagehide", cleanUp);
    return () => {
      mounted.current = false;
      window.removeEventListener("pagehide", cleanUp);
      cleanUp();
    };
  }, [cleanUp]);

  const restart = useCallback(() => {
    cleanUp();
    dispatch({ type: "RESET" });
  }, [cleanUp]);

  const fail = useCallback(
    (err: unknown) => {
      if (mounted.current) set({ error: err instanceof Error ? err.message : "Something went wrong", busy: false });
    },
    [set],
  );

  // Bring the active step into view; the page below the demo moves as steps collapse.
  useEffect(() => {
    if (state.step < 2) return;
    const timer = setTimeout(() => {
      const target = state.step === COMPLETE ? "[data-autopay-complete]" : `[data-autopay-step="${state.step}"]`;
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(timer);
  }, [state.step]);

  // Step 1: find an auto-debit gateway, then create the subscription.
  const start = useCallback(async () => {
    const orderId = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const customerId = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    dispatch({ type: "RESET" });
    set({ step: 1, busy: true, orderId, customerId });
    try {
      const methods = await callPaymentMethods({
        plugin: PLUGIN,
        currencies: ["KWD"],
        auto_debit: true,
        type: "sandbox",
        tags: ["demo"],
      });
      const pgCodes = extractPgCodes(methods);
      if (pgCodes.length === 0) {
        throw new Error("No auto-debit gateway is enabled for the demo merchant.");
      }
      const createReq = buildAutoPayRequest(orderId, customerId, pgCodes);
      const { type, pg_codes, ...extra } = createReq;
      const createRes = await createSandboxSession({ type, pg_codes, extra });
      const subscriptionId = (createRes as any).extra?.autopay?.subscription_id;
      liveSubscription.current = subscriptionId;
      set({ busy: false, pgCodes, createReq, createRes, subscriptionId });
    } catch (err) {
      fail(err);
    }
  }, [set, fail]);

  const sdkCallbacks = useMemo(() => createDemoCallbacks(() => set({ step: 3 })), [set]);

  // Step 4: retrieve now, then poll while the subscription is still pending_setup.
  const status: string | undefined = state.sub?.status;
  useEffect(() => {
    if (state.step !== 4 || !state.subscriptionId) return;
    if (status && status !== "pending_setup") return;
    if (state.polls >= MAX_POLLS) return;
    const timer = setTimeout(
      async () => {
        try {
          const sub = await connectCall("GET", `${SUBSCRIPTIONS}/${state.subscriptionId}/`);
          if (mounted.current) set({ sub, polls: state.polls + 1 });
        } catch (err) {
          fail(err);
        }
      },
      state.polls === 0 ? 0 : POLL_MS,
    );
    return () => clearTimeout(timer);
  }, [state.step, state.subscriptionId, state.polls, status, set, fail]);

  // Step 5: read the customer's page link (does not rotate it).
  const getPageLink = useCallback(async () => {
    set({ step: 5, busy: true });
    try {
      const link = await connectCall("GET", `${SUBSCRIPTIONS}/${state.subscriptionId}/page-link/`);
      set({ busy: false, link });
    } catch (err) {
      fail(err);
    }
  }, [state.subscriptionId, set, fail]);

  // Step 6: schedule the cancellation for the end of the period.
  const cancelAtPeriodEnd = useCallback(async () => {
    const cancelReq = { mode: "at_period_end" };
    set({ busy: true, cancelReq });
    try {
      const cancelRes = await connectCall("POST", `${SUBSCRIPTIONS}/${state.subscriptionId}/cancel/`, {
        body: cancelReq,
        headers: { "Idempotency-Key": crypto.randomUUID() },
      });
      set({ busy: false, cancelRes });
    } catch (err) {
      fail(err);
    }
  }, [state.subscriptionId, set, fail]);

  const next = (step: number) => <button className={styles.primaryBtn} onClick={() => set({ step })}>Continue</button>;

  const renderBody = (num: number) => {
    switch (num) {
      case 1:
        return (
          <>
            {state.busy && (
              <div className={styles.actions}>
                <button className={styles.primaryBtn} disabled>
                  <span className={styles.spinner} /> Creating the subscription...
                </button>
              </div>
            )}
            {state.createReq && (
              <>
                <ApiPanel label="POST /b/checkout/v1/pymt-txn/" data={state.createReq} />
                <ApiPanel label="Response — 201 Created" data={state.createRes} />
                <p className={styles.cardDescription}>
                  Store <code>extra.autopay.subscription_id</code>: it is your handle on the subscription.
                  The subscription starts in <code>pending_setup</code> until the customer pays.
                </p>
                {state.step === 1 && <div className={styles.actions}>{next(2)}</div>}
              </>
            )}
          </>
        );

      case 2:
        return state.step === 2 ? (
          <>
            <TestCardCallout />
            <CheckoutSDKEmbed
              sessionId={state.createRes.session_id}
              callbacks={sdkCallbacks}
              setupPreload={state.createRes.sdk_setup_preload_payload}
            />
          </>
        ) : (
          <p className={styles.cardDescription}>The first charge was paid in the Checkout SDK.</p>
        );

      case 3:
        return (
          <>
            <WebhookViewer
              orderId={state.orderId}
              label="Payment webhook"
              onEvent={(event) => set({ webhook: event.payload })}
            />
            <p className={styles.cardDescription} style={{ marginTop: 12 }}>
              Read <code>extra.autopay.subscription_id</code> to find the subscription. As a fallback,
              the webhook's <code>session_id</code> equals <code>setup_session_id</code> on the
              subscription. The subscription is usually still <code>pending_setup</code> when this
              webhook arrives, so treat it as "payment received", not "subscription active".
            </p>
            {state.step === 3 && <div className={styles.actions}>{next(4)}</div>}
          </>
        );

      case 4: {
        const pending = !status || status === "pending_setup";
        return (
          <>
            {state.sub && (
              <>
                <ApiPanel label={`GET ${SUBSCRIPTIONS}/${state.subscriptionId}/`} data={state.sub} />
                {state.webhook?.extra?.autopay?.subscription_id === state.sub.id && (
                  <p className={styles.cardDescription}>
                    The webhook's <code>extra.autopay.subscription_id</code> equals this subscription's <code>id</code>.
                  </p>
                )}
              </>
            )}
            <p className={styles.cardDescription}>
              {pending ? (
                <>
                  <strong><code>pending_setup</code> is expected right after payment.</strong> Ottu confirms
                  the first payment on a recurring check (usually a minute or two on the sandbox, up to about 15 minutes in production), so the status
                  lags the payment. {state.polls >= MAX_POLLS ? "Polling stopped; check again below." : "Checking every 5 seconds..."}
                </>
              ) : (
                <>
                  Status is <code>{status}</code>: Ottu confirmed the first payment.
                </>
              )}
            </p>
            {state.step === 4 && (
              <div className={styles.actions}>
                {pending && state.polls >= MAX_POLLS && (
                  <button className={styles.secondaryBtn} onClick={() => set({ polls: 0 })}>Check again</button>
                )}
                <button className={styles.primaryBtn} onClick={getPageLink}>
                  {pending ? "Continue without waiting" : "Continue"}
                </button>
              </div>
            )}
          </>
        );
      }

      case 5:
        return (
          <>
            {state.link && (
              <>
                <ApiPanel label={`GET ${SUBSCRIPTIONS}/${state.subscriptionId}/page-link/`} data={state.link} />
                <p className={styles.cardDescription}>
                  Send <code>page_url</code> to your customer. It is their private self-service page: the
                  link itself is the credential.
                </p>
                <div className={styles.actions}>
                  <a
                    className={styles.secondaryBtn}
                    href={state.link.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    Open the customer page <Icon path={mdiOpenInNew} size={0.6} />
                  </a>
                  {state.step === 5 && next(6)}
                </div>
              </>
            )}
          </>
        );

      case 6:
        return (
          <>
            <p className={styles.cardDescription}>
              <code>at_period_end</code> schedules the cancellation. The status does not change and
              <code>cancel_at_period_end</code> becomes <code>true</code>. When the next billing date
              arrives, Ottu cancels the subscription and does not charge.
            </p>
            {state.cancelReq && (
              <ApiPanel label={`POST ${SUBSCRIPTIONS}/${state.subscriptionId}/cancel/`} data={state.cancelReq} />
            )}
            {state.cancelRes && <ApiPanel label="Response — 200 OK" data={state.cancelRes} />}
            {state.step === 6 && (
              <div className={styles.actions}>
                {!state.cancelRes && (
                  <button className={styles.secondaryBtn} onClick={cancelAtPeriodEnd} disabled={state.busy}>
                    {state.busy ? "Cancelling..." : "Cancel at period end"}
                  </button>
                )}
                <button className={styles.primaryBtn} onClick={() => set({ step: COMPLETE })}>
                  {state.cancelRes ? "Finish" : "Skip and finish"}
                </button>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  if (state.step === 0) {
    return (
      <div className={styles.hero}>
        <h2 className={styles.heroTitle}>Try an AutoPay subscription</h2>
        <p className={styles.heroSubtitle}>
          Create a subscription, pay the first charge with a test card, then watch it activate
          — all in the sandbox. No real money moves.
        </p>
        <button className={styles.primaryBtn} onClick={start}>
          Start Demo
        </button>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={styles.errorCard}>
        <Icon path={mdiAlertCircleOutline} size={1.5} className={styles.errorIcon} />
        <p className={styles.errorMessage}>{state.error}</p>
        <button className={styles.secondaryBtn} onClick={restart}>
          Restart
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.journey}>
        {STEPS.map((step) => {
          const isDone = state.step > step.num;
          const isActive = state.step === step.num;
          const isExpanded = isDone && state.expanded.has(step.num);
          return (
            <div key={step.num} className={styles.step} data-autopay-step={step.num}>
              <div className={`${styles.node} ${isDone ? styles.nodeDone : isActive ? styles.nodeActive : styles.nodePending}`}>
                {isDone ? <Icon path={mdiCheck} size={0.7} /> : step.num}
              </div>
              <div className={`${styles.card} ${isActive ? styles.cardActive : ""} ${isDone ? (isExpanded ? styles.cardDoneExpanded : styles.cardDone) : ""}`}>
                <div
                  className={`${styles.cardHeader} ${isDone ? styles.cardHeaderDone : ""}`}
                  onClick={isDone ? () => dispatch({ type: "TOGGLE", num: step.num }) : undefined}
                >
                  <div>
                    <p className={`${styles.cardTitle} ${!isDone && !isActive ? styles.cardTitlePending : ""}`}>{step.title}</p>
                    {!isDone && <p className={styles.cardSubtitle}>{step.subtitle}</p>}
                  </div>
                  {isDone && (
                    <div className={styles.doneRight}>
                      <span className={styles.doneBadge}><Icon path={mdiCheck} size={0.55} /> Done</span>
                      <Icon path={mdiChevronDown} size={0.8} className={styles.chevron} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }} />
                    </div>
                  )}
                </div>
                {(isActive || isExpanded) && <div className={styles.cardBody}>{renderBody(step.num)}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {state.step === COMPLETE && (
        <div className={styles.completeCard} data-autopay-complete>
          <h3 className={styles.completeTitle}>Journey complete</h3>
          <p className={styles.completeSubtitle}>
            You created a subscription, paid its first charge, and read its status and customer page link.
            From here Ottu bills each cycle, retries failed charges and emails the customer.
          </p>
          <button className={styles.secondaryBtn} onClick={restart}>
            Restart
          </button>
        </div>
      )}
    </>
  );
}
