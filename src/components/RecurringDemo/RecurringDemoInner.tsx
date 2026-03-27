import React, { useReducer, useRef, useCallback, useEffect } from "react";
import Icon from "@mdi/react";
import { mdiAlertCircleOutline } from "@mdi/js";
import {
  createSandboxSession,
  callAutoDebit,
  getWebhookBaseUrl,
  SANDBOX_MERCHANT_ID,
  SANDBOX_API_KEY,
} from "@site/src/utils/sandbox";
import {
  loadCheckoutScript,
  initCheckout,
  CHECKOUT_SDK_THEME_MINIMAL,
} from "@site/src/utils/checkoutSdk";
import WebhookViewer, { extractTokenFromWebhook } from "./WebhookViewer";
import styles from "./styles.module.css";

// ── Types ────────────────────────────────────────────────────────────────────

type MITMode = "two-step" | "one-step";

type Phase =
  | "idle"
  | "cit_creating"
  | "cit_sdk"
  | "cit_waiting_webhook"
  | "cit_done"
  | "mit_select"
  | "mit_step1"
  | "mit_step1_done"
  | "mit_step2"
  | "mit_waiting_webhook"
  | "mit_done"
  | "complete"
  | "error";

interface State {
  phase: Phase;
  orderId: string;
  citSessionId?: string;
  citResponse?: any;
  citToken?: string;
  citWebhookEvents: any[];
  mitMode?: MITMode;
  mitSessionId?: string;
  mitResponse?: any;
  mitAutoDebitResponse?: any;
  mitWebhookEvents: any[];
  errorMessage?: string;
}

type Action =
  | { type: "START"; orderId: string }
  | { type: "CIT_SESSION_CREATED"; sessionId: string; response: any }
  | { type: "CIT_SDK_READY" }
  | { type: "CIT_PAYMENT_DONE" }
  | { type: "CIT_WEBHOOK_RECEIVED"; events: any[]; token: string }
  | { type: "SELECT_MIT"; mode: MITMode }
  | { type: "MIT_SESSION_CREATED"; sessionId: string; response: any }
  | { type: "MIT_STEP1_NEXT" }
  | { type: "MIT_AUTO_DEBIT_DONE"; response: any }
  | { type: "MIT_ONE_STEP_DONE"; response: any }
  | { type: "MIT_WEBHOOK_RECEIVED"; events: any[] }
  | { type: "COMPLETE" }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { ...initialState, phase: "cit_creating", orderId: action.orderId };
    case "CIT_SESSION_CREATED":
      return { ...state, phase: "cit_sdk", citSessionId: action.sessionId, citResponse: action.response };
    case "CIT_PAYMENT_DONE":
      return { ...state, phase: "cit_waiting_webhook" };
    case "CIT_WEBHOOK_RECEIVED":
      return { ...state, phase: "cit_done", citWebhookEvents: action.events, citToken: action.token };
    case "SELECT_MIT":
      return { ...state, phase: "mit_select", mitMode: action.mode };
    case "MIT_SESSION_CREATED":
      return { ...state, phase: "mit_step1_done", mitSessionId: action.sessionId, mitResponse: action.response };
    case "MIT_STEP1_NEXT":
      return { ...state, phase: "mit_step2" };
    case "MIT_AUTO_DEBIT_DONE":
      return { ...state, phase: "mit_waiting_webhook", mitAutoDebitResponse: action.response };
    case "MIT_ONE_STEP_DONE":
      return { ...state, phase: "mit_waiting_webhook", mitResponse: action.response };
    case "MIT_WEBHOOK_RECEIVED":
      return { ...state, phase: "mit_done", mitWebhookEvents: action.events };
    case "COMPLETE":
      return { ...state, phase: "complete" };
    case "ERROR":
      return { ...state, phase: "error", errorMessage: action.message };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

const initialState: State = {
  phase: "idle",
  orderId: "",
  citWebhookEvents: [],
  mitWebhookEvents: [],
};

