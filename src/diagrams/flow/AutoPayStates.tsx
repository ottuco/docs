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

// Edges: the main moves (facts-autopay.md section 2).
const arrows: FlowArrow[] = [
  { from: "pending", to: "active", label: "paid" },
  {
    from: "pending",
    to: "trial",
    fromSide: "top",
    toSide: "left",
    label: "paid 0",
  },
  {
    from: "trial",
    to: "active",
    fromSide: "bottom",
    toSide: "top",
    label: "charge paid",
    dx: 45,
  },
  {
    from: "pending",
    to: "failed",
    fromSide: "bottom",
    toSide: "top",
    label: "24 h, unpaid",
    dx: 45,
  },
  { from: "active", to: "pastDue", label: "retries fail" },
  {
    from: "trial",
    to: "pastDue",
    fromSide: "right",
    toSide: "left",
    label: "retries fail",
  },
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
    label: "last cycle paid",
    dx: 55,
  },
];

const layout: Record<
  keyof typeof STATES,
  Pick<FlowCard, "x" | "y" | "icon" | "tone">
> = {
  pending: { x: 0, y: 150, icon: mdiTimerSandEmpty },
  trial: { x: 240, y: 20, icon: mdiGiftOutline, tone: "info" },
  active: { x: 240, y: 150, icon: mdiCheckCircleOutline, tone: "success" },
  pastDue: { x: 480, y: 150, icon: mdiAlertCircleOutline, tone: "danger" },
  canceled: { x: 690, y: 150, icon: mdiCloseCircleOutline },
  expired: { x: 240, y: 340, icon: mdiCalendarCheck },
  failed: { x: 0, y: 340, icon: mdiCreditCardOff },
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
      width: 150,
      href: dev ? `${DEV_PAGE}#state-${slug}` : `#state-${slug}`,
      ...layout[id],
    };
  });
  return (
    <>
      <FlowDiagram
        title={dev ? "Subscription status values" : "Subscription states"}
        sub="Click a state to read what it means · Canceled and Expired are final"
        cards={cards}
        arrows={arrows}
        height={480}
      />
      {dev ? (
        <p>
          You can cancel with mode <code>immediate</code> from any state that is
          not final.
        </p>
      ) : null}
    </>
  );
}
