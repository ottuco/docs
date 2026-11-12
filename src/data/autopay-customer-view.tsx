import React from "react";
import Link from "@docusaurus/Link";
import type { Step } from "@site/src/components/StepGuide";

// TODO #158913: reminder-email.png still needs a real sandbox capture. Until it exists, that step
// stays text-only (StepGuide renders a step without an image).
export const autopayCustomerViewSteps: Step[] = [
  {
    title: "The first-charge checkout",
    description: (
      <>
        Your customer pays the first charge on Ottu's checkout page. Ottu saves their card, so the
        later charges need no action from them. More in{" "}
        <Link to="#first-payment-and-activation">First payment and activation</Link>.
      </>
    ),
    image: "/img/developers/autopay/first-charge-checkout.png",
    imageAlt: "Ottu's checkout page for the first AutoPay charge, with the card form and the amount due",
  },
  {
    title: "The self-service page",
    description: (
      <>
        Your customer opens the private link you send them. They see their status and billing
        history, add or switch a card, pay an overdue balance, and cancel or undo a pending
        cancellation. More in <Link to="#customer-self-service-page">Customer Self-Service Page</Link>.
      </>
    ),
    image: "/img/developers/autopay/self-service-page.png",
    imageAlt: "The customer's self-service page: subscription summary, saved card and payment history",
  },
  {
    title: "One email: the charge reminder",
    description: (
      <>
        Ottu emails your customer before each charge. The email carries your business name, your
        support email and a link to the self-service page. More in{" "}
        <Link to="#notifications">Notifications</Link>.
      </>
    ),
  },
];
