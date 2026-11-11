// Reference sequence diagram: the same card payment as messages between actors.
import React from "react";
import {
  mdiAccount,
  mdiBankTransfer,
  mdiServer,
  mdiShieldCheckOutline,
} from "@mdi/js";
import {
  SequenceDiagram,
  type SequenceActor,
  type SequenceMessage,
} from "@site/src/components/FlowDiagram";

const actors: SequenceActor[] = [
  { title: "Merchant", icon: mdiServer },
  { title: "Ottu", icon: mdiShieldCheckOutline, tone: "accent" },
  { title: "Customer", icon: mdiAccount },
  { title: "Gateway", icon: mdiBankTransfer },
];

// [from actor, to actor, label, kind?] — default kind is `request` (orange).
// Same actor twice ([1, 1, …]) draws a self-call loop.
const messages: SequenceMessage[] = [
  [0, 1, "Checkout API"],
  [1, 0, "checkout_url", "reply"],
  [0, 2, "Show checkout"],
  [2, 1, "Enter card · 3DS"],
  [1, 1, "Pick gateway"],
  [1, 3, "Charge"],
  [3, 1, "Result", "reply"],
  [1, 0, "Webhook", "reply"],
  [1, 2, "Redirect back", "reply"],
];

export default function CardPaymentSequence(): React.JSX.Element {
  return (
    <SequenceDiagram
      title="A card payment, step by step"
      sub="Orange = request · blue = reply"
      actors={actors}
      messages={messages}
    />
  );
}
