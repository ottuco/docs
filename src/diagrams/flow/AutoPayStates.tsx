// AutoPay subscription states and the main moves between them.
// Usage in MDX:  import AutoPayStates from "@site/src/diagrams/flow/AutoPayStates";
//   <AutoPayStates audience="business" />   or   <AutoPayStates audience="developer" />
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  mdiAlertCircleOutline,
  mdiCalendarCheck,
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiCreditCardOff,
  mdiGiftOutline,
  mdiTimerSandEmpty,
} from "@mdi/js";
import { flowMinWidth } from "@site/src/components/FlowDiagram/layout";
import {
  CaptionLayout,
  FlowDiagram,
  captionClass,
  type FlowArrow,
  type FlowCard,
} from "@site/src/components/FlowDiagram";

type Audience = "business" | "developer";
type Id =
  | "pending"
  | "trial"
  | "active"
  | "pastDue"
  | "canceled"
  | "expired"
  | "failed";

type Info = {
  /** Same words as the state headings on each page. */
  means: string;
  todo: string;
  more?: [label: string, href: string];
};

// slug = the heading anchor on both pages (#state-<slug>); code = the API value.
const STATES: Record<
  Id,
  { slug: string; label: string; devLabel: string; code: string; next: Id[] }
> = {
  pending: {
    slug: "pending-setup",
    label: "Pending setup",
    devLabel: "Pending setup",
    code: "pending_setup",
    next: ["active", "trial", "failed", "canceled"],
  },
  trial: {
    slug: "trialing",
    label: "Trialing",
    devLabel: "Trialing",
    code: "trialing",
    next: ["active", "pastDue", "canceled", "expired"],
  },
  active: {
    slug: "active",
    label: "Active",
    devLabel: "Active",
    code: "active",
    next: ["pastDue", "canceled", "expired"],
  },
  pastDue: {
    slug: "past-due",
    label: "Past Due",
    devLabel: "Past due",
    code: "past_due",
    next: ["active", "canceled"],
  },
  canceled: {
    slug: "canceled",
    label: "Canceled",
    devLabel: "Canceled",
    code: "canceled",
    next: [],
  },
  expired: {
    slug: "expired",
    label: "Expired",
    devLabel: "Expired",
    code: "expired",
    next: [],
  },
  failed: {
    slug: "setup-failed",
    label: "Setup Failed",
    devLabel: "Setup failed",
    code: "setup_failed",
    next: ["canceled"],
  },
};

// KEEP IN SYNC: this text must match the per-state headings on both pages (docs/business/autopay/index.mdx, docs/developers/payments/autopay/index.mdx). Edit all together.
// Text and next states follow the AutoPay subscription state machine.
const TEXT: Record<Audience, Record<Id, Info>> = {
  business: {
    pending: {
      means:
        "Ottu created the subscription and waits for the first payment. Ottu activates it automatically after your customer pays.",
      todo: "Nothing.",
    },
    trial: {
      means:
        "The first payment was zero, so no money has moved. Ottu charges the saved card at the next billing cycle.",
      todo: "Nothing.",
    },
    active: {
      means: "Billing normally. The latest cycle was paid.",
      todo: "Give your customer the service.",
    },
    pastDue: {
      means:
        "Every retry on a cycle failed. The subscription waits for your customer to pay.",
      todo: "Decide what to do if it stays Past Due.",
      more: ["When a payment fails", "#when-a-payment-fails"],
    },
    canceled: {
      means:
        "Billing has stopped. A cancellation set for the end of the period, by your customer or your team, lands here when that period ends. An immediate cancel by your team lands here at once.",
      todo: "Nothing.",
    },
    expired: {
      means:
        "The last cycle was paid and the next billing date would fall after the end date. Billing stopped. The history stays readable.",
      todo: "To continue, create a new subscription.",
    },
    failed: {
      means:
        "The customer canceled the checkout, did not pay within 24 hours, or paid but the card could not be saved. Ottu does not retry it.",
      todo: "Create a new subscription.",
    },
  },
  developer: {
    pending: {
      means:
        "Created by the checkout call; waiting for the customer to complete the first payment.",
      todo: "Wait for activation. Do not grant access yet.",
      more: ["First payment and activation", "#first-payment-and-activation"],
    },
    trial: {
      means:
        "The first payment settled with a 0.000 amount. No money moved, but the schedule is live.",
      todo: "Grant access.",
      more: ["Free trials", "#free-trials"],
    },
    active: {
      means: "Billing normally.",
      todo: "Grant access. Nothing else is needed.",
    },
    pastDue: {
      means: "A billing cycle used up every retry.",
      todo: 'Ask the customer to pay on their page, or cancel with mode "immediate".',
      more: ["Retries & Dunning", "#retries-and-dunning"],
    },
    canceled: { means: "Terminal. No more charges.", todo: "End access." },
    expired: {
      means:
        "Terminal. The last billing cycle was paid and the next one would fall after the subscription's end_date.",
      todo: "End access, or create a new subscription to continue.",
    },
    failed: {
      means:
        "The first payment did not complete: the customer canceled the checkout, the card was not saved, or 24 hours passed without payment.",
      todo: "Create a new subscription. Ottu does not retry it.",
    },
  },
};

