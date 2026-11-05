import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import type { EndpointKey, ResponseExamples } from "./ApiExecuteInner";

export type { EndpointKey, ResponseExamples };

export default function ApiExecute({
  endpoint,
  examples,
}: {
  endpoint: EndpointKey;
  examples?: ResponseExamples;
}): React.JSX.Element {
  return (
    <BrowserOnly>
      {() => {
        const ApiExecuteInner = require("./ApiExecuteInner").default;
        return <ApiExecuteInner endpoint={endpoint} examples={examples} />;
      }}
    </BrowserOnly>
  );
}
