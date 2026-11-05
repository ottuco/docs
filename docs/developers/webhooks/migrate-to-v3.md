---
title: Webhook Formats and Migrating to v3
sidebar_label: Formats & Migration
description: The three Ottu webhook formats, what format 3 changes, a field-by-field map from formats 1 and 2, and the steps to switch safely.
---

import FAQ, { FAQItem } from "@site/src/components/FAQ";

# Webhook Formats and Migrating to v3

Ottu has three webhook **formats**. Your account uses exactly one. **Ottu never switches a merchant to a new format on its own**: you keep receiving the format you have today until you ask for a change. This page explains what format 3 changes, maps every format 1 and 2 field to its place in format 3, and gives a step-by-step migration that you can test before anything changes for your customers.

## When to Use

- You receive `payment` and operation webhooks today and want the event envelope, `Idempotency-Key` and `Ottu-Signature` v2.
- You want one event per payment status (`payment.paid`, `payment.refunded`, ...) instead of inferring it from `state`.

## Guide

### The three formats {#formats}

| | Formats 1 and 2 | Format 3 |
|---|---|---|
| Body | One flat object per notification: a payment body or an operation body | An [envelope](/developers/webhooks/event-catalogue#envelope) with `id`, `event`, `created`, `version`, `is_sandbox`, `merchant_id`, `initiator` and `data`. `data` is the payment, flat |
| Encoding | JSON, or XML on request | JSON only |
| Authenticity | Body field `signature`, plus the `Ottu-Signature` header (`v1` by default) | `Ottu-Signature` header, `v2` only. No `signature` field in the body |
| Success | HTTP `200` or `201` | Any `2xx` |
| Retries | Your `retries` and `backoff_factor` settings, mainly on timeouts | 8 attempts over about 42 hours, see [Delivery and Retries](/developers/webhooks/delivery-and-retries#retry-schedule) |
| Event id | Only in the `Idempotency-Key` header | In the body `id` and the `Idempotency-Key` header |

Format 1 and format 2 differ from each other as described on [Payment Events](/developers/webhooks/payment-events) and [Operation Events](/developers/webhooks/operation-events); both are unchanged. The only addition on them is the new **header**: `Ottu-Signature` (controlled by your account's signature versions, default `v1`) and `Idempotency-Key`. Your body bytes, retries and redirect behaviour stay exactly as they were.

:::warning Format 3 is JSON only
If your account receives XML today, switching to format 3 means you receive JSON from then on. Update your parser before format 3 is enabled.
:::

### Quick implementation {#quick-implementation}

The shortest safe path:

1. **Update the receiver** using [Webhook Events (v3)](/developers/webhooks/event-catalogue#quick-implementation) and [Verify Signatures](/developers/webhooks/verify-signatures#verify-v2): parse the JSON envelope, read the flat `data`, branch on `event`, verify `Ottu-Signature` `v2` on the raw body, answer any `2xx`.
2. **Test it with the published vector** in [Verify Signatures](/developers/webhooks/verify-signatures#test-vectors), then with a sandbox payment and a refund, comparing against the [field map](#field-map).
3. **Ask Ottu to enable format 3 for your account:** contact [support@ottu.com](mailto:support@ottu.com) with the webhook configuration you want switched. Your existing `webhook_url` and operations URL then receive format 3 with the same moments. Deploy the new receiver before you ask.

If a URL is also configured to receive the same event through another route, that URL gets one delivery, in the format of the existing route: see [Same URL on a legacy route](/developers/webhooks/delivery-and-retries#same-url).

:::tip Prepare your signature check first
While still on format 1 or 2 you can already build and test the [v2 verification](/developers/webhooks/verify-signatures#verify-v2) against the vector, with no change to the body.
:::


### Renamed values {#renamed-values}

:::warning Two stored values have a new name in v3
`refund_queued` is **`refund_pending`** and `invalided` is **`invalidated`**, in the event name and in `data.status`. Formats 1 and 2 keep sending the old values. If your code compares `state` to either value, change the comparison when you move to format 3. There is no `payment.refund_queued` event.
:::

Three points to get right: a capture is `payment.paid` with `data.operation` equal to `capture`, cash on delivery is `payment.cod`, and the envelope key is `event`.

### Field map: formats 1 and 2 to format 3 {#field-map}

In format 3 `data` is one flat object for every `payment.*` event. Refunds, captures and voids are events about a child transaction, described by the same keys: `data.status`, `data.operation` and the [attempt keys](/developers/webhooks/event-catalogue#data-keys), while `data.session_id` stays the original payment's.

| Where it is today (format 2) | Where it is in format 3 | Notes |
|---|---|---|
| Payment webhook body (the whole object) | `data` | Renamed as in the rows below. Sent in `payment.*` events. |
| Operation webhook body (refund, capture, void) | `data` | The same flat object. A refund is `payment.refunded` with `data.operation` equal to `refund`; a void is `payment.voided`; a capture is `payment.paid` with `data.operation` equal to `capture`. |
| `state` | `data.status` | Renamed values: `refund_queued` becomes `refund_pending`, `invalided` becomes `invalidated`. |
| `result` | `data.result` | `null` only on `payment.created` and `payment.deleted`. See the [matrix](/developers/webhooks/event-catalogue#catalogue). |
| `timestamp_utc` | `data.processed_at` | ISO 8601 UTC with `Z`. The event time is the envelope's `created`. |
| `amount`, `currency_code` | `data.amount`, `data.currency` | Money is a string with the currency's decimals. |
| `amount_details`, `fee` | `data.connector` (`currency`, `amount`, `exchange_rate`, `fee`, `total`) | In the gateway's currency. |
| `paid_amount`, `settled_amount`, `refunded_amount`, `voided_amount`, `remaining_amount` | `data.totals` (`paid`, `settled`, `refunded`, `refund_pending`, `voided`, `remaining`) | In the session's currency, fees excluded. |
| `customer_*` | `data.customer` | `id`, `email`, `first_name`, `last_name`, `phone`, `phone_2` (was `customer_additional_phone`), `birthdate`. |
| `customer_address_*` | `data.billing_address` | `line1`, `line2`, `city`, `state`, `country`, `postal_code`. |
| `customer_shipping_address` | `data.shipping_address` | A fixed set of keys, always present. |
| `gateway_account`, `gateway_name`, `gateway_response`, `pg_params`, `reference_number` | `data.connector` (`code`, `identifier`/`processor`, `responses`, `params`, `reference_number`) | `params` keep their bilingual labels. See [PG Params](/developers/webhooks/pg-params). |
| `token` | `data.card` | The card used in the attempt; `data.card.token` is set when the card is saved. |
| `customer_wallet_transactions` | `data.wallets` | One entry per wallet leg. |
| `initiator` | `data.created_by`, and the envelope `initiator` for who caused the event | An [actor](/developers/webhooks/event-catalogue#actor): `kind`, `id`, `first_name`, `last_name`, `email`. |
| Operation `source` (`input`, `pg`) | Envelope `initiator.kind` | `user`, `api_key`, `customer`, `system` or `connector`. |
| Operation `reference_number` | `data.connector.reference_number` | The operation's own attempt. `data.session_id` is the original payment's. |
| Body field `signature` | Header `Ottu-Signature`, `v2=` part | Verify on the raw body: [Verify Signatures](/developers/webhooks/verify-signatures#verify-v2). |
| `state` that you read to detect a refund (`refunded` on format 1) | The event `payment.refunded` | `data.operation` is `refund`. The payment's own status stays `paid`. |
| `result` / `state` to detect success | `event` (`payment.paid`, `payment.authorized`, `payment.cod`) | Branch on `event` first, then read details. |
| `is_sandbox` | Envelope `is_sandbox` | Not repeated in `data`. Known before any attempt; see [`is_sandbox`](/developers/webhooks/event-catalogue#is-sandbox). |
| `extra.merchant_id` | Envelope `merchant_id` | Removed from `data.extra`. |
| Duplicate detection by `session_id` or `reference_number` | `Idempotency-Key` / body `id`, plus `reference_number` | Keep the business reference check as well. |
| Success status `200`/`201` | Any `2xx` | A `3xx` is a failure on every format. |
| `webhook_url` and operations URL | Same URLs | The payment's `webhook_url` and the operations URL receive the same moments in format 3 as in format 2, plus the new moments below. |

Not carried over: `transactions`, `signature`, `transaction_log_id`, `capture_delivery_address`, `capture_delivery_location` and `card_acceptance_criteria`.

### New moments in format 3 {#new-moments}

Format 3 sends events that formats 1 and 2 do not: `payment.created` (when a payment is created), `payment.attempted` (every failed try that leaves the payment payable), `payment.refund_pending` and `payment.refund_rejected` (a queued refund and its rejection). Subscribe to what you need; ignore the rest.

:::warning Order is not guaranteed
`payment.created` is delivered a few seconds after the payment is created, so it can arrive after a fast `payment.paid`. Order by `created` and de-duplicate on the event `id`. See [ordering](/developers/webhooks/event-catalogue#ordering).
:::

### Behaviours that change for the payer {#payer-behaviour}

On the payment's own `webhook_url` the payer waits for your answer on Ottu's page:

- **Formats 1 and 2:** `200` redirects the payer to your `redirect_url`, `201` keeps them on the Ottu summary page.
- **Format 3:** any `2xx` is success and lets the redirect proceed.

### Moments with no event type {#no-type}

A format 3 account never receives a format 1 or 2 body. If a payment moment has no event in the [catalogue](/developers/webhooks/event-catalogue#catalogue), nothing is sent for it. Ottu logs the skip, and when the moment concerns the payer's waiting page, that page moves to its failure state instead of waiting for your answer. Build your integration on the catalogue types and reconcile anything else with the [Payment Status API](/developers/payments/psq).

### Error handling

| Symptom after switching | Likely cause | Fix |
|---|---|---|
| Receiver returns `400` on every event | Parser still expects XML or the flat body | Parse the JSON envelope and read the flat `data`. |
| Every signature check fails | Verifying the body `signature` field, which no longer exists | Verify `Ottu-Signature` `v2` on the raw bytes. |
| Signature fails only on some payments | The body was parsed and re-serialised before verifying | Verify before parsing: [raw bytes](/developers/webhooks/verify-signatures#verify-v2). |
| Payers stay on the Ottu page | Receiver answered a non-`2xx` | Answer `200` for the redirect, within the timeout. |
| Refund logic never fires | Waiting for `state == "refunded"` | Branch on `event == "payment.refunded"`. |
| A `refund_queued` or `invalided` comparison never matches | Those values are renamed | Compare with `refund_pending` and `invalidated`. |
| Duplicate fulfilment | Not de-duplicating | Use [`Idempotency-Key`](/developers/webhooks/delivery-and-retries#idempotency-key) and the business reference. |

### Related references

Nothing to call to migrate. The related references are:

- The new body: [Webhook Events (v3)](/developers/webhooks/event-catalogue#envelope)
- The old bodies: [Payment Events](/developers/webhooks/payment-events#params), [Operation Events](/developers/webhooks/operation-events#params)
- The header: [Verify Signatures](/developers/webhooks/verify-signatures#ottu-signature-header)

## Best Practices

- Deploy the new receiver before format 3 is enabled, and test sandbox before production.
- Keep your format 1 or 2 receiver deployable until the first live day on format 3 has passed.
- Ignore unknown `event` values and unknown keys.
- Order by `created` and de-duplicate on the event `id`.

## Related

- [Webhooks Overview](/developers/webhooks)
- [Payment Events (formats 1 and 2)](/developers/webhooks/payment-events)
- [Operation Events (formats 1 and 2)](/developers/webhooks/operation-events)
- [PG Params](/developers/webhooks/pg-params)

## FAQ

<FAQ>
  <FAQItem question="Will Ottu switch my account to format 3 on its own?">
    No. Ottu never switches a merchant to a new format on its own; you keep receiving the format you have today until you ask for a change.
  </FAQItem>
  <FAQItem question="How do I ask for format 3?">
    Contact [support@ottu.com](mailto:support@ottu.com) and name the webhook configuration you want switched. Deploy and test your new receiver first.
  </FAQItem>
  <FAQItem question="Can I test format 3 before it affects my customers?">
    Yes. Deploy the new receiver first and test it in the sandbox before production; the steps are in [Quick implementation](#quick-implementation).
  </FAQItem>
  <FAQItem question="What changes for the payer when I move to format 3?">
    On the payment's `webhook_url`, any `2xx` now lets the redirect proceed, so `201` no longer holds the payer on the Ottu page. See [behaviours that change for the payer](#payer-behaviour).
  </FAQItem>
</FAQ>

## What's Next?

- [**Webhook Events (v3)**](/developers/webhooks/event-catalogue): every event and example
- [**Verify Signatures**](/developers/webhooks/verify-signatures#ottu-signature-header): build the v2 check
- [**Delivery and Retries**](/developers/webhooks/delivery-and-retries): success rules and `Idempotency-Key`
