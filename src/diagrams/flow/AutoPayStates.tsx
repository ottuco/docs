// AutoPay subscription states and the main moves between them.
// Usage in MDX:  import AutoPayStates from "@site/src/diagrams/flow/AutoPayStates";
//   <AutoPayStates audience="business" />   or   <AutoPayStates audience="developer" />
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useWidthFlag } from "@site/src/components/FlowDiagram/useWidthFlag";
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

// slug = the heading anchor on both pages (#state-<slug>); code = the API value.
const STATES: Record<
  Id,
  {
    slug: string;
    label: string;
    devLabel: string;
    code: string;
    final?: boolean;
  }
> = {
  pending: {
    slug: "pending-setup",
    label: "Pending setup",
    devLabel: "Pending setup",
    code: "pending_setup",
  },
  trial: {
    slug: "trialing",
    label: "Trialing",
    devLabel: "Trialing",
    code: "trialing",
  },
  active: {
    slug: "active",
    label: "Active",
    devLabel: "Active",
    code: "active",
  },
  pastDue: {
    slug: "past-due",
    label: "Past Due",
    devLabel: "Past due",
    code: "past_due",
  },
  canceled: {
    slug: "canceled",
    label: "Canceled",
    devLabel: "Canceled",
    code: "canceled",
    final: true,
  },
  expired: {
    slug: "expired",
    label: "Expired",
    devLabel: "Expired",
    code: "expired",
    final: true,
  },
  failed: {
    slug: "setup-failed",
    label: "Setup Failed",
    devLabel: "Setup failed",
    code: "setup_failed",
  },
};

// The panel paragraph is: text, then "<strong>label:</strong> todo", then "See <more>.".
// KEEP IN SYNC: word for word with the per-state headings on both pages
// (docs/business/autopay/index.mdx, docs/developers/payments/autopay/index.mdx).
// Backticks mark inline code. Edit all three together.
type Info = {
  text: string;
  label?: string;
  todo?: string;
  more?: [label: string, href: string];
};
const TEXT: Record<Audience, Record<Id, Info>> = {
  business: {
    pending: {
      text: "Ottu created the subscription and waits for the first payment. Ottu activates it automatically after your customer pays.",
      label: "Your part",
      todo: "nothing.",
    },
    trial: {
      text: "The first payment was zero, so no money has moved. Ottu charges the saved card at the next billing cycle.",
      label: "Your part",
      todo: "nothing.",
    },
    active: {
      text: "Billing normally. The latest cycle was paid.",
      label: "Your part",
      todo: "give your customer the service.",
    },
    pastDue: {
      text: "Every retry on a cycle failed. The subscription waits for your customer to pay.",
      label: "Your part",
      todo: "decide what to do if it stays Past Due.",
      more: ["When a payment fails", "#when-a-payment-fails"],
    },
    canceled: {
      text: "Billing has stopped. A cancellation set for the end of the period, by your customer or your team, lands here when that period ends. An immediate cancel by your team lands here at once.",
      label: "Your part",
      todo: "nothing.",
    },
    expired: {
      text: "The last cycle was paid and the next billing date would fall after the end date. Billing stopped. The history stays readable. To continue, create a new subscription.",
    },
    failed: {
      text: "The customer canceled the checkout, did not pay within 24 hours, or paid but the card could not be saved. Ottu does not retry it.",
      label: "Your part",
      todo: "create a new subscription. If the customer paid, refund that payment in Payment Management. Ottu does not refund it automatically.",
    },
  },
  developer: {
    pending: {
      text: "Created by the checkout call; waiting for the first payment.",
      label: "What to do",
      todo: "do not grant access yet.",
      more: ["First payment and activation", "#first-payment-and-activation"],
    },
    trial: {
      text: "The first payment settled with a `0.000` amount. No money moved, but the schedule is live.",
      label: "What to do",
      todo: "grant access.",
      more: ["Free trials", "#free-trials"],
    },
    active: {
      text: "Billing normally.",
      label: "What to do",
      todo: "grant access. Nothing else is needed.",
    },
    pastDue: {
      text: "A billing cycle used up every retry.",
      label: "What to do",
      todo: 'ask the customer to pay on their page, or cancel with `mode: "immediate"`.',
      more: ["Retries & Dunning", "#retries-and-dunning"],
    },
    canceled: {
      text: "Terminal. No more charges.",
      label: "What to do",
      todo: "end access.",
    },
    expired: {
      text: "Terminal. The last billing cycle was paid and the next one would fall after the subscription's `end_date`.",
      label: "What to do",
      todo: "end access, or create a new subscription to continue.",
    },
    failed: {
      text: "The customer canceled the checkout, 24 hours passed without payment, or the first payment succeeded but the card was not saved.",
      label: "What to do",
      todo: "create a new subscription. Ottu does not retry it. If the first payment succeeded, refund it. Ottu does not refund it automatically.",
    },
  },
};

