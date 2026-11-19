// Webhook events: payment.created can arrive after a fast payment.paid.
// Usage in MDX:  import PaymentEventOrder from "@site/src/diagrams/flow/PaymentEventOrder";  <PaymentEventOrder />
import React from "react";
import { mdiAccount, mdiServer, mdiShieldCheckOutline } from "@mdi/js";
import {
  SequenceDiagram,
  type SequenceActor,
  type SequenceMessage,
} from "@site/src/components/FlowDiagram";
import styles from "./ourDiagrams.module.css";

const actors: SequenceActor[] = [
  { title: "Customer", icon: mdiAccount },
  { title: "Ottu", icon: mdiShieldCheckOutline, tone: "accent" },
  { title: "Your receiver", icon: mdiServer },
];

const messages: SequenceMessage[] = [
  [1, 1, "Records payment.created"],
  [0, 1, "Pays within seconds"],
  [1, 2, "payment.paid arrives first"],
  [1, 2, "payment.created arrives later"],
  [2, 2, "Sort by created, dedupe on id"],
];

export default function PaymentEventOrder(): React.JSX.Element {
  return (
    <div className={styles.center}>
      <SequenceDiagram
        title="A fast payment's events"
        sub="Arrival order is not event order"
        actors={actors}
        messages={messages}
      />
    </div>
  );
}
