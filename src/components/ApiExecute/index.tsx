import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import type { EndpointKey } from "./ApiExecuteInner";

export default function ApiExecute({ endpoint }: { endpoint: EndpointKey }): React.JSX.Element {
  return (
    <BrowserOnly>
      {() => {
        const ApiExecuteInner = require("./ApiExecuteInner").default;
        return <ApiExecuteInner endpoint={endpoint} />;
      }}
    </BrowserOnly>
  );
}
