import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

// Wraps the AutoPay API tabs: shows the shared test subscription above them.
export default function ApiExecuteGroup({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <>
      <BrowserOnly>
        {() => {
          const { SubscriptionBar } = require("./ApiExecuteInner");
          return <SubscriptionBar />;
        }}
      </BrowserOnly>
      {children}
    </>
  );
}
