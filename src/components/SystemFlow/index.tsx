import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";

// React Flow measures the DOM, so each diagram only renders in the browser; the
// server build gets an empty box of the same height.
function clientOnly(load: () => React.ComponentType, height: number) {
  return function ClientOnlyDiagram(): React.JSX.Element {
    return (
      <BrowserOnly fallback={<div style={{height}} />}>
        {() => {
          const Diagram = load();
          return <Diagram />;
        }}
      </BrowserOnly>
    );
  };
}

export const SystemDiagram = clientOnly(() => require("./Flow").default, 600);
export const AutoPayFlow = clientOnly(() => require("./AutoPayFlow").default, 640);
export const SequenceDiagram = clientOnly(() => require("./Sequence").default, 574);

export const PaymentStory = clientOnly(() => require("./stories").PaymentStory, 740);
export const AutoPayStory = clientOnly(() => require("./stories").AutoPayStory, 815);

export default SystemDiagram;
