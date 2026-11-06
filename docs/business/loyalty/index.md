---
title: Loyalty
sidebar_label: Loyalty
description: "Let customers earn loyalty points on every payment, and understand how points are rewarded, reversed, and returned when you refund."
toc_min_heading_level: 2
toc_max_heading_level: 3
---

# Loyalty

Loyalty lets your customers **earn points** every time they pay. When a payment is completed, Ottu rewards the customer's account at the loyalty provider — the customer sees nothing extra at checkout, and the points simply appear in their loyalty account. If you later refund the order, Ottu takes the reward back for you and, when the customer paid with points, returns those points too.

## Why use Loyalty {#why-use-loyalty}

- **Reward customers without running a points system.** The loyalty provider keeps the points balance; you don't build or reconcile a ledger of your own.
- **Keep liability tied to real revenue.** When you refund an order, the points the customer earned on it are reversed automatically, so you never pay out points on money you gave back.
- **Make refunds painless when points were spent.** If a customer paid with redeemed points, a refund puts those points back in their account in the same step.
- **Add providers without rework.** The experience is the same for every provider, so new loyalty programs can be switched on for your account without changing how your team works.

:::tip Building the integration?
This page covers what Loyalty does for your business. The request fields, webhooks and API behaviour your developers need are in the [developer Loyalty docs](/developers/payments/loyalty).
:::

## How it works {#how-it-works}

1. **Your team marks a payment as rewardable** when the payment is created. This is done by your developers as part of the integration — it is not something a customer or a dashboard user has to do.
2. **The customer pays as usual.** There is no extra screen and nothing for them to confirm.
3. **The payment is completed.** Ottu checks that the payment qualifies for a reward.
4. **The reward is issued** to the customer's account at the loyalty provider shortly after the payment is confirmed. The customer sees the points in their provider account.
5. **If you refund**, the reward is reduced by the same proportion as the money you refund.

Ottu works out which loyalty program to use from the payment gateway the customer paid through, so you never choose a provider per payment.

## Supported providers {#supported-providers}

Loyalty works the same way for every provider. What differs is how the customer is identified and the provider's own rules. As new providers are enabled, they are listed here.

### STC Qitaf {#stc-qitaf}

STC Qitaf is the loyalty program of STC in Saudi Arabia.

- **Customer identified by:** their Saudi mobile number — not by your own customer ID.
- **Currency:** Saudi riyal (`SAR`) only. Payments in any other currency do not earn points.
- **What earns:** the money actually paid, in whole currency units. Anything below one riyal does not earn.
- **Earning rate:** set by STC under your Qitaf contract, not by Ottu.

## What the reward is calculated on {#what-the-reward-is-calculated-on}

The reward is based on the **money actually paid** — the payment gateway portion plus any real-money wallet credit. Value funded by redeemed loyalty points is excluded, so points never earn more points.

Amounts are sent to the provider as whole currency units: a payment basis of `10.99 SAR` is sent as `10`, and the cents do not earn. STC then applies its own earning rate to that figure, so the number of points a customer receives depends on your Qitaf contract.

## Earning vs. redeeming {#earning-vs-redeeming}

Earning and redeeming are two separate things:

- **Earning** — the customer receives points for a payment. Nothing is asked of the customer.
- **Redeeming** — the customer spends points they already have to pay. They enter their mobile number and confirm with a one-time password at checkout. This is SAR-only and is offered as a payment method in the checkout.

One order can do both: the customer redeems points toward part of the balance, then earns points on the money portion that remains.

## When a payment earns no reward {#when-no-reward}

A payment can complete normally and still earn nothing. In every case below the payment itself is not affected, and no error is shown to you or the customer.

- **The payment was not marked as rewardable.** Your integration did not opt the payment in.
- **The customer's mobile number was missing or invalid.** For Qitaf, only a valid Saudi mobile number can be rewarded.
- **The gateway is not linked to a loyalty service.** The reward depends on the gateway that actually settled the payment.
- **The currency does not match the loyalty service.** For Qitaf this means anything other than `SAR`.
- **The payment was authorization-only.** Only immediate-capture purchases earn.
- **The payment was funded entirely by redeemed points.** Points never earn points.
- **The payment was already rewarded.** A payment is never rewarded twice.

