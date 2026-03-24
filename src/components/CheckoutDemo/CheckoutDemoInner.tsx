import React, { useReducer, useEffect, useRef, useCallback } from "react";
import Icon from "@mdi/react";
import { mdiLoading, mdiCheck, mdiAlertCircleOutline } from "@mdi/js";
import {
  createSandboxSession,
  SANDBOX_MERCHANT_ID,
  SANDBOX_API_KEY,
} from "@site/src/utils/sandbox";
import styles from "./styles.module.css";

type State =
  | { status: "idle" }
  | { status: "creating_session" }
  | { status: "loading_script" }
  | { status: "initializing" }
  | { status: "ready" }
  | { status: "error"; message: string };

type Action =
  | { type: "START" }
  | { type: "SESSION_CREATED" }
  | { type: "SCRIPT_LOADED" }
  | { type: "SDK_READY" }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { status: "creating_session" };
    case "SESSION_CREATED":
      return { status: "loading_script" };
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

const SDK_SCRIPT_URL = "https://150330.dd33t4o2i3w1b.amplifyapp.com/checkout/v3/checkout.min.js";
const CONTAINER_ID = "checkout-demo-target";

const STEPS = [
  "Creating payment session...",
  "Loading Checkout SDK...",
  "Initializing payment form...",
];

function loadScript(): Promise<void> {
  if ((window as any).Checkout) return Promise.resolve();
  if (document.querySelector(`script[src="${SDK_SCRIPT_URL}"]`)) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if ((window as any).Checkout) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_SCRIPT_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Checkout SDK script"));
    document.head.appendChild(script);
    setTimeout(() => reject(new Error("Script load timed out")), 15000);
  });
}

function getStepState(
  stepIndex: number,
  status: string
): "pending" | "active" | "done" {
  const statusToStep: Record<string, number> = {
    creating_session: 0,
    loading_script: 1,
    initializing: 2,
    ready: 3,
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
      const { session_id } = await createSandboxSession({
        pg_codes: ["direct-payment"],
      });
      dispatch({ type: "SESSION_CREATED" });

      await loadScript();
      dispatch({ type: "SCRIPT_LOADED" });

      (window as any).Checkout.init({
        selector: CONTAINER_ID,
        merchant_id: SANDBOX_MERCHANT_ID,
        session_id,
        apiKey: SANDBOX_API_KEY,
        displayMode: "split",
        formsOfPayment: [
          "applePay",
          "tokenPay",
          "ottuPG",
          "redirect",
          "googlePay",
          "stcPay",
        ],
        theme: {
          "title-text": { "font-family": "system-ui" },
          amount: { "font-family": "system-ui" },
          "amount-label": { "font-family": "system-ui" },
          "amount-currency": { "font-family": "system-ui" },
          "pay-button": { "font-family": "system-ui" },
          "payment-method-name": { "font-family": "system-ui" },
        },
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
