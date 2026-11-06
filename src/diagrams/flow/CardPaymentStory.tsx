// Reference story diagram: a card payment, start to finish.
// Usage in MDX:  import CardPaymentStory from "@site/src/diagrams/flow/CardPaymentStory";  <CardPaymentStory />
import React from "react";
import {
  mdiAccount,
  mdiBankTransfer,
  mdiCheckDecagramOutline,
  mdiCreditCardCheckOutline,
  mdiCreditCardOutline,
  mdiServer,
  mdiShieldCheckOutline,
  mdiShoppingOutline,
  mdiSourceBranch,
  mdiWebhook,
} from "@mdi/js";
import {
  StoryDiagram,
  type StoryLane,
  type StoryLink,
  type StoryStep,
  type StoryJourney,
} from "@site/src/components/FlowDiagram";

const lanes: StoryLane[] = [
  {
    title: "Customer",
    icon: mdiAccount,
    chip: "Customer's part",
    about: {
      does: "Checks out on your site and enters their card on the checkout.",
      relies: "You for the checkout, Ottu to take the payment.",
    },
  },
  {
    title: "You (merchant)",
    icon: mdiServer,
    chip: "Your part",
    about: {
      does: "Creates the payment with one Checkout API call and ships the order once paid.",
      relies: "Ottu for the checkout and the signed result.",
    },
  },
  {
    title: "Ottu",
    icon: mdiShieldCheckOutline,
    chip: "Ottu's part",
    about: {
      does: "Hosts the checkout, picks the gateway, and sends you the result.",
      relies: "Your API call, and the gateways set up for you.",
    },
  },
  {
    title: "Bank / gateway",
    icon: mdiBankTransfer,
    chip: "Bank's part",
    about: {
      does: "Approves or declines the charge.",
      relies: "Ottu to send the payment.",
    },
  },
];

const steps: StoryStep[] = [
  {
    lane: 0,
    title: "Checks out on your site",
    sub: "Website or app",
    icon: mdiShoppingOutline,
    detail: "Your customer is ready to pay on your website or app.",
  },
  {
    lane: 1,
    title: "Creates a payment",
    sub: "Checkout API call",
    icon: mdiServer,
    detail:
      "Your server calls the Checkout API and gets a session_id and checkout_url back.",
  },
  {
    lane: 2,
    title: "Shows the checkout",
    sub: "SDK or hosted page",
    icon: mdiCreditCardOutline,
    tone: "accent",
    detail:
      "Embed the Checkout SDK with the session_id, or send your customer to the checkout_url.",
  },
  {
    lane: 0,
    title: "Enters card and pays",
    sub: "With 3-D Secure",
    icon: mdiCreditCardCheckOutline,
    detail: "Card details go to Ottu, never to your server.",
  },
  {
    lane: 2,
    title: "Picks the best gateway",
    sub: "Smart routing",
    icon: mdiSourceBranch,
    tone: "accent",
    detail:
      "Ottu sends the payment through the gateway set up for this payment.",
  },
  {
    lane: 3,
    title: "Approves the charge",
    sub: "KNET, MPGS, +40",
    icon: mdiCheckDecagramOutline,
    tone: "success",
    detail: "The bank approves or declines.",
  },
  {
    lane: 2,
    title: "Sends you the result",
    sub: "Signed webhook",
    icon: mdiWebhook,
    tone: "info",
    detail:
      "Ottu posts the signed result to your webhook_url and redirects the customer to your redirect_url.",
  },
  {
    lane: 1,
    title: "Gets paid, ships the order",
    sub: "Back on your site",
    icon: mdiCheckDecagramOutline,
    tone: "success",
    detail: "Verify the webhook signature, then fulfil the order.",
  },
];

// [from step, to step, label?, kind?] — `reply` draws a blue arrow.
const links: StoryLink[] = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7, undefined, "reply"],
  [7, 8, undefined, "reply"],
];

const journeys: StoryJourney[] = [
  {
    name: "Happy path",
    stops: [
      { step: 1, text: "Your customer checks out." },
      { step: 2, text: "You make one Checkout API call." },
      { step: 3, text: "Ottu shows the checkout, on your page or hosted." },
      { step: 4, text: "Your customer pays." },
      { step: 5, text: "Ottu routes the payment to a gateway." },
      { step: 6, text: "The bank approves." },
      { step: 7, text: "Ottu sends you the signed result." },
      { step: 8, text: "You ship the order." },
    ],
  },
];

export default function CardPaymentStory(): React.JSX.Element {
  return (
    <StoryDiagram
      title="How a card payment works"
      sub="Read top to bottom · hover a box or a part below to focus on it"
      lanes={lanes}
      steps={steps}
      links={links}
      journeys={journeys}
    />
  );
}
