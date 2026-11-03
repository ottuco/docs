import React from "react";
import type { Step } from "@site/src/components/StepGuide";

// TODO #158913: add real sandbox screenshots from Junaid, one `image` + `imageAlt` per step, at
// /img/developers/autopay/first-charge-checkout.png, self-service-page.png and reminder-email.png.
// No image props until the files exist: StepGuide renders text-only steps without them.
export const autopayCustomerViewSteps: Step[] = [
  {
    title: "The first-charge checkout",
    description: (
      <>
        Your customer pays the first charge on Ottu's checkout page. Ottu saves their card, so the
        later charges need no action from them.
      </>
    ),
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
  },
  {
    title: "One email: the charge reminder",
    description: (
      <>
        Ottu emails your customer before each charge. The email carries your business name, your
        support email and a link to the self-service page.
      </>
    ),
  },
];
