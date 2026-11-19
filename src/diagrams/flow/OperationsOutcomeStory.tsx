// How Operations v3 answers a refund, capture or void, by what the gateway did.
// Usage in MDX, the buttons in the text column and the diagram beside them
// (storyParts.tsx explains how the two talk):
//   import OperationsOutcomeStory, { OperationsOutcomeControls } from "@site/src/diagrams/flow/OperationsOutcomeStory";
//   <Beside wideVisual>
//   …text…
//   <OperationsOutcomeControls />
//   <Visual><OperationsOutcomeStory /></Visual>
//   </Beside>
import React from "react";
import {
  mdiAlertCircleOutline,
  mdiBankTransfer,
  mdiCheckCircleOutline,
  mdiClockAlertOutline,
  mdiCloseCircleOutline,
  mdiHelpCircleOutline,
  mdiShieldCheckOutline,
} from "@mdi/js";
import type {
  StoryLane,
  StoryLink,
  StoryProps,
  StoryStep,
} from "@site/src/components/FlowDiagram";
import { StoryControls, StoryFrame } from "./storyParts";

const lanes: StoryLane[] = [
  {
    title: "Bank / gateway",
    icon: mdiBankTransfer,
    chip: "Gateway's part",
    chipOrder: 1,
    about: {
      does: "Accepts, declines or never answers the operation Ottu sent.",
      relies: "Ottu to send the operation.",
    },
  },
  {
    title: "Ottu answers you",
    icon: mdiShieldCheckOutline,
    chip: "Ottu's part",
    chipOrder: 0,
    about: {
      does: "Turns what the gateway did into one HTTP status and one body.",
      relies: "The gateway's reply.",
    },
  },
];

const steps: StoryStep[] = [
  {
    lane: 0,
    title: "Accepts the operation",
    sub: "Refund, capture or void",
    icon: mdiCheckCircleOutline,
    detail: "The gateway confirms the operation, or accepts a refund it will confirm later.",
  },
  {
    lane: 1,
    title: "200 with the payment event",
    sub: "refunded or refund_pending",
    icon: mdiCheckCircleOutline,
    tone: "success",
    detail:
      "A refund answers status refunded, or refund_pending when the gateway has not confirmed it yet. A capture answers paid and a void answers voided.",
  },
  {
    lane: 0,
    title: "Declines a refund",
    sub: "The gateway says no",
    icon: mdiCloseCircleOutline,
    detail: "The gateway refuses the refund.",
  },
  {
    lane: 1,
    title: "200 refund_rejected",
    sub: "result is failed",
    icon: mdiAlertCircleOutline,
    tone: "info",
    detail:
      "A declined refund is a result, not an error: status 200, status refund_rejected, result failed. The payment.refund_rejected webhook event is sent.",
  },
  {
    lane: 0,
    title: "Declines a capture or void",
    sub: "The gateway says no",
    icon: mdiCloseCircleOutline,
    detail: "The gateway refuses the capture or the void.",
  },
  {
    lane: 1,
    title: "422 operation_declined",
    sub: "Gateway's message in detail",
    icon: mdiCloseCircleOutline,
    detail:
      "A declined capture or void is an error: nothing was recorded, and the gateway's own message is in the detail field.",
  },
  {
    lane: 0,
    title: "Does not answer",
    sub: "Timeout",
    icon: mdiClockAlertOutline,
    detail: "The gateway did not reply in time, so Ottu cannot know the result.",
  },
  {
    lane: 1,
    title: "504 gateway_timeout",
    sub: "Result unknown",
    icon: mdiClockAlertOutline,
    tone: "danger",
    detail:
      "The answer is stored under your Idempotency-Key. Check the payment with the status query before you retry with a new key.",
  },
  {
    lane: 0,
    title: "Sends an unusable reply",
    sub: "Error or garbled",
    icon: mdiHelpCircleOutline,
    detail: "The gateway replied with something Ottu cannot read as a result.",
  },
  {
    lane: 1,
    title: "502 gateway_error",
    sub: "Result unknown",
    icon: mdiHelpCircleOutline,
    detail:
      "The answer is stored under your Idempotency-Key. Check the payment with the status query before you retry with a new key.",
  },
];

const links: StoryLink[] = [
  [1, 2, undefined, "reply"],
  [3, 4, undefined, "reply"],
  [5, 6, undefined, "reply"],
  [7, 8, undefined, "reply"],
  [9, 10, undefined, "reply"],
];

// The hint sits with the buttons in the text column, so the diagram keeps
// only its title line.
const props: StoryProps = {
  title: "What each gateway outcome becomes",
  lanes,
  steps,
  links,
};

const KEY = "operations-outcome";
/** Natural size without the buttons, figure margin included (measured in
 * the browser at zoom 1), for the placeholder. */
const WIDTH = 627;
const HEIGHT = 929;

export function OperationsOutcomeControls(): React.JSX.Element {
  return <StoryControls storyKey={KEY} props={props} hint="Read top to bottom · hover a box to focus on it" />;
}

export default function OperationsOutcomeStory(): React.JSX.Element {
  return <StoryFrame storyKey={KEY} props={props} width={WIDTH} height={HEIGHT} />;
}