const DEV_PAGE = "/developers/payments/autopay/";
const BIZ_PAGE = "/business/autopay/";
const ids = Object.keys(STATES) as Id[];

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
const WIDE_W = 920;
const wideAt: Record<Id, [number, number]> = {
  pending: [0, 150],
  trial: [260, 20],
  active: [260, 150],
  pastDue: [520, 150],
  canceled: [750, 150],
  expired: [260, 340],
  failed: [0, 340],
};
// Narrow: top to bottom in two columns, about 430px, so it fits a phone or a
// narrow doc column at full text size.
const narrowAt: Record<Id, [number, number]> = {
  pending: [0, 0],
  failed: [260, 0],
  trial: [0, 130],
  active: [0, 260],
  pastDue: [260, 260],
  canceled: [260, 390],
  expired: [0, 520],
};

// Edges: the main moves of the AutoPay subscription state machine.
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
  const [selected, setSelected] = useState<Id | null>(null);
  // false when the selection came from the URL: no scrolling then.
  const [picked, setPicked] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // A link with #state-<slug> preselects that state (the browser scrolls to the heading).
  useEffect(() => {
    const fromHash = () => {
      const slug = window.location.hash.replace(/^#state-/, "");
      const id = ids.find((i) => STATES[i].slug === slug);
      if (id && window.location.hash.startsWith("#state-")) {
        setPicked(false);
        setSelected(id);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const pick = (id: string | null) => {
    setPicked(true);
    setCopied(false);
    setSelected(id as Id | null);
  };

  const at = narrow ? narrowAt : wideAt;
  const cards: FlowCard[] = ids.map((id) => ({
    id,
    title: dev ? STATES[id].devLabel : STATES[id].label,
    sub: dev ? STATES[id].code : undefined,
    mono: dev,
    width: 170,
    x: at[id][0],
    y: at[id][1],
    ...ICONS[id],
  }));
  const arrows = arrowsFor(narrow);

  const next = selected ? STATES[selected].next : [];
  const lit = selected
    ? {
        cards: [selected, ...next],
        arrows: arrows.flatMap((a, i) => (a.from === selected ? [i] : [])),
      }
    : undefined;

  const copy = async () => {
    if (!selected) return;
    const path = dev ? DEV_PAGE : BIZ_PAGE;
    const url = `${window.location.origin}${path}#state-${STATES[selected].slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  const info = selected ? TEXT[audience][selected] : null;
  const panel =
    selected && info ? (
      <>
        <div className={captionClass.eyebrow}>
          {dev ? STATES[selected].devLabel : STATES[selected].label}
          {dev ? (
            <>
              {" "}
              · <code>{STATES[selected].code}</code>
            </>
          ) : null}
        </div>
        <p>
          {info.means}
          {info.more ? (
            <>
              {" "}
              <a href={info.more[1]}>{info.more[0]}</a>.
            </>
          ) : null}
        </p>
        <p>
          <strong>What to do:</strong> {info.todo}
        </p>
        <div className={captionClass.chips} style={{ padding: 0 }}>
          <span>
            <strong>Next possible states:</strong>
          </span>
          {next.length === 0 ? (
            <span>none, this state is final</span>
          ) : (
            next.map((n) => (
              <button
                key={n}
                type="button"
                className={captionClass.chip}
                onClick={() => pick(n)}
              >
                {dev ? STATES[n].devLabel : STATES[n].label}
              </button>
            ))
          )}
          <button type="button" className={captionClass.chip} onClick={copy}>
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      </>
    ) : (
      <p>
        Click a state to see what it means and what to do. Press Escape to
        clear.
      </p>
    );

  return (
    <div ref={box}>
      <CaptionLayout
        diagramMinWidth={flowMinWidth({
          title: "",
          cards,
          arrows,
          height: 0,
        })}
        panel={panel}
        selected={selected}
        scrollToPanel={picked}
      >
        <FlowDiagram
          title={dev ? "Subscription status values" : "Subscription states"}
          sub="Click a state to read what it means · Canceled and Expired are final"
          cards={cards}
          arrows={arrows}
          height={narrow ? 700 : 480}
          selected={selected}
          onSelect={pick}
          lit={lit}
        />
      </CaptionLayout>
      {dev ? (
        <p>
          You can cancel with mode <code>immediate</code> from any state that is
          not final.
        </p>
      ) : null}
    </div>
  );
}