/** Text with `code` spans. */
const rich = (t: string): React.ReactNode =>
  t.split("`").map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));

const ids = Object.keys(STATES) as Id[];

const DEV_PAGE = "/developers/payments/autopay/";
const BIZ_PAGE = "/business/autopay/";

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
const WIDE_W = 850;
const wideAt: Record<Id, [number, number]> = {
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
          label: "cancel",
        }
      : {
          from: "active",
          to: "canceled",
          fromSide: "top",
          toSide: "top",
          kind: "plain",
          label: "cancel",
        },
    // Same rule as Active -> Canceled: a cancel scheduled in the trial closes it at period end.
    narrow
      ? {
          from: "trial",
          to: "canceled",
          fromSide: "right",
          toSide: "left",
          kind: "plain",
          label: "cancel",
          // Sit low on the vertical run, clear of the other labels on it.
          dy: 80,
        }
      : {
          from: "trial",
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
      // Narrow: sit on the straight segment above the cancel arrow's turn.
      dy: narrow ? -50 : 0,
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
  // Wide layout from the container's width alone (with hysteresis, see useWidthFlag).
  const wide = useWidthFlag(box, WIDE_W * 0.95 + 8);
  const narrow = !wide;
  const [selected, setSelected] = useState<Id | null>(null);
  // false when the selection came from the URL: no scrolling then.
  const [picked, setPicked] = useState(false);
  const [copied, setCopied] = useState(false);

  // A link with #state-<slug> preselects that state (the browser scrolls to the heading).
  useEffect(() => {
    const fromHash = () => {
      if (!window.location.hash.startsWith("#state-")) return;
      const slug = window.location.hash.replace(/^#state-/, "");
      const id = ids.find((i) => STATES[i].slug === slug);
      if (id) {
        setPicked(false);
        setSelected(id);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const pick = useCallback((id: string | null) => {
    setPicked(true);
    setCopied(false);
    setSelected(id as Id | null);
  }, []);

  const cards: FlowCard[] = useMemo(() => {
    const at = narrow ? narrowAt : wideAt;
    return [
      ...ids.map((id) => ({
        id,
        title: dev ? STATES[id].devLabel : STATES[id].label,
        sub: dev ? STATES[id].code : undefined,
        mono: dev,
        width: narrow ? 170 : 160,
        x: at[id][0],
        y: at[id][1],
        ...ICONS[id],
      })),
      // Room for the "paid" arrow that loops left of the narrow layout.
      ...(narrow
        ? [{ id: "spacer", x: -70, y: 130, width: 40, title: "", hidden: true }]
        : []),
    ];
  }, [narrow, dev]);
  const arrows = useMemo(() => arrowsFor(narrow), [narrow]);

  // Only transitions that are drawn: the chips, the lit arrows and the lit
  // cards all come from the same arrows.
  const drawn = selected
    ? arrows.flatMap((a, i) =>
        a.from === selected ? [[a.to as Id, i] as const] : [],
      )
    : [];
  const next = [...new Set(drawn.map(([to]) => to))];
  const lit = selected
    ? { cards: [selected, ...next], arrows: drawn.map(([, i]) => i) }
    : undefined;

  const copy = async () => {
    if (!selected) return;
    const url = `${window.location.origin}${dev ? DEV_PAGE : BIZ_PAGE}#state-${STATES[selected].slug}`;
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
              {" · "}
              <code>{STATES[selected].code}</code>
            </>
          ) : null}
        </div>
        <p>
          {rich(info.text)}
          {info.label ? (
            <>
              {" "}
              <strong>{info.label}:</strong> {rich(info.todo ?? "")}
            </>
          ) : null}
          {info.more ? (
            <>
              {" See "}
              <a href={info.more[1]}>{info.more[0]}</a>.
            </>
          ) : null}
        </p>
        <div className={captionClass.chips} style={{ padding: 0 }}>
          {next.length > 0 ? (
            <>
              <span>
                <strong>Next possible states:</strong>
              </span>
              {next.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={captionClass.chip}
                  onClick={() => pick(n)}
                >
                  {dev ? STATES[n].devLabel : STATES[n].label}
                </button>
              ))}
            </>
          ) : STATES[selected].final ? (
            <span>This state is final.</span>
          ) : null}
          <button type="button" className={captionClass.chip} onClick={copy}>
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
        {dev && !STATES[selected].final ? (
          <p>
            You can also cancel with mode <code>immediate</code> from any state
            that isn't final.
          </p>
        ) : null}
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
        diagramMinWidth={flowMinWidth({ title: "", cards, arrows, height: 0 })}
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
    </div>
  );
}