const SDK_CONTAINER_ID = "recurring-demo-checkout";

function generateOrderId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RecurringDemoInner() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const sdkContainerRef = useRef<HTMLDivElement>(null);
  const webhookEventsRef = useRef<any[]>([]);
  const webhookCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (webhookCheckInterval.current) clearInterval(webhookCheckInterval.current);
    };
  }, []);

  // Poll webhook events from WebhookViewer via a shared ref
  // (WebhookViewer manages the SSE connection; we check for new events)
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
    []
  );

  // ── CIT: Create session ──
  const startCIT = useCallback(async () => {
    const orderId = generateOrderId();
    dispatch({ type: "START", orderId });

    try {
      const webhookUrl = `${getWebhookBaseUrl()}/webhook/${orderId}`;
      const session = await createSandboxSession({
        pg_codes: ["pg_auto_debit"],
        extra: {
          payment_type: "auto_debit",
          include_sdk_setup_preload: true,
          webhook_url: webhookUrl,
          order_no: orderId,
          agreement: { type: "recurring" },
        },
      });

      dispatch({
        type: "CIT_SESSION_CREATED",
        sessionId: session.session_id,
        response: session,
      });

      // Load SDK and init
      await loadCheckoutScript();

      // Register callbacks
      (window as any).errorCallback = (data: any) => {
        dispatch({ type: "ERROR", message: data.message || "Payment failed" });
      };
      (window as any).cancelCallback = (data: any) => {
        dispatch({ type: "ERROR", message: data.message || "Payment cancelled" });
      };
      (window as any).successCallback = () => {
        dispatch({ type: "CIT_PAYMENT_DONE" });
        // Watch for webhook
        startWebhookWatch((events) => {
          const token = extractTokenFromWebhook(events);
          dispatch({
            type: "CIT_WEBHOOK_RECEIVED",
            events,
            token: token || "unknown",
          });
        });
      };

      initCheckout({
        selector: SDK_CONTAINER_ID,
        sessionId: session.session_id,
        setupPreload: (session as any).sdk_setup_preload_payload,
        formsOfPayment: ["tokenPay", "ottuPG", "redirect"],
        theme: CHECKOUT_SDK_THEME_MINIMAL,
      });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "Failed to start CIT" });
    }
  }, [startWebhookWatch]);

  // ── MIT Two-Step: Step 1 — Create session ──
  const startMITTwoStep1 = useCallback(async () => {
    dispatch({ type: "SELECT_MIT", mode: "two-step" });
    try {
      const webhookUrl = `${getWebhookBaseUrl()}/webhook/${state.orderId}`;
      const session = await createSandboxSession({
        pg_codes: ["pg_auto_debit"],
        amount: "15",
        extra: {
          webhook_url: webhookUrl,
          order_no: `${state.orderId}-mit`,
        },
      });
      dispatch({
        type: "MIT_SESSION_CREATED",
        sessionId: session.session_id,
        response: session,
      });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "MIT session failed" });
    }
  }, [state.orderId]);

  // ── MIT Two-Step: Step 2 — Call auto-debit ──
  const startMITTwoStep2 = useCallback(async () => {
    dispatch({ type: "MIT_STEP1_NEXT" });
    try {
      const result = await callAutoDebit(state.mitSessionId!, state.citToken!);
      dispatch({ type: "MIT_AUTO_DEBIT_DONE", response: result });
      startWebhookWatch((events) => {
        dispatch({ type: "MIT_WEBHOOK_RECEIVED", events });
      });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "Auto-debit failed" });
    }
  }, [state.mitSessionId, state.citToken, startWebhookWatch]);

  // ── MIT One-Step: Create + charge ──
  const startMITOneStep = useCallback(async () => {
    dispatch({ type: "SELECT_MIT", mode: "one-step" });
    try {
      const webhookUrl = `${getWebhookBaseUrl()}/webhook/${state.orderId}`;
      const result = await createSandboxSession({
        pg_codes: ["pg_auto_debit"],
        amount: "10",
        extra: {
          payment_type: "auto_debit",
          webhook_url: webhookUrl,
          order_no: `${state.orderId}-mit1s`,
          payment_instrument: {
            instrument_type: "token",
            payload: { token: state.citToken },
          },
        },
      });
      dispatch({ type: "MIT_ONE_STEP_DONE", response: result });
      startWebhookWatch((events) => {
        dispatch({ type: "MIT_WEBHOOK_RECEIVED", events });
      });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "One-step MIT failed" });
    }
  }, [state.orderId, state.citToken, startWebhookWatch]);

  // ── Render helpers ──

  const renderAPIPanel = (label: string, data: any) => (
    <div className={styles.apiPanel}>
      <div className={styles.apiPanelHeader}>{label}</div>
      <div className={styles.apiPanelBody}>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );

  // ── Idle ──
  if (state.phase === "idle") {
    return (
      <div className={styles.container}>
        <div className={styles.idleCard}>
          <h3 className={styles.idleTitle}>Try Recurring Payments</h3>
          <p className={styles.idleDescription}>
            Experience the full CIT/MIT flow: save a card with a test payment,
            then charge it automatically — all in sandbox mode. No real charges.
          </p>
          <button className={styles.primaryButton} onClick={startCIT}>
            Start Demo
          </button>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (state.phase === "error") {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <Icon path={mdiAlertCircleOutline} size={1.5} className={styles.errorIcon} />
          <p className={styles.errorMessage}>{state.errorMessage}</p>
          <button className={styles.secondaryButton} onClick={() => dispatch({ type: "RESET" })}>
            Restart Demo
          </button>
        </div>
      </div>
    );
  }

  // ── Complete ──
  if (state.phase === "complete" || state.phase === "mit_done") {
    return (
      <div className={styles.container}>
        <div className={styles.completeCard}>
          <h3 className={styles.completeTitle}>Recurring Payment Complete</h3>
          <p className={styles.completeDescription}>
            The card was charged without any customer interaction.
            {state.mitMode === "one-step"
              ? " Using One-Step Checkout, the session was created and charged in a single API call."
              : " Using Two-Step flow, a new session was created, then the auto-debit endpoint charged the saved token."}
          </p>
          <button className={styles.secondaryButton} onClick={() => dispatch({ type: "RESET" })}>
            Restart Demo
          </button>
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          <WebhookViewer orderId={state.orderId} label="All Webhook Notifications" />
        </div>
      </div>
    );
  }

  // ── Active phases ──
  const isCIT = state.phase.startsWith("cit_");
  const phaseLabel = isCIT ? "Step 1: First Payment (CIT)" : `Step 2: Auto-Debit (MIT) — ${state.mitMode === "one-step" ? "One-Step" : "Two-Step"}`;

  return (
    <div className={styles.container}>
      <div className={styles.phaseHeader}>
        <span className={styles.phaseLabel}>{phaseLabel}</span>
        <span className={styles.stepIndicator}>
          {isCIT ? "Step 1 of 2" : "Step 2 of 2"}
        </span>
      </div>

      <div className={styles.stepContent}>
        {/* CIT: Creating session */}
        {state.phase === "cit_creating" && (
          <>
            <p className={styles.stepTitle}>
              <span className={styles.spinner} />
              Creating payment session...
            </p>
            <p className={styles.stepDescription}>
              Calling the Checkout API with <code>payment_type: "auto_debit"</code> and an agreement object.
            </p>
          </>
        )}

        {/* CIT: SDK showing */}
        {state.phase === "cit_sdk" && (
          <>
            <p className={styles.stepTitle}>Enter test card details</p>
            <p className={styles.stepDescription}>
              Use test card <strong>5123 4500 0000 0008</strong>, expiry <strong>01/39</strong>, CVV <strong>100</strong>.
            </p>
            {state.citResponse && renderAPIPanel("Checkout API Response", {
              session_id: state.citSessionId,
              payment_type: state.citResponse.payment_type,
              amount: state.citResponse.amount,
              currency_code: state.citResponse.currency_code,
            })}
          </>
        )}

        {/* CIT: Waiting for webhook */}
        {state.phase === "cit_waiting_webhook" && (
          <>
            <p className={styles.stepTitle}>
              <span className={styles.spinner} />
              Payment submitted — waiting for webhook...
            </p>
            <p className={styles.stepDescription}>
              The payment is being processed. The webhook notification will appear below when Ottu confirms the result.
            </p>
          </>
        )}

        {/* CIT: Done — show token + webhook + MIT selector */}
        {state.phase === "cit_done" && (
          <>
            <p className={styles.stepTitle}>Token received!</p>
            <p className={styles.stepDescription}>
              The card has been saved. Token: <code>{state.citToken}</code>
            </p>
            <p className={styles.stepDescription}>
              Choose how to charge this saved card:
            </p>
            <div className={styles.tabSelector}>
              <button
                className={`${styles.tabButton}`}
                onClick={startMITTwoStep1}
              >
                <span className={styles.tabButtonLabel}>Two-Step MIT</span>
                <span className={styles.tabButtonDescription}>Checkout API + Auto-Debit API</span>
              </button>
              <button
                className={`${styles.tabButton}`}
                onClick={startMITOneStep}
              >
                <span className={styles.tabButtonLabel}>One-Step MIT</span>
                <span className={styles.tabButtonDescription}>Checkout API with payment_instrument</span>
              </button>
            </div>
          </>
        )}

        {/* MIT select (loading) */}
        {state.phase === "mit_select" && (
          <p className={styles.stepTitle}>
            <span className={styles.spinner} />
            {state.mitMode === "two-step" ? "Creating new session..." : "Creating session + charging..."}
          </p>
        )}

        {/* MIT Two-Step: Step 1 done — show response, next button */}
        {state.phase === "mit_step1_done" && (
          <>
            <p className={styles.stepTitle}>New session created</p>
            <p className={styles.stepDescription}>
              A new payment session was created with a different amount. Now call the Auto-Debit API with the saved token.
            </p>
            {renderAPIPanel("New Session Response", {
              session_id: state.mitSessionId,
              amount: state.mitResponse?.amount,
              currency_code: state.mitResponse?.currency_code,
            })}
            <div className={styles.stepActions}>
              <button className={styles.primaryButton} onClick={startMITTwoStep2}>
                Call Auto-Debit API →
              </button>
            </div>
          </>
        )}

        {/* MIT Two-Step: Step 2 — charging */}
        {state.phase === "mit_step2" && (
          <p className={styles.stepTitle}>
            <span className={styles.spinner} />
            Charging saved card via Auto-Debit API...
          </p>
        )}

        {/* MIT: Waiting for webhook */}
        {state.phase === "mit_waiting_webhook" && (
          <>
            <p className={styles.stepTitle}>
              <span className={styles.spinner} />
              Card charged — waiting for webhook...
            </p>
            {state.mitAutoDebitResponse && renderAPIPanel("Auto-Debit Response", state.mitAutoDebitResponse)}
            {state.mitMode === "one-step" && state.mitResponse && renderAPIPanel("One-Step Response", {
              session_id: state.mitResponse.session_id,
              state: state.mitResponse.state,
              amount: state.mitResponse.amount,
            })}
          </>
        )}
      </div>

      {/* SDK container — always in DOM for CIT */}
      <div
        className={styles.sdkContainer}
        style={{ display: state.phase === "cit_sdk" ? "block" : "none" }}
      >
        <div id={SDK_CONTAINER_ID} ref={sdkContainerRef} />
      </div>

      {/* Webhook viewer — always visible once started */}
      {state.orderId && (
        <div style={{ padding: "0 20px 20px" }}>
          <WebhookViewer
            orderId={state.orderId}
            label="Live Webhook Notifications"
          />
        </div>
      )}
    </div>
  );
}
