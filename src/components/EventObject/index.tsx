// The webhook event, Stripe style: every field on the left and the example on
// the right with a picker between events. Same field list as ApiReference,
// fed from a hand-written schema because a webhook has no OpenAPI operation.
// No inner scrollbar anywhere, and the two columns are kept about as tall as
// each other so neither side shows a blank block:
// - <EventObject /> (the envelope): fields folded, and a short example, the
//   envelope in full with `data` cut to its first keys (a caption says so and
//   links to the full body below).
// - <EventObject part="data" />: the `data` fields (child attributes folded,
//   as everywhere) beside the full `data` body. The folded list is already
//   taller than the body, so nothing needs opening.
// In both, whichever column is shorter is sticky, so no blank block shows
// while the reader scrolls past the taller one.
//
// Usage in MDX: <EventObject />  and  <EventObject part="data" />
import React, { useEffect, useRef, useState } from "react";
import FieldList from "@site/src/components/ApiReference/Fields";
import { fieldsOf } from "@site/src/components/ApiReference/schema";
import { ExamplePanel, useExample } from "@site/src/components/ApiExecute/ResponseExamples";
import type { ResponseExamples } from "@site/src/components/ApiExecute";
import styles from "@site/src/components/ApiReference/styles.module.css";
import boxStyles from "@site/src/components/ApiExecute/styles.module.css";
import own from "./styles.module.css";
import { EVENT_SCHEMA } from "./schema";
import created from "./examples/payment.created.json";
import pending from "./examples/payment.pending.json";
import attempted from "./examples/payment.attempted.json";
import authorized from "./examples/payment.authorized.json";
import paid from "./examples/payment.paid.json";
import paidCapture from "./examples/payment.paid.capture.json";
import failed from "./examples/payment.failed.json";
import cod from "./examples/payment.cod.json";
import canceled from "./examples/payment.canceled.json";
import expired from "./examples/payment.expired.json";
import invalidated from "./examples/payment.invalidated.json";
import refundPending from "./examples/payment.refund_pending.json";
import refunded from "./examples/payment.refunded.json";
import refundRejected from "./examples/payment.refund_rejected.json";
import voided from "./examples/payment.voided.json";
import deleted from "./examples/payment.deleted.json";

const FIELDS = fieldsOf(EVENT_SCHEMA, "response");

// payment.paid first so the picker opens on it; the rest in catalogue order.
const EXAMPLES: ResponseExamples = [
  { code: "payment.paid", examples: [{ name: "paid", summary: "a card payment", value: paid }] },
  { code: "payment.created", examples: [{ name: "created", summary: "a new payment", value: created }] },
  { code: "payment.pending", examples: [{ name: "pending", summary: "the payer opened the page", value: pending }] },
  { code: "payment.attempted", examples: [{ name: "attempted", summary: "a declined try, retry allowed", value: attempted }] },
  { code: "payment.authorized", examples: [{ name: "authorized", summary: "a successful card authorization", value: authorized }] },
  { code: "payment.paid", examples: [{ name: "capture", summary: "a capture of an authorized payment", value: paidCapture }] },
  { code: "payment.failed", examples: [{ name: "failed", summary: "a final failed try", value: failed }] },
  { code: "payment.cod", examples: [{ name: "cod", summary: "cash on delivery acknowledged", value: cod }] },
  { code: "payment.canceled", examples: [{ name: "canceled", summary: "canceled through the API", value: canceled }] },
  { code: "payment.expired", examples: [{ name: "expired", summary: "expired when its time passed", value: expired }] },
  { code: "payment.invalidated", examples: [{ name: "invalidated", summary: "the gateway page failed to open", value: invalidated }] },
  { code: "payment.refund_pending", examples: [{ name: "refund_pending", summary: "a refund awaiting the gateway", value: refundPending }] },
  { code: "payment.refunded", examples: [{ name: "refunded", summary: "a partial refund", value: refunded }] },
  { code: "payment.refund_rejected", examples: [{ name: "refund_rejected", summary: "a refund the gateway rejected", value: refundRejected }] },
  { code: "payment.voided", examples: [{ name: "voided", summary: "void of the uncaptured rest", value: voided }] },
  { code: "payment.deleted", examples: [{ name: "deleted", summary: "a paid payment archived", value: deleted }] },
];

