import React, { useReducer, useCallback, useEffect, useMemo } from "react";
import Icon from "@mdi/react";
import { mdiCheck, mdiLoading, mdiAlertCircleOutline, mdiChevronDown, mdiChevronRight } from "@mdi/js";
import {
  createSandboxSession,
  callPaymentMethods,
  extractPgCodes,
  generateDemoCustomerId,
} from "@site/src/utils/sandbox";
import { loadCheckoutScript, initCheckout, createDemoCallbacks } from "@site/src/utils/checkoutSdk";
import { seedWalletViaBackend } from "@site/src/utils/walletSeed";
import { WALLET_DEMO } from "@site/src/utils/walletDemoConfig";
import ApiPanel from "@site/src/components/ApiPanel";
import styles from "./styles.module.css";

// ── State machine ──────────────────────────────────────

type Status =
  | "idle"
  | "step1_discover"
  | "step1_done"
  | "step2_seed"
  | "step2_done"
  | "step3_session"
  | "step3_done"
  | "step4_checkout"
  | "done"
  | "error";

interface State {
  status: Status;
  // Step 1 — discover
  discoverRequest: any;
  discoverResponse: any;
  pgCode: string;
  // Step 2 — seed
  seedRequest: any;
  seedResponse: any;
  customerId: string;
  // Step 3 — session
  sessionRequest: any;
  sessionResponse: any;
  sessionId: string;
  // Error
  errorMessage: string;
  // Expanded done steps (user clicked the header)
  expanded: Set<number>;
}

type Action =
  | { type: "START" }
  | { type: "STEP1_DONE"; request: any; response: any; pgCode: string }
  | { type: "STEP2_GO"; customerId: string; request: any }
  | { type: "STEP2_DONE"; response: any }
  | { type: "STEP3_GO"; request: any }
  | { type: "STEP3_DONE"; response: any; sessionId: string }
  | { type: "STEP4_GO" }
  | { type: "DONE" }
  | { type: "ERROR"; message: string }
  | { type: "RESET" }
  | { type: "TOGGLE_EXPAND"; stepNum: number };

const initialState: State = {
  status: "idle",
  discoverRequest: null,
  discoverResponse: null,
  pgCode: "",
  seedRequest: null,
  seedResponse: null,
  customerId: "",
  sessionRequest: null,
  sessionResponse: null,
  sessionId: "",
  errorMessage: "",
  expanded: new Set(),
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { ...initialState, status: "step1_discover" };
    case "STEP1_DONE":
      return {
        ...state,
        status: "step1_done",
        discoverRequest: action.request,
        discoverResponse: action.response,
        pgCode: action.pgCode,
      };
    case "STEP2_GO":
      return {
        ...state,
        status: "step2_seed",
        customerId: action.customerId,
        seedRequest: action.request,
      };
    case "STEP2_DONE":
      return { ...state, status: "step2_done", seedResponse: action.response };
    case "STEP3_GO":
      return { ...state, status: "step3_session", sessionRequest: action.request };
    case "STEP3_DONE":
      return {
        ...state,
        status: "step3_done",
        sessionResponse: action.response,
        sessionId: action.sessionId,
      };
    case "STEP4_GO":
      return { ...state, status: "step4_checkout" };
    case "DONE":
      return { ...state, status: "done" };
    case "ERROR":
      return { ...state, status: "error", errorMessage: action.message };
    case "RESET":
      return initialState;
    case "TOGGLE_EXPAND": {
      const next = new Set(state.expanded);
      if (next.has(action.stepNum)) next.delete(action.stepNum);
      else next.add(action.stepNum);
      return { ...state, expanded: next };
    }
  }
}

// ── Step metadata ──────────────────────────────────────

const STEPS = [
  {
    num: 1,
    title: "Discover wallet-capable gateways",
    description:
      "Call the Payment Methods API filtered by payment_services: [\"wallet\"]. The first returned pg_code is used for the next step.",
  },
  {
    num: 2,
    title: "Seed a fresh wallet (backend)",
    description:
      "Ask the docs backend to mint a Keycloak JWT and credit a brand-new customer's wallet via the wallet service. The Keycloak client secret stays server-side.",
  },
  {
    num: 3,
    title: "Create the Checkout session",
    description:
      "Call the Checkout API with the wallet-capable pg_code and the freshly seeded customer_id. The response includes the session_id that initializes the SDK.",
  },
  {
    num: 4,
    title: "Render the Checkout SDK",
    description:
      "Mount the SDK with formsOfPayment: [\"wallet\", <pg_code>]. The customer sees the wallet balance and can pay with it.",
  },
];

function getStepStatus(stepNum: number, state: State): "pending" | "active" | "done" {
  const order: Record<Status, number> = {
    idle: 0,
    step1_discover: 1,
    step1_done: 1,
    step2_seed: 2,
    step2_done: 2,
    step3_session: 3,
    step3_done: 3,
    step4_checkout: 4,
    done: 5,
    error: 0,
  };
  const active = order[state.status];
  if (stepNum < active) return "done";
  if (stepNum === active) return "active";
  return "pending";
}

