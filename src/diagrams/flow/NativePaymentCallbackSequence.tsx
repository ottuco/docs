// Native payments: the backend receives the callback and tells the client.
// Usage in MDX:  import NativePaymentCallbackSequence from "@site/src/diagrams/flow/NativePaymentCallbackSequence";  <NativePaymentCallbackSequence />
import React from "react";
import { mdiAccount, mdiServer, mdiShieldCheckOutline } from "@mdi/js";
import { SequenceDiagram, type SequenceActor, type SequenceMessage } from "@site/src/components/FlowDiagram";

const actors: SequenceActor[] = [
  { title: "Client", icon: mdiAccount },
  { title: "Backend", icon: mdiServer },
  { title: "Ottu", icon: mdiShieldCheckOutline, tone: "accent" },
];
const messages: SequenceMessage[] = [
  [0, 1, "Payment data"],
  [1, 2, "Send to Ottu"],
  [2, 1, "Payment callback", "reply"],
  [1, 0, "Payment status", "reply"],
];

export default function NativePaymentCallbackSequence(): React.JSX.Element {
  return <SequenceDiagram title="Native payment callback" sub="Orange = request · blue = reply" actors={actors} messages={messages} />;
}
