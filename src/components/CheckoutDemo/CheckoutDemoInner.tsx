import React, { useReducer, useEffect, useRef, useCallback } from "react";
import Icon from "@mdi/react";
import { mdiLoading, mdiCheck, mdiAlertCircleOutline } from "@mdi/js";
import {
  createSandboxSession,
  callPaymentMethods,
} from "@site/src/utils/sandbox";
import CheckoutSDKEmbed from "@site/src/components/CheckoutSDKEmbed";
import styles from "./styles.module.css";

type State =
  | { status: "idle" }
  | { status: "fetching_methods" }
  | { status: "creating_session"; pgCodes: string[] }
  | { status: "sdk_loading"; sessionId: string }
  | { status: "ready"; sessionId: string }
  | { status: "error"; message: string };

type Action =
  | { type: "START" }
  | { type: "METHODS_FETCHED"; pgCodes: string[] }
  | { type: "SESSION_CREATED"; sessionId: string }
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
      return { status: "sdk_loading", sessionId: action.sessionId };
    case "SDK_READY":
      return { status: "ready", sessionId: (state as any).sessionId ?? "" };
    case "ERROR":
      return { status: "error", message: action.message };
    case "RESET":
      return { status: "idle" };
  }
}

const STEPS = [
  "Fetching available payment methods...",
  "Creating payment session...",
  "Loading Checkout SDK...",
];

function getStepState(
  stepIndex: number,
  status: string
): "pending" | "active" | "done" {
  const statusToStep: Record<string, number> = {
    fetching_methods: 0,
    creating_session: 1,
    sdk_loading: 2,
    ready: 3,
  };
  const activeStep = statusToStep[status] ?? -1;
  if (stepIndex < activeStep) return "done";
  if (stepIndex === activeStep) return "active";
  return "pending";
}

export default function CheckoutDemoInner() {
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

      const { session_id } = await createSandboxSession({
        pg_codes: pgCodes.length > 0 ? pgCodes : ["ottu_sdk"],
        type: "e_commerce",
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
    state.status === "creating_session" ||
    state.status === "sdk_loading";

  const sessionId = (state.status === "sdk_loading" || state.status === "ready")
    ? (state as any).sessionId
    : null;

  return (
    <div className={styles.container}>
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

      {state.status === "error" && (
        <div className={styles.errorCard}>
          <Icon
            path={mdiAlertCircleOutline}
            size={1.5}
            className={styles.errorIcon}
          />
          <p className={styles.errorMessage}>{(state as any).message}</p>
          <button
            className={styles.retryButton}
            onClick={handleRetry}
            disabled={retryDisabled}
          >
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

      {sessionId && (
        <CheckoutSDKEmbed
          sessionId={sessionId}
          onReady={() => dispatch({ type: "SDK_READY" })}
          onError={(message) => dispatch({ type: "ERROR", message })}
        />
      )}
    </div>
  );
}
