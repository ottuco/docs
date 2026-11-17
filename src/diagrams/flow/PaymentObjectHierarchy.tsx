// A Payment Transaction is the parent of its Payment Attempts.
// Usage in MDX:  import PaymentObjectHierarchy from "@site/src/diagrams/flow/PaymentObjectHierarchy";  <PaymentObjectHierarchy />
import React from "react";
import { mdiFileDocumentOutline, mdiCreditCardOutline } from "@mdi/js";
import { FlowDiagram, type FlowArrow, type FlowCard } from "@site/src/components/FlowDiagram";

const cards: FlowCard[] = [
  { id: "pt", x: 0, y: 0, width: 240, title: "Payment Transaction", sub: "Parent, intent, lifecycle", icon: mdiFileDocumentOutline, tone: "accent" },
  { id: "pa", x: 360, y: 0, width: 240, title: "Payment Attempt", sub: "One gateway try, own states", icon: mdiCreditCardOutline, tone: "accent" },
];
const arrows: FlowArrow[] = [{ from: "pt", to: "pa", label: "1..N children", kind: "plain" }];

export default function PaymentObjectHierarchy(): React.JSX.Element {
  return <FlowDiagram title="Payment object hierarchy" sub="One transaction, many attempts" cards={cards} arrows={arrows} height={150} />;
}