function isStepCalling(stepNum: number, state: State): boolean {
  return (
    (stepNum === 1 && state.status === "step1_discover") ||
    (stepNum === 2 && state.status === "step2_seed") ||
    (stepNum === 3 && state.status === "step3_session")
  );
}

// ── Component ──────────────────────────────────────────

export default function WalletDemoInner(): React.JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Step 1 — discover
  useEffect(() => {
    if (state.status !== "step1_discover") return;
    const filter = WALLET_DEMO.pgFilter || ({} as any);
    const request: Record<string, unknown> = {
      plugin: filter.plugin ?? "e_commerce",
      currencies: [WALLET_DEMO.currency],
    };
    if (filter.type) request.type = filter.type;
    if (filter.tags) request.tags = filter.tags;
    if (filter.payment_services) request.payment_services = filter.payment_services;

    (async () => {
      try {
        const response = await callPaymentMethods({
          ...request,
          currencies: [WALLET_DEMO.currency],
          merchantId: WALLET_DEMO.merchantId,
          connectBaseUrl: WALLET_DEMO.connectBaseUrl,
          apiKey: WALLET_DEMO.apiKey,
        } as any);
        const codes = extractPgCodes(response);
        if (codes.length === 0) {
          dispatch({
            type: "ERROR",
            message: `No wallet-capable gateways returned for ${WALLET_DEMO.currency} on ${WALLET_DEMO.merchantId}. Check that a PG tagged "docs" with payment_services: ["wallet"] is enabled.`,
          });
          return;
        }
        dispatch({ type: "STEP1_DONE", request, response, pgCode: codes[0] });
      } catch (err: any) {
        dispatch({ type: "ERROR", message: err.message ?? String(err) });
      }
    })();
  }, [state.status]);

  // Step 1 → Step 2 (auto)
  useEffect(() => {
    if (state.status !== "step1_done") return;
    const customerId = generateDemoCustomerId();
    const request = {
      customer_id: customerId,
      currency: WALLET_DEMO.currency,
      amount: WALLET_DEMO.seedAmount,
      pg_code: state.pgCode,
    };
    dispatch({ type: "STEP2_GO", customerId, request });
  }, [state.status, state.pgCode]);

  // Step 2 — seed
  useEffect(() => {
    if (state.status !== "step2_seed") return;
    (async () => {
      try {
        const result = await seedWalletViaBackend(state.seedRequest);
        dispatch({ type: "STEP2_DONE", response: result.raw });
      } catch (err: any) {
        dispatch({ type: "ERROR", message: err.message ?? String(err) });
      }
    })();
  }, [state.status, state.seedRequest]);

  // Step 2 → Step 3 (auto)
  useEffect(() => {
    if (state.status !== "step2_done") return;
    const request = {
      type: "e_commerce",
      pg_codes: [state.pgCode],
      amount: WALLET_DEMO.sessionAmount,
      currency_code: WALLET_DEMO.currency,
      customer_id: state.customerId,
    };
    dispatch({ type: "STEP3_GO", request });
  }, [state.status, state.customerId, state.pgCode]);

  // Step 3 — create session
  useEffect(() => {
    if (state.status !== "step3_session") return;
    (async () => {
      try {
        const response = await createSandboxSession({
          ...(state.sessionRequest as any),
          merchantId: WALLET_DEMO.merchantId,
          connectBaseUrl: WALLET_DEMO.connectBaseUrl,
          apiKey: WALLET_DEMO.apiKey,
        });
        await loadCheckoutScript();
        dispatch({ type: "STEP3_DONE", response, sessionId: response.session_id });
      } catch (err: any) {
        dispatch({ type: "ERROR", message: err.message ?? String(err) });
      }
    })();
  }, [state.status, state.sessionRequest]);

  // Step 3 → Step 4 (auto)
  useEffect(() => {
    if (state.status !== "step3_done") return;
    dispatch({ type: "STEP4_GO" });
  }, [state.status]);

  // Step 4 — mount SDK
  useEffect(() => {
    if (state.status !== "step4_checkout") return;
    const callbacks = createDemoCallbacks(() => dispatch({ type: "DONE" }));
    initCheckout({
      selector: "wallet-demo-mount",
      sessionId: state.sessionId,
      formsOfPayment: ["wallet", state.pgCode],
      callbacks,
    });
  }, [state.status, state.sessionId, state.pgCode]);

  const restart = useCallback(() => dispatch({ type: "RESET" }), []);

  // ── Render ──

  const renderNode = (stepNum: number) => {
    const status = getStepStatus(stepNum, state);
    const calling = isStepCalling(stepNum, state);
    return (
      <div
        className={`${styles.node} ${
          status === "active" ? styles.nodeActive : status === "done" ? styles.nodeDone : styles.nodePending
        }`}
      >
        {status === "done" ? (
          <Icon path={mdiCheck} size={0.7} />
        ) : calling ? (
          <Icon path={mdiLoading} size={0.7} spin />
        ) : (
          stepNum
        )}
      </div>
    );
  };

  const renderStep = (stepNum: number, body: React.ReactNode) => {
    const status = getStepStatus(stepNum, state);
    const meta = STEPS[stepNum - 1];
    const isActive = status === "active";
    const isDone = status === "done";
    const isExpanded = isDone && state.expanded.has(stepNum);
    const showBody = isActive || isExpanded;

    return (
      <div className={styles.step} key={stepNum}>
        {renderNode(stepNum)}
        <div
          className={`${styles.card} ${
            isActive ? styles.cardActive : isDone ? (isExpanded ? styles.cardDoneExpanded : styles.cardDone) : ""
          }`}
        >
          <div
            className={`${styles.cardHeader} ${isDone ? styles.cardHeaderDone : ""}`}
            onClick={isDone ? () => dispatch({ type: "TOGGLE_EXPAND", stepNum }) : undefined}
          >
            <div>
              <h3 className={`${styles.cardTitle} ${status === "pending" ? styles.cardTitlePending : ""}`}>
                {meta.title}
              </h3>
              {isActive && <p className={styles.cardSubtitle}>Step {stepNum} of {STEPS.length}</p>}
            </div>
            {isDone && (
              <div className={styles.doneRight}>
                <span className={styles.doneBadge}>
                  <Icon path={mdiCheck} size={0.6} /> Done
                </span>
                <Icon path={isExpanded ? mdiChevronDown : mdiChevronRight} size={0.8} className={styles.chevron} />
              </div>
            )}
          </div>
          {showBody && (
            <div className={styles.cardBody}>
              <p className={styles.cardDescription}>{meta.description}</p>
              {body}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Idle
  if (state.status === "idle") {
    return (
      <div className={styles.hero}>
        <span className={styles.envBadge}>
          Live · <span className={styles.envBadgeCode}>{WALLET_DEMO.merchantId}</span>
        </span>
        <h3 className={styles.heroTitle}>Wallet at Checkout — Live Demo</h3>
        <p className={styles.heroSubtitle}>
          Watch a real wallet credit get seeded for a fresh customer, a checkout session created, and the SDK mounted —
          each step shows the live API request and response.
        </p>
        <button className={styles.primaryBtn} onClick={() => dispatch({ type: "START" })}>
          Try Wallet at Checkout
        </button>
      </div>
    );
  }

  // Error
  if (state.status === "error") {
    return (
      <div className={styles.errorCard}>
        <Icon path={mdiAlertCircleOutline} size={1.5} className={styles.errorIcon} />
        <p className={styles.errorMessage}>{state.errorMessage}</p>
        <div className={styles.actions}>
          <button className={styles.secondaryBtn} onClick={restart}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  // Active timeline
  return (
    <div className={styles.journey}>
      {renderStep(
        1,
        <>
          {state.discoverRequest && (
            <ApiPanel label={`POST ${WALLET_DEMO.connectBaseUrl}/b/pbl/v2/payment-methods/`} data={state.discoverRequest} />
          )}
          {state.discoverResponse && (
            <ApiPanel label="Response — Payment Methods" data={state.discoverResponse} />
          )}
        </>
      )}

      {renderStep(
        2,
        <>
          {state.seedRequest && (
            <ApiPanel label="POST /seed-wallet (docs backend)" data={state.seedRequest} />
          )}
          {state.seedResponse && (
            <ApiPanel label="Response — Wallet Credit" data={state.seedResponse} />
          )}
        </>
      )}

      {renderStep(
        3,
        <>
          {state.sessionRequest && (
            <ApiPanel label={`POST ${WALLET_DEMO.connectBaseUrl}/b/checkout/v1/pymt-txn/`} data={state.sessionRequest} />
          )}
          {state.sessionResponse && (
            <ApiPanel label="Response — Checkout Session" data={state.sessionResponse} />
          )}
        </>
      )}

      {renderStep(
        4,
        <>
          {(state.status === "step4_checkout" || state.status === "done") && (
            <div id="wallet-demo-mount" className={styles.sdkContainer} />
          )}
          {state.status === "done" && (
            <div className={styles.successBanner}>
              <span className={styles.successBannerIcon}>
                <Icon path={mdiCheck} size={0.8} />
              </span>
              <h4 className={styles.successBannerTitle}>Payment Complete</h4>
              <p className={styles.successBannerDescription}>
                The wallet balance was applied to the session.
              </p>
              <div className={styles.actions}>
                <button className={styles.primaryBtn} onClick={restart}>
                  Run again
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
