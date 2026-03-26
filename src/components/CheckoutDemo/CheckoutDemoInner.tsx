import React, { useReducer, useEffect, useRef, useCallback } from "react";
import Icon from "@mdi/react";
import { mdiLoading, mdiCheck, mdiAlertCircleOutline } from "@mdi/js";
import {
  createSandboxSession,
  callPaymentMethods,
} from "@site/src/utils/sandbox";
import {
  loadCheckoutScript,
  initCheckout,
  CHECKOUT_SDK_THEME,
} from "@site/src/utils/checkoutSdk";
import styles from "./styles.module.css";

type State =
  | { status: "idle" }
  | { status: "fetching_methods" }
  | { status: "creating_session"; pgCodes: string[] }
  | { status: "loading_script"; pgCodes: string[] }
  | { status: "initializing" }
  | { status: "ready" }
  | { status: "error"; message: string };

type Action =
  | { type: "START" }
  | { type: "METHODS_FETCHED"; pgCodes: string[] }
  | { type: "SESSION_CREATED" }
  | { type: "SCRIPT_LOADED" }
  | { type: "SDK_READY" }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { status: "fetching_methods" };
    case "METHODS_FETCHED":
      return { status: "creating_session", pgCodes: action.pgCodes };
    case "SESSION_CREATED":
      return { status: "loading_script", pgCodes: (state as any).pgCodes ?? [] };
    case "SCRIPT_LOADED":
      return { status: "initializing" };
    case "SDK_READY":
      return { status: "ready" };
    case "ERROR":
      return { status: "error", message: action.message };
    case "RESET":
      return { status: "idle" };
  }
}

const CONTAINER_ID = "checkout-demo-target";

const STEPS = [
  "Fetching available payment methods...",
  "Creating payment session...",
  "Loading Checkout SDK...",
  "Initializing payment form...",
];

function getStepState(
  stepIndex: number,
  status: string
): "pending" | "active" | "done" {
  const statusToStep: Record<string, number> = {
    fetching_methods: 0,
    creating_session: 1,
    loading_script: 2,
    initializing: 3,
    ready: 4,
  };
  const activeStep = statusToStep[status] ?? -1;
  if (stepIndex < activeStep) return "done";
  if (stepIndex === activeStep) return "active";
  return "pending";
}

export default function CheckoutDemoInner() {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });
  const containerRef = useRef<HTMLDivElement>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [retryDisabled, setRetryDisabled] = React.useState(false);

  const cleanup = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [cleanup]);

  const launch = useCallback(async () => {
    cleanup();
    dispatch({ type: "START" });

    try {
      // Step 1: Fetch payment methods
      const methodsResponse = await callPaymentMethods({
        currencies: ["KWD"],
        is_sandbox: true,
        tags: ["demo"],
      });
      const pgCodes =
        methodsResponse?.payment_methods?.map((m: any) => m.code) ??
        methodsResponse?.pg_codes ??
        [];
      dispatch({ type: "METHODS_FETCHED", pgCodes });

      // Step 2: Create session
      const { session_id } = await createSandboxSession({
        pg_codes: pgCodes.length > 0 ? pgCodes : ["ottu_sdk"],
        type: "e_commerce",
      });
      dispatch({ type: "SESSION_CREATED" });

      // Step 3: Load SDK script
      await loadCheckoutScript();
      dispatch({ type: "SCRIPT_LOADED" });

      // Step 4: Init SDK
      initCheckout({
        selector: CONTAINER_ID,
        sessionId: session_id,
        displayMode: "column",
        theme: CHECKOUT_SDK_THEME,
      });

      dispatch({ type: "SDK_READY" });
    } catch (err: any) {
      dispatch({ type: "ERROR", message: err.message || "Something went wrong" });
    }
  }, [cleanup]);

  const handleRetry = useCallback(() => {
    setRetryDisabled(true);
    retryTimer.current = setTimeout(() => setRetryDisabled(false), 2000);
    launch();
  }, [launch]);

  const isProgress =
    state.status === "fetching_methods" ||
    state.status === "creating_session" ||
    state.status === "loading_script" ||
    state.status === "initializing";

  return (
    <div className={styles.container}>
      {/* Idle state */}
      {state.status === "idle" && (
        <div className={styles.idleCard}>
          <h3 className={styles.idleTitle}>Try the Checkout SDK</h3>
          <p className={styles.idleDescription}>
            Experience the Ottu payment form with a live sandbox session. No
            real charges will be made.
          </p>
          <button className={styles.launchButton} onClick={launch}>
            Launch Demo
          </button>
        </div>
      )}

      {/* Error state */}
      {state.status === "error" && (
        <div className={styles.errorCard}>
          <Icon
            path={mdiAlertCircleOutline}
            size={1.5}
            className={styles.errorIcon}
          />
          <p className={styles.errorMessage}>{state.message}</p>
          <button
            className={styles.retryButton}
            onClick={handleRetry}
            disabled={retryDisabled}
          >
            Retry
          </button>
        </div>
      )}

      {/* Progress stepper */}
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
                    {stepState === "active" && (
                      <Icon path={mdiLoading} size={0.6} />
                    )}
                    {stepState === "done" && (
                      <Icon path={mdiCheck} size={0.6} />
                    )}
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

      {/* SDK container — ALWAYS mounted, visibility toggled */}
      <div
        className={styles.sdkContainer}
        style={{ display: state.status === "ready" ? "block" : "none" }}
      >
        <div id={CONTAINER_ID} ref={containerRef} />
      </div>
    </div>
  );
}
