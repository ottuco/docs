// A refund with an Idempotency-Key: first call, replay, changed body, concurrent operation.
// Usage in MDX:  import OperationsIdempotencySequence from "@site/src/diagrams/flow/OperationsIdempotencySequence";  <OperationsIdempotencySequence />
import React from "react";
import { mdiBankTransfer, mdiServer, mdiShieldCheckOutline } from "@mdi/js";
import {
  SequenceDiagram,
  type SequenceActor,
  type SequenceMessage,
} from "@site/src/components/FlowDiagram";

const actors: SequenceActor[] = [
  { title: "You (merchant)", icon: mdiServer },
  { title: "Ottu", icon: mdiShieldCheckOutline, tone: "accent" },
  { title: "Gateway", icon: mdiBankTransfer },
];

const messages: SequenceMessage[] = [
  [0, 1, "Refund 3.000 · key K1"],
  [1, 2, "Refund 3.000"],
  [2, 1, "Accepted", "reply"],
  [1, 0, "200 payment.refunded", "reply"],
  [0, 1, "Same refund · key K1 again"],
  [1, 0, "200 stored · Idempotent-Replayed: true", "reply"],
  [0, 1, "Refund 4.000 · key K1"],
  [1, 0, "422 idempotency_key_reused", "reply"],
  [0, 1, "While a refund runs: capture · key K2"],
  [1, 0, "409 operation_in_progress", "reply"],
];

export default function OperationsIdempotencySequence(): React.JSX.Element {
  return (
    <SequenceDiagram
      title="Idempotency-Key: four cases"
      sub="Orange = request · blue = reply · the gateway is called once"
      actors={actors}
      messages={messages}
    />
  );
}
