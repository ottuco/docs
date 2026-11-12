// Webhook format 3 delivery: one event, a failed first attempt, a retry the receiver de-duplicates.
// Usage in MDX:  import WebhookDeliveryStory from "@site/src/diagrams/flow/WebhookDeliveryStory";  <WebhookDeliveryStory />
import React from "react";
import {
  mdiAlertCircleOutline,
  mdiCheckDecagramOutline,
  mdiContentCopy,
  mdiDatabaseOutline,
  mdiDatabasePlusOutline,
  mdiPackageVariantClosed,
  mdiReplay,
  mdiReplyOutline,
  mdiServer,
  mdiShieldCheckOutline,
  mdiShieldKeyOutline,
  mdiWebhook,
} from "@mdi/js";
import {
  StoryDiagram,
  type StoryJourney,
  type StoryLane,
  type StoryLink,
  type StoryStep,
} from "@site/src/components/FlowDiagram";

const lanes: StoryLane[] = [
  {
    title: "Ottu",
    icon: mdiShieldCheckOutline,
    chip: "Ottu's part",
    about: {
      does: "Records each event once, signs every attempt, and retries until your receiver answers 2xx or 8 attempts have failed.",
      relies: "A public HTTPS webhook URL that answers quickly.",
    },
  },
  {
    title: "Your receiver",
    icon: mdiServer,
    chip: "Your receiver",
    about: {
      does: "Verifies the signature, processes the event once, and answers 2xx.",
      relies: "Ottu-Signature and Idempotency-Key on every attempt.",
    },
  },
  {
    title: "Your database",
    icon: mdiDatabaseOutline,
    chip: "Your database",
    about: {
      does: "Keeps the ids of processed events under a unique key.",
      relies: "Your receiver writing the id and the business change in one transaction.",
    },
  },
];

const steps: StoryStep[] = [
  {
    lane: 0,
    title: "Records the event",
    sub: "Body stored once",
    icon: mdiDatabasePlusOutline,
    tone: "accent",
    detail:
      "Ottu records event evt_X and stores its body bytes once, so every attempt sends exactly the same bytes.",
  },
  {
    lane: 0,
    title: "Sends attempt 1",
    sub: "Signed POST",
    icon: mdiWebhook,
    detail:
      "Ottu posts the body with an Ottu-Signature header and Idempotency-Key: evt_X.",
  },
  {
    lane: 1,
    title: "Verifies the signature",
    sub: "v2 on the raw body",
    icon: mdiShieldKeyOutline,
    detail:
      "Compute the v2 HMAC over the timestamp and the raw body bytes before parsing the JSON. Reject the request if it does not match.",
  },
  {
    lane: 2,
    title: "Stores evt_X",
    sub: "First time",
    icon: mdiDatabasePlusOutline,
    detail:
      "Insert the Idempotency-Key under a unique constraint. The first insert succeeds, so this event is new.",
  },
  {
    lane: 1,
    title: "Fulfils the order",
    sub: "Checks the reference",
    icon: mdiPackageVariantClosed,
    detail:
      "Before fulfilling, check that the order or connector.reference_number has not already been applied. Two events can describe the same outcome.",
  },
  {
    lane: 1,
    title: "Times out or fails",
    sub: "Timeout or 5xx",
    icon: mdiAlertCircleOutline,
    tone: "danger",
    detail:
      "The answer does not reach Ottu in time, or it is not 2xx. Ottu counts the attempt as failed.",
  },
  {
    lane: 0,
    title: "Waits, then retries",
    sub: "1 min ± 10%",
    icon: mdiReplay,
    tone: "accent",
    detail:
      "Retries follow 1m, 5m, 30m, 2h, 5h, 10h and 24h, each ± 10%: 8 attempts over about 42 hours. Each one sends the same bytes and the same key with a fresh signature.",
  },
  {
    lane: 2,
    title: "Finds evt_X already",
    sub: "Duplicate key",
    icon: mdiContentCopy,
    detail:
      "The unique insert fails, so your receiver knows this event was already processed.",
  },
  {
    lane: 1,
    title: "Answers 200, skips work",
    sub: "Nothing reprocessed",
    icon: mdiReplyOutline,
    tone: "info",
    detail:
      "Answer 2xx without fulfilling the order again. Any 2xx tells Ottu the event arrived.",
  },
  {
    lane: 0,
    title: "Marks it delivered",
    sub: "Retries stop",
    icon: mdiCheckDecagramOutline,
    tone: "success",
    detail:
      "Any 2xx stops the retries. If all 8 attempts fail, Ottu marks the delivery failed and sends one failure email.",
  },
];

// [from step, to step, label?, kind?]. Steps are 1-based.
const links: StoryLink[] = [
  [1, 2],
  [2, 3, "Attempt 1"],
  [3, 4],
  [4, 5, undefined, "reply"],
  [5, 6],
  [6, 7, undefined, "reply"],
  [7, 8, "Attempt 2"],
  [8, 9, undefined, "reply"],
  [9, 10, undefined, "reply"],
];

const journeys: StoryJourney[] = [
  {
    name: "Delivered on the retry",
    stops: [
      { step: 1, text: "Ottu records the event and its body once." },
      { step: 2, text: "Attempt 1 arrives, signed, with Idempotency-Key evt_X." },
      { step: 3, text: "Your receiver verifies v2 on the raw body." },
      { step: 4, text: "evt_X is new, so your database stores it." },
      { step: 5, text: "You fulfil the order after checking your own reference." },
      { step: 6, text: "Your answer times out, so Ottu sees a failure." },
      { step: 7, text: "After about a minute Ottu sends the same bytes and key again." },
      { step: 8, text: "Your database already has evt_X." },
      { step: 9, text: "You answer 200 and do not fulfil the order twice." },
      { step: 10, text: "Ottu marks the event delivered and stops retrying." },
    ],
  },
  {
    name: "If every attempt fails",
    stops: [
      { step: 2, text: "Ottu sends attempt 1." },
      { step: 6, text: "Your receiver times out, returns 5xx, or any other non-2xx answer." },
      {
        step: 7,
        text: "Ottu retries on the schedule, up to 8 attempts over about 42 hours.",
      },
      {
        step: 10,
        text: "When attempt 8 also fails, the delivery is marked failed and one failure email goes to your webhook recipients.",
      },
    ],
  },
];

export default function WebhookDeliveryStory(): React.JSX.Element {
  return (
    <StoryDiagram
      title="How a webhook is delivered"
      sub="Read top to bottom · click a step"
      lanes={lanes}
      steps={steps}
      links={links}
      journeys={journeys}
    />
  );
}
