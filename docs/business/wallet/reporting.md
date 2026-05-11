---
title: Wallet Reporting
sidebar_label: Wallet Reporting
---

import StepGuide from "@site/src/components/StepGuide";

# Wallet Reporting

The dashboard provides three screens for tracking wallet activity: **Accounts**, **Ledger**, and **Operations**.

## Accounts screen

Lists every customer who has a wallet account with your business, with current balance per currency.

<StepGuide steps={[
  {
    title: "Open Wallet → Accounts",
    description: <>From the main navigation, go to <strong>Wallet → Accounts</strong>.</>,
    image: "/img/business/wallet/reporting-01-accounts.png",
    imageAlt: "Wallet Accounts screen in the dashboard",
  },
  {
    title: "Search and filter",
    description: <>Filter by customer ID, currency, or balance range. Sort by balance to find top-credit customers.</>,
    image: "/img/business/wallet/reporting-02-filter.png",
    imageAlt: "Filter and sort controls on the Accounts screen",
  },
  {
    title: "Open an account",
    description: <>Click any row to open the account's full ledger history for that customer and currency.</>,
    image: "/img/business/wallet/reporting-03-detail.png",
    imageAlt: "Individual wallet account ledger view",
  },
]} />

## Ledger screen

Shows every credit, debit, and reservation entry for an account. Entries are immutable — they cannot be edited or deleted. Corrections are made via reversals.

Each entry shows:

- **Entry ID** — unique identifier for the ledger row.
- **Type** — `credit`, `debit`, or `reservation`.
- **Amount** — signed amount in the wallet currency.
- **Balance after** — wallet balance immediately after this entry.
- **Funding source** — `refund_from_payment`, `manual_adjustment`, `promo`, or `goodwill` for credits.
- **Linked session** — the original payment session this entry references, if any.
- **Timestamp** — when the entry was recorded.

![Ledger screen with columns visible](/img/business/wallet/reporting-04-ledger.png)

## Operations screen

Lists individual wallet operations (a single credit, debit, or reservation cycle) across all accounts. Useful for audit and reconciliation.

![Operations screen with filters and operation rows](/img/business/wallet/reporting-05-operations.png)

Filter by:

- Operation type (credit / debit / reservation / commit / release)
- Customer ID
- Currency
- Date range
- Linked session ID

## Exporting

You can export Accounts, Ledger, or Operations data as **CSV** or **XLSX** for offline analysis and accounting.

![Export dropdown showing CSV and XLSX options](/img/business/wallet/reporting-06-export.png)

## FAQ

#### Can I edit a wallet entry?

No. Entries are immutable. To correct an error, issue a reversal — an opposing debit or credit. Contact [csd@ottu.com](mailto:csd@ottu.com) for help.

#### Can I close a customer's wallet?

No. A wallet account opens automatically on the first refund-to-wallet and behaves as non-existent when the balance is zero — no maintenance needed.

#### How do I find the original payment behind a wallet credit?

Open the ledger entry — the **Linked session** field gives you the original payment's `session_id`. Click it to jump to the payment in Payment Management.

## What's Next?

- [Refund to wallet](./refund-to-wallet) — issuing credits.
- [Wallet at checkout](./using-wallet-at-checkout) — the customer-side flow.
- [Wallet for developers](/developers/payments/wallet/) — querying balances and history programmatically.
