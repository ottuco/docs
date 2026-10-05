---
title: AutoPay
sidebar_label: AutoPay
description: "AutoPay runs subscriptions for you: it charges the saved card on schedule, retries failed payments, emails your customer, and gives them a page to manage it."
toc_min_heading_level: 2
toc_max_heading_level: 3
---

import StepGuide from "@site/src/components/StepGuide";
import FAQ, { FAQItem } from "@site/src/components/FAQ";
import AutoPaySequenceDiagram from "@site/src/diagrams/AutoPaySequenceDiagram";

# AutoPay

AutoPay turns a [subscription](/glossary/#term-subscription) into a single checkout call. After that, it generates every [billing cycle](/glossary/#term-billing-cycle), charges the saved card, retries failed charges, emails the customer, and hosts a page where they manage their own subscription.

Building the integration? See [AutoPay for developers](/developers/payments/autopay/).

## Why use AutoPay {#why-use-autopay}

- **Run subscriptions without building a billing engine.** AutoPay owns the schedule, the retries, the [dunning](/glossary/#term-dunning) emails, and the customer page. Your integration is one checkout call per subscription.
- **Recover failed payments automatically.** AutoPay retries every declined card and emails the customer at each stage, so a renewal doesn't lapse unnoticed.
- **Give customers somewhere to self-serve.** Status, billing history, saved cards, and cancellation live on one page you send them.

The difference is who owns the billing schedule after the first charge:

| | Self-managed recurring billing | AutoPay subscriptions |
|---|---|---|
| Billing schedule | Your system decides when to charge | AutoPay decides when to charge |
| Failed payments | Your team retries and follows up | AutoPay retries automatically and emails the customer |
| Cancel, swap card, pay a balance | You build and host that experience | AutoPay hosts a ready-made self-service page |
| What your integration does | Calls the charge API on every cycle | Makes one checkout call, once, at signup |

## How it works {#how-it-works}

This is the whole journey, from signup to recovery. Each step below links to the section that explains it.

<AutoPaySequenceDiagram />

1. **You create the subscription** with one checkout call. [Setup](#setting-up-autopay)
2. **Your customer pays the first charge.** [Billing cycles](#lifecycle-and-billing-cycles)
3. **Your customer gets the self-service link** in every AutoPay email. You can send it too. [Self-service page](#the-self-service-page)
4. **A reminder email arrives** before each charge. [Emails](#the-emails)
5. **AutoPay charges the saved card** on each billing date. [Billing cycles](#lifecycle-and-billing-cycles)
6. **If a charge fails,** AutoPay retries it and emails the customer. [Failed payments](#when-a-payment-fails)
7. **The final email** links the customer straight to paying the balance. [Emails](#the-emails)
8. **Your customer pays,** and the subscription is active again. [Failed payments](#when-a-payment-fails)

## What your customer sees {#what-your-customer-sees}

Your customer gets two things: emails and one private page. AutoPay hosts both.

### The emails {#the-emails}

AutoPay sends an upcoming-charge reminder, a payment-failed notice, and a final-failure notice. You can switch each one off per subscription, and all of them are also available in Arabic. Reminders go out ahead of each charge:

| Billing frequency | Reminders | When |
|---|---|---|
| Monthly | 1 | 2 days before |
| Yearly | 3 | 30, 10, and 3 days before |

<StepGuide steps={[
  {
    title: "Upcoming charge",
    description: <>Sent before money moves. Shows the amount, billing date, and card on file, with a link to manage the subscription.</>,
    image: "/img/business/autopay/notifications-01-upcoming-charge-en.png",
    imageAlt: "Upcoming charge reminder email in English",
  },
  {
    title: "Payment failed",
    description: <>Sent after a failed attempt while retries remain. Shows the reason, when the next retry runs, and a link to update the card.</>,
    image: "/img/business/autopay/notifications-03-payment-failed-en.png",
    imageAlt: "Payment failed email in English",
  },
  {
    title: "Final failure",
    description: <>Sent when every retry is used up. Shows the outstanding balance and links the customer straight to paying it.</>,
    image: "/img/business/autopay/notifications-05-final-failure-en.png",
    imageAlt: "Final failure email in English with outstanding balance and next steps",
  },
  {
    title: "Final failure in Arabic",
    description: <>The same notice, fully localized.</>,
    image: "/img/business/autopay/notifications-06-final-failure-ar.png",
    imageAlt: "Final failure email in Arabic with outstanding balance and next steps",
  },
]} />

The final email may talk about suspended access. That describes your product. AutoPay itself never suspends or cancels a subscription because a payment failed.

### The self-service page {#the-self-service-page}

Every subscription gets its own private page, reached through a private link. Treat it like a password: anyone holding the link can open the page. The link is in every AutoPay email, and you can also send it yourself, for example at signup. AutoPay hosts the page, keeps it in sync with the subscription, and shows it in English and Arabic.

From this page, a customer can:

- **See** their plan, status, and next charge date.
- **Review billing history**, including the next cycle, listed as **Scheduled** until it is charged.
- **Add a card**, or switch which saved card is active.
- **Pay** an outstanding balance.
- **Cancel**, or undo a pending cancellation.

What the page shows depends on the subscription's state:

<StepGuide steps={[
  {
    title: "Active",
    description: <>Plan, status, next payment date, saved cards, and payment history on one page. Nothing is outstanding.</>,
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
    title: "Past due",
    description: <>The page shows the overdue date and the failed card, with <strong>Pay Now</strong> to clear the balance.</>,
    image: "/img/business/autopay/recovery-01-past-due.png",
    imageAlt: "The past-due self-service page: overdue-since date, the failed card flagged, and a Failed row in the payment history",
  },
  {
    title: "Expired",
    description: <>Billing stopped at the end date. History stays readable and every action is gone. Continuing means a new subscription.</>,
    image: "/img/business/autopay/portal-04-expired.png",
    imageAlt: "Expired subscription: billing stopped at the end date, actions removed, history still readable",
  },
]} />

And these are the actions a customer can take:

<StepGuide steps={[
  {
    title: "Add a card",
    description: <>A secure card form opens on the page. The new card can become active immediately, and the next charge uses it.</>,
    image: "/img/business/autopay/cards-02-add-card.png",
    imageAlt: "Adding a card: a secure checkout where the customer enters and saves a new card to the subscription",
  },
  {
    title: "Confirm a cancellation",
    description: <>The dialog states when access ends and that no further charges follow.</>,
    image: "/img/business/autopay/cancellation-01-confirm.png",
    imageAlt: "Cancellation confirmation dialog stating access continues until the end of the paid period",
  },
  {
    title: "Give a reason",
    description: <>A short reason list, clearly marked optional.</>,
    image: "/img/business/autopay/cancellation-02-reason-options.png",
    imageAlt: "Optional cancellation reason selection dialog",
  },
  {
    title: "Undo the cancellation",
    description: <>One click, no new checkout. The dialog previews the plan, amount, and next renewal date.</>,
    image: "/img/business/autopay/reactivation-01-confirm.png",
    imageAlt: "Reactivation confirmation previewing the plan, amount, and next renewal date before the customer confirms",
  },
  {
    title: "Accept terms, if asked",
    description: <>Some gateways require the customer to accept terms before paying an outstanding balance.</>,
    image: "/img/business/autopay/recovery-03-payment-terms-alert.png",
    imageAlt: "Terms and conditions alert shown before completing an outstanding-balance payment",
  },
  {
    title: "Payment confirmed",
    description: <>The balance clears and the subscription returns to Active.</>,
    image: "/img/business/autopay/recovery-02-payment-confirmed.png",
    imageAlt: "Payment confirmed screen after clearing an outstanding balance",
  },
]} />

:::note A customer's cancellation waits for the end of the paid period
It never takes effect immediately. Only your team can cancel immediately, through the API. Undo is available while an active subscription's cancellation is pending.
:::

Customers can hold several cards and switch the active one in a click. AutoPay never deletes saved cards, so an old card still explains what paid an earlier cycle.

:::warning Regenerating a link revokes the old one
The previous link stops working instantly, and AutoPay doesn't notify the customer. Deliver the new link the same way you delivered the first, or the customer is locked out.
:::

A regenerated link shows "link expired". A mistyped link shows "link not recognized". Links never expire on their own.

## When a payment fails {#when-a-payment-fails}

- **Four attempts by default.** That is one initial charge plus three retries, spaced one hour apart.
- **The customer is emailed** after each failed attempt while retries remain, so they can update their card.
- **After the last attempt,** the subscription moves to Past Due. The customer gets the final email with a link to pay.
- **Paying the balance** returns the subscription to Active.

:::warning AutoPay never cancels a past-due subscription
It stays Past Due until the customer pays or your team cancels it. Build your own process for subscriptions that stay past due longer than you are comfortable with.
:::

## Lifecycle and billing cycles {#lifecycle-and-billing-cycles}

A subscription moves through seven states. Canceled and Expired are final.

| State | What it means |
|---|---|
| Pending setup | Created and waiting for the first charge to resolve. |
| Trialing | The first charge was zero, so no money has moved. The customer has access now, and the first real charge comes at the next billing cycle. |
| Active | Billing normally. The latest cycle was paid. |
| Past Due | Every retry on a cycle failed. The subscription is not canceled. It waits for the balance to be paid. |
| Canceled | Billing has stopped and access has ended. A customer's cancellation lands here at the end of the paid period. Your team's immediate cancel lands here at once. |
| Expired | Billing stopped because the subscription reached its end date. |
| Setup Failed | The customer never completed the first payment. AutoPay doesn't retry it. Create a new subscription. |

AutoPay creates [billing cycles](/glossary/#term-billing-cycle) one at a time. The next cycle exists only once the current one is paid. Each cycle locks its amount when it is generated, so past cycles stay a reliable record of what was charged.

### Anchor days

Every subscription bills on its anchor day, set by the start date. One anchored on the 29th, 30th, or 31st is clamped to the last day of a shorter month, then returns to its anchor day. Here is a subscription anchored on the 31st:

| Cycle | Anchor day | Bills on | Why |
|---|---|---|---|
| January | 31st | Jan 31 | The anchor day exists in January. |
| February | 31st | Feb 28 (Feb 29 in a leap year) | February has no 31st, so the charge clamps to the last day. |
| March | 31st | Mar 31 | March has a 31st again. The anchor day never moved. |

## Setting up AutoPay {#setting-up-autopay}

AutoPay is an API-only integration. Your developers call the API to create, look up, and cancel subscriptions. There is no AutoPay screen in the dashboard.

Before your first subscription, make sure you have:

1. **AutoPay enabled for your account.** Ask Ottu support to turn it on.
2. **A support email.** It appears on the customer's page and in the footer of every AutoPay email.
3. **A privacy policy URL.** It is linked from the footer of every AutoPay email.
4. **A tokenizable payment gateway that supports auto-debit,** in the currency you bill in. AutoPay needs somewhere to save and charge the card.
5. **The three notification templates registered,** in English and Arabic. Ottu support sets these up, the same way [notification templates](/business/notifications/) work for one-off payments.

AutoPay has no plan catalog. The plan name is a free-text label, and the price is the amount your team passes in the checkout call that creates the subscription. The [developer docs](/developers/payments/autopay/#api-reference) show the request shape.

## Things to know {#things-to-know}

- **A Past Due subscription never cancels itself.** See [When a payment fails](#when-a-payment-fails).
- **A customer's cancellation waits for the end of the paid period.** See [The self-service page](#the-self-service-page).
- **Regenerating a link silently revokes the old one.** Deliver the new link yourself. See [The self-service page](#the-self-service-page).
- **A zero first charge starts a trial,** not an active subscription. See [Lifecycle](#lifecycle-and-billing-cycles).
- **A cycle's amount is locked when it is generated,** not read fresh at charge time. See [Lifecycle and billing cycles](#lifecycle-and-billing-cycles).

## FAQ {#faq}

<FAQ>
  <FAQItem question="Can I cancel a customer's subscription immediately?">
    Yes, but only your team can, through the API. A cancellation the customer starts always waits for the end of their paid period.
  </FAQItem>
  <FAQItem question="Can I change the price of a subscription that's already running?">
    No. AutoPay has no way to edit a running subscription's amount. Cancel it and create a new one at the new price.
  </FAQItem>
  <FAQItem question="What happens when my customer's card expires?">
    The charge fails like any other declined card. AutoPay retries and emails the customer. If every attempt fails, the subscription moves to Past Due. The customer can add a new card and pay from their self-service page.
  </FAQItem>
  <FAQItem question="Can a customer have more than one card on file?">
    Yes. They can switch the active card from their self-service page at any time.
  </FAQItem>
  <FAQItem question="Does AutoPay support Arabic?">
    Yes. Every AutoPay email and the self-service page itself offer Arabic.
  </FAQItem>
  <FAQItem question="What if a customer opens a link that was replaced?">
    They see a "link expired" page instead of their subscription. Send them the new link yourself. AutoPay doesn't offer to email one.
  </FAQItem>
</FAQ>

## What's Next? {#whats-next}

- [AutoPay for developers](/developers/payments/autopay/): API integration and the full request/response contract.
- [Notifications](/business/notifications/): configuring email, SMS, and WhatsApp templates generally.
- [Payment Management](/business/payment-management/): find and manage your transactions.
- [Settings → API Keys](/business/settings/api-keys): the credentials your developers need to call the AutoPay API.
