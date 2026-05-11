import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import styles from "./styles.module.css";

export default function WalletDemo(): React.JSX.Element {
  return (
    <BrowserOnly
      fallback={
        <div className={styles.container}>
          <div className={styles.header}>
            <h3 className={styles.title}>Wallet at Checkout — Live Demo</h3>
          </div>
          <button className={styles.startButton} disabled>
            Try Wallet at Checkout
          </button>
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
