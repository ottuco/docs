---
title: M-Wallet
sidebar_label: M-Wallet
toc_min_heading_level: 2
toc_max_heading_level: 3
---

import StepGuide from "@site/src/components/StepGuide";
import { businessWalletScenariosSteps } from "@site/src/data/wallet-scenarios";
import { walletExportSteps } from "@site/src/data/wallet-export-steps";
import FAQ, { FAQItem } from "@site/src/components/FAQ";

# M-Wallet

M-Wallet (merchant wallet) is a stored balance you can grant to a customer in any currency you accept. Once a customer has wallet credit, they can spend it at checkout — fully or partially — on any future order with your business.

## Why use M-Wallet {#why-use-wallet}

- **Refund without returning funds to the original card.** Useful when cards expire, or when you want to issue store credit instead of cash back.
- **Issue goodwill credit or promotional balances** without payment-gateway fees.
- **Reduce PG fees on future orders.** Customers spend wallet credit first; card only covers the remainder.

## How it works

1. **Customer pays for an order** using any payment method.
2. **You refund to wallet** instead of refunding to their card — one action in the dashboard.
3. **Customer returns** for a future order with your business.
4. **They pay with wallet** — fully if the balance covers it, partially with another method otherwise.

## Refund to M-Wallet {#refund-to-wallet}

Refunding to wallet credits the customer's wallet balance instead of returning funds through the payment gateway. The customer can spend the credit on their next order.

**When to use this:**

- The customer's card has expired and a gateway refund would fail.
- You want to issue store credit, loyalty, or goodwill credit without payment-gateway fees.
- You are processing a goodwill compensation that wasn't tied to a specific payment.

<StepGuide steps={[
  {
    title: "Click on the desired payment transaction",
    description: <>From <strong>Payment Request Transactions Screen</strong>, open the paid transaction you want to refund.</>,
    image: "/img/business/wallet/payment-request-transactions.png",
    imageAlt: "Paid transaction opened in Payment Management",
  },
  {
    title: "Open the action menu",
    description: <>From <strong>Payment Management Details</strong> page, open the action menu.</>,
    image: "/img/business/wallet/refund-01-transaction.png",
    imageAlt: "Action menu open on the payment transaction detail page",
  },
  {
    title: "Click Refund to Wallet",
    description: <>Use the <strong>Refund to Wallet</strong> button in the operations panel.</>,
    image: "/img/business/wallet/refund-02-refund-button.png",
    imageAlt: "Refund to Wallet button highlighted in the operations panel",
  },
  {
    title: "Confirm amount and submit",
    description: <>Enter the full or partial refund amount, and click <strong>YES</strong>. The wallet balance is credited immediately.</>,
    image: "/img/business/wallet/refund-04-confirm.png",
    imageAlt: "Confirming the wallet refund amount",
  },
  {
    title: "See the confirmation",
    description: <>A success popup shows the refunded wallet balance for the customer. The refund appears in both the transaction history and the wallet ledger.</>,
    image: "/img/business/wallet/refund-05-success.png",
    imageAlt: "Refund-to-wallet success popup showing new balance",
  },
]} />

The next time the customer reaches checkout in your store (same currency), they'll see **Wallet (X.XXX USD)** as a payment method. See [M-Wallet at Checkout](#wallet-at-checkout) below for the customer-side flow.

## M-Wallet at Checkout {#wallet-at-checkout}

This section explains what your customer sees when they have a wallet balance and reach checkout — so you can answer support questions and design messaging on your own site.

<StepGuide steps={businessWalletScenariosSteps} />

:::note Reservation auto-release
If a customer abandons, cancels, or fails a payment, the reserved wallet amount is restored to their balance about **four hours** later. The wait is intentional — it gives slow gateway confirmations time to land. There is no human in the loop.
:::

**Rules customers cannot change:**

- They cannot choose how much wallet credit to apply — Ottu deducts the required amount automatically, no more.
- They cannot transfer credit between currencies — each currency has its own wallet.
- They cannot use wallet on authorize-only orders. Wallet supports immediate-capture flows only.

:::warning Cross-currency wallet payments are not supported
The wallet only appears when its currency matches the order currency.
:::

