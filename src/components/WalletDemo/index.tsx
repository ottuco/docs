import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import styles from "./styles.module.css";

export default function WalletDemo(): React.JSX.Element {
  return (
    <BrowserOnly
      fallback={
        <div className={styles.container}>
          <div className={styles.idleCard}>
            <h3 className={styles.idleTitle}>Try Wallet at Checkout</h3>
            <p className={styles.idleDescription}>Loading…</p>
          </div>
        </div>
      }
    >
      {() => {
        const WalletDemoInner = require("./WalletDemoInner").default;
        return <WalletDemoInner />;
      }}
    </BrowserOnly>
  );
}
