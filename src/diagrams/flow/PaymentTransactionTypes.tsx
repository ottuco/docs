// The `type` of a Payment Transaction.
// Usage in MDX:  import PaymentTransactionTypes from "@site/src/diagrams/flow/PaymentTransactionTypes";  <PaymentTransactionTypes />
import React from "react";
import { mdiFileDocumentOutline, mdiLinkVariant, mdiStorefrontOutline, mdiShapeOutline } from "@mdi/js";
import { FlowDiagram, type FlowArrow, type FlowCard } from "@site/src/components/FlowDiagram";

const cards: FlowCard[] = [
  { id: "pt", x: 0, y: 95, width: 240, title: "Payment Transaction", sub: "Parent, intent, lifecycle", icon: mdiFileDocumentOutline, tone: "accent" },
  { id: "pr", x: 380, y: 0, width: 260, title: "Payment Request", sub: "type: payment_request", icon: mdiLinkVariant },
  { id: "ec", x: 380, y: 95, width: 260, title: "E-commerce Payment", sub: "type: e_commerce", icon: mdiStorefrontOutline },
  { id: "ot", x: 380, y: 190, width: 260, title: "Other types", sub: "bulk, event, food_ordering, ...", icon: mdiShapeOutline },
];
const arrows: FlowArrow[] = [
  { from: "pt", to: "pr", label: "type", kind: "plain" },
  { from: "pt", to: "ec", label: "type", kind: "plain" },
  { from: "pt", to: "ot", label: "type", kind: "plain" },
];

export default function PaymentTransactionTypes(): React.JSX.Element {
  return <FlowDiagram title="Payment transaction types" sub="The type field says what kind of intent it is" cards={cards} arrows={arrows} height={320} />;
}
