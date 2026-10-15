import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import styles from "@site/src/components/RecurringDemo/styles.module.css";

export default function AutoPayDemo(): React.JSX.Element {
  return (
    <BrowserOnly
      fallback={
        <div className={styles.hero}>
          <h2 className={styles.heroTitle}>Try an AutoPay subscription</h2>
          <p className={styles.heroSubtitle}>
            Create a subscription, pay the first charge with a test card, then watch it activate
            — all in the sandbox.
          </p>
          <button className={styles.primaryBtn} disabled>
            Start Demo
          </button>
        </div>
      }
    >
      {() => {
        const AutoPayDemoInner = require("./AutoPayDemoInner").default;
        return <AutoPayDemoInner />;
      }}
    </BrowserOnly>
  );
}
