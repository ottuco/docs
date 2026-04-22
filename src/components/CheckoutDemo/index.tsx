import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import styles from "./styles.module.css";

export default function CheckoutDemo(): React.JSX.Element {
  return (
    <BrowserOnly
      fallback={
        <div className={styles.container}>
          <div className={styles.idleCard}>
            <h3 className={styles.idleTitle}>Try the Checkout SDK</h3>
            <p className={styles.idleDescription}>
              Experience the Ottu payment form with a live sandbox session. No
              real charges will be made.
            </p>
            <button className={styles.launchButton} disabled>
              Launch Demo
            </button>
          </div>
        </div>
      }
    >
      {() => {
        const CheckoutDemoInner =
          require("./CheckoutDemoInner").default;
        return <CheckoutDemoInner />;
      }}
    </BrowserOnly>
  );
}
