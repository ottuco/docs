import React, { useState, useEffect, useRef } from "react";
import {
  createSandboxSession,
  createSandboxWalletCredit,
  SANDBOX_MERCHANT_ID,
  SANDBOX_API_KEY,
} from "@site/src/utils/sandbox";
import type { WalletCreditResult } from "@site/src/utils/sandbox";
import styles from "./styles.module.css";

declare global {
  interface Window {
    Checkout: any;
    walletDemoSuccess?: (data: unknown) => void;
    walletDemoError?: (err: unknown) => void;
    walletDemoCancel?: () => void;
  }
}

type State =
  | { kind: "idle" }
  | { kind: "seeding" }
  | { kind: "ready"; credit: WalletCreditResult }
  | { kind: "checkout"; credit: WalletCreditResult; sessionId: string }
  | { kind: "done"; message: string }
  | { kind: "seed_error"; message: string }
  | { kind: "pay_error"; message: string };

const SCRIPT_SRC = "https://assets.ottu.net/checkout/v3/checkout.min.js";

function useCheckoutScript(): boolean {
  const [loaded, setLoaded] = useState<boolean>(
    typeof window !== "undefined" && Boolean(window.Checkout)
  );

  useEffect(() => {
    if (loaded) return;
    if (window.Checkout) {
      setLoaded(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (existing) {
      const handler = () => setLoaded(true);
      existing.addEventListener("load", handler);
      return () => existing.removeEventListener("load", handler);
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.dataset.success = "walletDemoSuccess";
    script.dataset.error = "walletDemoError";
    script.dataset.cancel = "walletDemoCancel";
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, [loaded]);

  return loaded;
}

export default function WalletDemoInner(): React.JSX.Element {
  const [state, setState] = useState<State>({ kind: "idle" });
  const scriptLoaded = useCheckoutScript();
  const mountRef = useRef<HTMLDivElement>(null);

  // Auto-advance from "ready" to "checkout" after 1.5s
  useEffect(() => {
    if (state.kind !== "ready") return;
    const timer = setTimeout(async () => {
      try {
        const session = await createSandboxSession({
          pg_codes: ["ottu_sandbox"],
          amount: "15.000",
          currency_code: state.credit.currency,
          customer_id: state.credit.customer_id,
        });
        setState({
          kind: "checkout",
          credit: state.credit,
          sessionId: session.session_id,
        });
      } catch (err) {
        setState({
          kind: "pay_error",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [state]);

  // Mount Checkout SDK when entering "checkout" state
  useEffect(() => {
    if (state.kind !== "checkout" || !scriptLoaded) return;

    window.walletDemoSuccess = (data: unknown) => {
      setState({
        kind: "done",
        message: "Payment successful.",
      });
    };
    window.walletDemoError = (err: unknown) => {
      setState({
        kind: "pay_error",
        message: `Payment error: ${
          err instanceof Error ? err.message : JSON.stringify(err)
        }`,
      });
    };
    window.walletDemoCancel = () => {
      setState({
        kind: "pay_error",
        message: "Payment was cancelled.",
      });
    };

    window.Checkout.init({
      selector: "wallet-demo-mount",
      merchant_id: SANDBOX_MERCHANT_ID,
      apiKey: SANDBOX_API_KEY,
      session_id: state.sessionId,
      formsOfPayment: ["wallet", "ottu_sandbox"],
    });

    return () => {
      delete window.walletDemoSuccess;
      delete window.walletDemoError;
      delete window.walletDemoCancel;
    };
  }, [state, scriptLoaded]);

  const start = async () => {
    setState({ kind: "seeding" });
    try {
      const credit = await createSandboxWalletCredit({
        amount: "10.000",
        currency: "KWD",
        pg_code: "ottu_sandbox",
      });
      setState({ kind: "ready", credit });
    } catch (err) {
      setState({
        kind: "seed_error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const restart = () => setState({ kind: "idle" });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Wallet at Checkout — Live Demo</h3>
        {(state.kind === "done" ||
          state.kind === "seed_error" ||
          state.kind === "pay_error") && (
          <button className={styles.restartButton} onClick={restart}>
            Try again
          </button>
        )}
      </div>

      {state.kind === "idle" && (
        <button className={styles.startButton} onClick={start}>
          Try Wallet at Checkout
        </button>
      )}

      {state.kind === "seeding" && (
        <div className={styles.progress}>
          <div className={styles.progressIcon} />
          <span>Setting up your demo wallet…</span>
        </div>
      )}

      {state.kind === "ready" && (
        <div className={styles.progress}>
          <span className={styles.success}>
            ✓ Wallet funded: {state.credit.balance} {state.credit.currency}
          </span>
        </div>
      )}

      {state.kind === "checkout" && (
        <div
          ref={mountRef}
          id="wallet-demo-mount"
          className={styles.checkoutMount}
        />
      )}

      {state.kind === "done" && (
        <div className={styles.resultCard}>
          <p>{state.message}</p>
        </div>
      )}

      {state.kind === "seed_error" && (
        <div className={styles.error}>
          <p>
            <strong>Could not fund wallet:</strong> {state.message}
          </p>
        </div>
      )}

      {state.kind === "pay_error" && (
        <div className={styles.error}>
          <p>
            <strong>Payment issue:</strong> {state.message}
          </p>
        </div>
      )}
    </div>
  );
}
