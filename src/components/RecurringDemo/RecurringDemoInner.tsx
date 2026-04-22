import React, { useReducer, useRef, useCallback, useEffect } from "react";
import Icon from "@mdi/react";
import { mdiCheck, mdiAlertCircleOutline, mdiChevronDown } from "@mdi/js";
import {
  createSandboxSession,
  callAutoDebit,
  callPaymentMethods,
  extractPgCodes,
  getWebhookBaseUrl,
} from "@site/src/utils/sandbox";
import ApiPanel from "@site/src/components/ApiPanel";
import CheckoutSDKEmbed from "@site/src/components/CheckoutSDKEmbed";
import { TEST_CARD } from "@site/src/components/TestCardCallout";
import WebhookViewer, { extractTokenFromWebhook } from "./WebhookViewer";
import styles from "./styles.module.css";

// ── Types ────────────────────────────────────────────────────────────────────

type Phase =
  | "idle"
  | "step1_calling" | "step1_done"
  | "step2_calling" | "step2_done"
  | "step3_sdk"     | "step3_success"
  | "step4_waiting" | "step4_done"
  | "step5_select"  | "step5_calling" | "step5_done"
  | "complete" | "error";

interface State {
  phase: Phase;
  orderId: string;
  customerId: string;
  // Step 1: Payment Methods
  pgCodes: string[];
  pmRequest?: any;
  pmResponse?: any;
  // Step 2: CIT session
  citSessionId?: string;
  citRequest?: any;
  citResponse?: any;
  agreementId?: string;
  agreement?: any;
  // Step 3: SDK
  // Step 4: Webhook + token
  citToken?: string;
  citPgCode?: string;
  webhookPayload?: any;
  // Step 5: MIT
  mitMode?: "one-step" | "two-step";
  mitSessionId?: string;
  mitRequest?: any;
  mitResponse?: any;
  mitAutoDebitRequest?: any;
  mitAutoDebitResponse?: any;
  // UI
  expandedDoneSteps: Set<number>;
  errorMessage?: string;
}

type Action =
  | { type: "START"; orderId: string; customerId: string }
  | { type: "STEP1_DONE"; pgCodes: string[]; pmRequest: any; pmResponse: any }
  | { type: "STEP2_CALLING" }
  | { type: "STEP2_DONE"; sessionId: string; citRequest: any; citResponse: any; agreementId: string; agreement: any }
  | { type: "STEP3_SDK" }
  | { type: "STEP3_SUCCESS" }
  | { type: "STEP4_WAITING" }
  | { type: "STEP4_DONE"; token: string; pgCode: string; webhookPayload: any }
  | { type: "STEP5_SELECT" }
  | { type: "STEP5_CALLING"; mitMode: "one-step" | "two-step"; mitRequest: any }
  | { type: "STEP5_SESSION_DONE"; mitSessionId: string; mitResponse: any }
  | { type: "STEP5_AUTO_DEBIT"; mitAutoDebitRequest: any }
  | { type: "STEP5_DONE"; mitResponse?: any; mitAutoDebitResponse?: any }
  | { type: "COMPLETE" }
  | { type: "ERROR"; message: string }
  | { type: "TOGGLE_STEP"; stepNum: number }
  | { type: "RESET" };

