import React from "react";
import type { Step } from "@site/src/components/StepGuide";

// Real captures from sandbox.ottu.net only (#158909 Definition of done): no
// betabulk, no mockups. The full customer tour is on the business page.
export const autopayCustomerSteps: Step[] = [
  {
    title: "The customer pays the first charge",
    description: (
      <>
        They pay on the Ottu checkout like any other order. The card they use is
        saved for the renewals.
      </>
    ),
    image: "/img/developers/autopay/customer-01-first-charge.png",
    imageAlt: "Ottu checkout paying the first charge of a subscription",
  },
  {
    title: "They manage the subscription themselves",
    description: (
      <>
        The link you send opens their own page: the plan, the next charge date,
        the billing history and the saved cards. They can switch cards or pay an
        outstanding balance without contacting you.
      </>
    ),
    image: "/img/developers/autopay/customer-02-self-service.png",
    imageAlt: "Customer self-service page showing an active subscription",
  },
  {
    title: "They can cancel, at the end of the period",
    description: (
      <>
        A customer who cancels keeps the service until the period they paid for
        ends, and can undo it until then. Only you can cancel immediately.
      </>
    ),
    image: "/img/developers/autopay/customer-03-cancel.png",
    imageAlt: "Cancellation confirmation on the customer self-service page",
  },
  {
    title: "Ottu emails them before every charge",
    description: (
      <>
        A reminder arrives before each renewal, and an email follows if a charge
        fails. Every email links back to their page.
      </>
    ),
    image: "/img/developers/autopay/customer-04-reminder-email.png",
    imageAlt: "Upcoming-charge reminder email",
  },
];
