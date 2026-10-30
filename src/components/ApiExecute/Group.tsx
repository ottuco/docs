import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import styles from "./styles.module.css";

export default function ApiExecuteGroup({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className={styles.group}>
      <BrowserOnly>
        {() => {
          const { SubscriptionBar } = require("./ApiExecuteInner");
          return <SubscriptionBar />;
        }}
      </BrowserOnly>
      {children}
    </div>
  );
}
