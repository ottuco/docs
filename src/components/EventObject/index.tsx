// The format 3 webhook event, Stripe style: every field on the left, with its
// child attributes folded away, and a sticky example on the right with a picker
// between events. Same layout and field list as ApiReference, fed from a
// hand-written schema because a webhook has no OpenAPI operation.
//
// Usage in MDX: <EventObject />
import React from "react";
import FieldList from "@site/src/components/ApiReference/Fields";
import { fieldsOf } from "@site/src/components/ApiReference/schema";
import ResponseExamplesBox from "@site/src/components/ApiExecute/ResponseExamples";
import type { ResponseExamples } from "@site/src/components/ApiExecute";
import styles from "@site/src/components/ApiReference/styles.module.css";
import { EVENT_SCHEMA } from "./schema";
import created from "./examples/payment.created.json";
import paid from "./examples/payment.paid.json";
import refunded from "./examples/payment.refunded.json";

const FIELDS = fieldsOf(EVENT_SCHEMA, "response");

const EXAMPLES: ResponseExamples = [
  { code: "payment.paid", examples: [{ name: "paid", summary: "a card payment", value: paid }] },
  { code: "payment.created", examples: [{ name: "created", summary: "a new payment", value: created }] },
  {
    code: "payment.refunded",
    examples: [{ name: "refunded", summary: "a partial refund (shortened)", value: refunded }],
  },
];

export default function EventObject(): React.JSX.Element {
  return (
    <div className={styles.reference}>
      <div className={styles.left}>
        <FieldList fields={FIELDS} prefix="event" />
      </div>
      <div className={styles.right}>
        <ResponseExamplesBox examples={EXAMPLES} title="Example" />
      </div>
    </div>
  );
}