:::note Offering multiple payment gateways on one checkout
If a checkout offers several payment gateways, make sure at most **one wallet per wallet provider** can be used for the order currency. If two gateways each carry a wallet from the same provider for that currency, the checkout cannot be created. See [Only one wallet per provider per checkout](/developers/payments/wallet/#2-create-a-checkout-session-with-the-wallet-capable-pgs) in the developer docs.
:::

**What you can do:**

- Display the customer's wallet balance on your own site or app — call the [Wallet Accounts API](/developers/payments/wallet/#api-reference).
- Refund any future order to the same wallet to top it up.
- View full credit and debit history per customer in [M-Wallet Reporting](#wallet-reporting) below.

## How fees are charged

When an order carries a processing fee, the wallet and the payment gateway (PG) do not share that fee. Ottu applies one simple rule:

> **The wallet leg is fee-free. The processing fee always lands on the PG remainder — the part of the order paid through the gateway.**

The wallet only ever covers **principal** (the order amount itself). It never carries a fee. So whether a fee is charged at all depends on whether any part of the order still has to go through the PG.

This produces three cases at checkout. The examples below all use the same order: **amount 50.000, fee 10.000, total 60.000**.

| Case | Wallet balance | Wallet covers | PG covers | Fee charged | Customer pays |
|---|---|---|---|---|---|
| **No wallet** | 0 (or no wallet) | nothing | 50.000 principal + 10.000 fee | **10.000** | 60.000 |
| **Partial wallet** | below the order amount — e.g. 30.000 | 30.000 principal | 20.000 principal + 10.000 fee | **10.000** | 30.000 |
| **Full wallet** | at or above the order amount — e.g. 50.000 or 100.000 | 50.000 principal (full) | nothing — no PG hop | **0.000** | 0.000 |

:::tip Full wallet coverage means no fee
When the customer's wallet balance is **equal to or greater than the order amount**, the wallet covers the entire principal and the payment never reaches a gateway. With no PG remainder, there is no fee to charge — the customer pays exactly the order amount, and the **Pay** button shows `0.000`.
:::

**Why the fee never moves to the wallet.** The processing fee exists to cover the cost of the gateway transaction. A fully wallet-covered payment is an internal balance transfer with no gateway transaction, so there is no cost to pass on. Partial-wallet payments still hit the gateway for the remainder, so the full fee rides along on that PG leg — it is not split in proportion to how much the wallet covered.

:::note Effect on a partial-wallet payment
In the partial-wallet case above, the customer pays 30.000 at checkout, but only 20.000 of that is principal — the other 10.000 is the fee. The wallet still contributed its full 30.000 toward principal. The fee did not reduce the wallet's contribution; it was added on top of the PG leg.
:::

## M-Wallet Reporting {#wallet-reporting}

The dashboard provides three screens for tracking wallet activity: **Accounts**, **Ledger**, and **Operations**.

### Accounts screen

Lists every customer who has a wallet account with your business, with current balance per currency.

<StepGuide steps={[
  {
    title: "Open Wallet → Accounts",
    description: <>From the main navigation, go to <strong>Wallet → Accounts</strong>.</>,
    image: "/img/business/wallet/reporting-01-accounts-listing.png",
    imageAlt: "Wallet Accounts screen in the dashboard",
  },
  {
    title: "Search and filter",
    description: <>Filter by customer ID, currency, or Status.</>,
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

### Ledger screen

Every credit, debit, and reservation for an account lives in the ledger. Entries are **immutable** — corrections are made by adding reversal entries, never by editing the originals.

<StepGuide steps={[
  {
    title: "View the entries",
    description: <>Open any account from the <strong>Accounts</strong> screen to see its full history — every credit, debit, and reservation, with the entry type, amount, direction, status, and linked payment session for each row.</>,
    image: "/img/business/wallet/reporting-04-ledger.png",
    imageAlt: "Ledger screen with entry rows visible",
  },
  {
    title: "Filter the entries",
    description: <>Use the <strong>Filter</strong> panel to narrow by entry type (credit, debit, reserve, release), status, currency, date range, or linked session ID.</>,
    image: "/img/business/wallet/reporting-ledger-filters.png",
    imageAlt: "Ledger screen with the filter panel open",
  },
]} />

<details>
<summary>What each column means</summary>

- **Operation ID** — unique identifier for the ledger row.
- **Entry Type** — `credit_refund`, `debit_payment`, `debit_adjustment`, `credit_adjustment`, `reserve`, `release`, `expire`, or `reversal`.
- **Amount** — signed amount in the wallet currency.
- **Direction** — high-level accounting direction: `credit` (balance increases) or `debit` (balance decreases). Use it for quick filtering; see Entry Type for the exact operation.
- **Status** — current state of the entry (`pending`, `completed`, `failed`, etc.).
- **Linked session** — the original payment session this entry references, if any.
- **Timestamp** — when the entry was recorded.

</details>

### Operations screen

Lists individual wallet operations (a single credit, debit, or reservation cycle) across all accounts. Useful for audit and reconciliation.

![Operations screen with filters and operation rows](/img/business/wallet/reporting-05-operations.png)

## Reconciliation

Wallet-enabled payments settle across two separate rails — the **wallet rail** (funds moved internally between wallet balances, no card scheme involved) and the **PG rail** (funds charged through a payment gateway and settled by the acquirer). A single customer order may use one rail or both, so your month-end reconciliation needs to account for both sources of funds.

This section explains how Ottu represents a wallet-touched payment in your transaction records, and gives a step-by-step procedure for matching it against your wallet ledger and PG settlement files.

### How a wallet payment appears in your records

Ottu records every order as a **parent transaction** at the full order amount. When part (or all) of the order is paid from the customer's wallet, Ottu also creates a **child transaction** linked to the parent, carrying just the wallet portion. The child shares the same `session_id` as the parent but has its own `order_no`.

There are two flows you will see:

| Flow | Wallet covers | What you see in records |
|---|---|---|
| **A — Full wallet (checkout)** | 100% of the order | Parent at the full amount + **one child** at the same amount. No PG attempt. |
| **B — Partial wallet + PG (checkout)** | Less than 100% | Parent at the full amount, with **one PG attempt** for the remainder + **one child** for the wallet portion. |

:::note Why the parent shows a "blank" wallet attempt
After the wallet leg settles, the parent transaction records a zero-amount attempt with the form of payment set to `wallet`. This is bookkeeping — it tells you the parent was finalized through the wallet rail. In partial-wallet flows (B), this blank attempt sits alongside the PG attempt; in full-wallet flows (A), it is the only parent attempt. You should treat it as a finalization marker, not as a separate charge.
:::

#### Amount fields on a wallet-touched payment

On the parent transaction page, three amount fields together tell you how the order was paid:

- **`amount`** — the total transaction amount (the full order value).
- **`settled_amount`** — the paid or authorized amount in the original currency, excluding fees. When the order is fully settled across both rails, this equals `amount`.
- **`paid_amount`** — the total paid amount in the original currency, including fees, possibly after currency exchange. **This is the PG-rail total** — the portion the customer was actually charged through the gateway. Use it to check the PG-side number.

On the child transaction page, you'll see just `amount` — the wallet portion.

#### Example — partial wallet payment of 20.00 USD

A customer pays a 20.00 USD order with 10.00 USD from their wallet and 10.00 USD on a card:

**Parent transaction**

| Field | Value | Notes |
|---|---|---|
| `amount` | 20.00 USD | Total order value. |
| `settled_amount` | 20.00 USD | Total settled across both rails (PG + wallet). |
| `paid_amount` | 10.00 USD | PG-rail charge actually paid by the customer. |
| `state` | `PAID` | The order is fully paid. |

**Child transaction** (linked to the parent — same `session_id`, new `order_no`)

| Field | Value | Notes |
|---|---|---|
| `amount` | 10.00 USD | The wallet leg. |
| `state` | `PAID` | Wallet leg committed. |

**Reconciliation identity** — every wallet-touched parent satisfies this:

```
parent.amount == parent.paid_amount + sum(child.amount for each wallet child)
```

In plain English: **order total = PG-rail total + wallet-rail total.**

#### Where to find these fields in the dashboard

<StepGuide steps={[
  {
    title: "Parent transaction — amount fields",
    description: <>Open the parent transaction in <strong>Payment Management</strong>. The details panel shows <strong>Amount</strong>, <strong>Settled amount</strong>, and <strong>Paid amount</strong> stacked together — these are the three fields used in the example above.</>,
    image: "/img/business/wallet/reconciliation-01-parent-amounts.png",
    imageAlt: "Parent transaction detail page highlighting the Amount, Settled amount, and Paid amount fields",
  },
  {
    title: "Linked child transaction",
    description: <>From the parent, open the linked child transaction. The child's <strong>Amount</strong> is the wallet portion, and its <strong>Session ID</strong> matches the parent's.</>,
    image: "/img/business/wallet/reconciliation-02-child-transaction.png",
    imageAlt: "Child transaction detail page showing the wallet-portion amount and shared session ID",
  },
  {
    title: "Operations screen — wallet leg",
    description: <>On the <strong>Wallet → Operations</strong> screen, search by <code>operation_id</code> (from <code>customer_wallet_transactions</code>) to see the canonical wallet-side row for that leg.</>,
    image: "/img/business/wallet/reporting-05-operations1.png",
    imageAlt: "Operations screen with a wallet operation row highlighted",
  },
]} />

### Where to find the wallet portion of a payment

Each parent transaction's webhook payload (and dashboard detail page) carries two arrays you will use during reconciliation:

- **`transactions`** — the parent's child transactions. Contains one entry for the wallet leg of a wallet-touched payment.
- **`customer_wallet_transactions`** — one entry per wallet provider that touched this payment. Each entry includes `provider_code`, `amount` (in the order currency), `currency`, `operation_id`, and the verbatim `wallet_response` from the wallet service.

:::warning `customer_wallet_transactions` is omitted when no wallet was used
The key is **not present at all** on payments that never touched a wallet. Your reconciliation script should treat a missing key the same as an empty list.
:::

**Multi-wallet stacking.** If your setup supports more than one wallet provider (for example, M-Wallet + Qitaf), `customer_wallet_transactions` will contain one entry per provider that contributed funds. Sum the `amount` fields to get the total wallet portion of the payment. Ordering is not guaranteed — treat the array as a set.

**Cross-currency reservations.** When the wallet's native ledger currency differs from the order currency (rare, but possible), the entry includes `wallet_amount_native` and `wallet_currency` fields alongside `amount` and `currency`. Reconcile against the wallet ledger using the native values; use `amount`/`currency` for the order-side math.

### Month-end reconciliation procedure

Run this once per settlement period (typically monthly). The goal is to prove that every unit of order revenue lands in exactly one of two places: your PG settlement file or your wallet ledger.

<StepGuide steps={[
  {
    title: "Export your paid parent transactions",
    description: <>Export every parent transaction in <strong>PAID</strong> state for the period from <strong>Payment Management</strong>. Note each transaction's <code>amount</code>, <code>paid_amount</code>, <code>settled_amount</code>, <code>currency_code</code>, <code>order_no</code>, and <code>session_id</code>.</>,
    image: "/img/business/wallet/recon-procedure-01-transactions-list.png",
    imageAlt: "Payment Management → Transactions list with the Export Transactions button visible",
  },
  {
    title: "Classify each payment by flow",
    description: <>For each parent, check whether it has child transactions and wallet entries: <strong>no wallet entries</strong> → pure PG payment (no wallet to reconcile); <strong>wallet entries + child transactions</strong> → full or partial wallet payment.</>,
    image: "/img/business/wallet/recon-procedure-02-classify.png",
    imageAlt: "Parent transaction's CHILD TRANSACTIONS tab showing a linked wallet-leg row — the marker that classifies the parent as wallet-touched",
  },
  {
    title: "Split each payment into wallet and PG portions",
    description: <>For each wallet-touched parent: <code>pg_total = parent.paid_amount</code> and <code>wallet_total = sum of child transaction amounts</code>. The two should add up to <code>parent.amount</code> exactly. If they don't, flag the transaction for investigation.</>,
    image: "/img/business/wallet/recon-procedure-03-amount-split.png",
    imageAlt: "Parent transaction's AMOUNT tab with Amount, Settled amount, and Paid amount fields — the values used to compute the wallet vs PG split",
  },
  {
    title: "Match the PG portion against your gateway settlement",
    description: <>For each parent with <code>parent.paid_amount &gt; 0</code>, find the matching line in your payment gateway's settlement file using the parent's <code>order_no</code> or the PG reference number. The gateway-side amount should equal <code>parent.paid_amount</code>.</>,
  },
  {
    title: "Match the wallet portion against your wallet ledger",
    description: <>For each entry in <code>customer_wallet_transactions</code>, open the <strong>Operations</strong> screen (or call the wallet operations API) using the entry's <code>operation_id</code>. The wallet ledger should show a debit of the same amount. Sum all wallet debits across the period — they should equal your wallet-rail settlement total.</>,
    image: "/img/business/wallet/reporting-05-operations1.png",
    imageAlt: "Operations screen used to look up a wallet operation by ID",
  },
  {
    title: "Reconcile refunds-to-wallet separately",
    description: <>For any parent with a refund child transaction whose attempt carries a wallet operation, the wallet ledger should show a matching <strong>credit</strong>. Match these by the parent's <code>session_id</code> or <code>order_no</code> — <strong>not</strong> by <code>operation_id</code>, because the original payment debit and the refund credit have different operation IDs.</>,
    image: "/img/business/wallet/recon-procedure-04-refund-credit.png",
    imageAlt: "Wallet account detail showing credit_refund rows on the ledger — the wallet-side mirror of a refund-to-wallet operation",
  },
]} />

:::tip Use the Operations screen as your wallet-side source of truth
Every wallet leg — debit, credit, reserve, release — has a single canonical row on the <strong>Operations</strong> screen, keyed by <code>operation_id</code>. When a number disagrees between the PG file and the parent transaction, the Operations row tells you what actually moved on the wallet rail.
:::

### Edge cases to watch for

- **Abandoned or cancelled wallet payments.** If a customer reserves wallet funds but never completes the payment, the reservation is released automatically about four hours later. The released leg may still appear in `customer_wallet_transactions` so you can audit attempted-but-released holds — check the state of the parent transaction (`FAILED`, `CANCELLED`) before counting wallet amounts.
- **Refund operation IDs differ from payment operation IDs.** A refund to wallet creates a fresh `operation_id` for the credit; it does not reuse the original payment's debit ID. Always match refunds to original payments through `session_id` or `order_no`, not through `operation_id`.
- **Wallet response format is provider-specific.** The `wallet_response` field in `customer_wallet_transactions` is the verbatim body returned by the wallet service. Treat it as audit-only — do not parse it for reconciliation logic.
- **Only the parent fires webhooks.** Child transactions do not emit their own webhooks. The child's state is always visible inside the parent's webhook payload under `transactions`.

## Exporting

Export Accounts or Ledger data as **CSV** or **XLSX** for offline analysis and accounting. Exports are generated asynchronously — you queue a report from the account, then pick it up from **Generated Reports** once it's ready.

<StepGuide steps={walletExportSteps} />


## Things to know

- **One wallet per currency.** A customer who buys in both EUR and USD has two separate wallet balances.
- **No PII.** The wallet service stores only the customer ID and balance — no card details, no personal information.
- **Automatic release.** If a customer abandons checkout, their reserved wallet funds are released automatically after about four hours. No action required from you.
- **Immutable history.** Every credit, debit, and reservation is recorded permanently. Corrections are made by adding an opposing entry — never by editing the original.
- **No expiry.** Wallet credit does not expire.
- **Wallet appears at checkout when:** the customer has positive balance in the order currency **and** the order is set to capture immediately. Authorize-only orders do not show wallet.

## FAQ

<FAQ>
  <FAQItem question="Can I refund partial amounts to wallet?">
    Yes. Enter any amount up to the original payment amount.
  </FAQItem>
  <FAQItem question="Can I refund to a wallet that doesn't exist yet?">
    Yes. If the customer has no wallet account for that currency, one is created automatically on the first refund.
  </FAQItem>
  <FAQItem question="Can I undo a refund-to-wallet?">
    You cannot edit or delete the original credit — wallet history is immutable. You can issue an opposing debit entry (a reversal) to offset it. Contact [csd@ottu.com](mailto:csd@ottu.com) if you need help raising a reversal.
  </FAQItem>
  <FAQItem question="Does the customer get notified?">
    No, customers are not notified automatically when a wallet credit is issued. If you want to notify them, message them through your own channels.
  </FAQItem>
  <FAQItem question="Why doesn't wallet show for some orders?">
    The order may be authorize-only, the customer may have zero balance in that currency, or the `customer_id` may differ between sessions. Check the order's `customer_id` matches the wallet's.
  </FAQItem>
  <FAQItem question="What happens if the customer disputes the original payment after the refund-to-wallet?">
    Disputes can be resolved manually. Contact [csd@ottu.com](mailto:csd@ottu.com) to raise a reversal.
  </FAQItem>
  <FAQItem question="Does wallet credit expire?">
    No, wallet credit does not expire.
  </FAQItem>
  <FAQItem question="If a customer cancels or their payment fails, when do they get their wallet credit back?">
    Reserved wallet funds are automatically restored about four hours after an abandoned, cancelled, or failed payment. No action is needed.
  </FAQItem>
  <FAQItem question="Can I edit a wallet entry?">
    No. Entries are immutable. To correct an error, issue a reversal — an opposing debit or credit. Contact [csd@ottu.com](mailto:csd@ottu.com) for help.
  </FAQItem>
  <FAQItem question="Can I close a customer's wallet?">
    No. A wallet account opens automatically on the first refund-to-wallet and behaves as non-existent when the balance is zero — no maintenance needed.
  </FAQItem>
  <FAQItem question="How do I find the original payment behind a wallet credit?">
    Open the ledger entry — the **Linked session** field gives you the original payment's `session_id`. Click it to jump to the payment in Payment Management.
  </FAQItem>
</FAQ>

## What's Next?

- [M-Wallet for developers](/developers/payments/wallet/) — API and SDK integration.
- [Payment Management](/business/payment-management/) — viewing and managing all transactions.
- [Refund to M-Wallet (developer reference)](/developers/operations#refund-to-wallet) — the API behind the dashboard refund flow.
