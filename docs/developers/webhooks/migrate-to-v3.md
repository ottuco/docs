---
title: Migrate to Webhooks v3
sidebar_label: Migrate to v3
description: Move an integration built on the old Ottu webhooks (format 2) to v3 - the two renamed values, the steps to switch safely, and where every old field is now.
displayed_sidebar: developerSidebar
hide_table_of_contents: true
---

# Migrate to Webhooks v3

This page is for an integration built on the old webhooks (format 2). It tells you what to change in your receiver, how to switch without risk, and where every field you read today is in v3.

Ottu never switches an account on its own. You keep receiving the old webhooks until **Version** is set to 3 in [Webhook Config](/developers/webhooks#admin-setup).

## Renamed values {#renamed-values}

:::warning Two values have a new name in v3
`refund_queued` is **`refund_pending`**, and `invalided` is **`invalidated`**, in the event name and in `data.status`. If your code compares `state` with either value, change the comparison. There is no `payment.refund_queued` event.
:::

Three more points to get right: a capture is `payment.paid` with `data.operation` equal to `capture`, cash on delivery is `payment.cod`, and the name of the event is in the key `event`.

## How to switch {#how-to-switch}

1. **Update the receiver.** Parse the JSON event, read `data`, branch on `event`, verify `Ottu-Signature` on the raw body, and answer any `2xx`. The [Webhooks guide](/developers/webhooks#step-by-step) has the code. You can build and test the [signature check](/developers/webhooks/verify-signatures#verify-v2) today: the old webhooks carry the same `Ottu-Signature` header.
2. **Test it.** First with the [published test vector](/developers/webhooks/verify-signatures#test-vectors), then with a sandbox payment and a refund, comparing against the [field map](#field-map).
3. **Set Version to 3** in [Webhook Config](/developers/webhooks#admin-setup) and save, or ask [support@ottu.com](mailto:support@ottu.com) to do it. The switch takes effect when you save, so deploy the new receiver first. Your `webhook_url` and operations URL stay the same.

Keep the old receiver deployable until the first live day on v3 has passed.

## What changes {#what-changes}

#### The body is an event {#change-body}

One [event object](/developers/webhooks#envelope) with `id`, `event`, `created`, `version`, `is_sandbox`, `merchant_id`, `initiator` and `data`. `data` is the payment, flat. There are no separate payment and operation bodies.

#### JSON only {#change-json}

If your account receives XML today, you receive JSON after the switch. Update your parser first.

#### The signature is in the header only {#change-signature}

The body has no `signature` field. Verify the `Ottu-Signature` header.

#### Any `2xx` is success {#change-success}

Before, only `200` and `201` were. On the payment's own `webhook_url`, `201` used to keep the payer on the Ottu page: now any `2xx` lets the redirect to your `redirect_url` proceed. If your receiver relied on `201` to hold the payer, change that first.

#### Retries follow a fixed schedule {#change-retries}

8 attempts over about 42 hours, for any failure. Your `retries` and `backoff_factor` settings are no longer used. See the [retry schedule](/developers/webhooks#retry-schedule).

#### The event id is in the body {#change-event-id}

`id` in the body, and the same value in the `Idempotency-Key` header.

#### Four new events {#new-moments}

`payment.created`, `payment.attempted`, `payment.refund_pending` and `payment.refund_rejected` have no old equivalent. You cannot switch single events off, except that a [plugin URL](/developers/webhooks#plugin-urls) can be limited to some payment states. Handle the events you need, and answer `2xx` to the rest.

#### Order is not guaranteed {#change-order}

`payment.created` is delivered a few seconds after the payment is created, so it can arrive after a fast `payment.paid`. Order by `created`. See [Order and unknown events](/developers/webhooks#ordering).

#### A moment with no event sends nothing {#no-type}

After the switch you never receive an old body. If a payment moment has no event in the [list](/developers/webhooks#catalogue), nothing is sent for it, and when the payer is waiting on that moment, their page moves to its failure state. Build on the listed events, and check anything else with the [Payment Status Query v3](/developers/payments/psq-v3).

## Field map {#field-map}

Every old field, and where it is now. In v3, refunds, captures and voids use the same keys as payments: `data.status`, `data.operation` and the attempt keys describe the operation, while `data.session_id` stays the original payment's.

#### The payment body {#map-payment-body}

**Now:** `data`, in `payment.*` events.

#### The operation body (refund, capture, void) {#map-operation-body}

**Now:** `data`, the same flat object. A refund is `payment.refunded` with `data.operation` equal to `refund`, a void is `payment.voided`, and a capture is `payment.paid` with `data.operation` equal to `capture`.

#### `session_id`, `order_no`, `payment_type`, `message`, `agreement`, `extra` {#map-same-name}

**Now:** the same names, inside `data`. `extra` no longer carries `merchant_id`.

#### The `autopay` block {#map-autopay}

**Now:** not in the event. What happens to a subscription arrives as its own [`subscription.*` events](/developers/webhooks#subscription-events).

#### `state` {#map-state}

**Now:** `data.status`. Renamed values: `refund_queued` is `refund_pending`, and `invalided` is `invalidated`.

#### `result` {#map-result}

**Now:** `data.result`. It is `null` only on `payment.created` and `payment.deleted`.

#### `timestamp_utc` {#map-timestamp-utc}

**Now:** `data.processed_at`, ISO 8601 UTC with `Z`. The time of the event itself is `created`.

#### `amount`, `currency_code` {#map-amount}

**Now:** `data.amount`, `data.currency`. Money is a string with the currency's decimals.

#### `amount_details`, `fee` {#map-amount-details}

**Now:** `data.connector`: `currency`, `amount`, `exchange_rate`, `fee`, `total`, in the gateway's currency.

#### `paid_amount`, `settled_amount`, `refunded_amount`, `voided_amount`, `remaining_amount` {#map-totals}

**Now:** `data.totals`: `paid`, `settled`, `refunded`, `refund_pending`, `voided`, `remaining`, in the payment's currency, fees excluded.

#### `customer_*` {#map-customer}

**Now:** `data.customer`: `id`, `email`, `first_name`, `last_name`, `phone`, `phone_2` (was `customer_additional_phone`), `birthdate`.

#### `customer_address_*` {#map-billing-address}

**Now:** `data.billing_address`: `line1`, `line2`, `city`, `state`, `country`, `postal_code`.

#### `customer_shipping_address` {#map-shipping-address}

**Now:** `data.shipping_address`, a fixed set of keys that is always present.

#### `gateway_account`, `gateway_name`, `gateway_response`, `pg_params`, `reference_number` {#map-connector}

**Now:** `data.connector`: `code`, `identifier` and `processor`, `responses`, `params`, `reference_number`. `params` keep their bilingual labels: see [PG Params](/developers/webhooks/pg-params).

#### `token` {#map-token}

**Now:** `data.card`, the card used in the attempt. `data.card.token` is set when the card is saved.

#### `customer_wallet_transactions` {#map-wallets}

**Now:** `data.wallets`, one entry per wallet leg.

#### `initiator` {#map-initiator}

**Now:** `data.created_by` for who created the payment, and `initiator` in the envelope for who caused the event. Both are an [actor](/developers/webhooks#actor).

#### Operation `source` (`input`, `pg`) {#map-source}

**Now:** `initiator.kind`: `user`, `api_key`, `customer`, `system` or `connector`.

#### Operation `reference_number` {#map-operation-reference}

**Now:** `data.connector.reference_number`, the operation's own reference. `data.session_id` is the original payment's.

#### `signature` {#map-signature}

**Now:** the `Ottu-Signature` header. Verify it on the raw body: [Verify signatures](/developers/webhooks/verify-signatures#verify-v2).

#### `is_sandbox` {#map-is-sandbox}

**Now:** `is_sandbox` in the envelope. `data` does not repeat it.

#### `extra.merchant_id` {#map-merchant-id}

**Now:** `merchant_id` in the envelope. It is no longer in `data.extra`.

#### Detecting a refund from `state` {#map-detect-refund}

**Now:** the event `payment.refunded`. The payment's own status stays `paid`.

#### Detecting success from `result` or `state` {#map-detect-success}

**Now:** `event`: `payment.paid`, `payment.authorized` or `payment.cod`. Branch on `event` first, then read the details.

#### Detecting duplicates from `session_id` or `reference_number` {#map-duplicates}

**Now:** the event `id`, also sent as `Idempotency-Key`. Keep your check on the reference as well.

#### Not carried over {#map-not-carried}

`transactions`, `transaction_log_id`, `capture_delivery_address`, `capture_delivery_location` and `card_acceptance_criteria`.

## After the switch {#after-the-switch}

#### The receiver answers `400` to every event {#after-400}

The parser still expects XML or the old flat body. Parse the JSON event and read `data`.

#### Every signature check fails {#after-signature}

The code verifies the body `signature` field, which no longer exists. Verify `Ottu-Signature` on the raw bytes.

#### The signature fails on some payments only {#after-signature-some}

The body was parsed and re-serialised before verifying. [Verify before parsing](/developers/webhooks/verify-signatures#verify-v2).

#### Payers stay on the Ottu page {#after-payer-waits}

The receiver answered something other than `2xx`. Answer `200` within the timeout.

#### Refund logic never runs {#after-refund}

The code waits for `state == "refunded"`. Branch on `event == "payment.refunded"`.

#### A `refund_queued` or `invalided` comparison never matches {#after-renamed}

Those values are renamed. Compare with `refund_pending` and `invalidated`.

#### An order is fulfilled twice {#after-duplicates}

The receiver does not de-duplicate. Use the event `id` and the business reference: [Drop duplicates](/developers/webhooks#drop-duplicates).

## What's Next?

- [**Webhooks guide**](/developers/webhooks): set up and build the v3 receiver.
- [**Events**](/developers/webhooks#api-reference): the event object and every event.
- [**Verify signatures**](/developers/webhooks/verify-signatures#verify-v2): the signature check.
- [**The old webhook docs**](/developers/webhooks/legacy): the pages for format 2.
