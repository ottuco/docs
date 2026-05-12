import React, { useReducer, useEffect, useRef, useCallback, useMemo } from "react";
import Icon from "@mdi/react";
import { mdiLoading, mdiCheck, mdiAlertCircleOutline } from "@mdi/js";
import {
  createSandboxSession,
  callPaymentMethods,
  extractPgCodes,
  generateDemoCustomerId,
} from "@site/src/utils/sandbox";
import { createDemoCallbacks } from "@site/src/utils/checkoutSdk";
import { seedWalletViaBackend } from "@site/src/utils/walletSeed";
import { WALLET_DEMO } from "@site/src/utils/walletDemoConfig";
import CheckoutSDKEmbed from "@site/src/components/CheckoutSDKEmbed";
import styles from "./styles.module.css";

type State =
  | { status: "idle" }
  | { status: "fetching_methods" }
  | { status: "seeding_wallet"; pgCode: string }
  | { status: "creating_session"; pgCode: string; customerId: string }
  | { status: "sdk_loading"; sessionId: string; pgCode: string }
  | { status: "ready"; sessionId: string; pgCode: string }
  | { status: "complete"; sessionId: string; pgCode: string }
  | { status: "error"; message: string };

type Action =
  | { type: "START" }
  | { type: "METHODS_FETCHED"; pgCode: string }
  | { type: "WALLET_SEEDED"; customerId: string }
  | { type: "SESSION_CREATED"; sessionId: string }
  | { type: "SDK_READY" }
  | { type: "COMPLETE" }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { status: "fetching_methods" };
    case "METHODS_FETCHED":
      return { status: "seeding_wallet", pgCode: action.pgCode };
    case "WALLET_SEEDED":
      return state.status === "seeding_wallet"
        ? { status: "creating_session", pgCode: state.pgCode, customerId: action.customerId }
        : state;
    case "SESSION_CREATED":
      return state.status === "creating_session"
        ? { status: "sdk_loading", sessionId: action.sessionId, pgCode: state.pgCode }
        : state;
    case "SDK_READY":
      return state.status === "sdk_loading"
        ? { status: "ready", sessionId: state.sessionId, pgCode: state.pgCode }
        : state;
    case "COMPLETE":
      return state.status === "ready" || state.status === "sdk_loading"
        ? { status: "complete", sessionId: state.sessionId, pgCode: state.pgCode }
        : state;
    case "ERROR":
      return { status: "error", message: action.message };
    case "RESET":
      return { status: "idle" };
  }
}

const STEPS = [
  "Fetching wallet-capable payment methods...",
  "Seeding wallet balance...",
  "Creating payment session...",
  "Loading Checkout SDK...",
];

function getStepState(stepIndex: number, status: string): "pending" | "active" | "done" {
  const statusToStep: Record<string, number> = {
    fetching_methods: 0,
    seeding_wallet: 1,
    creating_session: 2,
    sdk_loading: 3,
    ready: 4,
  };
  const activeStep = statusToStep[status] ?? -1;
  if (stepIndex < activeStep) return "done";
  if (stepIndex === activeStep) return "active";
  return "pending";
}

