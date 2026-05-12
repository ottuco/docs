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
import styles from "./styles.module.css";

type State =
  | { kind: "idle" }
  | { kind: "launching" }
  | { kind: "checkout"; sessionId: string }
  | { kind: "done" }
  | { kind: "error"; message: string };

export default function WalletDemoInner(): React.JSX.Element {
  const [state, setState] = useState<State>({ kind: "idle" });

  useEffect(() => {
    if (state.kind !== "launching") return;
    let cancelled = false;
    (async () => {
      try {
        const credit = await createSandboxWalletCredit({
          amount: "10.000",
          currency: "KWD",
          pg_code: "ottu_sandbox",
        });
        const [session] = await Promise.all([
          createSandboxSession({
            pg_codes: ["ottu_sandbox"],
            amount: "15.000",
            currency_code: credit.currency,
            customer_id: credit.customer_id,
          }),
          loadCheckoutScript(),
        ]);
        if (cancelled) return;
        setState({ kind: "checkout", sessionId: session.session_id });
      } catch (err) {
        if (cancelled) return;
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state]);

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

  const start = () => setState({ kind: "launching" });
  const restart = () => setState({ kind: "idle" });

  const showRestart = state.kind === "done" || state.kind === "error";

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

      {state.kind === "error" && (
        <div className={styles.error}>
          <p>
            <strong>Demo unavailable:</strong> {state.message}
          </p>
        </div>
      )}
    </div>
  );
}
