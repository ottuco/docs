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
