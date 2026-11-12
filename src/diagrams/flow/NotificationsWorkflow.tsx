// Notifications workflow: one request, three channels.
// Usage in MDX:  import NotificationsWorkflow from "@site/src/diagrams/flow/NotificationsWorkflow";  <NotificationsWorkflow />
import React from "react";
import { mdiAccount, mdiServer, mdiShieldCheckOutline } from "@mdi/js";
import { SequenceDiagram, type SequenceActor, type SequenceMessage } from "@site/src/components/FlowDiagram";

const actors: SequenceActor[] = [
  { title: "Merchant", icon: mdiServer },
  { title: "Ottu", icon: mdiShieldCheckOutline, tone: "accent" },
  { title: "Customer", icon: mdiAccount },
];
const messages: SequenceMessage[] = [
  [0, 1, "session_id or order_no"],
  [1, 2, "SMS", "reply"],
  [1, 2, "Email", "reply"],
  [1, 2, "WhatsApp", "reply"],
];

export default function NotificationsWorkflow(): React.JSX.Element {
  return <SequenceDiagram title="Notifications workflow" sub="Ottu delivers on the channels you choose" actors={actors} messages={messages} />;
}
