---
title: Payment Attempt Fields
sidebar_label: Attempt Fields
---

# Payment Attempt Fields

A **payment attempt** is one individual try at completing a payment through a specific [payment gateway](/business/payments/gateways). Each time a customer hits "Pay" — succeeds or fails — Ottu creates a new attempt record. One [payment transaction](/business/payment-management/transaction-fields) can have many attempts (the customer's first card declines, they retry with a different card), but at most one ever reaches a successful state.

Attempt records are where you find the gateway-level detail: which card was used, what the gateway responded, what error the customer saw, and exactly what Ottu sent over to your [webhook](/business/settings/webhooks). When a payment goes wrong, the attempt is where you investigate.

This page lists every field on a payment attempt.

:::tip Looking for the transaction-level fields?
For fields that belong to the parent [payment transaction](/glossary#term-payment-transaction) — order number, customer details, callback URLs, lifecycle state — see [Payment Transaction Fields](/business/payment-management/transaction-fields).
:::

---

## Identifiers

### reference_number

A unique identifier for this payment attempt, sent to the payment gateway as the merchant reference. One [transaction](/business/payment-management/transaction-fields#session_id) can have multiple reference numbers — one per attempt.

### transaction

Reference back to the parent [payment transaction](/business/payment-management/transaction-fields) this attempt belongs to.

---

## State & lifecycle

### state

The current status of this payment attempt — whether it is pending, successfully processed, failed, canceled, or encountered an error. Also supports the Cash on Delivery payment method.

### state_changed_at

Timestamp of the most recent state change on this attempt. Useful for measuring how long the customer spent on the gateway and for ordering attempts in support views.

### message

The human-readable error message when the attempt didn't succeed. Sourced from the gateway. Empty for successful attempts.

---

## Amounts

### amount

The amount the gateway was asked to settle for this attempt, in [`currency_code`](#currency_code). For non-editable transactions this equals the [transaction `amount`](/business/payment-management/transaction-fields#amount); for editable ones it's whatever the customer entered before submitting this attempt.

### fee

The [fee](/business/payment-management/transaction-fields#fee) the customer is paying on top of [`amount`](#amount) for this attempt, in the customer's chosen currency.

### total


### currency_code

The currency the gateway was charged in. May differ from the parent transaction's currency if the customer chose to pay in a different one — in that case [`exchange_rate`](#exchange_rate) records the conversion used.

### exchange_rate

The conversion rate Ottu used if this attempt involved a currency conversion (i.e. the customer paid in a currency other than the transaction's). 1.0 when no conversion happened. See the [Exchange Rate](/glossary#term-exchange-rate) glossary entry.

---

## Gateway interaction

### settings


### card

The card used for this payment attempt.

### gateway_response

The full response received from the payment gateway for this attempt.

---

## Webhook diagnostics

These fields tell you what Ottu delivered to your [webhook URL](/business/settings/webhooks) for this attempt — useful when you can't find a payment notification in your own system.

### disclosed_to_merchant

When true, Ottu successfully delivered a webhook for this attempt. When false, either no webhook was attempted yet, or every delivery attempt failed (see [`disclosure_url_error`](#disclosure_url_error)).

### disclosed_data

The exact payload Ottu posted to your webhook URL. Use this to confirm what was sent if your own system shows different data.

### disclosed_states

A read-only convenience field that pulls just the state values out of [`disclosed_data`](#disclosed_data) — useful when an attempt has been webhooked more than once and you want to see the state at each delivery.

### disclosure_url_error

The error reason logged when Ottu could not reach the merchant webhook URL.

---

## Internal & diagnostic fields

<details>
<summary>Internal fields (2) — expand to see one-line notes</summary>

### data

Stores useful information for internal purposes.

### request_data

Technical data of the request that triggered this attempt.

</details>

---

## What's Next?

- [Payment Transaction Fields](/business/payment-management/transaction-fields) — fields on the parent transaction
- [Transaction States](/business/payment-management/transaction-states) — how attempts roll up into the parent state
- [Webhooks](/business/settings/webhooks) — set up the URL the diagnostic fields above describe
