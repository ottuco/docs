import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import type { ResponseExamples } from "./ResponseExamples";
import type { ScenarioKey } from "./scenarios";

export type { ResponseExamples };

/** Run one endpoint of a scenario (scenarios/index.ts) on the sandbox. */
export default function ApiExecute({
  scenario,
  endpoint,
  examples,
}: {
  scenario: ScenarioKey;
  endpoint: string;
  examples?: ResponseExamples;
}): React.JSX.Element {
  return (
    <BrowserOnly>
      {() => {
        const ApiExecuteInner = require("./ApiExecuteInner").default;
        return (
          <ApiExecuteInner
            scenario={scenario}
            endpoint={endpoint}
            examples={examples}
          />
        );
      }}
    </BrowserOnly>
  );
}
