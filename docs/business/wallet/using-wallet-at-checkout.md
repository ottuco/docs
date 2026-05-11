---
title: Wallet at Checkout
sidebar_label: Wallet at Checkout
---

import StepGuide from "@site/src/components/StepGuide";

# Wallet at Checkout

This page explains what your customer sees when they have a wallet balance and reach checkout — so you can answer support questions and design messaging on your own site.

## The customer's experience

<StepGuide steps={[
  {
    title: "Wallet appears as a method",
    description: <>If the customer has balance in the order currency, <strong>Wallet (X.XXX KWD)</strong> shows up alongside other payment methods.</>,
    image: "/img/business/wallet/checkout-01-method.png",
    imageAlt: "Checkout showing Wallet as a payment method",
  },
  {
    title: "Full coverage",
    description: <>If the wallet balance is enough to cover the order, only the order amount is deducted. Any surplus stays in the wallet for the next order.</>,
    image: "/img/business/wallet/checkout-02-full.png",
    imageAlt: "Wallet fully covering the order amount",
  },
  {
    title: "Partial coverage",
    description: <>If the balance is smaller than the order, the customer is prompted to choose a second method for the remainder. Both payments confirm together at submit.</>,
    image: "/img/business/wallet/checkout-03-partial.png",
    imageAlt: "Wallet plus another method for partial coverage",
  },
  {
    title: "Reservation while paying",
    description: <>Wallet funds are reserved the moment the customer hits <strong>Pay</strong> — they cannot be spent twice in parallel sessions.</>,
    image: "/img/business/wallet/checkout-04-reservation.png",
    imageAlt: "Reservation hold placed on wallet funds during payment",
  },
  {
    title: "Automatic release",
    description: <>If the customer abandons checkout or the payment fails, the reservation is released automatically after about four hours. No action is needed from your team.</>,
    image: "/img/business/wallet/checkout-05-release.png",
    imageAlt: "Reserved wallet funds released automatically after four hours",
  },
]} />

:::note Reservation auto-release
If a customer abandons, cancels, or fails a payment, the reserved wallet amount is restored to their balance about **four hours** later. The wait is intentional — it gives slow gateway confirmations time to land. There is no human in the loop.
:::

## Rules customers cannot change

- They cannot choose how much wallet credit to apply — Ottu deducts the required amount automatically, no more.
- They cannot transfer credit between currencies — each currency has its own wallet.
- They cannot use wallet on authorize-only orders. Wallet supports immediate-capture flows only.

:::warning Cross-currency wallet payments are not supported
The wallet only appears when its currency matches the order currency.
:::

## What you can do

- Display the customer's wallet balance on your own site or app — call the [Wallet Accounts API](/developers/payments/wallet/#api-reference).
- Refund any future order to the same wallet to top it up.
- View full credit and debit history per customer in [Wallet reporting](/business/wallet/reporting).

## FAQ

#### Why doesn't wallet show for some orders?

The order may be authorize-only, the customer may have zero balance in that currency, or the `customer_id` may differ between sessions. Check the order's `customer_id` matches the wallet's.

#### What happens if the customer disputes the original payment after the refund-to-wallet?

Disputes can be resolved manually. Contact [csd@ottu.com](mailto:csd@ottu.com) to raise a reversal.

#### Does wallet credit expire?

No, wallet credit does not expire today.

#### If a customer cancels or their payment fails, when do they get their wallet credit back?

Reserved wallet funds are automatically restored about four hours after an abandoned, cancelled, or failed payment. No action is needed.

## What's Next?

- [Refund to wallet](/business/wallet/refund-to-wallet) — issuing wallet credits.
- [Wallet reporting](/business/wallet/reporting) — auditing balances and history.
