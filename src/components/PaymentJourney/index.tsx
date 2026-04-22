import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import styles from "./styles.module.css";

export default function PaymentJourney(): React.JSX.Element {
  return (
    <BrowserOnly
      fallback={
        <div className={styles.hero}>
          <span className={styles.heroTitle}>Payment Integration Journey</span>
          <p className={styles.heroSubtitle}>
            Walk through a complete Ottu payment integration with live API calls.
            Every step runs against our sandbox — no real charges.
          </p>
          <button className={styles.primaryBtn} disabled>
            Start Journey
          </button>
        </div>
      }
    >
      {() => {
        const PaymentJourneyInner =
          require("./PaymentJourneyInner").default;
        return <PaymentJourneyInner />;
      }}
    </BrowserOnly>
  );
}