// `part="data"`: the `data` object alone, its fields and each example's `data`.
const DATA_FIELDS = fieldsOf(EVENT_SCHEMA.properties!.data, "response");
const DATA_EXAMPLES: ResponseExamples = EXAMPLES.map(({ code, examples }) => ({
  code,
  examples: examples.map((example) => ({ ...example, value: (example.value as { data: unknown }).data })),
}));

/** Lines the envelope example may take: about the height of the folded
 * envelope field list beside it. */
const SHORT_LINES = 40;

/** The event with `data` cut to its first keys, so the whole example takes
 * at most SHORT_LINES lines. Whole keys only: nothing is changed or made up. */
function shortened(event: { data: Record<string, unknown> }): { value: unknown; kept: number; total: number } {
  const keys = Object.keys(event.data);
  const lines = (v: unknown) => JSON.stringify(v, null, 2).split("\n").length;
  let kept = 0;
  while (kept < keys.length) {
    const data = Object.fromEntries(keys.slice(0, kept + 1).map((k) => [k, event.data[k]]));
    if (lines({ ...event, data }) > SHORT_LINES) break;
    kept += 1;
  }
  const data = Object.fromEntries(keys.slice(0, kept).map((k) => [k, event.data[k]]));
  return { value: { ...event, data }, kept, total: keys.length };
}

const SHORT_EXAMPLES: ResponseExamples = EXAMPLES.map(({ code, examples }) => ({
  code,
  examples: examples.map((example) => ({
    ...example,
    value: shortened(example.value as { data: Record<string, unknown> }).value,
  })),
}));

/** The examples with their picker, full height (no inner scrollbar). */
function Examples({
  examples,
  title,
  caption,
}: {
  examples: ResponseExamples;
  title: string;
  caption?: (value: unknown) => React.ReactNode;
}): React.JSX.Element | null {
  const { example, picker } = useExample(examples);
  if (!example) return null;
  return (
    <>
      <div className={boxStyles.box}>
        <div className={boxStyles.boxHead}>
          <span className={boxStyles.boxTitle}>{title}</span>
          {picker}
        </div>
        <ExamplePanel example={example} maxHeight="none" />
      </div>
      {caption ? <p className={own.caption}>{caption(example.value)}</p> : null}
    </>
  );
}

/** Which column is shorter (it gets position: sticky), once measured. */
function useShorter(
  left: React.RefObject<HTMLDivElement | null>,
  right: React.RefObject<HTMLDivElement | null>,
): "left" | "right" | null {
  const [shorter, setShorter] = useState<"left" | "right" | null>(null);
  useEffect(() => {
    const l = left.current;
    const r = right.current;
    if (!l || !r) return;
    const measure = () => {
      const lh = l.offsetHeight;
      const rh = r.offsetHeight;
      setShorter(Math.abs(lh - rh) < 1 ? null : lh < rh ? "left" : "right");
    };
    const observer = new ResizeObserver(measure);
    observer.observe(l);
    observer.observe(r);
    measure();
    return () => observer.disconnect();
  }, [left, right]);
  return shorter;
}

export default function EventObject({ part = "event" }: { part?: "event" | "data" }): React.JSX.Element {
  const data = part === "data";
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const shorter = useShorter(left, right);
  const sticky = (side: "left" | "right") => (shorter === side ? own.sticky : "");
  return (
    <div className={`${styles.reference} ${own.reference}`}>
      <div ref={left} className={`${styles.left} ${sticky("left")}`}>
        <FieldList fields={data ? DATA_FIELDS : FIELDS} prefix={data ? "data" : "event"} />
      </div>
      <div ref={right} className={`${own.right} ${sticky("right")}`}>
        {data ? (
          <Examples examples={DATA_EXAMPLES} title="data" />
        ) : (
          <Examples
            examples={SHORT_EXAMPLES}
            title="Example"
            caption={(value) => {
              const kept = Object.keys((value as { data: object }).data).length;
              return (
                <>
                  Shortened: <code>data</code> shows its first {kept} keys. The full body of every event is
                  in <a href="#data-keys">the data object</a> below.
                </>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
