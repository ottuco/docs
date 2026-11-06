// AutoPay for business readers: what the customer, Ottu and your team each do.
// Usage in MDX:  import AutoPayBusinessStory from "@site/src/diagrams/flow/AutoPayBusinessStory";  <AutoPayBusinessStory />
import React from "react";
import {
  mdiAccount,
  mdiAccountCogOutline,
  mdiAccountGroupOutline,
  mdiAlertCircleOutline,
  mdiCalendarSync,
  mdiCartOutline,
  mdiCheckDecagramOutline,
  mdiCreditCardCheckOutline,
  mdiLinkVariant,
  mdiShieldCheckOutline,
} from "@mdi/js";
import {
  StoryDiagram,
  type StoryLane,
  type StoryLink,
  type StoryStep,
} from "@site/src/components/FlowDiagram";

const lanes: StoryLane[] = [
  { title: "Your customer", icon: mdiAccount, chip: "Customer's part" },
  { title: "Ottu", icon: mdiShieldCheckOutline, chip: "Ottu's part" },
  { title: "Your team", icon: mdiAccountGroupOutline, chip: "Your part" },
];

const steps: StoryStep[] = [
  {
    lane: 0,
    title: "Signs up",
    sub: "On your site or app",
    icon: mdiCartOutline,
    detail: "Your customer picks a plan. Your part: nothing yet.",
  },
  {
    lane: 2,
    title: "Starts the subscription",
    sub: "One checkout call",
    icon: mdiLinkVariant,
    detail:
      "Your part: your developer makes one checkout call and sends your customer to the checkout page.",
  },
  {
    lane: 0,
    title: "Pays the first charge",
    sub: "Or saves a card for a trial",
    icon: mdiCreditCardCheckOutline,
    detail:
      "Your customer pays on Ottu's checkout page. Ottu saves the card. Later charges need no action from them.",
  },
  {
    lane: 1,
    title: "Activates the subscription",
    sub: "Automatic",
    icon: mdiCheckDecagramOutline,
    tone: "accent",
    detail:
      "Ottu activates the subscription after the first payment. It emails and texts your customer a link to their own page.",
  },
  {
    lane: 1,
    title: "Charges every billing date",
    sub: "Reminder email first",
    icon: mdiCalendarSync,
    tone: "accent",
    detail:
      "Ottu emails a reminder, then charges the saved card on schedule. Your part: nothing.",
  },
  {
    lane: 1,
    title: "Retries failed charges",
    sub: "Emails the customer",
    icon: mdiAlertCircleOutline,
    detail:
      "Ottu retries a failed charge and asks your customer to fix it. If every retry fails, the subscription becomes Past Due. Your part: decide what to do with a Past Due subscription.",
  },
  {
    lane: 0,
    title: "Manages it themselves",
    sub: "Card, balance, cancel",
    icon: mdiAccountCogOutline,
    tone: "success",
    detail:
      "Your customer changes the card, pays a balance, sees the history, or cancels, on a page Ottu hosts. Your part: optional. Send them the page link.",
  },
];

const links: StoryLink[] = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6, "if a charge fails"],
  [6, 7, undefined, "reply"],
];

export default function AutoPayBusinessStory(): React.JSX.Element {
  return (
    <StoryDiagram
      title="How AutoPay works"
      sub="Ottu runs the schedule · click a step to see your part"
      lanes={lanes}
      steps={steps}
      links={links}
      journeys={[
        {
          name: "Sign-up and billing",
          stops: [1, 2, 3, 4, 5].map((n) => ({
            step: n,
            text: steps[n - 1].detail ?? "",
          })),
        },
        {
          name: "A payment fails",
          stops: [5, 6, 7].map((n) => ({
            step: n,
            text: steps[n - 1].detail ?? "",
          })),
        },
      ]}
    />
  );
}
