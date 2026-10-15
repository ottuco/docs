import React, { useReducer, useRef, useCallback, useEffect } from "react";
import Icon from "@mdi/react";
import { mdiCheck, mdiAlertCircleOutline, mdiChevronDown, mdiOpenInNew } from "@mdi/js";
import {
  createSandboxSession,
  callPaymentMethods,
  extractPgCodes,
  getWebhookBaseUrl,
  getWebhookRelayUrl,
  retrieveSubscription,
  getSubscriptionPageLink,
  cancelSubscription,
  type PaymentPlugin,
} from "@site/src/utils/sandbox";
import ApiPanel from "@site/src/components/ApiPanel";
import CheckoutSDKEmbed from "@site/src/components/CheckoutSDKEmbed";
import { TEST_CARD } from "@site/src/components/TestCardCallout";
import WebhookViewer from "@site/src/components/RecurringDemo/WebhookViewer";
import styles from "@site/src/components/RecurringDemo/styles.module.css";

// Gateway discovery and session creation must name the same plugin, or the
// session gets pg_codes that are not enabled for it (#159191).
const PLUGIN: PaymentPlugin = "e_commerce";

// AutoPay confirms the first payment on its own schedule (it polls Connect), so
// the subscription can stay pending_setup for a few minutes after the customer pays.
const POLL_INTERVAL_MS = 5000;
const POLL_LIMIT = 72;

type Phase =
  | "idle"
  | "s1_calling" | "s1_done"
  | "s2_sdk" | "s2_success"
  | "s3_waiting" | "s3_done"
  | "s4_polling" | "s4_slow" | "s4_done"
  | "s5_calling" | "s5_done"
  | "s6_calling" | "s6_done"
  | "complete" | "error";

interface State {
  phase: Phase;
  orderId: string;
  customerId: string;
  createRequest?: any;
  createResponse?: any;
  sessionId?: string;
  subscriptionId?: string;
  webhookPayload?: any;
  statusTrail: string[];
  subscription?: any;
  pageLink?: any;
  cancelRequest?: any;
  cancelResponse?: any;
  expandedDoneSteps: Set<number>;
  errorMessage?: string;
}

type Action =
  | { type: "START"; orderId: string; customerId: string }
  | { type: "S1_DONE"; createRequest: any; createResponse: any; sessionId: string; subscriptionId: string }
  | { type: "S2_SDK" }
  | { type: "S2_SUCCESS" }
  | { type: "S3_WAITING" }
  | { type: "S3_DONE"; webhookPayload: any }
  | { type: "S4_POLLING" }
  | { type: "S4_TICK"; subscription: any }
  | { type: "S4_SLOW" }
  | { type: "S4_DONE"; subscription: any }
  | { type: "S5_CALLING" }
  | { type: "S5_DONE"; pageLink: any }
  | { type: "S6_CALLING"; cancelRequest: any }
  | { type: "S6_DONE"; cancelResponse: any }
  | { type: "COMPLETE" }
  | { type: "ERROR"; message: string }
  | { type: "TOGGLE_STEP"; stepNum: number }
  | { type: "RESET" };

const initialState: State = {
  phase: "idle",
  orderId: "",
  customerId: "",
  statusTrail: [],
  expandedDoneSteps: new Set(),
};

