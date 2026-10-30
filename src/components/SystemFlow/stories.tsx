import React from "react";
import {
  mdiAccount,
  mdiBankTransfer,
  mdiCalendarSync,
  mdiCheckDecagramOutline,
  mdiCreditCardCheckOutline,
  mdiCreditCardOutline,
  mdiEmailOutline,
  mdiServer,
  mdiShieldCheckOutline,
  mdiShoppingOutline,
  mdiSourceBranch,
  mdiAccountCogOutline,
  mdiWebhook,
} from "@mdi/js";
import Swimlane, {type Journey, type Lane, type Link, type Step} from "./Swimlane";

const customer: Lane = {title: "Customer", icon: mdiAccount, chip: "Customer's part"};
const merchant: Lane = {title: "You (merchant)", icon: mdiServer, chip: "Your part"};
const ottu: Lane = {title: "Ottu", icon: mdiShieldCheckOutline, chip: "Ottu's part"};
const gateway: Lane = {title: "Bank / gateway", icon: mdiBankTransfer, chip: "Bank's part"};

// A card payment, start to finish.
const paymentSteps: Step[] = [
  {lane: 0, title: "Checks out on your site", sub: "Website or app", icon: mdiShoppingOutline},
  {lane: 1, title: "Creates a payment", sub: "Checkout API call", icon: mdiServer},
  {lane: 2, title: "Shows the checkout", sub: "SDK on your page, or hosted", icon: mdiCreditCardOutline, tone: "accent"},
  {lane: 0, title: "Enters card and pays", sub: "3-D Secure if needed", icon: mdiCreditCardCheckOutline},
  {lane: 2, title: "Picks the best gateway", sub: "Smart routing · failover", icon: mdiSourceBranch, tone: "accent"},
  {lane: 3, title: "Approves the charge", sub: "KNET · MPGS · +40 more", icon: mdiCheckDecagramOutline, tone: "success"},
  {lane: 2, title: "Sends you the result", sub: "Signed webhook", icon: mdiWebhook, tone: "info"},
  {lane: 1, title: "Gets paid, ships the order", sub: "Customer returns to your site", icon: mdiCheckDecagramOutline, tone: "success"},
];
const paymentLinks: Link[] = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7, undefined, true], [7, 8, undefined, true]];

export function PaymentStory(): React.JSX.Element {
  return (
    <Swimlane
      title="How a card payment works"
      sub="Read top to bottom · hover a box or a part below to focus on it"
      lanes={[customer, merchant, ottu, gateway]}
      steps={paymentSteps}
      links={paymentLinks}
    />
  );
}

// AutoPay, from sign-up to the customer managing their subscription.
const autopayLanes: Lane[] = [
  {
    ...customer,
    about: {
      does: "Pays the first charge once, on the checkout page. After that they only act on the emails and their own page.",
      relies: "Ottu for the charges and emails, and you for the link to their page.",
    },
  },
  {
    ...merchant,
    about: {
      does: "Makes one Checkout API call, sends the customer to pay, and starts the service once the subscription is active.",
      relies: "Ottu for the result of the first charge. Renewals send you no webhook, so you poll for past-due subscriptions.",
    },
  },
  {
    ...ottu,
    about: {
      does: "Hosts the checkout, saves the card, charges each cycle, retries failed charges, sends the emails and hosts the customer's page.",
      relies: "The first payment, and a gateway that supports auto-debit.",
    },
  },
];
const autopaySteps: Step[] = [
  {lane: 0, title: "Subscribes on your site", sub: "Picks a plan", icon: mdiShoppingOutline, detail: "Your customer picks a plan on your website or app."},
  {lane: 1, title: "Creates the subscription", sub: "One Checkout API call", icon: mdiServer, detail: "Send one Checkout API call with the plan and its schedule, and store the subscription ID it returns."},
  {lane: 2, title: "Shows the checkout", sub: "For the first charge", icon: mdiCreditCardOutline, tone: "accent", detail: "Send your customer to the checkout_url from the response."},
  {lane: 0, title: "Pays the first charge", sub: "Card is saved", icon: mdiCreditCardCheckOutline, detail: "Ottu saves the card, so later charges need no action from them. With a 0.000 first charge, no money moves and the card is only saved."},
  {lane: 2, title: "Sends you the result", sub: "Webhook", icon: mdiWebhook, tone: "info", detail: "Ottu sends the result to your webhook URL, if you set one. The subscription can still be pending_setup at this point."},
  {lane: 1, title: "Starts the service", sub: "Once status is active", icon: mdiCheckDecagramOutline, tone: "success", detail: "Retrieve the subscription until it leaves pending_setup, then start the service."},
  {lane: 2, title: "Charges every cycle", sub: "Retries · reminder emails", icon: mdiCalendarSync, tone: "accent", detail: "Ottu generates each billing cycle, emails a reminder, charges the saved card and retries failed charges."},
  {lane: 0, title: "Gets emails with a link", sub: "Upcoming charge · failed", icon: mdiEmailOutline, detail: "Every email links to their private page."},
  {lane: 0, title: "Manages it on their page", sub: "Cards · history · cancel", icon: mdiAccountCogOutline, tone: "success", detail: "They can add or switch a card, see their history, pay an overdue balance, and cancel or undo a pending cancellation."},
];
const autopayJourneys: Journey[] = [
  {
    name: "First charge",
    stops: [
      {step: 1, text: "Your customer picks a plan on your site."},
      {step: 2, text: "You make one Checkout API call and store the subscription ID."},
      {step: 3, text: "You send your customer to the checkout_url."},
      {step: 4, text: "Your customer pays, and Ottu saves the card."},
      {step: 5, text: "Ottu sends the result to your webhook URL. Treat it as payment received, activation pending."},
      {step: 6, text: "Retrieve the subscription until it leaves pending_setup, then start the service."},
    ],
  },
  {
    name: "Every cycle",
    stops: [
      {step: 7, text: "Ottu emails a reminder, then charges the saved card on the billing date."},
      {step: 8, text: "Your customer gets the reminder with a link to their page. Renewals send you no webhook."},
    ],
  },
  {
    name: "Payment fails",
    stops: [
      {step: 7, text: "Ottu retries one hour apart, 3 retries by default. When the last one fails, the subscription becomes past_due."},
      {step: 8, text: "Ottu emails your customer after each failed attempt, then a final-failure email. It never cancels on its own."},
      {step: 9, text: "Your customer pays the balance on their page, or you cancel. Ottu doesn't notify you, so poll for past_due."},
    ],
  },
  {
    name: "Customer cancels",
    stops: [
      {step: 8, text: "Your customer opens the link from any email."},
      {step: 9, text: "They cancel on their page. It takes effect at the end of the paid period, and they can undo it until then."},
    ],
  },
];
const autopayLinks: Link[] = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6, undefined, true],
  [5, 7, "then, every cycle"],
  [7, 8, undefined, true],
  [8, 9],
];

export function AutoPayStory(): React.JSX.Element {
  return (
    <Swimlane
      title="How AutoPay works"
      sub="You make one call, Ottu runs the rest · click a side or a step, or walk a journey"
      lanes={autopayLanes}
      steps={autopaySteps}
      links={autopayLinks}
      journeys={autopayJourneys}
    />
  );
}

