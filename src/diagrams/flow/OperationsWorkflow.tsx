// Operations workflow: internal operations update state, external ones go to the gateway.
// Usage in MDX:  import OperationsWorkflow from "@site/src/diagrams/flow/OperationsWorkflow";  <OperationsWorkflow />
import React from "react";
import { mdiBankTransfer, mdiFileTreeOutline, mdiRefresh, mdiServer, mdiShieldCheckOutline } from "@mdi/js";
import { FlowDiagram, type FlowArrow, type FlowCard } from "@site/src/components/FlowDiagram";

const cards: FlowCard[] = [
  { id: "merchant", x: 0, y: 95, title: "Merchant", sub: "Your server", icon: mdiServer },
  { id: "api", x: 290, y: 95, title: "Operations API", sub: "Ottu", icon: mdiShieldCheckOutline, tone: "accent" },
  { id: "state", x: 580, y: 0, title: "Updated state", sub: "Internal operations", icon: mdiRefresh },
  { id: "pg", x: 580, y: 95, title: "Payment Gateway", sub: "External operations", icon: mdiBankTransfer },
  { id: "child", x: 580, y: 190, title: "Child transaction", sub: "Records the result", icon: mdiFileTreeOutline },
];
const arrows: FlowArrow[] = [
  { from: "merchant", to: "api", label: "Operation request" },
  { from: "api", to: "state", label: "Internal ops" },
  { from: "api", to: "pg", label: "External ops", fromSide: "right", toSide: "left", dy: -14 },
  { from: "pg", to: "api", label: "PG response", kind: "reply", fromSide: "left", toSide: "right", dy: 14 },
  { from: "api", to: "child" },
];

export default function OperationsWorkflow(): React.JSX.Element {
  return <FlowDiagram title="Operations workflow" sub="Internal operations stay in Ottu, external ones reach the gateway" cards={cards} arrows={arrows} height={320} />;
}