export default function WalletDemoInner() {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [retryDisabled, setRetryDisabled] = React.useState(false);

  useEffect(() => {
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  const launch = useCallback(async () => {
    dispatch({ type: "START" });

    try {
      // Step 1 — Fetch wallet-capable gateways
      const filter = WALLET_DEMO.pgFilter || ({} as any);
      const methodsResponse = await callPaymentMethods({
        currencies: [WALLET_DEMO.currency],
        plugin: filter.plugin,
        type: filter.type,
        tags: filter.tags,
        payment_services: filter.payment_services,
        merchantId: WALLET_DEMO.merchantId,
        connectBaseUrl: WALLET_DEMO.connectBaseUrl,
        apiKey: WALLET_DEMO.apiKey,
      });
      const pgCodes = extractPgCodes(methodsResponse);
      if (pgCodes.length === 0) {
        dispatch({
          type: "ERROR",
          message: `No wallet-capable gateways for ${WALLET_DEMO.currency} on ${WALLET_DEMO.merchantId}. Enable a PG with payment_services: ["wallet"] tagged "docs".`,
        });
        return;
      }
      const pgCode = pgCodes[0];
      dispatch({ type: "METHODS_FETCHED", pgCode });

      // Step 2 — Seed wallet via backend
      const customerId = generateDemoCustomerId();
      await seedWalletViaBackend({
        customer_id: customerId,
        currency: WALLET_DEMO.currency,
        amount: WALLET_DEMO.seedAmount,
        pg_code: pgCode,
      });
      dispatch({ type: "WALLET_SEEDED", customerId });

      // Step 3 — Create Checkout session
      const { session_id } = await createSandboxSession({
        pg_codes: [pgCode],
        type: "e_commerce",
        amount: WALLET_DEMO.sessionAmount,
        currency_code: WALLET_DEMO.currency,
        customer_id: customerId,
        merchantId: WALLET_DEMO.merchantId,
        connectBaseUrl: WALLET_DEMO.connectBaseUrl,
        apiKey: WALLET_DEMO.apiKey,
      });
      dispatch({ type: "SESSION_CREATED", sessionId: session_id });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "Something went wrong" });
    }
  }, []);

  const handleRetry = useCallback(() => {
    setRetryDisabled(true);
    retryTimer.current = setTimeout(() => setRetryDisabled(false), 2000);
    launch();
  }, [launch]);

  const isProgress =
    state.status === "fetching_methods" ||
    state.status === "seeding_wallet" ||
    state.status === "creating_session" ||
    state.status === "sdk_loading";

  const sessionId =
    state.status === "sdk_loading" || state.status === "ready" || state.status === "complete"
      ? state.sessionId
      : null;

  const sdkPgCode =
    state.status === "sdk_loading" || state.status === "ready" || state.status === "complete"
      ? state.pgCode
      : null;

  const callbacks = useMemo(
    () => createDemoCallbacks(() => dispatch({ type: "COMPLETE" })),
    []
  );

  return (
    <div className={styles.container}>
      {state.status === "idle" && (
        <div className={styles.idleCard}>
          <h3 className={styles.idleTitle}>Try Wallet at Checkout</h3>
          <p className={styles.idleDescription}>
            Seed a fresh customer's wallet through the docs backend, then pay with it in
            the embedded SDK. No real charges.
          </p>
          <button className={styles.launchButton} onClick={launch}>
            Launch Demo
          </button>
        </div>
      )}

      {state.status === "complete" && (
        <div className={styles.completeCard}>
          <span className={styles.completeIcon}>
            <Icon path={mdiCheck} size={0.8} />
          </span>
          <h3 className={styles.completeTitle}>Payment Complete</h3>
          <p className={styles.completeDescription}>
            The wallet balance was applied to the session. In a real integration the
            customer would be redirected to your confirmation page and your server would
            receive a webhook notification.
          </p>
          <button className={styles.restartButton} onClick={() => dispatch({ type: "RESET" })}>
            Try Again
          </button>
        </div>
      )}

      {state.status === "error" && (
        <div className={styles.errorCard}>
          <Icon path={mdiAlertCircleOutline} size={1.5} className={styles.errorIcon} />
          <p className={styles.errorMessage}>{(state as any).message}</p>
          <button className={styles.retryButton} onClick={handleRetry} disabled={retryDisabled}>
            Retry
          </button>
        </div>
      )}

      {isProgress && (
        <div className={styles.progressCard}>
          <div className={styles.stepper}>
            {STEPS.map((label, i) => {
              const stepState = getStepState(i, state.status);
              return (
                <div
                  key={i}
                  className={`${styles.step} ${
                    stepState === "active"
                      ? styles.stepActive
                      : stepState === "done"
                        ? styles.stepDone
                        : ""
                  }`}
                >
                  <span
                    className={`${styles.stepIcon} ${
                      stepState === "active"
                        ? styles.stepIconActive
                        : stepState === "done"
                          ? styles.stepIconDone
                          : styles.stepIconPending
                    }`}
                  >
                    {stepState === "active" && <Icon path={mdiLoading} size={0.6} />}
                    {stepState === "done" && <Icon path={mdiCheck} size={0.6} />}
                    {stepState === "pending" && (
                      <span style={{ fontSize: 10 }}>{i + 1}</span>
                    )}
                  </span>
                  {label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sessionId && (
        <CheckoutSDKEmbed
          sessionId={sessionId}
          onReady={() => dispatch({ type: "SDK_READY" })}
          onError={(message) => dispatch({ type: "ERROR", message })}
          callbacks={callbacks}
          formsOfPayment={sdkPgCode ? ["wallet", sdkPgCode] : ["wallet"]}
        />
      )}
    </div>
  );
}
