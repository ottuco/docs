// Payment attempt states: how one gateway interaction can end.
// Usage in MDX:  import PaymentAttemptStates from "@site/src/diagrams/flow/PaymentAttemptStates";  <PaymentAttemptStates />
import React from "react";
import {
  mdiAlertCircleOutline,
  mdiCashCheck,
  mdiCashMultiple,
  mdiCancel,
  mdiClockOutline,
  mdiCloseCircleOutline,
} from "@mdi/js";
import {
  FlowDiagram,
  type FlowArrow,
  type FlowCard,
} from "@site/src/components/FlowDiagram";

const cards: FlowCard[] = [
  { id: "pending", x: 0, y: 190, title: "pending", sub: "Request goes to the gateway", icon: mdiClockOutline },
  { id: "success", x: 360, y: 0, title: "success", sub: "Gateway confirmed", icon: mdiCashCheck, tone: "accent" },
  { id: "failed", x: 360, y: 95, title: "failed", sub: "Declined or timed out", icon: mdiCloseCircleOutline },
  { id: "canceled", x: 360, y: 190, title: "canceled", sub: "Customer left the gateway", icon: mdiCancel },
  { id: "error", x: 360, y: 285, title: "error", sub: "Link creation failed", icon: mdiAlertCircleOutline },
  { id: "cod", x: 360, y: 380, title: "cod", sub: "Cash on delivery", icon: mdiCashMultiple },
];

const arrows: FlowArrow[] = [
  { from: "pending", to: "success", label: "Gateway succeeds" },
  { from: "pending", to: "failed", label: "Gateway fails" },
  { from: "pending", to: "canceled", label: "Customer cancels" },
  { from: "pending", to: "error", label: "Link error" },
  { from: "pending", to: "cod", label: "CoD acknowledged" },
];

export default function PaymentAttemptStates(): React.JSX.Element {
  return (
    <FlowDiagram
      title="Payment attempt states"
      sub="One gateway interaction, one outcome"
      cards={cards}
      arrows={arrows}
      height={500}
    />
  );
}
