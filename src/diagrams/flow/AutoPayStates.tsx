// AutoPay subscription states and the main moves between them.
// Usage in MDX:  import AutoPayStates from "@site/src/diagrams/flow/AutoPayStates";
//   <AutoPayStates audience="business" />   or   <AutoPayStates audience="developer" />
import React from "react";
import {
  mdiAlertCircleOutline,
  mdiCalendarCheck,
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiCreditCardOff,
  mdiGiftOutline,
  mdiTimerSandEmpty,
} from "@mdi/js";
import {
  FlowDiagram,
  type FlowArrow,
  type FlowCard,
} from "@site/src/components/FlowDiagram";

type Audience = "business" | "developer";

// [slug, business label, developer code]
const STATES = {
  pending: ["pending-setup", "Pending setup", "pending_setup"],
  trial: ["trialing", "Trialing", "trialing"],
  active: ["active", "Active", "active"],
  pastDue: ["past-due", "Past Due", "past_due"],
  canceled: ["canceled", "Canceled", "canceled"],
  expired: ["expired", "Expired", "expired"],
  failed: ["setup-failed", "Setup Failed", "setup_failed"],
} as const;

const DEV_PAGE = "/developers/payments/autopay/";

const arrows: FlowArrow[] = [
  { from: "pending", to: "active", label: "first payment above 0" },
  {
    from: "pending",
    to: "trial",
    fromSide: "top",
    toSide: "left",
    label: "first payment 0",
  },
  {
    from: "trial",
    to: "active",
    fromSide: "bottom",
    toSide: "top",
    label: "first charge paid",
    dx: 70,
  },
  {
    from: "pending",
    to: "failed",
    fromSide: "bottom",
    toSide: "top",
    label: "not paid in 24 h, or checkout canceled",
    dx: 95,
  },
  { from: "active", to: "pastDue", label: "all retries fail" },
  {
    from: "pastDue",
    to: "active",
    fromSide: "bottom",
    toSide: "bottom",
    kind: "reply",
    label: "customer pays",
  },
  { from: "pastDue", to: "canceled", label: "cancel" },
  {
    from: "active",
    to: "canceled",
    fromSide: "top",
    toSide: "top",
    kind: "plain",
    label: "cancel",
  },
  {
    from: "active",
    to: "expired",
    fromSide: "bottom",
    toSide: "top",
    label: "last cycle paid, end date passed",
    dx: 95,
  },
];

const layout: Record<keyof typeof STATES, Pick<FlowCard, "x" | "y" | "icon" | "tone">> = {
  pending: { x: 0, y: 150, icon: mdiTimerSandEmpty },
  trial: { x: 300, y: 20, icon: mdiGiftOutline, tone: "info" },
  active: { x: 300, y: 150, icon: mdiCheckCircleOutline, tone: "success" },
  pastDue: { x: 600, y: 150, icon: mdiAlertCircleOutline, tone: "danger" },
  canceled: { x: 900, y: 150, icon: mdiCloseCircleOutline },
  expired: { x: 300, y: 400, icon: mdiCalendarCheck },
  failed: { x: 0, y: 400, icon: mdiCreditCardOff },
};

export default function AutoPayStates({
  audience,
}: {
  audience: Audience;
}): React.JSX.Element {
  const dev = audience === "developer";
  const cards: FlowCard[] = (
    Object.keys(STATES) as (keyof typeof STATES)[]
  ).map((id) => {
    const [slug, label, code] = STATES[id];
    return {
      id,
      title: dev ? code : label,
      width: 170,
      href: dev ? `${DEV_PAGE}#state-${slug}` : `#state-${slug}`,
      ...layout[id],
    };
  });
  return (
    <FlowDiagram
      title={dev ? "Subscription status values" : "Subscription states"}
      sub="Click a state to read what it means · Canceled and Expired are final"
      cards={cards}
      arrows={arrows}
      height={520}
    />
  );
}
