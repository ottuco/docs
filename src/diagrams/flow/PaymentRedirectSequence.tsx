// Webhook formats 1 and 2: the payer's redirect waits for the webhook_url answer.
// Usage in MDX:  import PaymentRedirectSequence from "@site/src/diagrams/flow/PaymentRedirectSequence";  <PaymentRedirectSequence />
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
  { title: "Customer", icon: mdiAccount },
  { title: "Ottu", icon: mdiShieldCheckOutline, tone: "accent" },
  { title: "Gateway", icon: mdiBankTransfer },
];

const messages: SequenceMessage[] = [
  [0, 2, "Send payment details"],
  [2, 0, "Processed information", "reply"],
  [0, 1, "Show checkout"],
  [1, 2, "Submit payment"],
  [2, 3, "Process payment"],
  [3, 2, "Payment result", "reply"],
  [2, 0, "POST to webhook_url"],
  [0, 2, "HTTP status", "reply"],
  [2, 1, "200: redirect_url, else summary", "reply"],
];

export default function PaymentRedirectSequence(): React.JSX.Element {
  return (
    <SequenceDiagram
      title="The redirect waits for your webhook answer"
      sub="Orange = request · blue = reply"
      actors={actors}
      messages={messages}
    />
  );
}
