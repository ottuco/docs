// The webhook events an AutoPay integration receives, for the Events tab of
// the API Reference shortcut box (docs/developers/payments/autopay/index.mdx).
// Two groups: the first charge is an ordinary checkout payment, so it sends
// the v3 payment events to its webhook_url; everything after it is reported
// as subscription.* events, to a webhook endpoint only. Each event links to
// its table on the Webhooks page.
import type { ShortcutEvent } from "@site/src/components/ApiReference/Shortcuts";

const PAYMENT_EVENTS = "/developers/webhooks/#catalogue";
const SUBSCRIPTION_EVENTS = "/developers/webhooks/#subscription-events";

const FIRST_CHARGE = "First charge: sent to the webhook_url of the Create call";
const SUBSCRIPTION = "Subscription: sent to a webhook endpoint that subscribes to subscription.*";

const firstCharge: [string, string][] = [
  ["payment.created", "Your Create call made the checkout payment for the first charge."],
  ["payment.pending", "The customer opened the checkout page. Sent once."],
  ["payment.attempted", "A try at the first charge failed; the customer can try again."],
  ["payment.paid", "The customer paid the first charge. The subscription can still be pending_setup. Give access on subscription.activated."],
  ["payment.failed", "The first charge failed and allows no other try."],
  ["payment.expired", "The checkout expired before the customer paid."],
];

// Meanings as in the catalogue's "Subscription events" table.
const subscription: [string, string][] = [
  ["subscription.created", "The subscription was created."],
  ["subscription.activated", "The subscription became active."],
  ["subscription.setup_failed", "Setting the subscription up failed."],
  ["subscription.renewed", "A billing cycle was renewed."],
  ["subscription.payment_failed", "A billing cycle payment failed."],
  ["subscription.past_due", "The subscription is past due."],
  ["subscription.card_updated", "The card on the subscription was updated."],
  ["subscription.cancel_scheduled", "Cancellation was scheduled."],
  ["subscription.cancel_reverted", "A scheduled cancellation was withdrawn."],
  ["subscription.canceled", "The subscription was canceled."],
  ["subscription.expired", "The subscription expired."],
];

export const autopayEvents: ShortcutEvent[] = [
  ...firstCharge.map(([name, meaning]) => ({ name, meaning, href: PAYMENT_EVENTS, group: FIRST_CHARGE })),
  ...subscription.map(([name, meaning]) => ({ name, meaning, href: SUBSCRIPTION_EVENTS, group: SUBSCRIPTION })),
];

export const AUTOPAY_EVENTS_NOTE =
  "Renewals do not call your webhook_url. An endpoint set up by Ottu support also gets subscription.* events, such as subscription.renewed.";
