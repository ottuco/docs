// AutoPay subscription states and the main moves between them.
// Usage in MDX:  import AutoPayStates from "@site/src/diagrams/flow/AutoPayStates";
//   <AutoPayStates audience="business" />   or   <AutoPayStates audience="developer" />
import React, { useLayoutEffect, useRef, useState } from "react";
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

const ICONS = {
  pending: { icon: mdiTimerSandEmpty },
  trial: { icon: mdiGiftOutline, tone: "info" },
  active: { icon: mdiCheckCircleOutline, tone: "success" },
  pastDue: { icon: mdiAlertCircleOutline, tone: "danger" },
  canceled: { icon: mdiCloseCircleOutline },
  expired: { icon: mdiCalendarCheck },
  failed: { icon: mdiCreditCardOff },
} as const;

// Wide: left to right, about 840px. Used when the container fits it.
const WIDE_W = 840;
const wideAt: Record<keyof typeof STATES, [number, number]> = {
  pending: [0, 150],
  trial: [240, 20],
  active: [240, 150],
  pastDue: [480, 150],
  canceled: [690, 150],
  expired: [240, 340],
  failed: [0, 340],
};
// Narrow: top to bottom in two columns, about 430px, so it fits a phone or a
// narrow doc column at full text size.
const narrowAt: Record<keyof typeof STATES, [number, number]> = {
  pending: [0, 0],
  failed: [260, 0],
  trial: [0, 130],
  active: [0, 260],
  pastDue: [260, 260],
  canceled: [260, 390],
  expired: [0, 520],
};

// Edges: the main moves (facts-autopay.md section 2).
function arrowsFor(narrow: boolean): FlowArrow[] {
  const toActive: FlowArrow = narrow
    ? {
        from: "pending",
        to: "active",
        fromSide: "left",
        toSide: "left",
        label: "paid",
      }
    : { from: "pending", to: "active", label: "paid" };
  return [
    toActive,
    narrow
      ? {
          from: "pending",
          to: "trial",
          fromSide: "bottom",
          toSide: "top",
          label: "free trial",
        }
      : {
          from: "pending",
          to: "trial",
          fromSide: "top",
          toSide: "left",
          label: "free trial",
        },
    {
      from: "trial",
      to: "active",
      fromSide: "bottom",
      toSide: "top",
      label: "charge paid",
      dx: narrow ? 0 : 45,
    },
    narrow
      ? { from: "pending", to: "failed", label: "24 h, unpaid" }
      : {
          from: "pending",
          to: "failed",
          fromSide: "bottom",
          toSide: "top",
          label: "24 h, unpaid",
          dx: 45,
        },
    { from: "active", to: "pastDue", label: "retries fail" },
    narrow
      ? {
          from: "trial",
          to: "pastDue",
          fromSide: "right",
          toSide: "top",
          label: "retries fail",
        }
      : {
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
    narrow
      ? {
          from: "pastDue",
          to: "canceled",
          fromSide: "bottom",
          toSide: "top",
          label: "cancel",
        }
      : { from: "pastDue", to: "canceled", label: "cancel" },
    narrow
      ? {
          from: "active",
          to: "canceled",
          fromSide: "bottom",
          toSide: "left",
          kind: "plain",
        }
      : {
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
      dx: narrow ? 0 : 55,
    },
  ];
}

export default function AutoPayStates({
  audience,
}: {
  audience: Audience;
}): React.JSX.Element {
  const dev = audience === "developer";
  const box = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  // Pick the layout from the container's width, one frame after it changes.
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    setNarrow(el.clientWidth < WIDE_W * 0.95 + 24);
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setNarrow(el.clientWidth < WIDE_W * 0.95 + 24),
      );
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const at = narrow ? narrowAt : wideAt;
  const cards: FlowCard[] = (
    Object.keys(STATES) as (keyof typeof STATES)[]
  ).map((id) => {
    const [slug, label, code] = STATES[id];
    return {
      id,
      title: dev ? code : label,
      width: narrow ? 170 : 150,
      href: dev ? `${DEV_PAGE}#state-${slug}` : `#state-${slug}`,
      x: at[id][0],
      y: at[id][1],
      ...ICONS[id],
    };
  });
  return (
    <div ref={box}>
      <FlowDiagram
        title={dev ? "Subscription status values" : "Subscription states"}
        sub="Click a state to read what it means · Canceled and Expired are final"
        cards={cards}
        arrows={arrowsFor(narrow)}
        height={narrow ? 700 : 480}
      />
      {dev ? (
        <p>
          You can cancel with mode <code>immediate</code> from any state that is
          not final.
        </p>
      ) : null}
    </div>
  );
}
