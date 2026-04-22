import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import styles from "./styles.module.css";

export default function RecurringDemo(): React.JSX.Element {
  return (
    <BrowserOnly
      fallback={
        <div className={styles.container}>
          <div className={styles.idleCard}>
            <h3 className={styles.idleTitle}>Try Recurring Payments</h3>
            <p className={styles.idleDescription}>
              Experience the full CIT/MIT flow: save a card with a test payment,
              then charge it automatically — all in sandbox mode.
            </p>
            <button className={styles.primaryButton} disabled>
              Start Demo
            </button>
          </div>
        </div>
      }
    >
      {() => {
        const RecurringDemoInner = require("./RecurringDemoInner").default;
        return <RecurringDemoInner />;
      }}
    </BrowserOnly>
  );
}