function withStatus(trail: string[], status: string | undefined): string[] {
  if (!status || trail[trail.length - 1] === status) return trail;
  return [...trail, status];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { ...initialState, phase: "s1_calling", orderId: action.orderId, customerId: action.customerId };
    case "S1_DONE":
      return {
        ...state,
        phase: "s1_done",
        createRequest: action.createRequest,
        createResponse: action.createResponse,
        sessionId: action.sessionId,
        subscriptionId: action.subscriptionId,
      };
    case "S2_SDK":
      return { ...state, phase: "s2_sdk" };
    case "S2_SUCCESS":
      return { ...state, phase: "s2_success" };
    case "S3_WAITING":
      return { ...state, phase: "s3_waiting" };
    case "S3_DONE":
      return { ...state, phase: "s3_done", webhookPayload: action.webhookPayload };
    case "S4_POLLING":
      return { ...state, phase: "s4_polling" };
    case "S4_TICK":
      return { ...state, subscription: action.subscription, statusTrail: withStatus(state.statusTrail, action.subscription?.status) };
    case "S4_SLOW":
      return { ...state, phase: "s4_slow" };
    case "S4_DONE":
      return {
        ...state,
        phase: "s4_done",
        subscription: action.subscription,
        statusTrail: withStatus(state.statusTrail, action.subscription?.status),
      };
    case "S5_CALLING":
      return { ...state, phase: "s5_calling" };
    case "S5_DONE":
      return { ...state, phase: "s5_done", pageLink: action.pageLink };
    case "S6_CALLING":
      return { ...state, phase: "s6_calling", cancelRequest: action.cancelRequest };
    case "S6_DONE":
      return { ...state, phase: "s6_done", cancelResponse: action.cancelResponse };
    case "COMPLETE":
      return { ...state, phase: "complete" };
    case "ERROR":
      return { ...state, phase: "error", errorMessage: action.message };
    case "TOGGLE_STEP": {
      const next = new Set(state.expandedDoneSteps);
      if (next.has(action.stepNum)) next.delete(action.stepNum);
      else next.add(action.stepNum);
      return { ...state, expandedDoneSteps: next };
    }
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

const STEPS = [
  { num: 1, title: "Create the subscription", subtitle: "Checkout API with payment_type: auto_pay" },
  { num: 2, title: "The customer pays the first charge", subtitle: "Checkout SDK, sandbox test card" },
  { num: 3, title: "The payment webhook arrives", subtitle: "Your webhook_url" },
  { num: 4, title: "The subscription goes live", subtitle: "Retrieve a subscription" },
  { num: 5, title: "Open the customer's page", subtitle: "Page link" },
  { num: 6, title: "Cancel at the end of the period (optional)", subtitle: "Cancel a subscription" },
];

function stepOf(phase: Phase): number {
  if (phase === "complete") return 7;
  const match = /^s(\d)_/.exec(phase);
  return match ? Number(match[1]) : 0;
}

function getStepStatus(stepNum: number, phase: Phase): "pending" | "active" | "done" {
  const active = stepOf(phase);
  if (stepNum < active) return "done";
  if (stepNum === active) return "active";
  return "pending";
}

function isoDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildCreateFields(orderId: string, webhookUrl: string) {
  const today = new Date();
  const oneYearLater = new Date(today);
  oneYearLater.setFullYear(today.getFullYear() + 1);
  return {
    payment_type: "auto_pay",
    webhook_url: webhookUrl,
    order_no: orderId,
    // The agreement is the mandate the gateway sees: a full recurring agreement
    // describing the same schedule as the autopay block.
    agreement: {
      id: `AGR-${orderId}`,
      type: "recurring",
      frequency: "monthly",
      amount_variability: "fixed",
      cycle_interval_days: 30,
      total_cycles: 12,
      expiry_date: isoDate(oneYearLater),
    },
    autopay: {
      frequency: "monthly",
      recurring_amount: "9.900",
      start_date: isoDate(today),
      description: "Pro Plan - Monthly",
    },
  };
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export default function AutoPayDemoInner() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => () => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
  }, []);

  // Keep the active step in view as the journey advances (same behaviour as the
  // Recurring Payments demo). Skip the initial mount so the page does not jump.
  useEffect(() => {
    if (state.phase !== "idle") hasStartedRef.current = true;
    if (state.phase === "idle" && !hasStartedRef.current) return;
    const timer = setTimeout(() => {
      const selector =
        state.phase === "idle" ? "[data-autopay-idle]"
          : state.phase === "error" ? "[data-autopay-error]"
          : state.phase === "complete" ? "[data-autopay-complete]"
          : `[data-autopay-step="${stepOf(state.phase)}"]`;
      (document.querySelector(selector) as HTMLElement | null)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(timer);
  }, [state.phase]);

  // ── Step 1: create the subscription ──
  const startDemo = useCallback(async () => {
    const orderId = `autopay-demo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const customerId = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    dispatch({ type: "START", orderId, customerId });

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
        dispatch({ type: "ERROR", message: "No sandbox gateway that supports auto-debit was found." });
        return;
      }

      const fields = buildCreateFields(orderId, `${getWebhookBaseUrl()}/webhook/${orderId}`);
      const session = await createSandboxSession({
        pg_codes: pgCodes,
        type: PLUGIN,
        amount: "9.900",
        customer_id: customerId,
        extra: { ...fields, include_sdk_setup_preload: true },
      });
      const subscriptionId = (session as any)?.extra?.autopay?.subscription_id;
      if (!subscriptionId) {
        dispatch({ type: "ERROR", message: "The response has no extra.autopay.subscription_id." });
        return;
      }

      // Show the request as a merchant would send it: the demo's random customer
      // name and phone are added by the sandbox helper and are not AutoPay fields.
      const createRequest = {
        type: PLUGIN,
        amount: "9.900",
        currency_code: "KWD",
        pg_codes: pgCodes,
        customer_id: customerId,
        customer_email: (session as any)?.customer_email,
        ...fields,
      };
      const { sdk_setup_preload_payload: _preload, ...shownResponse } = session as any;
      dispatch({
        type: "S1_DONE",
        createRequest,
        createResponse: { ...shownResponse, _preload },
        sessionId: session.session_id,
        subscriptionId,
      });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "Could not create the subscription." });
    }
  }, []);

  const sdkCallbacksRef = useRef({
    errorCallback(data: any) {
      console.log("SDK error", data);
    },
    successCallback() {
      dispatch({ type: "S2_SUCCESS" });
    },
    cancelCallback(data: any) {
      console.log("SDK cancel", data);
    },
  });

  // A gateway that finishes on its own page (a redirect, or a 3-D Secure
  // challenge) never calls the SDK's success callback, so the demo would wait on
  // step 2 forever. The payment webhook is the signal a merchant relies on
  // anyway: advance as soon as it reports a successful payment.
  useEffect(() => {
    if (state.phase !== "s2_sdk" || !state.orderId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const res = await fetch(`${getWebhookRelayUrl()}/webhook/${state.orderId}/events.json?since=-1`, { cache: "no-store" });
        const data = await res.json();
        if (!stopped && data.events?.some((e: any) => e.payload?.result === "success")) {
          dispatch({ type: "S2_SUCCESS" });
          return;
        }
      } catch {
        // The relay is briefly unreachable; try again on the next tick.
      }
      if (!stopped) timer = setTimeout(tick, 3000);
    };
    timer = setTimeout(tick, 3000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [state.phase, state.orderId]);

  // ── Step 4: poll Retrieve until AutoPay confirms the first payment ──
  const pollSubscription = useCallback(
    (attempt = 0) => {
      if (!state.subscriptionId) return;
      retrieveSubscription(state.subscriptionId)
        .then((subscription) => {
          if (subscription?.status && subscription.status !== "pending_setup") {
            dispatch({ type: "S4_DONE", subscription });
            return;
          }
          dispatch({ type: "S4_TICK", subscription });
          if (attempt + 1 >= POLL_LIMIT) {
            dispatch({ type: "S4_SLOW" });
            return;
          }
          pollTimer.current = setTimeout(() => pollSubscription(attempt + 1), POLL_INTERVAL_MS);
        })
        .catch((err: any) => dispatch({ type: "ERROR", message: err.message || "Retrieve failed." }));
    },
    [state.subscriptionId],
  );

  const startPolling = useCallback(() => {
    dispatch({ type: "S4_POLLING" });
    pollSubscription(0);
  }, [pollSubscription]);

  // ── Step 5: read the customer's link (never rotates it) ──
  const readPageLink = useCallback(async () => {
    if (!state.subscriptionId) return;
    dispatch({ type: "S5_CALLING" });
    try {
      dispatch({ type: "S5_DONE", pageLink: await getSubscriptionPageLink(state.subscriptionId) });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "Page link failed." });
    }
  }, [state.subscriptionId]);

  // ── Step 6: cancel at the end of the period ──
  const cancelAtPeriodEnd = useCallback(async () => {
    if (!state.subscriptionId) return;
    const idempotencyKey = uuid();
    dispatch({
      type: "S6_CALLING",
      cancelRequest: { headers: { "Idempotency-Key": idempotencyKey }, body: { mode: "at_period_end" } },
    });
    try {
      const cancelResponse = await cancelSubscription(state.subscriptionId, "at_period_end", idempotencyKey);
      dispatch({ type: "S6_DONE", cancelResponse });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "Cancel failed." });
    }
  }, [state.subscriptionId]);

  const subscriptionPath = `/b/pbl/v2/subscriptions/${state.subscriptionId ?? "{subscription_id}"}/`;
  const { _preload, ...createResponseShown } = state.createResponse ?? {};

  const renderStepContent = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return (
          <>
            {state.phase === "s1_calling" && (
              <div className={styles.actions}>
                <button className={styles.primaryBtn} disabled>
                  <span className={styles.spinner} /> Creating the subscription...
                </button>
              </div>
            )}
            {state.createResponse && (state.phase === "s1_done" || state.expandedDoneSteps.has(1)) && (
              <>
                <ApiPanel label="POST /b/checkout/v1/pymt-txn/" data={state.createRequest} />
                <ApiPanel label="Response — 201 Created" data={createResponseShown} />
                <p className={styles.cardDescription}>
                  The subscription exists now, in <code>pending_setup</code>. Its id is{" "}
                  <code>{state.subscriptionId}</code>, returned in <code>extra.autopay.subscription_id</code>.
                  Save it: it is your handle on the subscription.
                </p>
                {state.phase === "s1_done" && (
                  <div className={styles.actions}>
                    <button className={styles.primaryBtn} onClick={() => dispatch({ type: "S2_SDK" })}>
                      Continue — Pay the first charge
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        );

      case 2:
        return (
          <>
            {state.phase === "s2_sdk" && state.sessionId && (
              <>
                <p className={styles.cardDescription}>
                  This is the customer's checkout. Pay with test card <strong>{TEST_CARD.number}</strong>, expiry{" "}
                  <strong>{TEST_CARD.expiry}</strong>, CVV <strong>{TEST_CARD.cvv}</strong>. The card is saved for the
                  renewals.
                </p>
                <CheckoutSDKEmbed
                  sessionId={state.sessionId}
                  callbacks={sdkCallbacksRef.current}
                  setupPreload={_preload}
                />
              </>
            )}
            {state.phase === "s2_success" && (
              <>
                <p className={styles.cardDescription}>The first charge is paid and the card is saved.</p>
                <div className={styles.actions}>
                  <button className={styles.primaryBtn} onClick={() => dispatch({ type: "S3_WAITING" })}>
                    Continue — Payment webhook
                  </button>
                </div>
              </>
            )}
            {state.expandedDoneSteps.has(2) && (
              <p className={styles.cardDescription}>The customer paid the first charge in the Checkout SDK.</p>
            )}
          </>
        );

      case 3:
        return (
          <>
            {(state.phase === "s3_waiting" || state.phase === "s3_done" || state.expandedDoneSteps.has(3)) && (
              <WebhookViewer
                orderId={state.orderId}
                label="Payment webhook"
                onEvent={(event) => {
                  if (state.phase === "s3_waiting") dispatch({ type: "S3_DONE", webhookPayload: event.payload });
                }}
              />
            )}
            {state.phase === "s3_waiting" && (
              <p className={styles.cardDescription} style={{ marginTop: 12 }}>
                Waiting for Ottu to call your <code>webhook_url</code> with the payment result...
              </p>
            )}
            {state.webhookPayload && (state.phase === "s3_done" || state.expandedDoneSteps.has(3)) && (
              <>
                <p className={styles.cardDescription} style={{ marginTop: 12 }}>
                  The payment webhook reports <code>payment_type: {String(state.webhookPayload.payment_type)}</code> and
                  carries the same <code>extra.autopay.subscription_id</code>, inside the signed fields. It tells you the
                  first charge succeeded; AutoPay activates the subscription right after.
                </p>
                {state.phase === "s3_done" && (
                  <div className={styles.actions}>
                    <button className={styles.primaryBtn} onClick={startPolling}>
                      Continue — Watch the subscription go live
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        );

      case 4:
        return (
          <>
            {(state.phase === "s4_polling" || state.phase === "s4_slow") && (
              <>
                <div className={styles.actions}>
                  <button className={styles.primaryBtn} disabled>
                    <span className={styles.spinner} />{" "}
                    {state.phase === "s4_slow" ? "Still pending" : `Status: ${state.statusTrail.join(" → ") || "..."}`}
                  </button>
                </div>
                <p className={styles.cardDescription}>
                  Calling <code>GET {subscriptionPath}</code> every few seconds. AutoPay confirms the first payment on
                  its own schedule, so this can take a few minutes.
                </p>
                {state.phase === "s4_slow" && (
                  <div className={styles.actions}>
                    <button className={styles.secondaryBtn} onClick={startPolling}>Keep checking</button>
                  </div>
                )}
              </>
            )}
            {state.subscription && (state.phase === "s4_done" || state.expandedDoneSteps.has(4)) && (
              <>
                <ApiPanel label={`GET ${subscriptionPath}`} data={state.subscription} />
                <p className={styles.cardDescription}>
                  Status went <code>{state.statusTrail.join(" → ")}</code>. <code>card</code> shows the saved card,
                  and <code>current_cycle</code> the paid first charge. From here AutoPay bills the saved card on{" "}
                  <code>next_billing_date</code>, retries failures, and emails the customer.
                </p>
                {state.phase === "s4_done" && (
                  <div className={styles.actions}>
                    <button className={styles.primaryBtn} onClick={readPageLink}>
                      Continue — Get the customer's link
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        );

      case 5:
        return (
          <>
            {state.phase === "s5_calling" && (
              <div className={styles.actions}>
                <button className={styles.primaryBtn} disabled>
                  <span className={styles.spinner} /> Reading the page link...
                </button>
              </div>
            )}
            {state.pageLink && (state.phase === "s5_done" || state.expandedDoneSteps.has(5)) && (
              <>
                <ApiPanel label={`GET ${subscriptionPath}page-link/`} data={state.pageLink} />
                <p className={styles.cardDescription}>
                  Send <code>page_url</code> to your customer. It opens their self-service page: status, next charge,
                  billing history, cards, and cancel. The token in it is the credential, so treat the link like a
                  password.
                </p>
                <div className={styles.actions}>
                  <a className={styles.secondaryBtn} href={state.pageLink.page_url} target="_blank" rel="noopener noreferrer">
                    Open the customer's page <Icon path={mdiOpenInNew} size={0.6} />
                  </a>
                  {state.phase === "s5_done" && (
                    <>
                      <button className={styles.primaryBtn} onClick={cancelAtPeriodEnd}>
                        Continue — Cancel at period end
                      </button>
                      <button className={styles.secondaryBtn} onClick={() => dispatch({ type: "COMPLETE" })}>
                        Finish without canceling
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        );

      case 6:
        return (
          <>
            {state.phase === "s6_calling" && (
              <div className={styles.actions}>
                <button className={styles.primaryBtn} disabled>
                  <span className={styles.spinner} /> Canceling...
                </button>
              </div>
            )}
            {state.cancelResponse && (state.phase === "s6_done" || state.expandedDoneSteps.has(6)) && (
              <>
                <ApiPanel label={`POST ${subscriptionPath}cancel/`} data={state.cancelRequest} />
                <ApiPanel label="Response — 200 OK" data={state.cancelResponse} />
                <p className={styles.cardDescription}>
                  <code>cancel_at_period_end</code> is now <code>{String(state.cancelResponse.cancel_at_period_end)}</code>{" "}
                  and <code>status</code> stays <code>{state.cancelResponse.status}</code>: the customer keeps the
                  service until the period ends, and no further charge is made. Reopen the customer's page to see it.
                </p>
                {state.phase === "s6_done" && (
                  <div className={styles.actions}>
                    <button className={styles.primaryBtn} onClick={() => dispatch({ type: "COMPLETE" })}>
                      Complete
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        );

      default:
        return null;
    }
  };

  if (state.phase === "idle") {
    return (
      <div className={styles.hero} data-autopay-idle>
        <h2 className={styles.heroTitle}>Try AutoPay</h2>
        <p className={styles.heroSubtitle}>
          Create a real subscription on the sandbox, pay its first charge with a test card, and watch it go live. Every
          request and response is shown as it happens.
        </p>
        <button className={styles.primaryBtn} onClick={startDemo}>
          Start Demo
        </button>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className={styles.errorCard} data-autopay-error>
        <Icon path={mdiAlertCircleOutline} size={1.5} className={styles.errorIcon} />
        <p className={styles.errorMessage}>{state.errorMessage}</p>
        <button className={styles.secondaryBtn} onClick={() => dispatch({ type: "RESET" })}>
          Restart
        </button>
      </div>
    );
  }

  const renderTimeline = (complete: boolean) => (
    <div className={styles.journey}>
      {STEPS.map((step) => {
        const status = complete ? "done" : getStepStatus(step.num, state.phase);
        // The optional cancel step is skipped when the user finishes early.
        if (complete && step.num === 6 && !state.cancelResponse) return null;
        const isDone = status === "done";
        const isActive = status === "active";
        const isPending = status === "pending";
        const isExpanded = isDone && state.expandedDoneSteps.has(step.num);
        return (
          <div key={step.num} className={styles.step} data-autopay-step={step.num}>
            <div className={`${styles.node} ${isDone ? styles.nodeDone : isActive ? styles.nodeActive : styles.nodePending}`}>
              {isDone ? <Icon path={mdiCheck} size={0.7} /> : step.num}
            </div>
            <div className={`${styles.card} ${isActive ? styles.cardActive : ""} ${isDone ? (isExpanded ? styles.cardDoneExpanded : styles.cardDone) : ""}`}>
              <div
                className={`${styles.cardHeader} ${isDone ? styles.cardHeaderDone : ""}`}
                onClick={isDone ? () => dispatch({ type: "TOGGLE_STEP", stepNum: step.num }) : undefined}
              >
                <div>
                  <p className={`${styles.cardTitle} ${isPending ? styles.cardTitlePending : ""}`}>{step.title}</p>
                  {(isActive || isPending) && <p className={styles.cardSubtitle}>{step.subtitle}</p>}
                </div>
                {isDone && (
                  <div className={styles.doneRight}>
                    <span className={styles.doneBadge}><Icon path={mdiCheck} size={0.55} /> Done</span>
                    <Icon path={mdiChevronDown} size={0.8} className={styles.chevron} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }} />
                  </div>
                )}
              </div>
              {(isActive || isExpanded) && <div className={styles.cardBody}>{renderStepContent(step.num)}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (state.phase === "complete") {
    return (
      <>
        {renderTimeline(true)}
        <div className={styles.completeCard} data-autopay-complete>
          <h3 className={styles.completeTitle}>Subscription created</h3>
          <p className={styles.completeSubtitle}>
            One Checkout API call created the subscription, the customer paid once, and AutoPay took over: it bills the
            saved card every month, retries failures, and emails the customer. Your code only reads the result.
          </p>
          <button className={styles.secondaryBtn} onClick={() => dispatch({ type: "RESET" })}>
            Restart
          </button>
        </div>
      </>
    );
  }

  return renderTimeline(false);
}
