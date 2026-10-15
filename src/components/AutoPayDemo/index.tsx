import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import styles from "../RecurringDemo/styles.module.css";

export default function AutoPayDemo(): React.JSX.Element {
  return (
    <BrowserOnly
      fallback={
        <div className={styles.hero}>
          <h2 className={styles.heroTitle}>Try AutoPay</h2>
          <p className={styles.heroSubtitle}>
            Create a real subscription on the sandbox, pay its first charge
            with a test card, and watch it go live.
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