const initialState: State = {
  phase: "idle",
  orderId: "",
  customerId: "",
  pgCodes: [],
  expandedDoneSteps: new Set(),
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { ...initialState, phase: "step1_calling", orderId: action.orderId, customerId: action.customerId };
    case "STEP1_DONE":
      return { ...state, phase: "step1_done", pgCodes: action.pgCodes, pmRequest: action.pmRequest, pmResponse: action.pmResponse };
    case "STEP2_CALLING":
      return { ...state, phase: "step2_calling" };
    case "STEP2_DONE":
      return { ...state, phase: "step2_done", citSessionId: action.sessionId, citRequest: action.citRequest, citResponse: action.citResponse, agreementId: action.agreementId, agreement: action.agreement };
    case "STEP3_SDK":
      return { ...state, phase: "step3_sdk" };
    case "STEP3_SUCCESS":
      return { ...state, phase: "step3_success" };
    case "STEP4_WAITING":
      return { ...state, phase: "step4_waiting" };
    case "STEP4_DONE":
      return { ...state, phase: "step4_done", citToken: action.token, citPgCode: action.pgCode, webhookPayload: action.webhookPayload };
    case "STEP5_SELECT":
      return { ...state, phase: "step5_select" };
    case "STEP5_CALLING":
      return { ...state, phase: "step5_calling", mitMode: action.mitMode, mitRequest: action.mitRequest };
    case "STEP5_SESSION_DONE":
      return { ...state, phase: "step5_done", mitSessionId: action.mitSessionId, mitResponse: action.mitResponse };
    case "STEP5_AUTO_DEBIT":
      return { ...state, phase: "step5_calling", mitAutoDebitRequest: action.mitAutoDebitRequest };
    case "STEP5_DONE":
      return {
        ...state,
        phase: "step5_done",
        ...(action.mitResponse && { mitResponse: action.mitResponse }),
        ...(action.mitAutoDebitResponse && { mitAutoDebitResponse: action.mitAutoDebitResponse }),
      };
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

// ── Step metadata ────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, title: "Discover Payment Methods", subtitle: "Payment Methods API (optional)" },
  { num: 2, title: "Create Payment Session", subtitle: "Checkout API — CIT" },
  { num: 3, title: "Accept Payment", subtitle: "Checkout SDK" },
  { num: 4, title: "Webhook Notification", subtitle: "Token received" },
  { num: 5, title: "Charge Saved Card", subtitle: "MIT — Auto-Debit" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStepStatus(stepNum: number, phase: Phase): "pending" | "active" | "done" {
  const activeStep = phase.startsWith("step1") ? 1
    : phase.startsWith("step2") ? 2
    : phase.startsWith("step3") ? 3
    : phase.startsWith("step4") ? 4
    : phase.startsWith("step5") ? 5
    : phase === "complete" ? 6
    : 0;
  if (stepNum < activeStep) return "done";
  if (stepNum === activeStep) return "active";
  return "pending";
}

function generateOrderId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateCustomerId(): string {
  return `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatDateDDMMYYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function buildAgreement(orderId: string) {
  const today = new Date();
  const oneYearLater = new Date(today);
  oneYearLater.setFullYear(today.getFullYear() + 1);
  return {
    id: `AGR-${orderId}`,
    type: "recurring",
    amount_variability: "fixed",
    frequency: "monthly",
    start_date: formatDateDDMMYYYY(today),
    expiry_date: formatDateDDMMYYYY(oneYearLater),
    cycle_interval_days: 30,
    total_cycles: 12,
    seller: {
      name: "Ottu Demo Store",
      short_name: "ODS",
      category_code: "5411",
    },
  };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RecurringDemoInner() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const webhookEventsRef = useRef<any[]>([]);
  const webhookCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (webhookCheckInterval.current) clearInterval(webhookCheckInterval.current);
    };
  }, []);

  // Scroll on every phase transition so the relevant content is in view.
  // Without this, transitions that shrink the DOM (all steps collapsing on
  // `complete`, journey replaced by error card on `error`) leave the stale
  // scroll position past the end of the component — the viewport lands on
  // whatever page content sits below.
  useEffect(() => {
    if (state.phase === "idle") return;
    const timer = setTimeout(() => {
      const selector =
        state.phase === "error"
          ? "[data-recurring-error]"
          : state.phase === "complete"
            ? "[data-recurring-complete]"
            : (() => {
                const n = state.phase.startsWith("step1") ? 1
                  : state.phase.startsWith("step2") ? 2
                  : state.phase.startsWith("step3") ? 3
                  : state.phase.startsWith("step4") ? 4
                  : state.phase.startsWith("step5") ? 5
                  : 0;
                return n === 0 ? null : `[data-recurring-step="${n}"]`;
              })();
      if (!selector) return;
      const el = document.querySelector(selector);
      (el as HTMLElement | null)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(timer);
  }, [state.phase]);

  const startWebhookWatch = useCallback(
    (onReceived: (events: any[]) => void) => {
      if (webhookCheckInterval.current) clearInterval(webhookCheckInterval.current);
      const startCount = webhookEventsRef.current.length;
      webhookCheckInterval.current = setInterval(() => {
        if (webhookEventsRef.current.length > startCount) {
          if (webhookCheckInterval.current) clearInterval(webhookCheckInterval.current);
          onReceived(webhookEventsRef.current);
        }
      }, 500);
    },
    [],
  );

  // ── Step 1: Payment Methods ──
  const startDemo = useCallback(async () => {
    const orderId = generateOrderId();
    const customerId = generateCustomerId();
    dispatch({ type: "START", orderId, customerId });
    webhookEventsRef.current = [];

    const pmRequest = {
      plugin: "e_commerce",
      currencies: ["KWD"],
      auto_debit: true,
      type: "sandbox",
      tags: ["demo"],
    };

    try {
      const pmResult = await callPaymentMethods(pmRequest);
      const pgCodes = extractPgCodes(pmResult);

      if (pgCodes.length === 0) {
        dispatch({ type: "ERROR", message: "No auto-debit eligible payment methods found." });
        return;
      }

      dispatch({ type: "STEP1_DONE", pgCodes, pmRequest, pmResponse: pmResult });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "Payment Methods API failed" });
    }
  }, []);

  // Step 1 done — user clicks Continue to start Step 2

  // ── Step 2: CIT Session ──
  const startCIT = useCallback(async () => {
    dispatch({ type: "STEP2_CALLING" });
    try {
      const webhookUrl = `${getWebhookBaseUrl()}/webhook/${state.orderId}`;
      const agreement = buildAgreement(state.orderId);
      const citRequest = {
        type: "e_commerce",
        pg_codes: state.pgCodes,
        amount: "20",
        currency_code: "KWD",
        customer_id: state.customerId,
        payment_type: "auto_debit",
        include_sdk_setup_preload: true,
        webhook_url: webhookUrl,
        order_no: state.orderId,
        agreement,
      };

      const session = await createSandboxSession({
        pg_codes: state.pgCodes,
        customer_id: state.customerId,
        extra: {
          payment_type: "auto_debit",
          include_sdk_setup_preload: true,
          webhook_url: webhookUrl,
          order_no: state.orderId,
          agreement,
        },
      });

      dispatch({
        type: "STEP2_DONE",
        sessionId: session.session_id,
        citRequest,
        citResponse: session,
        agreementId: agreement.id,
        agreement,
      });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "Failed to create CIT session" });
    }
  }, [state.orderId, state.customerId, state.pgCodes]);

  // Step 2 done — user clicks Continue to show SDK

  // SDK callbacks
  const sdkCallbacksRef = useRef({
    errorCallback(data: any) {
      console.log("SDK error", data);
    },
    successCallback() {
      dispatch({ type: "STEP3_SUCCESS" });
    },
    cancelCallback(data: any) {
      console.log("SDK cancel", data);
    },
  });

  // Step 3 done — user clicks Continue to start watching webhooks
  const continueToWebhook = useCallback(() => {
    dispatch({ type: "STEP4_WAITING" });
    startWebhookWatch((events) => {
      const token = extractTokenFromWebhook(events);
      const lastEvent = events[events.length - 1];
      const pgCode = lastEvent?.payload?.token?.pg_code ?? state.pgCodes[0];
      dispatch({
        type: "STEP4_DONE",
        token: token || "unknown",
        pgCode,
        webhookPayload: lastEvent?.payload,
      });
    });
  }, [startWebhookWatch, state.pgCodes]);

  // Step 4 done — user clicks Continue to show MIT selector

  // ── Step 5: MIT One-Step ──
  const startMITOneStep = useCallback(async () => {
    const webhookUrl = `${getWebhookBaseUrl()}/webhook/${state.orderId}`;
    const mitRequest = {
      type: "e_commerce",
      pg_codes: [state.citPgCode],
      amount: "15",
      currency_code: "KWD",
      customer_id: state.customerId,
      payment_type: "auto_debit",
      webhook_url: webhookUrl,
      order_no: `${state.orderId}-mit`,
      agreement: state.agreement,
      payment_instrument: { instrument_type: "token", payload: { token: state.citToken } },
    };

    dispatch({ type: "STEP5_CALLING", mitMode: "one-step", mitRequest });

    try {
      const result = await createSandboxSession({
        pg_codes: [state.citPgCode || state.pgCodes[0]],
        amount: "15",
        customer_id: state.customerId,
        extra: {
          payment_type: "auto_debit",
          webhook_url: webhookUrl,
          order_no: `${state.orderId}-mit`,
          agreement: state.agreement,
          payment_instrument: {
            instrument_type: "token",
            payload: { token: state.citToken },
          },
        },
      });

      dispatch({ type: "STEP5_DONE", mitResponse: result });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "One-step MIT failed" });
    }
  }, [state.orderId, state.customerId, state.citToken, state.citPgCode, state.pgCodes, state.agreement]);

  // ── Step 5: MIT Two-Step — Step 1 (create session) ──
  const startMITTwoStep = useCallback(async () => {
    const webhookUrl = `${getWebhookBaseUrl()}/webhook/${state.orderId}`;
    const mitRequest = {
      type: "e_commerce",
      pg_codes: [state.citPgCode],
      amount: "15",
      currency_code: "KWD",
      customer_id: state.customerId,
      payment_type: "auto_debit",
      webhook_url: webhookUrl,
      order_no: `${state.orderId}-mit`,
      agreement: state.agreement,
    };

    dispatch({ type: "STEP5_CALLING", mitMode: "two-step", mitRequest });

    try {
      const session = await createSandboxSession({
        pg_codes: [state.citPgCode || state.pgCodes[0]],
        amount: "15",
        customer_id: state.customerId,
        extra: {
          payment_type: "auto_debit",
          webhook_url: webhookUrl,
          order_no: `${state.orderId}-mit`,
          agreement: state.agreement,
        },
      });

      dispatch({ type: "STEP5_SESSION_DONE", mitSessionId: session.session_id, mitResponse: session });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "MIT session creation failed" });
    }
  }, [state.orderId, state.customerId, state.citPgCode, state.pgCodes, state.agreement]);

  // ── Step 5: MIT Two-Step — Step 2 (auto-debit) ──
  const callMITAutoDebit = useCallback(async () => {
    const mitAutoDebitRequest = {
      session_id: state.mitSessionId,
      token: state.citToken,
    };

    dispatch({ type: "STEP5_AUTO_DEBIT", mitAutoDebitRequest });

    try {
      const result = await callAutoDebit(state.mitSessionId!, state.citToken!);
      dispatch({ type: "STEP5_DONE", mitAutoDebitResponse: result });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "Auto-debit failed" });
    }
  }, [state.mitSessionId, state.citToken]);

  // ── Success summary (extracted from final API response) ──
  const chargeSummary = (() => {
    const src = state.mitMode === "two-step" ? state.mitAutoDebitResponse : state.mitResponse;
    if (!src) return null;
    return {
      state: src.state ?? src.payment_status ?? src.status,
      amount: src.amount ?? src.total_amount,
      currency: src.currency_code ?? src.currency,
      paymentId: src.session_id ?? src.payment_id ?? src.id,
      reference: src.order_no ?? src.reference_number,
    };
  })();

  const chargeCommitted =
    state.mitMode === "one-step" ? !!state.mitResponse : !!state.mitAutoDebitResponse;
  const canSwitchMode = state.phase === "step5_done" && !chargeCommitted;

  // ── Render step content ──
  const renderStepContent = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return (
          <>
            {state.phase === "step1_calling" && (
              <div className={styles.actions}>
                <button className={styles.primaryBtn} disabled>
                  <span className={styles.spinner} /> Calling Payment Methods API...
                </button>
              </div>
            )}
            {(state.phase === "step1_done" || state.expandedDoneSteps.has(1)) && (
              <>
                <ApiPanel label="POST /b/pbl/v2/payment-methods/" data={state.pmRequest} />
                <ApiPanel label="Response — Payment Methods" data={state.pmResponse} />
                <p className={styles.cardDescription}>
                  Found {state.pgCodes.length} auto-debit eligible gateway{state.pgCodes.length !== 1 ? "s" : ""}: <code>{state.pgCodes.join(", ")}</code>
                </p>
                {state.phase === "step1_done" && (
                  <div className={styles.actions}>
                    <button className={styles.primaryBtn} onClick={() => startCIT()}>
                      Continue — Create Payment Session
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
            {state.phase === "step2_calling" && (
              <div className={styles.actions}>
                <button className={styles.primaryBtn} disabled>
                  <span className={styles.spinner} /> Creating payment session...
                </button>
              </div>
            )}
            {(state.phase === "step2_done" || state.expandedDoneSteps.has(2)) && state.citSessionId && (
              <>
                <ApiPanel label="POST /b/checkout/v1/pymt-txn/" data={state.citRequest} />
                <ApiPanel label="Response — Session" data={state.citResponse} />
                {state.phase === "step2_done" && (
                  <div className={styles.actions}>
                    <button className={styles.primaryBtn} onClick={() => dispatch({ type: "STEP3_SDK" })}>
                      Continue — Accept Payment
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        );

      case 3:
        return (
          <>
            {state.phase === "step3_sdk" && state.citSessionId && (
              <>
                <p className={styles.cardDescription}>
                  Enter test card <strong>{TEST_CARD.number}</strong>, expiry <strong>{TEST_CARD.expiry}</strong>, CVV <strong>{TEST_CARD.cvv}</strong>.
                </p>
                <CheckoutSDKEmbed
                  sessionId={state.citSessionId}
                  callbacks={sdkCallbacksRef.current}
                  setupPreload={(state.citResponse as any)?.sdk_setup_preload_payload}
                />
              </>
            )}
            {state.phase === "step3_success" && (
              <>
                <p className={styles.cardDescription}>
                  Payment completed successfully via the Checkout SDK.
                </p>
                <div className={styles.actions}>
                  <button className={styles.primaryBtn} onClick={continueToWebhook}>
                    Continue — Webhook Notification
                  </button>
                </div>
              </>
            )}
            {state.expandedDoneSteps.has(3) && (
              <p className={styles.cardDescription}>
                Payment was completed via the Checkout SDK.
              </p>
            )}
          </>
        );

      case 4:
        return (
          <>
            {(state.phase === "step4_waiting" || state.phase === "step4_done" || state.expandedDoneSteps.has(4)) && state.orderId && (
              <WebhookViewer
                orderId={state.orderId}
                label="CIT Webhook Notifications"
                onEvent={(event) => {
                  webhookEventsRef.current = [...webhookEventsRef.current, event];
                }}
              />
            )}
            {state.phase === "step4_waiting" && (
              <p className={styles.cardDescription} style={{ marginTop: 12 }}>
                Waiting for the payment webhook. Once Ottu processes the payment, the token will be extracted automatically.
              </p>
            )}
            {(state.phase === "step4_done" || state.expandedDoneSteps.has(4)) && state.citToken && (
              <>
                <p className={styles.cardDescription} style={{ marginTop: 12 }}>
                  Token received: <code>{state.citToken}</code>
                </p>
                {state.phase === "step4_done" && (
                  <div className={styles.actions}>
                    <button className={styles.primaryBtn} onClick={() => dispatch({ type: "STEP5_SELECT" })}>
                      Continue — Charge Saved Card
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        );

      case 5: {
        if (state.phase === "step5_select") {
          return (
            <>
              <p className={styles.cardDescription}>
                Choose how to charge the saved card without customer interaction:
              </p>
              <div className={styles.pathSelector}>
                <div className={styles.pathCard} onClick={startMITOneStep}>
                  <p className={styles.pathLabel}>One-Step Checkout</p>
                  <p className={styles.pathDescription}>Checkout API with payment_instrument — session created and charged in one call</p>
                </div>
                <div className={styles.pathCard} onClick={startMITTwoStep}>
                  <p className={styles.pathLabel}>Two-Step</p>
                  <p className={styles.pathDescription}>Checkout API + Auto-Debit API — create session first, then charge separately</p>
                </div>
              </div>
            </>
          );
        }

        // sub-step statuses for Two-Step
        const sub1Status: "pending" | "active" | "done" =
          state.mitResponse ? "done"
          : state.phase === "step5_calling" && !state.mitAutoDebitRequest ? "active"
          : "pending";
        const sub2Status: "pending" | "active" | "done" =
          state.mitAutoDebitResponse ? "done"
          : state.mitAutoDebitRequest ? "active"
          : state.mitResponse ? "pending"
          : "pending";

        const modeLabel = state.mitMode === "one-step" ? "One-Step Checkout" : "Two-Step Checkout";
        const modeHint = state.mitMode === "one-step"
          ? "Session created and charged in a single API call"
          : "Create session first, then charge with Auto-Debit";

        const showModeChip = !!state.mitMode;

        const summaryCard = chargeCommitted && chargeSummary && (
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <span className={styles.summaryIcon}><Icon path={mdiCheck} size={0.7} /></span>
              <div>
                <p className={styles.summaryTitle}>Payment Charged</p>
                <p className={styles.summarySubtitle}>
                  The saved token was debited automatically — no customer interaction required.
                </p>
              </div>
            </div>
            <div className={styles.summaryGrid}>
              {chargeSummary.state && (
                <div className={styles.summaryField}>
                  <span className={styles.summaryLabel}>State</span>
                  <span className={styles.summaryValue}><code>{String(chargeSummary.state)}</code></span>
                </div>
              )}
              {chargeSummary.amount && (
                <div className={styles.summaryField}>
                  <span className={styles.summaryLabel}>Amount</span>
                  <span className={styles.summaryValue}>{chargeSummary.amount} {chargeSummary.currency || ""}</span>
                </div>
              )}
              {chargeSummary.paymentId && (
                <div className={styles.summaryField}>
                  <span className={styles.summaryLabel}>Payment ID</span>
                  <span className={styles.summaryValue}><code>{chargeSummary.paymentId}</code></span>
                </div>
              )}
              {chargeSummary.reference && (
                <div className={styles.summaryField}>
                  <span className={styles.summaryLabel}>Reference</span>
                  <span className={styles.summaryValue}><code>{chargeSummary.reference}</code></span>
                </div>
              )}
            </div>
          </div>
        );

        const completeButton = chargeCommitted && state.phase === "step5_done" && (
          <div className={styles.actions}>
            <button className={styles.primaryBtn} onClick={() => dispatch({ type: "COMPLETE" })}>
              Complete
            </button>
          </div>
        );

        return (
          <>
            {showModeChip && (
              <div className={styles.modeChip}>
                <div className={styles.modeChipMain}>
                  <span className={styles.modeChipBadge}>Mode</span>
                  <div>
                    <p className={styles.modeChipLabel}>{modeLabel}</p>
                    <p className={styles.modeChipHint}>{modeHint}</p>
                  </div>
                </div>
                {canSwitchMode && (
                  <button
                    type="button"
                    className={styles.modeChipSwitch}
                    onClick={() => dispatch({ type: "STEP5_SELECT" })}
                  >
                    Switch mode
                  </button>
                )}
              </div>
            )}

            {/* One-Step flow */}
            {state.mitMode === "one-step" && (
              <>
                {state.phase === "step5_calling" && (
                  <div className={styles.actions}>
                    <button className={styles.primaryBtn} disabled>
                      <span className={styles.spinner} /> Creating session + charging...
                    </button>
                  </div>
                )}
                {(state.phase === "step5_done" || state.expandedDoneSteps.has(5)) && (
                  <>
                    <ApiPanel label="POST /b/checkout/v1/pymt-txn/ (One-Step)" data={state.mitRequest} />
                    {state.mitResponse && (
                      <ApiPanel label="Response — One-Step MIT" data={state.mitResponse} />
                    )}
                    {summaryCard}
                    {completeButton}
                  </>
                )}
              </>
            )}

            {/* Two-Step flow */}
            {state.mitMode === "two-step" && (
              <div className={styles.subSteps}>
                {/* Sub-step 5.1: Create MIT Session */}
                <div className={`${styles.subCard} ${sub1Status === "active" ? styles.subCardActive : ""} ${sub1Status === "done" ? styles.subCardDone : ""}`}>
                  <div className={styles.subStepHeader}>
                    <span className={`${styles.subStepDot} ${styles[`subStepDot_${sub1Status}`]}`}>
                      {sub1Status === "done" && <Icon path={mdiCheck} size={0.5} />}
                      {sub1Status === "active" && <span className={styles.spinnerSmall} />}
                    </span>
                    <div className={styles.subStepTitles}>
                      <p className={styles.subStepTitle}>5.1 · Create MIT Session</p>
                      <p className={styles.subStepSubtitle}>POST /b/checkout/v1/pymt-txn/</p>
                    </div>
                  </div>
                  {sub1Status !== "pending" && (
                    <div className={styles.subStepBody}>
                      <ApiPanel label="Request" data={state.mitRequest} />
                      {state.mitResponse && <ApiPanel label="Response" data={state.mitResponse} />}
                    </div>
                  )}
                </div>

                {/* Sub-step 5.2: Trigger Auto-Debit */}
                <div className={`${styles.subCard} ${sub2Status === "active" ? styles.subCardActive : ""} ${sub2Status === "done" ? styles.subCardDone : ""}`}>
                  <div className={styles.subStepHeader}>
                    <span className={`${styles.subStepDot} ${styles[`subStepDot_${sub2Status}`]}`}>
                      {sub2Status === "done" && <Icon path={mdiCheck} size={0.5} />}
                      {sub2Status === "active" && <span className={styles.spinnerSmall} />}
                    </span>
                    <div className={styles.subStepTitles}>
                      <p className={styles.subStepTitle}>5.2 · Trigger Auto-Debit</p>
                      <p className={styles.subStepSubtitle}>POST /b/pbl/v2/payment/auto-debit/</p>
                    </div>
                  </div>
                  {sub2Status === "pending" && state.mitResponse && (
                    <div className={styles.subStepBody}>
                      <p className={styles.subStepPrompt}>
                        Session created. Call the Auto-Debit endpoint to charge the saved token.
                      </p>
                      <div className={styles.actions}>
                        <button className={styles.primaryBtn} onClick={callMITAutoDebit}>
                          Call Auto-Debit API
                        </button>
                      </div>
                    </div>
                  )}
                  {sub2Status === "active" && (
                    <div className={styles.subStepBody}>
                      <div className={styles.actions}>
                        <button className={styles.primaryBtn} disabled>
                          <span className={styles.spinner} /> Charging saved card...
                        </button>
                      </div>
                    </div>
                  )}
                  {sub2Status === "done" && (
                    <div className={styles.subStepBody}>
                      {state.mitAutoDebitRequest && (
                        <ApiPanel label="Request" data={state.mitAutoDebitRequest} />
                      )}
                      {state.mitAutoDebitResponse && (
                        <ApiPanel label="Response" data={state.mitAutoDebitResponse} />
                      )}
                    </div>
                  )}
                </div>

                {summaryCard}
                {completeButton}
              </div>
            )}
          </>
        );
      }

      default:
        return null;
    }
  };

  // ── Idle state ──
  if (state.phase === "idle") {
    return (
      <div className={styles.hero}>
        <h2 className={styles.heroTitle}>Try Recurring Payments</h2>
        <p className={styles.heroSubtitle}>
          Experience the full CIT/MIT flow: save a card with a test payment,
          then charge it automatically — all in sandbox mode.
        </p>
        <button className={styles.primaryBtn} onClick={startDemo}>
          Start Demo
        </button>
      </div>
    );
  }

  // ── Error state ──
  if (state.phase === "error") {
    return (
      <div className={styles.errorCard} data-recurring-error>
        <Icon path={mdiAlertCircleOutline} size={1.5} className={styles.errorIcon} />
        <p className={styles.errorMessage}>{state.errorMessage}</p>
        <button className={styles.secondaryBtn} onClick={() => dispatch({ type: "RESET" })}>
          Restart
        </button>
      </div>
    );
  }

  // ── Complete state ──
  if (state.phase === "complete") {
    return (
      <>
        <div className={styles.journey}>
          {STEPS.map((step) => {
            const isExpanded = state.expandedDoneSteps.has(step.num);
            return (
              <div key={step.num} className={styles.step} data-recurring-step={step.num}>
                <div className={`${styles.node} ${styles.nodeDone}`}>
                  <Icon path={mdiCheck} size={0.7} />
                </div>
                <div className={`${styles.card} ${isExpanded ? styles.cardDoneExpanded : styles.cardDone}`}>
                  <div
                    className={`${styles.cardHeader} ${styles.cardHeaderDone}`}
                    onClick={() => dispatch({ type: "TOGGLE_STEP", stepNum: step.num })}
                  >
                    <div>
                      <p className={styles.cardTitle}>{step.title}</p>
                    </div>
                    <div className={styles.doneRight}>
                      <span className={styles.doneBadge}><Icon path={mdiCheck} size={0.55} /> Done</span>
                      <Icon path={mdiChevronDown} size={0.8} className={styles.chevron} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }} />
                    </div>
                  </div>
                  {isExpanded && (
                    <div className={styles.cardBody}>
                      {renderStepContent(step.num)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.completeCard} data-recurring-complete>
          <h3 className={styles.completeTitle}>Recurring Payment Complete</h3>
          <p className={styles.completeSubtitle}>
            The card was charged without any customer interaction.
            {state.mitMode === "one-step"
              ? " Using One-Step Checkout, the session was created and charged in a single API call."
              : " Using Two-Step flow, a new session was created, then the auto-debit endpoint charged the saved token."}
          </p>
          <button className={styles.secondaryBtn} onClick={() => dispatch({ type: "RESET" })}>
            Restart
          </button>
        </div>
      </>
    );
  }

  // ── Active timeline ──
  return (
    <div className={styles.journey}>
      {STEPS.map((step) => {
        const status = getStepStatus(step.num, state.phase);
        const isDone = status === "done";
        const isActive = status === "active";
        const isPending = status === "pending";
        const isExpanded = isDone && state.expandedDoneSteps.has(step.num);

        return (
          <div key={step.num} className={styles.step} data-recurring-step={step.num}>
            {/* Node */}
            <div className={`${styles.node} ${isDone ? styles.nodeDone : isActive ? styles.nodeActive : styles.nodePending}`}>
              {isDone ? <Icon path={mdiCheck} size={0.7} /> : step.num}
            </div>

            {/* Card */}
            <div className={`${styles.card} ${isActive ? styles.cardActive : ""} ${isDone ? (isExpanded ? styles.cardDoneExpanded : styles.cardDone) : ""}`}>
              {/* Header */}
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

              {/* Body */}
              {(isActive || isExpanded) && (
                <div className={styles.cardBody}>
                  {renderStepContent(step.num)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
