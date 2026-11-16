---
title: Webhooks
sidebar_label: Overview & Setup
---

import FAQ, { FAQItem } from '@site/src/components/FAQ';
import AgentPrompt from '@site/src/components/AgentPrompt';

# Webhooks

Ottu calls your server when something happens to a payment, so you don't have to keep asking.

- **When:** a payment is paid, fails or expires, and when a [refund, capture or void](/developers/operations-v3) runs on it.
- **Off by default.** Turn webhooks on in the Ottu dashboard, or send a `webhook_url` with the [Checkout API](/developers/payments/checkout-api).
- **One shape for every gateway.** MPGS, KNET, PayPal or any other [payment gateway](/developers/payments/payment-methods): you parse one format. A gateway you add later needs no new code.
- **Gateway details included.** Normalized gateway fields ([`pg_params`](./pg-params) on formats 1 and 2, [`connector.params`](./event-catalogue.mdx#event-data-connector-params) on format 3) plus the gateway's raw response as JSON ([`connector.responses`](./event-catalogue.mdx#event-data-connector-responses) on format 3), card numbers cut.

<AgentPrompt topic="webhooks" />

:::tip[Every event Ottu can send]
See the [event catalogue](./event-catalogue.mdx#catalogue) for every event, when each one is sent, and the fields it carries.
:::

## **Webhook formats** {#webhook-formats}

Ottu sends webhooks in one of three **formats**, set per account. **Ottu never switches you to a new format on its own.**

| Format | What you receive | Read |
|---|---|---|
| **1 and 2** | A flat payment body or operation body, in JSON (XML on request), signed in the body and in the `Ottu-Signature` header | [Payment Events](./payment-events.mdx), [Operation Events](./operation-events.md) |
| **3** | An **envelope** (`id`, `event`, `created`, `version`, `is_sandbox`, `merchant_id`, `initiator`, `data`), where `data` is the payment itself, flat, per event, in JSON, signed with `Ottu-Signature` `v2` over the raw body | [Webhook Events (v3)](./event-catalogue.mdx) |

Format 3 adds a [catalogue of 15 events](./event-catalogue.mdx#catalogue) named after the status reached (`payment.paid`, `payment.refunded`, ...), a fixed [retry schedule](./delivery-and-retries.mdx#retry-schedule), and `Idempotency-Key`. To move from format 1 or 2, follow [Migrating to v3](./migrate-to-v3.md).

On **every** format each delivery carries an `Idempotency-Key` header with the event id, so you can drop a duplicate before you fulfil an order. See [Delivery and Retries](./delivery-and-retries.mdx#idempotency-key).

:::note Ordering is not guaranteed
Events can arrive out of order, especially after a retry. `payment.created` can arrive after a fast `payment.paid`. Use the `created` time of a format 3 event to order them, de-duplicate on the event `id`, and fetch the payment's current state with the [Payment Status Query v3](/developers/payments/psq-v3) when the final state matters.
:::

## **Types of Webhooks** {#types-of-webhooks}

Ottu sends webhooks to two kinds of URL:

- **The payment's `webhook_url`:** called when a payment is processed (paid, failed, expired, ...). On formats 1 and 2 this is the [payment webhook](./payment-events.mdx).
- **The operations URL:** called for later gateway operations on a payment, such as refunds, captures and voids. On formats 1 and 2 this is the asynchronous [operations webhook](./operation-events.md).

On format 3 both URLs receive the same [envelope](./event-catalogue.mdx#envelope): a refund is `payment.refunded`, a void is `payment.voided`, and a capture is `payment.paid` with `data.operation` equal to `capture`.

## **Body encoding** {#webhook-structure}

- **Format 3** is always JSON.
- **Formats 1 and 2** are JSON by default. XML is available on request: contact [support@ottu.com](mailto:support@ottu.com) to have it turned on.

## **Delivery Guarantees** {#delivery-guarantees}

- **The same event can arrive more than once.** Make your receiver idempotent (see [Endpoint Requirements](#endpoint-requirements)).
- **Failed deliveries are retried.** The retry mechanism is on by default:
  - **Format 3:** 8 attempts over about 42 hours. See the [retry schedule](./delivery-and-retries.mdx#retry-schedule).
  - **Formats 1 and 2:** up to 3 attempts in total, on timeouts only. See [Formats 1 and 2 only](#formats-1-and-2-settings).

## Endpoint Requirements {#endpoint-requirements}

Your webhook endpoint must:

- **Use HTTPS.** Ottu's format 3 docs, the [quickstart](./quickstart.mdx) and the AI agent prompt above all assume an HTTPS URL. Ottu verifies your certificate by default (`ignore_ssl` is `false`), so use a certificate from a public authority (see [SSL verification](#ssl-verification)).
- **Be public and online.** Ottu must reach it from the internet.
- **Answer within the configured `timeout`** (**15 seconds** by default; see [Webhook Notification Mechanism](#webhook-notification-mechanism)), or the delivery is treated as failed.
- **Return a success status:** any `2xx` on format 3, `200` or `201` on formats 1 and 2. Any other status marks the notification as failed. Redirects (`3xx`) are not followed.
- **Be idempotent.** Ottu can notify the URL more than once for the same event, and repeated calls must not cause side effects. Use the [`Idempotency-Key`](./delivery-and-retries.mdx#idempotency-key) header (the event id) to detect repeats, and also check the business `reference_number` before you fulfil or refund.

## Security {#security}

Every webhook is signed with HMAC-SHA256, so you can confirm it comes from Ottu and was not altered in transit:

- **Format 3:** the `Ottu-Signature` header, `v2` part, computed over the raw body.
- **Formats 1 and 2:** the `Ottu-Signature` header (`v1` by default), plus the `signature` field in the body.

[Verify Signatures](/developers/webhooks/verify-signatures) gives the exact recipe, test vectors and code for each.

## Webhook Notification Mechanism {#webhook-notification-mechanism}

These settings belong to your webhook configuration. Each one has a default that works out of the box, and each can be adjusted for your account.

### Settings for every format {#settings}

#### SSL verification {#ssl-verification}

- **Field:** `ignore_ssl`
- **Default:** `False`: Ottu verifies the SSL certificate of your webhook URL.
- **Description:** set it to `True` only while you test with a self-signed certificate, and turn it back off before you go live. Older webhook configurations may still have `True`; if yours does, ask Ottu to turn certificate verification on.

#### Error notification {#error-notification}

- **Field:** `notify_on_error`
- **Default:** `True`
- **Description:** when a webhook call fails, Ottu emails the recipients in `emails`. On format 3 this is one email after the last attempt; see [Failure email](./delivery-and-retries.mdx#failure-email).

#### Email recipients for error notification {#emails}

- **Field:** `emails`
- **Default:** empty list
- **Description:** the addresses alerted when a webhook call fails, so the right people can act.

#### Timeout {#timeout}

- **Field:** `timeout`
- **Default:** `15` seconds
- **Description:** how long Ottu waits for your response. No response within this time is a timeout, and the delivery counts as failed.

### Formats 1 and 2 only {#formats-1-and-2-settings}

Format 3 does not use these settings: it follows its own fixed [retry schedule](./delivery-and-retries.mdx#retry-schedule).

#### Retries {#retries}

- **Fields:** `retries` and `backoff_factor`
- **Defaults:** retries: `3`, backoff\_factor: `5` seconds
- **Description:** `retries` is the total number of attempts, the first one included. Ottu retries **only on a timeout**: with the defaults it makes up to 3 attempts, waiting 5 seconds (`backoff_factor`) between them, so with the 15-second `timeout` it tries for up to 55 seconds in all. Any other error, or a status other than `200` or `201`, is not retried: Ottu marks the notification `failed`. Because a timed-out call may still have reached you, your endpoint can receive the same webhook more than once; handle repeats as described in [Endpoint Requirements](#endpoint-requirements).

:::note User agent
On formats 1 and 2 the `User-Agent` header mimics a Chrome browser by default. For a custom user agent, contact [support@ottu.com](mailto:support@ottu.com).
:::

## FAQ

<FAQ>
  <FAQItem question="What are webhooks, and why would I use them?">
    Webhooks are automated messages sent from Ottu to a specified endpoint when a particular event occurs. They’re useful for real-time notifications, allowing you to automate reactions to events like payment completions or gateway operations without constantly polling our API.
  </FAQItem>
  <FAQItem question="I’ve set up my webhook, but I’m not receiving any notifications. What could be the issue?">
    **There could be several reasons:**

    1. Ensure that the webhook is enabled, either via the Ottu dashboard or the Checkout API.
    2. Check that your endpoint meets all the requirements, such as being secure (HTTPS) and answering within the configured `timeout` (15 seconds by default).
    3. Verify that your endpoint returns a success status: any `2xx` on format 3, `200` or `201` on formats 1 and 2.
    4. If you’re still facing issues, see [Troubleshooting](./troubleshooting.mdx) or reach out to our support team.
  </FAQItem>
  <FAQItem question="How can I ensure the webhook notifications I receive are genuinely from Ottu?">
    Ottu signs every webhook with the `Ottu-Signature` header: `v2` (HMAC-SHA256 over the raw body) on format 3, `v1` by default on formats 1 and 2, plus the `signature` field in the body of formats 1 and 2. See [the `Ottu-Signature` header](/developers/webhooks/verify-signatures#ottu-signature-header). By verifying the signature attached to each payload, you can ensure its authenticity and integrity. Detailed steps on how to verify the signature can be found [here](/developers/webhooks/verify-signatures#4-verification-by-merchant).
  </FAQItem>
  <FAQItem question="What should I do if I receive the same webhook notification multiple times?">
    Webhooks can be retried, especially in cases of timeouts. It’s essential to make your webhook processing idempotent, meaning processing the same webhook notification more than once should not have a different effect. Always check the event ID (the [`Idempotency-Key`](./delivery-and-retries.mdx#idempotency-key) header) and the transaction `reference_number` to ensure you’re not processing duplicates.
  </FAQItem>
  <FAQItem question="How long will Ottu retry a webhook if my server doesn’t respond?">
    On formats 1 and 2, Ottu makes up to 3 attempts in total by default (the `retries` setting), 5 seconds apart (`backoff_factor`), and only after a timeout; both can be adjusted in the webhook settings. On format 3 there are 8 attempts over about 42 hours: see the [retry schedule](./delivery-and-retries.mdx#retry-schedule).
  </FAQItem>
</FAQ>

## Related

- [**Webhook Events (v3)**](./event-catalogue.mdx): the envelope and every event
- [**Delivery and Retries**](./delivery-and-retries.mdx): success rules, retry schedule, `Idempotency-Key`
- [**Migrating to v3**](./migrate-to-v3.md): move from format 1 or 2
- [**Verify Signatures**](./verify-signatures.md): `Ottu-Signature` v1 and v2
