// Payment transaction lifecycle: the most common state transitions.
// Usage in MDX:  import PaymentStatesLifecycle from "@site/src/diagrams/flow/PaymentStatesLifecycle";  <PaymentStatesLifecycle />
import React from "react";
import {
  mdiAlertCircleOutline,
  mdiCashCheck,
  mdiCashRefund,
  mdiClockOutline,
  mdiCreditCardOutline,
  mdiFileDocumentOutline,
  mdiLockOutline,
  mdiTimerSandEmpty,
  mdiCancel,
  mdiUndoVariant,
} from "@mdi/js";
import {
  FlowDiagram,
  type FlowArrow,
  type FlowCard,
} from "@site/src/components/FlowDiagram";

const cards: FlowCard[] = [
  { id: "created", x: 0, y: 0, title: "created", sub: "Link not opened yet", icon: mdiFileDocumentOutline },
  { id: "pending", x: 260, y: 0, title: "pending", sub: "Customer opened the link", icon: mdiClockOutline },
  { id: "paid", x: 520, y: 0, title: "paid", sub: "Funds collected", icon: mdiCashCheck, tone: "accent" },
  { id: "refunded", x: 780, y: 0, title: "refunded", sub: "Child transaction", icon: mdiCashRefund },
  { id: "final", x: 0, y: 120, title: "failed, expired, canceled", sub: "Terminal", icon: mdiCancel },
  { id: "attempted", x: 260, y: 120, title: "attempted", sub: "Open for a retry", icon: mdiAlertCircleOutline },
  { id: "authorized", x: 520, y: 120, title: "authorized", sub: "Funds reserved", icon: mdiLockOutline, tone: "accent" },
  { id: "queued", x: 780, y: 120, title: "refund_queued", sub: "Awaiting the gateway", icon: mdiTimerSandEmpty },
  { id: "rejected", x: 1040, y: 120, title: "refund_rejected", sub: "Gateway declined", icon: mdiAlertCircleOutline },
  { id: "voided", x: 780, y: 240, title: "voided", sub: "Authorization reversed", icon: mdiUndoVariant },
];

const arrows: FlowArrow[] = [
  { from: "created", to: "pending" },
  { from: "created", to: "final", label: "No payment" },
  { from: "pending", to: "paid", label: "Payment succeeds" },
  { from: "pending", to: "attempted", label: "Try fails" },
  { from: "pending", to: "authorized", label: "Auth succeeds" },
  { from: "attempted", to: "paid", label: "Retry succeeds", dy: -26 },
  { from: "paid", to: "refunded" },
  { from: "paid", to: "queued", label: "Queued refund" },
  { from: "queued", to: "refunded", label: "Confirmed", kind: "reply" },
  { from: "queued", to: "rejected", label: "Declined", kind: "reply" },
  { from: "authorized", to: "voided", label: "Void" },
];

export default function PaymentStatesLifecycle(): React.JSX.Element {
  return (
    <FlowDiagram
      title="Payment transaction lifecycle"
      sub="The most common transitions"
      cards={cards}
      arrows={arrows}
      height={420}
    />
  );
}
