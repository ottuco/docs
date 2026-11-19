// Payment Status Query v3: what happens on one inquiry (the Workflow list of
// docs/developers/payments/psq-v3.mdx, and nothing more).
// Usage in MDX:  import PsqWorkflowSequence from "@site/src/diagrams/flow/PsqWorkflowSequence";  <PsqWorkflowSequence />
import React from "react";
import { mdiBankTransfer, mdiServer, mdiShieldCheckOutline } from "@mdi/js";
import {
  SequenceDiagram,
  type SequenceActor,
  type SequenceMessage,
} from "@site/src/components/FlowDiagram";
import styles from "./ourDiagrams.module.css";

const actors: SequenceActor[] = [
  { title: "You (merchant)", icon: mdiServer },
  { title: "Ottu", icon: mdiShieldCheckOutline, tone: "accent" },
  { title: "Payment gateway", icon: mdiBankTransfer },
];

const messages: SequenceMessage[] = [
  [0, 1, "POST /b/pbl/v3/inquiry/ · session_id or order_no"],
  [1, 2, "Only if still open: status check"],
  [1, 0, "The payment object", "reply"],
];

export default function PsqWorkflowSequence(): React.JSX.Element {
  return (
    <div className={styles.center}>
      <SequenceDiagram
        title="Payment Status Query v3"
        sub="Open: pending, attempted, failed or expired · paid and authorized are answered straight away, without the gateway"
        actors={actors}
        messages={messages}
      />
    </div>
  );
}
