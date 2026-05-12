---
title: Wallet at Checkout
sidebar_label: Wallet at Checkout
---

import WalletScenarios from "@site/src/components/WalletScenarios";

# Wallet at Checkout

This page explains what your customer sees when they have a wallet balance and reach checkout — so you can answer support questions and design messaging on your own site.

## The customer's experience

<WalletScenarios />

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
