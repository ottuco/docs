import React, { useSyncExternalStore } from "react";
import Icon from "@mdi/react";
import { mdiOpenInNew } from "@mdi/js";
import { getSession, resetSession, subscribe, watchPayment } from "./session";
import styles from "../../styles.module.css";

/** The test subscription every AutoPay tab shares, above the tabs. */
export default function SubscriptionBar(): React.JSX.Element | null {
  const session = useSyncExternalStore(subscribe, getSession, getSession);

  if (!session.subscriptionId) return null;
  return (
    <div className={styles.subscription}>
      <span>
        Test subscription <code>{session.subscriptionId}</code>{" "}
        <strong>{session.subscriptionStatus}</strong>
        {session.watchingPayment && (
          <span className={styles.note}> · waiting for the payment</span>
        )}
      </span>
      <span className={styles.subscriptionActions}>
        {session.checkoutUrl &&
          session.subscriptionStatus === "pending_setup" && (
            <a
              href={session.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={watchPayment}
            >
              Pay the first charge <Icon path={mdiOpenInNew} size={0.55} />
            </a>
          )}
        {session.pageUrl && (
          <a href={session.pageUrl} target="_blank" rel="noopener noreferrer">
            Open customer page <Icon path={mdiOpenInNew} size={0.55} />
          </a>
        )}
        <button className={styles.linkBtn} onClick={resetSession}>
          Start over
        </button>
      </span>
    </div>
  );
}