Because a skipped reward is silent, ask your developers to follow the checks in [Loyalty best practices](/developers/payments/loyalty#best-practices) and confirm each gateway with Ottu before going live.

## Refunding an order paid with points {#refund-rules}

When a customer **redeemed** points at checkout, the order is recorded as a parent transaction with one child row per funding source: one for the points and, on a split payment, one for the gateway payment. Refunding such an order has two halves that always run in a fixed order. These are the rules.

#### Gateway money first, points second {#rule-order}

Until the gateway portion is fully refunded, nothing returns the points: **Refund** on the parent only offers the gateway money still owed. A refund that is still waiting for approval counts as outstanding.

#### The last gateway refund returns the points {#rule-trigger}

The refund that leaves nothing owed through the gateway also returns the points, in the same request. An order paid with points only has no gateway portion, so **Refund** on the parent returns the points directly.

#### One door: the parent transaction {#rule-one-door}

Points only come back through the parent. The points row has no actions, and a refund aimed at the points row is refused.

#### Always the full amount {#rule-amount}

The whole redeemed amount comes back in one step. There is nothing to enter and no partial return.

#### Only once {#rule-once}

A second return — by hand, by a retry, or by an automatic run landing after a manual one — is refused, and two simultaneous requests book exactly one.

#### Recoverable if the provider is unavailable {#rule-recoverable}

If Qitaf times out or answers with a temporary error, nothing is booked and the gateway refund is not affected. Ottu retries on its own every few minutes, and **Refund** on the parent offers the points value so an operator can return them by hand in the meantime. If Qitaf answers that the redemption can no longer be reversed — for example the reversal window has passed — **Refund** stops offering the points and the customer has to be refunded another way.

#### Earned points are not touched {#rule-reward}

Returning redeemed points does **not** reduce the points the customer earned — the money refund already did that.

#### How the return is recorded {#rule-records}

A successful return adds a *Refunded* child row for the points amount under the parent, so the parent's refunded amount reaches the order total.

The exact dashboard steps, the messages your team may see, and the two-step approval flow are in [Refunding Orders Paid with Qitaf Points](/business/operations/qitaf-points-refund).

## How a points-only order is listed {#points-only-listing}

A wallet is a payment service, not a payment gateway, so an order paid **entirely** with redeemed points has no gateway of its own. In the transaction list and details, its **Gateway Name** shows the wallet's name — for example `Qitaf` — in the dashboard user's language, instead of an internal placeholder. It keeps that name after the points are returned. A split order lists its card gateway.

## Setting up Loyalty {#setting-up-loyalty}

Loyalty is set up by Ottu, not from the dashboard. Contact your Ottu account manager to confirm that:

1. **A Qitaf service is active on your account**, with the credentials STC issued to you.
2. **The service is linked to each payment gateway you want to reward through.** This is the step most often missed — a payment routed through an unlinked gateway earns nothing.
3. **The service currency matches your payments.** Qitaf operates in `SAR` only.

Then ask your developers to enable loyalty on your payments — see the [developer Loyalty docs](/developers/payments/loyalty).

## Things to know {#things-to-know}

- **Ottu cannot show you whether a reward arrived.** The outcome is not reported back in the dashboard, so reconcile your rewarded orders against STC's own reporting from time to time.
- **There is no automatic retry for a reward.** If the provider is unreachable at the moment the reward is sent, that reward is not issued.
- **Rewards are tied to money, not to points.** Points the customer spent never earn new points.

## FAQ {#faq}

**Does the customer see anything different at checkout?**
No. Earning happens entirely behind the scenes. The customer sees a normal checkout, and their points appear in their loyalty account afterwards.

**What happens to points when I refund?**
Two things, depending on which points you mean. Points the customer **earned** on the order are reduced automatically, in proportion to the money you refund. Points the customer **redeemed** to pay come back to their account when the gateway portion is fully refunded — or directly through **Refund** on the parent for a points-only order.

**Can I return only part of the redeemed points?**
No. Redeemed points are always returned in full. If the customer should get back only part of the order's value, refund that part from the gateway portion and leave the points alone.

**Why does Refund not offer the points on a refunded order?**
Either the gateway portion is not fully refunded yet (a refund waiting for approval still counts), the points were already returned, or Qitaf answered that the redemption can no longer be reversed. The operator sees the exact reason when they try.

**Which currencies are supported?**
A Qitaf service operates in exactly one currency, configured by Ottu — `SAR` in practice. Payments in any other currency do not earn points.

## What's Next?

- [Refunding Orders Paid with Qitaf Points](/business/operations/qitaf-points-refund) — the dashboard workflow, step by step.
- [Payment Gateways](/business/payments/gateways) — the gateways a loyalty service is linked to.
- [M-Wallet](/business/wallet) — store credit that can be combined with loyalty points.
- [Two-Step Refund & Void Authorization](/business/operations/two-step-authorization) — approval for refunds and point returns.
- **For developers:** [Loyalty integration](/developers/payments/loyalty) — request fields, webhooks and API behaviour.
