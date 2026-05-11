---
title: Refund to Wallet
sidebar_label: Refund to Wallet
---

import StepGuide from "@site/src/components/StepGuide";

# Refund to Wallet

Refunding to wallet credits the customer's wallet balance instead of returning funds through the payment gateway. The customer can spend the credit on their next order.

## When to use this

- The customer's card has expired and a gateway refund would fail.
- You want to issue store credit, loyalty, or goodwill credit without payment-gateway fees.
- You are processing a goodwill compensation that wasn't tied to a specific payment.

## Workflow

<StepGuide steps={[
  {
    title: "Open the transaction",
    description: <>From <strong>Payment Management</strong>, open the paid transaction you want to refund.</>,
    image: "/img/business/wallet/refund-01-transaction.png",
    imageAlt: "Paid transaction opened in Payment Management",
  },
  {
    title: "Click Refund",
    description: <>Use the <strong>Refund</strong> button in the operations panel.</>,
    image: "/img/business/wallet/refund-02-refund-button.png",
    imageAlt: "Refund button highlighted in the operations panel",
  },
  {
    title: "Choose destination: Wallet",
    description: <>In the refund dialog, switch destination from <strong>Original Gateway</strong> to <strong>Wallet</strong>.</>,
    image: "/img/business/wallet/refund-03-destination.png",
    imageAlt: "Refund dialog with Wallet destination selected",
  },
  {
    title: "Confirm amount and submit",
    description: <>Enter the full or partial refund amount, add an optional reason, and click <strong>Confirm</strong>. The wallet balance is credited immediately.</>,
    image: "/img/business/wallet/refund-04-confirm.png",
    imageAlt: "Confirming the wallet refund amount",
  },
  {
    title: "See the confirmation",
    description: <>A success banner shows the new wallet balance for the customer. The refund appears in both the transaction history and the wallet ledger.</>,
    image: "/img/business/wallet/refund-05-success.png",
    imageAlt: "Refund-to-wallet success banner showing new balance",
  },
]} />

## What customers see

The next time the customer reaches checkout in your store (same currency), they'll see **Wallet (X.XXX KWD)** as a payment method. For the full customer-side flow, see [Wallet at checkout](./using-wallet-at-checkout).

## FAQ

#### Can I refund partial amounts to wallet?

Yes. Enter any amount up to the original payment amount.

#### Can I refund to a wallet that doesn't exist yet?

Yes. If the customer has no wallet account for that currency, one is created automatically on the first refund.

#### Can I undo a refund-to-wallet?

You cannot edit or delete the original credit — wallet history is immutable. You can issue an opposing debit entry (a reversal) to offset it. Contact [csd@ottu.com](mailto:csd@ottu.com) if you need help raising a reversal.

#### Does the customer get notified?

No, customers are not notified automatically when a wallet credit is issued today. If you want to notify them, message them through your own channels.

## What's Next?

- [Wallet at checkout](./using-wallet-at-checkout) — what the customer sees when paying.
- [Wallet reporting](./reporting) — auditing wallet balances and history.
