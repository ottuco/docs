// The webhook events an AutoPay integration receives, for the Events tab of
// the API Reference shortcut box (docs/developers/payments/autopay/index.mdx).
// The first charge is an ordinary checkout payment, so these are its v3
// payment events; renewals send no webhook (see AUTOPAY_EVENTS_NOTE).
import type { ShortcutEvent } from "@site/src/components/ApiReference/Shortcuts";

const CATALOGUE = "/developers/webhooks/event-catalogue/#catalogue";

export const autopayEvents: ShortcutEvent[] = [
  {
    name: "payment.created",
    meaning: "Your Create call made the checkout payment for the first charge.",
    href: CATALOGUE,
  },
  {
    name: "payment.pending",
    meaning: "The customer opened the checkout page. Sent once.",
    href: CATALOGUE,
  },
  {
    name: "payment.attempted",
    meaning: "A try at the first charge failed; the customer can try again.",
    href: CATALOGUE,
  },
  {
    name: "payment.paid",
    meaning:
      "The customer paid the first charge. Retrieve the subscription: it turns active once Ottu confirms the payment.",
    href: CATALOGUE,
  },
  {
    name: "payment.failed",
    meaning: "The first charge failed and allows no other try.",
    href: CATALOGUE,
  },
  {
    name: "payment.expired",
    meaning: "The checkout expired before the customer paid.",
    href: CATALOGUE,
  },
];

export const AUTOPAY_EVENTS_NOTE =
  "Renewals send no webhook: list past-due subscriptions to follow them.";
