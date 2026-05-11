---
title: Wallet
sidebar_label: Wallet
---

# Wallet

Wallet is a stored balance you can grant to a customer in any currency you accept. Once a customer has wallet credit, they can spend it at checkout — fully or partially — on any future order with your business.

## Why use Wallet

- **Refund without returning funds to the original card.** Useful when cards expire, or when you want to issue store credit instead of cash back.
- **Issue goodwill credit or promotional balances** without payment-gateway fees.
- **Reduce PG fees on future orders.** Customers spend wallet credit first; card only covers the remainder.

## How it works

1. **Customer pays for an order** using any payment method.
2. **You refund to wallet** instead of refunding to their card — one action in the dashboard.
3. **Customer returns** for a future order with your business.
4. **They pay with wallet** — fully if the balance covers it, partially with another method otherwise.

## When wallet is offered to the customer

The wallet shows up as a payment method when **both** conditions are met:

- The customer has positive balance in the same currency as the order.
- The order is set to capture immediately. Authorize-only orders do not show wallet.

:::warning Cross-currency wallet payments are not supported
A KWD wallet cannot be used to pay a SAR order, and vice versa. Each currency maintains a separate wallet balance.
:::

## Things to know

- **One wallet per currency.** A customer who buys in both KWD and SAR has two separate wallet balances.
- **No PII.** The wallet service stores only the customer ID and balance — no card details, no personal information.
- **Automatic release.** If a customer abandons checkout, their reserved wallet funds are released automatically after about four hours. No action required from you.
- **Immutable history.** Every credit, debit, and reservation is recorded permanently. Corrections are made by adding an opposing entry — never by editing the original.
- **No expiry.** Wallet credit does not expire today.

## What's Next?

- [Refund to wallet](./refund-to-wallet) — the dashboard workflow.
- [Wallet at checkout](./using-wallet-at-checkout) — what the customer sees.
- [Wallet reporting](./reporting) — viewing balances and ledger.
- [Wallet for developers](/developers/payments/wallet/) — API and SDK integration.
