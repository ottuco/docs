import React from "react";
import type { Step } from "@site/src/components/StepGuide";

// TODO #158913: replace the placeholder image paths with real sandbox screenshots from Junaid.
export const autopayCustomerViewSteps: Step[] = [
  {
    title: "The first-charge checkout",
    description: (
      <>
        Your customer pays the first charge on Ottu's checkout page. Ottu saves their card, so the
        later charges need no action from them.
      </>
    ),
    image: "/img/developers/autopay/first-charge-checkout.png",
    imageAlt: "Ottu checkout page where the customer pays the first AutoPay charge",
  },
  {
    title: "The self-service page",
    description: (
      <>
        Your customer opens the private link you send them. They see their status and billing
        history, add or switch a card, pay an overdue balance, and cancel or undo a pending
        cancellation.
      </>
    ),
    image: "/img/developers/autopay/self-service-page.png",
    imageAlt: "AutoPay self-service page showing subscription status and billing history",
  },
  {
    title: "One email: the charge reminder",
    description: (
      <>
        Ottu emails your customer before each charge. The email carries your business name, your
        support email and a link to the self-service page.
      </>
    ),
    image: "/img/developers/autopay/reminder-email.png",
    imageAlt: "Email reminding the customer about an upcoming AutoPay charge",
  },
];
