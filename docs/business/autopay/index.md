---
title: AutoPay
sidebar_label: AutoPay
toc_min_heading_level: 2
toc_max_heading_level: 3
---

import StepGuide from "@site/src/components/StepGuide";
import FAQ, { FAQItem } from "@site/src/components/FAQ";

# AutoPay

AutoPay turns a [subscription](/glossary/#term-subscription) into a single checkout call. After that, AutoPay generates every [billing cycle](/glossary/#term-billing-cycle), charges the saved card, retries failed charges, emails the customer, and hosts a self-service page where the customer manages their own subscription.

## Why use AutoPay {#why-use-autopay}

- **Run subscriptions without building a billing engine.** AutoPay owns the schedule, the retries, the [dunning](/glossary/#term-dunning) emails, and the customer self-service page. Your integration is one checkout call per subscription.
- **Recover failed payments automatically.** Every declined card is retried and the customer is emailed at each stage, so a renewal doesn't lapse because nobody noticed.
- **Give customers somewhere to self-serve.** Status, billing history, saved cards, and cancellation all live on one page you send them.

The difference is who owns the billing schedule after the first charge:

| | Self-managed recurring billing | AutoPay subscriptions |
|---|---|---|
| Billing schedule | Your system decides when to charge | AutoPay decides when to charge |
| Failed payments | Your team retries and follows up | AutoPay retries automatically and emails the customer |
| Cancel, swap card, pay a balance | You build and host that experience | AutoPay hosts a ready-made self-service page |
| What your integration does | Calls the charge API on every cycle | Makes one checkout call, once, at signup |

:::tip Building the integration?
This page covers what AutoPay does for your business. The exact request and response contract your developers need — every field, and how to handle errors — lives in the [developer AutoPay docs](/developers/payments/autopay/).
:::

## How it works {#how-it-works}

1. **Your team creates a subscription with a single checkout call** — the plan details (amount, billing frequency, start date) travel with it.
2. **AutoPay generates the first billing cycle** and, if there's a charge due right away, processes it against the card the customer just entered.
3. **From then on, AutoPay generates each new cycle on schedule** and charges the saved card automatically — the next cycle is only created once the current one is paid.
4. **If a charge fails, AutoPay retries it automatically** and keeps the customer posted by email — your team doesn't have to notice or act.
5. **The customer manages everything else themselves** — checking their next charge date, updating a card, or canceling — from a private self-service page you send them.

## Subscription lifecycle {#subscription-lifecycle}

A subscription moves through a small set of states from the moment it's created to the moment it stops billing. Knowing what each one means — and which ones can recover on their own — saves a lot of confused support tickets.

| State | What it means |
|---|---|
| Pending setup | The subscription has been created and is waiting on its first charge attempt to resolve. |
| Trialing | The first charge was for zero — no money has moved yet. The customer has access now; the first real charge happens at the next billing cycle. |
| Active | The subscription is billing normally — the most recent cycle was paid. |
| Past Due | A charge failed and every retry on that cycle has been used up. The subscription is not canceled — it's waiting for the balance to be paid. |
| Canceled | Billing has stopped — either the customer canceled (their access continues until the end of the period they already paid for) or your team canceled it directly (effective immediately). |
| Expired | Billing has stopped because the subscription reached a defined end date, rather than being canceled outright. |
| Setup Failed | The very first charge attempt didn't go through. Unlike the two states above, this one isn't final — the subscription moves back to Pending setup so setup can be tried again. |

Three of these are worth calling out specifically:

- **A zero first charge creates a trial, not an active subscription.** If the first amount your checkout call charges is zero, the subscription starts in Trialing rather than Active — useful for free-trial plans where the real charge only happens once the first billing cycle comes due.
- **Past Due only happens after every retry is used up.** A single declined card changes nothing; AutoPay retries automatically first (see [Retries and dunning](#retries-and-dunning)). The subscription moves to Past Due only once the whole retry sequence for a cycle is exhausted.
- **Paying the outstanding balance is what moves a subscription back to Active.** The moment the customer pays what's owed — from their self-service page — the subscription returns to Active. There's no separate merchant-side action that does this; it's the customer's payment that clears it.

:::tip
See what each of these states looks like from your customer's side in [The customer self-service page](#customer-self-service-page).
:::

## Billing cycles {#billing-cycles}

AutoPay doesn't pre-generate a year of invoices upfront. It creates billing cycles one at a time — the next cycle only comes into existence once the current one has been paid.

The amount charged on any given cycle is whatever was locked in on that cycle when it was generated — not whatever the subscription's amount happens to be by the time the charge actually runs. In practice, this means past cycles stay a reliable record of what was actually charged, no matter what happens to the subscription afterward.

### How anchor-day clamping works

Every subscription bills on the same day each cycle — its anchor day, set by the start date. Most months that's straightforward. The exception is a subscription anchored on the 29th, 30th, or 31st hitting a shorter month. AutoPay clamps the charge to the last real day of that month, then returns to the original anchor day as soon as the calendar allows it again.

Here's a subscription anchored on the 31st, working through the January–March cycles:

| Cycle | Anchor day | Bills on | Why |
|---|---|---|---|
| January | 31st | Jan 31 | The anchor day exists in January. |
| February | 31st | Feb 28 (Feb 29 in a leap year) | February has no 31st, so the charge clamps to the month's last day. |
| March | 31st | Mar 31 | March has a 31st again — the anchor day was never permanently moved. |

## Retries and dunning {#retries-and-dunning}

Not every card charge succeeds on the first try. AutoPay handles the follow-up automatically, so a single declined card doesn't need your team's attention.

- **How many attempts.** AutoPay makes one initial attempt plus a set number of retries — four attempts in total by default (one initial charge, three retries).
- **How they're spaced.** Retries run one hour apart, on a flat schedule — not the doubling delay you might expect from other billing systems.
- **What happens when every attempt fails.** The cycle is marked failed, the subscription moves to Past Due, and the customer receives a final-failure email with a link back to their self-service page so they can pay directly.

![The past-due self-service page: "We couldn't charge your card," the overdue-since date, the failed card flagged, and a Failed row in the payment history](/img/business/autopay/recovery-01-past-due.png)

:::warning AutoPay never cancels a past-due subscription on its own
A Past Due subscription stays Past Due indefinitely. AutoPay does not cancel it automatically, no matter how long the balance goes unpaid — it keeps waiting for the customer to pay, or for your team to cancel it directly. If you were assuming subscriptions eventually cancel themselves after enough failed attempts, they don't — build your own process (a scheduled report, a support workflow) around subscriptions that have been past due longer than you're comfortable with.
:::

## The customer self-service page {#customer-self-service-page}

Every subscription gets its own private page (the product calls it "Manage Subscription") — a link with a signed token that only that customer can use. Your team delivers the link; AutoPay hosts the page and keeps it in sync with the subscription's real state automatically, in English and Arabic.

From this page, a customer can:

- View their plan, status, and next charge date
- See every billing cycle — date, amount and outcome — including the next one, which is listed as **Scheduled** before it is charged
- Add a new card
- Switch which saved card is their active one
- Pay an outstanding balance directly
- Cancel their subscription
- Undo a cancellation that hasn't taken effect yet

### What a subscription looks like to your customer

The page is a single scrolling view — customer details, subscription summary, saved payment methods, and payment history all live on the one page; there's no separate screen to click into for billing history or cards. What it shows adapts to the subscription's state:

<StepGuide steps={[
  {
    title: "Active",
    description: <>Plan, status, next payment date, saved cards, and payment history on one page. Nothing is outstanding, so there is nothing to pay.</>,
    image: "/img/business/autopay/portal-01-summary-active.png",
    imageAlt: "Active subscription: customer details, subscription summary, payment methods, and payment history all on one page",
  },
  {
    title: "Trialing",
    description: <>A banner counts down to the trial's end, when the saved card is charged. Canceling first means no charge at all.</>,
    image: "/img/business/autopay/portal-02-trialing.png",
    imageAlt: "Trialing subscription with a banner counting down to the trial's end date",
  },
  {
    title: "Cancellation pending",
    description: <>Access runs to the end of the paid period, with <strong>Reactivate subscription</strong> available until then.</>,
    image: "/img/business/autopay/portal-03-canceled-pending-reactivation.png",
    imageAlt: "Canceled subscription pending the end of its period, with a Reactivate subscription option",
  },
  {
    title: "Expired",
    description: <>Billing stopped at the subscription's end date. History stays readable, every action is gone. Continuing means a new subscription.</>,
  },
  {
    title: "No cards saved",
    description: <>The empty state before a payment method is added. <strong>Add Card</strong> is the only action.</>,
    image: "/img/business/autopay/portal-05-no-cards.png",
    imageAlt: "Empty payment methods state with no saved cards",
  },
]} />

### Canceling a subscription

A cancellation the customer starts always takes effect at the end of their current billing period, never immediately — they keep access, and the option to change their mind, for whatever they've already paid for. If you need to cut a subscription off right away instead — a fraud case, a billing dispute — that's a merchant-side cancellation, and only your team can do it, immediately, via the AutoPay API.

<StepGuide steps={[
  {
    title: "Confirm the cancellation",
    description: <>The dialog states when access ends, that no further charges follow, and that reactivation stays open until then.</>,
    image: "/img/business/autopay/cancellation-01-confirm.png",
    imageAlt: "Cancellation confirmation dialog stating access continues until the end of the paid period",
  },
  {
    title: "Optional cancellation reason",
    description: <>A short reason list, clearly marked optional.</>,
    image: "/img/business/autopay/cancellation-02-reason-options.png",
    imageAlt: "Optional cancellation reason selection dialog",
  },
]} />

### Undoing a cancellation

As long as a canceled subscription hasn't reached the end of its period yet, the customer can undo the cancellation from the same page — one click, no new checkout needed.

![Reactivation confirmation previewing the plan, amount, and next renewal date before the customer confirms](/img/business/autopay/reactivation-01-confirm.png)

### Paying an outstanding balance

When a subscription is Past Due, **Pay Now** on the self-service page collects the outstanding balance immediately, using whichever saved card the customer picks.

<StepGuide steps={[
  {
    title: "Accept terms, if asked",
    description: <>Some gateways require the customer to accept terms before the charge runs.</>,
    image: "/img/business/autopay/recovery-03-payment-terms-alert.png",
    imageAlt: "Terms and conditions alert shown before completing an outstanding-balance payment",
  },
  {
    title: "Payment confirmed",
    description: <>The balance clears and the subscription returns to <a href="#subscription-lifecycle">Active</a>.</>,
    image: "/img/business/autopay/recovery-02-payment-confirmed.png",
    imageAlt: "Payment confirmed screen after clearing an outstanding balance",
  },
]} />

### Managing saved cards

Customers can hold several cards on file and switch which one is active with a single click. Adding a new card opens a standard card-entry form right on the page, and the newly added card can be made active immediately — the next charge then uses it instead of the previous one.

Saved cards are never deleted. AutoPay keeps every card a customer has used as part of the subscription's record, so a card that is no longer active still explains what paid for an earlier cycle. Switching the active card is the only card management a customer needs — there is no removal step to walk them through.

:::warning Regenerating a customer's link revokes the old one instantly
If you regenerate a subscription's self-service link, the previous link stops working immediately — and AutoPay does not tell the customer. Whatever channel delivered the first link (email, your own account area, a support reply), you need to deliver the new one the same way, or the customer is simply locked out with no explanation.
:::

### If a link stops working

A customer opening a page that's loading, expired, no longer recognized, or unreachable sees one of these instead of their subscription:

<StepGuide steps={[
  {
    title: "Loading",
    description: <>Shown while the page fetches the subscription.</>,
    image: "/img/business/autopay/states-01-loading.png",
    imageAlt: "Loading state while the self-service page fetches subscription details",
  },
  {
    title: "Link expired",
    description: <>Shown once a link has aged out. The page offers to email a fresh one; if you regenerated it yourself, send the new link directly.</>,
    image: "/img/business/autopay/states-02-magic-link-expired.png",
    imageAlt: "Expired self-service link screen",
  },
  {
    title: "Link not recognized",
    description: <>Shown for a malformed link, or one you have just regenerated away.</>,
    image: "/img/business/autopay/states-03-magic-link-invalid.png",
    imageAlt: "Invalid or unrecognized self-service link screen",
  },
  {
    title: "Connection problem",
    description: <>A fetch failure. The page confirms nothing has changed and invites a retry.</>,
    image: "/img/business/autopay/states-04-network-error.png",
    imageAlt: "Network error screen shown when the self-service page cannot reach the server",
  },
]} />

## Notifications {#notifications}

AutoPay sends three emails over a subscription's life, each available in English and Arabic, and each one can be switched off individually per subscription if you don't want it sent.

| Billing frequency | Reminders before the charge | When |
|---|---|---|
| Monthly | 1 | 2 days before |
| Yearly | 3 | 30, 10, and 3 days before |

### Upcoming charge

Sent before money moves, so a declined or forgotten card doesn't come as a surprise.

<StepGuide steps={[
  {
    title: "English",
    description: <>Amount, billing date, and the card on file, with a link to manage the subscription.</>,
    image: "/img/business/autopay/notifications-01-upcoming-charge-en.png",
    imageAlt: "Upcoming charge reminder email in English",
  },
  {
    title: "Arabic",
    description: <>The same reminder, fully localized.</>,
    image: "/img/business/autopay/notifications-02-upcoming-charge-ar.png",
    imageAlt: "Upcoming charge reminder email in Arabic",
  },
]} />

### Payment failed

Sent when a charge attempt fails and AutoPay still has retries left to run — a chance for the customer to update their card before the automatic retries continue.

<StepGuide steps={[
  {
    title: "English",
    description: <>The failure reason, when the next retry runs, and a link to update the card.</>,
    image: "/img/business/autopay/notifications-03-payment-failed-en.png",
    imageAlt: "Payment failed email in English",
  },
  {
    title: "Arabic",
    description: <>The same notice, fully localized.</>,
    image: "/img/business/autopay/notifications-04-payment-failed-ar.png",
    imageAlt: "Payment failed email in Arabic",
  },
]} />

### Final failure

Sent once every retry on a cycle has been used up — see [Retries and dunning](#retries-and-dunning) — with a direct link back to the customer's self-service page so they can clear the balance.

:::note What "suspension" means in this email
The final-failure email talks about the customer's access being suspended — that describes what happens in *your* product, not in AutoPay. AutoPay itself never suspends, cancels, or otherwise changes the subscription on its own; it stays Past Due until it's paid or your team cancels it. Whether — and how — you restrict access for a Past Due customer in your own app is entirely your call.
:::

<StepGuide steps={[
  {
    title: "English",
    description: <>The outstanding balance, why every retry failed, and what happens next in your product.</>,
    image: "/img/business/autopay/notifications-05-final-failure-en.png",
    imageAlt: "Final failure email in English with outstanding balance and next steps",
  },
  {
    title: "Arabic",
    description: <>The same notice, fully localized.</>,
    image: "/img/business/autopay/notifications-06-final-failure-ar.png",
    imageAlt: "Final failure email in Arabic with outstanding balance and next steps",
  },
]} />

## Setting up AutoPay {#setting-up-autopay}

AutoPay is available today as an API-only integration — your developers call the API to create, look up, and cancel subscriptions. There's no merchant dashboard for it yet.

Before your first subscription, make sure you have:

1. **AutoPay enabled for your account.** This isn't a self-serve toggle yet — ask Ottu support to turn it on.
2. **A support email.** It appears on the customer's self-service page and in the footer of every AutoPay email, so customers have somewhere to go when something looks wrong.
3. **A privacy policy URL.** It's linked from the footer of every AutoPay email, alongside the support email.
4. **At least one tokenizable payment gateway that supports auto-debit, in the currency you're billing in.** AutoPay needs somewhere to actually save and charge the customer's card.
5. **The three notification templates registered, in English and Arabic** — upcoming charge, payment failed, and final failure. Ottu support sets these up on your account, the same way [notification templates](/business/notifications/) are configured for one-off payments.

AutoPay has no plan catalog to configure up front — there's no separate list of products or prices to set up in advance. The plan name is just a free-text label, and the price is whatever amount your team passes when it makes the checkout call that creates the subscription. See the [developer AutoPay docs](/developers/payments/autopay/#api-reference) for the exact request shape.

:::note No merchant dashboard yet
Everything above — enabling AutoPay, creating a subscription, looking one up, canceling it — happens through the API or through Ottu support today. A dashboard view of your AutoPay subscriptions is planned for a later phase.
:::

## Things to know {#things-to-know}

- **A Past Due subscription never cancels itself.** It stays Past Due until the customer pays or your team cancels it — see [Retries and dunning](#retries-and-dunning).
- **A zero first charge starts a trial, not an active subscription.**
- **Cycles are generated one at a time.** The next one isn't created until the current one is paid — see [Billing cycles](#billing-cycles).
- **The amount on a cycle is locked in when that cycle is generated**, not read fresh from the subscription at charge time.
- **Regenerating a customer's self-service link kills the old one instantly, silently.** Deliver the new one yourself.
- **A customer's own cancellation always waits until the end of their paid period.** Only your team, via the API, can cancel immediately.
- **There's no merchant dashboard yet.** AutoPay is API-only, with Ottu support handling account-level setup, in this phase.

## FAQ {#faq}

<FAQ>
  <FAQItem question="Does a past-due subscription ever cancel on its own?">
    No — it stays Past Due indefinitely until the customer pays or your team cancels it. This is the single most important thing to know about AutoPay's retry behavior. See [Retries and dunning](#retries-and-dunning).
  </FAQItem>
  <FAQItem question="What happens when a card fails on every retry?">
    The cycle is marked failed, the subscription moves to Past Due, and the customer gets a final-failure email with a link to pay directly.
  </FAQItem>
  <FAQItem question="Can I cancel a customer's subscription immediately?">
    Yes, but only your team can — via the API. A cancellation the customer starts themselves always waits until the end of their current period.
  </FAQItem>
  <FAQItem question="Does my customer get notified when I regenerate their self-service link?">
    No. The old link stops working the instant you regenerate, and AutoPay doesn't tell the customer — you need to deliver the new link yourself.
  </FAQItem>
  <FAQItem question="What happens if the first charge on a new subscription is zero?">
    It starts in Trialing instead of Active. The real charge happens at the next billing cycle.
  </FAQItem>
  <FAQItem question="How does a past-due subscription get back to active?">
    The customer pays the outstanding balance from their self-service page. There's no separate merchant-side action that does this.
  </FAQItem>
  <FAQItem question="Can I change the price of a subscription that's already running?">
    Not today — AutoPay doesn't currently expose a way to edit an existing subscription's amount. If pricing changes, cancel the existing subscription and create a new one at the new price.
  </FAQItem>
  <FAQItem question="Is there a dashboard where I can see all my AutoPay subscriptions?">
    Not yet. Ask your developers to look one up via the API, or contact Ottu support — a dashboard view is planned for a later phase.
  </FAQItem>
  <FAQItem question="Can a customer have more than one card on file?">
    Yes, and they can switch which one is active from their self-service page at any time.
  </FAQItem>
  <FAQItem question="Does AutoPay support Arabic?">
    Yes — every AutoPay email and the self-service page itself both offer an Arabic toggle.
  </FAQItem>
  <FAQItem question="What happens if a customer clicks a link that's expired or been replaced?">
    They land on a plain "link expired" or "link not recognized" page instead of their subscription. If you've regenerated their link, send them the new one rather than waiting for them to request one themselves.
  </FAQItem>
</FAQ>

## What's Next? {#whats-next}

- [AutoPay for developers](/developers/payments/autopay/) — API integration and the full request/response contract.
- [Notifications](/business/notifications/) — configuring email, SMS, and WhatsApp templates generally.
- [Payment Management](/business/payment-management/) — viewing individual AutoPay charges alongside all other transactions.
- [Settings → API Keys](/business/settings/api-keys) — the credentials your developers need to call the AutoPay API.
