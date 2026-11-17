// Invoice workflow: create, send the link, the customer pays, webhook.
// Usage in MDX:  import InvoiceWorkflow from "@site/src/diagrams/flow/InvoiceWorkflow";  <InvoiceWorkflow />
import React from "react";
import { mdiAccount, mdiServer, mdiShieldCheckOutline } from "@mdi/js";
import { SequenceDiagram, type SequenceActor, type SequenceMessage } from "@site/src/components/FlowDiagram";

const actors: SequenceActor[] = [
  { title: "Merchant", icon: mdiServer },
  { title: "Ottu", icon: mdiShieldCheckOutline, tone: "accent" },
  { title: "Customer", icon: mdiAccount },
];
const messages: SequenceMessage[] = [
  [0, 1, "Create invoice"],
  [1, 0, "checkout_url", "reply"],
  [0, 2, "Send the link"],
  [2, 1, "View and pay"],
  [1, 0, "Webhook", "reply"],
];

export default function InvoiceWorkflow(): React.JSX.Element {
  return <SequenceDiagram title="Invoice workflow" sub="Orange = request · blue = reply" actors={actors} messages={messages} />;
}
