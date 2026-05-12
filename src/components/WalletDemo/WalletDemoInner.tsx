import React, { useState, useEffect } from "react";
import {
  loadCheckoutScript,
  initCheckout,
  createDemoCallbacks,
} from "@site/src/utils/checkoutSdk";
import {
  createSandboxSession,
  createSandboxWalletCredit,
} from "@site/src/utils/sandbox";
import type { WalletCreditResult } from "@site/src/utils/sandbox";
import styles from "./styles.module.css";

type State =
  | { kind: "idle" }
  | { kind: "seeding" }
  | { kind: "ready"; credit: WalletCreditResult }
  | { kind: "launching"; credit: WalletCreditResult }
  | { kind: "checkout"; credit: WalletCreditResult; sessionId: string }
  | { kind: "done" }
  | { kind: "seed_error"; message: string }
  | { kind: "pay_error"; message: string };

const READY_DELAY_MS = 1500;

export default function WalletDemoInner(): React.JSX.Element {
  const [state, setState] = useState<State>({ kind: "idle" });

  // Auto-advance "ready" → "launching" → "checkout"
  useEffect(() => {
    if (state.kind !== "ready") return;
    const timer = setTimeout(() => {
      setState({ kind: "launching", credit: state.credit });
    }, READY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state]);

  // Create session + load SDK while in "launching"
  useEffect(() => {
    if (state.kind !== "launching") return;
    let cancelled = false;
    (async () => {
      try {
        const [session] = await Promise.all([
          createSandboxSession({
            pg_codes: ["ottu_sandbox"],
            amount: "15.000",
            currency_code: state.credit.currency,
            customer_id: state.credit.customer_id,
          }),
          loadCheckoutScript(),
        ]);
        if (cancelled) return;
        setState({
          kind: "checkout",
          credit: state.credit,
          sessionId: session.session_id,
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          kind: "pay_error",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state]);

  // Mount Checkout SDK once we have a session
  useEffect(() => {
    if (state.kind !== "checkout") return;
    const callbacks = createDemoCallbacks(() => setState({ kind: "done" }));
    initCheckout({
      selector: "wallet-demo-mount",
      sessionId: state.sessionId,
      formsOfPayment: ["wallet", "ottu_sandbox"],
      callbacks,
    });
  }, [state]);

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

  const showRestart =
    state.kind === "done" ||
    state.kind === "seed_error" ||
    state.kind === "pay_error";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Wallet at Checkout — Live Demo</h3>
        {showRestart && (
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

      {state.kind === "launching" && (
        <div className={styles.progress}>
          <div className={styles.progressIcon} />
          <span>Launching checkout…</span>
        </div>
      )}

      {state.kind === "checkout" && (
        <div id="wallet-demo-mount" className={styles.checkoutMount} />
      )}

      {state.kind === "done" && (
        <div className={styles.resultCard}>
          <p>
            <strong>Payment successful.</strong> The wallet balance has been
            applied. Start over to try a different amount or coverage scenario.
          </p>
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
