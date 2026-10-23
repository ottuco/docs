---
title: Webhook Formats and Migrating to v3
sidebar_label: Formats & Migration
description: The three Ottu webhook formats, what format 3 changes, a field-by-field map from formats 1 and 2, and the steps to switch safely.
---

# Webhook Formats and Migrating to v3

Ottu has three webhook **formats**. Your account uses exactly one. **Ottu never switches a merchant to a new format on its own**: you keep receiving the format you have today until you ask for a change. This page explains what format 3 changes, maps every format 1 and 2 field to its place in format 3, and gives a step-by-step migration that you can test before anything changes for your customers.

## Use cases

- You receive `payment` and operation webhooks today and want the event envelope, `Idempotency-Key` and `Ottu-Signature` v2.
- You want one event type per payment moment (`payment.paid`, `payment.refunded`, ...) instead of inferring it from `state`.

## The three formats {#formats}

| | Formats 1 and 2 | Format 3 |
|---|---|---|
| Body | One flat object per notification: a payment body or an operation body | An [envelope](/developers/webhooks/event-catalogue#envelope) with `id`, `type`, `created`, `version`, `is_sandbox`, `merchant_id` and `data` |
| Encoding | JSON, or XML on request | JSON only |
| Authenticity | Body field `signature`, plus the `Ottu-Signature` header (`v1` by default) | `Ottu-Signature` header, `v2` only. No `signature` field in the body |
| Success | HTTP `200` or `201` | Any `2xx` |
| Retries | Your `retries` and `backoff_factor` settings, mainly on timeouts | 8 attempts over about 42 hours, see [Delivery and Retries](/developers/webhooks/delivery-and-retries#retry-schedule) |
| Event id | Only in the `Idempotency-Key` header | In the body `id` and the `Idempotency-Key` header |

Format 1 and format 2 differ from each other as described on [Payment Events](/developers/webhooks/payment-events) and [Operation Events](/developers/webhooks/operation-events); both are unchanged. The only addition on them is the new **header**: `Ottu-Signature` (controlled by your account's signature versions, default `v1`) and `Idempotency-Key`. Your body bytes, retries and redirect behaviour stay exactly as they were.

:::warning Format 3 is JSON only
If your account receives XML today, switching to format 3 means you receive JSON from then on. Update your parser before format 3 is enabled.
:::

## Quick implementation

The shortest safe path:

1. **Update the receiver** using [Webhook Events (v3)](/developers/webhooks/event-catalogue#quick-implementation) and [Verify Signatures](/developers/webhooks/verify-signatures#verify-v2): parse the JSON envelope, read `data.payment` / `data.operation`, verify `Ottu-Signature` `v2` on the raw body, answer any `2xx`.
2. **Test it with the published vector** in [Verify Signatures](/developers/webhooks/verify-signatures#test-vectors), then with a sandbox payment and a refund, comparing against the [field map](#field-map).
3. **Ottu enables format 3 for your account.** Your existing `webhook_url` and operations URL then receive format 3 with the same moments. Deploy the new receiver before this happens.

If a URL is also configured to receive the same event through another route, that URL gets one delivery, in the format of the existing route: see [Same URL on a legacy route](/developers/webhooks/delivery-and-retries#same-url).

:::tip Prepare your signature check first
While still on format 1 or 2 you can already build and test the [v2 verification](/developers/webhooks/verify-signatures#verify-v2) against the vector, with no change to the body.
:::

## Detailed guide

### Field map: formats 1 and 2 to format 3 {#field-map}

| Where it is today | Where it is in format 3 | Notes |
|---|---|---|
| Payment webhook body (the whole object) | `data.payment` | Same field names and meanings. Without `signature`. Sent in `payment.*` events. |
| Operation webhook body (refund, capture, void) | `data.operation` | Same keys. Without `signature`. Sent in `payment.refunded`, `payment.captured`, `payment.voided` and, for cancel, expire and delete, in `payment.canceled`, `payment.expired`, `payment.deleted`. The original payment arrives alongside in `data.payment`. |
| Operation `reference_number` | `data.operation.reference_number` | The operation's own reference. The payment's reference is `data.payment.reference_number`. |
| Operation `session_id` | `data.operation.session_id` | The original payment's session. `data.operation.txn` describes the child transaction. |
| Body field `signature` | Header `Ottu-Signature`, `v2=` part | Verify on the raw body: [Verify Signatures](/developers/webhooks/verify-signatures#verify-v2). |
| `state` that you read to detect a refund (`refunded` on format 1) | The event `type` (`payment.refunded`) and `data.operation.operation` | `data.payment.state` is not remapped to `refunded` in format 3. |
| `result` / `state` to detect success | `type` (`payment.paid`, `payment.authorized`, `payment.failed`) | Branch on `type` first, then read details. |
| `is_sandbox` | Top-level `is_sandbox`, and still inside `data.payment` / `data.operation` | |
| `extra.merchant_id` | Top-level `merchant_id` | `extra.merchant_id` stays inside `data.payment`. |
| `timestamp_utc` | `created` for the event time, `data.*.timestamp_utc` for the payment or operation time | `created` is ISO 8601, `2026-10-22T10:00:00Z`. |
| Duplicate detection by `session_id` or `reference_number` | `Idempotency-Key` / body `id`, plus `reference_number` | Keep the business reference check as well. |
| Success status `200`/`201` | Any `2xx` | A `3xx` is a failure on every format. |
| `webhook_url` and operations URL | Same URLs, same moments | The payment's `webhook_url` and the operations URL receive the same moments in format 3 as in format 2. |

### Behaviours that change for the payer {#payer-behaviour}

On the payment's own `webhook_url` the payer waits for your answer on Ottu's page:

- **Formats 1 and 2:** `200` redirects the payer to your `redirect_url`, `201` keeps them on the Ottu summary page.
- **Format 3:** any `2xx` is success and lets the redirect proceed.

### Moments with no event type {#no-type}

A format 3 account never receives a format 1 or 2 body. If a payment moment has no event type in the [catalogue](/developers/webhooks/event-catalogue#catalogue), nothing is sent for it. Ottu logs the skip, and when the moment concerns the payer's waiting page, that page moves to its failure state instead of waiting for your answer. Build your integration on the catalogue types and reconcile anything else with the [Payment Status API](/developers/payments/psq).

## API reference

Nothing to call to migrate. The related references are:

- The new body: [Webhook Events (v3)](/developers/webhooks/event-catalogue#envelope)
- The old bodies: [Payment Events](/developers/webhooks/payment-events#params), [Operation Events](/developers/webhooks/operation-events#params)
- The header: [Verify Signatures](/developers/webhooks/verify-signatures#ottu-signature-header)

## Error handling

| Symptom after switching | Likely cause | Fix |
|---|---|---|
| Receiver returns `400` on every event | Parser still expects XML or the flat body | Parse the JSON envelope and read `data.payment`. |
| Every signature check fails | Verifying the body `signature` field, which no longer exists | Verify `Ottu-Signature` `v2` on the raw bytes. |
| Signature fails only on some payments | The body was parsed and re-serialised before verifying | Verify before parsing: [raw bytes](/developers/webhooks/verify-signatures#verify-v2). |
| Payers stay on the Ottu page | Receiver answered a non-`2xx` | Answer `200` for the redirect, within the timeout. |
| Refund logic never fires | Waiting for `state == "refunded"` | Branch on `type == "payment.refunded"`. |
| Duplicate fulfilment | Not de-duplicating | Use [`Idempotency-Key`](/developers/webhooks/delivery-and-retries#idempotency-key) and the business reference. |

## Best practices

- Deploy the new receiver before format 3 is enabled, and test sandbox before production.
- Keep your format 1 or 2 receiver deployable until the first live day on format 3 has passed.
- Ignore unknown `type` values and unknown keys.

## What's Next?

- [**Webhook Events (v3)**](/developers/webhooks/event-catalogue): every event and example
- [**Verify Signatures**](/developers/webhooks/verify-signatures#ottu-signature-header): build the v2 check
- [**Delivery and Retries**](/developers/webhooks/delivery-and-retries): success rules and `Idempotency-Key`

## Related

- [Webhooks Overview](/developers/webhooks)
- [Payment Events (formats 1 and 2)](/developers/webhooks/payment-events)
- [Operation Events (formats 1 and 2)](/developers/webhooks/operation-events)
- [PG Params](/developers/webhooks/pg-params)
