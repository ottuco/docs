import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import styles from "./styles.module.css";

export default function WalletDemo(): React.JSX.Element {
  return (
    <BrowserOnly
      fallback={
        <div className={styles.hero}>
          <h3 className={styles.heroTitle}>Wallet at Checkout — Live Demo</h3>
          <p className={styles.heroSubtitle}>Loading…</p>
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
