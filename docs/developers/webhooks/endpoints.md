---
title: Webhook Endpoints
sidebar_label: Endpoints
description: What a webhook endpoint is, how to choose the events it receives (exact types, payment.*, subscription.* or everything), how it interacts with your existing webhook URLs, and how to test and resend.
---

# Webhook Endpoints

A **webhook endpoint** is a URL on your server that you register with Ottu together with the list of [events](/developers/webhooks/event-catalogue) it should receive. Endpoints are the way to receive **all** your events, including [subscription events](/developers/webhooks/event-catalogue#subscription-events), at one or more URLs, independently of the single `webhook_url` you may already send per payment.

Every endpoint always receives [format 3](/developers/webhooks/event-catalogue) (the envelope) signed with [`Ottu-Signature` v2](/developers/webhooks/verify-signatures#ottu-signature-header), whatever webhook format the rest of your account uses. That makes an endpoint the safe way to try format 3 before you [migrate](/developers/webhooks/migrate-to-v3).

:::note Endpoints are registered by Ottu for now
In this release Ottu staff create and edit endpoints for you. Ask [Ottu support](mailto:support@ottu.com) with the URL and the events you want; a self-service dashboard page is planned separately and is not available yet. This page tells you what to ask for and how the endpoint behaves once it exists.
:::

## Use cases

- Receive `payment.paid` and `payment.refunded` on your order service, and `subscription.*` on your billing service, each at its own URL.
- Add a second consumer (analytics, a data warehouse) without changing the `webhook_url` on any payment.
- Test format 3 against production-like traffic while your existing integration keeps receiving format 1 or 2.

## Quick implementation

Send support one message per endpoint. This is all they need:

```text
Endpoint URL:  https://shop.example.com/webhooks/ottu
Events:        payment.*            (or: payment.paid, payment.refunded | subscription.* | everything)
Description:   Orders service (internal note, never sent to the URL)
Environment:   sandbox / production
```

Then:

1. Support registers the endpoint and sends a [test event](#test-event). Your receiver must answer `2xx`.
2. Confirm in your logs that you verified `Ottu-Signature` on the raw body and saw the `webhook.ping` envelope.
3. Create a sandbox payment and watch the events arrive. Compare with the [event catalogue](/developers/webhooks/event-catalogue#catalogue).

## Detailed guide

### What an endpoint holds {#fields}

| Field | Meaning |
|---|---|
| URL | Where Ottu sends events with a `POST`. Up to 2048 characters. Ottu screens show only the scheme and host; the path and query (which may contain a token) are hidden. |
| Events | The patterns it subscribes to. See [choosing events](#choosing-events). At least one is required. |
| Active | Untick to pause deliveries. Deliveries still waiting for a paused endpoint are abandoned, not held for later. |
| Description | An internal note to tell endpoints apart. It is never sent to your URL. |

### URL requirements {#requirements}

Ottu checks the URL when the endpoint is saved:

- It must be a **public `https`** address. `http` is accepted only on sandbox deployments where Ottu has switched that on.
- Credentials in the URL (`https://user:pass@host/`) are rejected. Put the secret in a path segment you control, or rely on the signature.
- `localhost` and literal IP addresses that are not publicly routable (private, loopback and similar ranges, including unusual decimal, octal or hex spellings) are rejected. A public numeric IP is accepted.

Your server must also answer within the configured timeout (15 seconds by default) with a [`2xx`](/developers/webhooks/delivery-and-retries#success-rules).

### Choosing events {#choosing-events}

Each endpoint lists **patterns**. A pattern is one of:

| Pattern | Receives | Example |
|---|---|---|
| An exact type | Only that event | `payment.paid` |
| A namespace wildcard | Every event in the namespace, **including types added later** | `payment.*`, `subscription.*` |
| `*` | Every event Ottu offers to endpoints, including types added later | `*` |

Available namespaces are `payment` (12 types) and `subscription` (11 types); the full list is in the [event catalogue](/developers/webhooks/event-catalogue#catalogue). Not available: `token.*` and `wallet.*` (reserved) and `webhook.*` (the test event is sent on request, never subscribed to).

:::warning Wildcards grow, exact types do not
A wildcard such as `payment.*` automatically starts receiving any payment event type Ottu adds in the future. Your receiver must acknowledge unknown `type` values with `2xx` instead of failing, or a new event type will turn into a stream of failures and retries. Choose exact types when you want a fixed, reviewed list.
:::

:::warning An endpoint only receives events created after it exists
Ottu only records an event for endpoints when one subscribes at that moment. An endpoint added today never receives yesterday's events, and an event that happened while no endpoint matched it cannot be replayed to a new endpoint later. To catch up, query the [Payment Status API](/developers/payments/psq).
:::

### Endpoints and your existing webhook URLs {#legacy-urls}

An event can be eligible for both an endpoint and a legacy URL: the payment's `webhook_url`, a caller URL, a plugin webhook URL or the operations webhook URL. The rule is **the legacy URL wins and keeps its format**:

| Situation | Result |
|---|---|
| The endpoint URL differs from every legacy URL | Both receive the event: the legacy URL in your account's format, the endpoint in format 3. Same event id and `Idempotency-Key` on both. |
| The endpoint URL **equals** a legacy URL that will definitely receive the same event | The endpoint is skipped for that event: the URL gets one delivery, in the legacy URL's format. |
| Two endpoints have the same URL | One delivery. |

Operation events (`payment.refunded`, `payment.captured`, `payment.voided`, and so on) are compared with the operations URL only. Because the same event can reach you on two URLs, **de-duplicate on the event id**: see [`Idempotency-Key`](/developers/webhooks/delivery-and-retries#idempotency-key). Ottu warns the person saving the endpoint when its URL equals a legacy URL.

### Test event {#test-event}

Ottu staff can send a **test event** (`webhook.ping`) to one endpoint. It is a real, signed format 3 delivery to that endpoint only:

```json
{
  "id": "evt_01JABCDEFGHJKMNPQRSTVWXYZ4",
  "type": "webhook.ping",
  "created": "2026-10-22T07:00:00Z",
  "version": 3,
  "is_sandbox": false,
  "merchant_id": "merchant.ottu.net",
  "data": {
    "endpoint": { "id": "7", "url": "https://shop.example.com/webhooks/ottu" }
  }
}
```

| Key | Meaning |
|---|---|
| `data.endpoint.id` | The endpoint's id, as a string. |
| `data.endpoint.url` | The full URL the test was sent to. |

- It is sent once, **synchronously**, and is **never retried**. There is no failure email.
- Support sees the HTTP status and the first 100 characters of your response, or a short error such as `timeout`.
- An inactive endpoint cannot be tested. At most five endpoints are tested at a time.
- A test event cannot be resent: ask for a new one.

### Resend {#resend}

If an endpoint delivery failed, support can **Resend** it. A resend is a new delivery of the same event with the same stored body and the same `Idempotency-Key`. It is available for format 3 deliveries; for formats 1 and 2, support uses a manual re-disclose. It is refused for test events, for deliveries still being retried, and when the endpoint has been removed or deactivated.

## API reference

There is no merchant API for endpoints in this release. The payload you receive is documented in [Webhook Events (v3)](/developers/webhooks/event-catalogue#envelope); the headers in [Delivery and Retries](/developers/webhooks/delivery-and-retries#request).

## Error handling

| What happens | Cause | What to do |
|---|---|---|
| Support says the URL is rejected | Not `https`, credentials in the URL, `localhost` or a private IP | Use a public `https` URL without credentials. |
| Support says an event pattern is unknown | A pattern outside the catalogue, or a reserved namespace | Pick from the [catalogue](/developers/webhooks/event-catalogue#catalogue). |
| The test event shows `timeout` | Your server did not answer in time | Answer faster, then ask for another test. |
| The test event shows `HTTP 401` or similar | Your receiver rejected the delivery | Check the signature handling against the [test vector](/developers/webhooks/verify-signatures#test-vectors). |
| You receive an event twice | The URL is both an endpoint and a legacy URL on different routes, or Ottu retried | Dedupe on `Idempotency-Key`. |
| You receive nothing | Endpoint inactive, patterns do not match, or the event predates the endpoint | Ask support to check the endpoint and its [delivery log](/developers/webhooks/delivery-and-retries#delivery-log). |

## Best practices

- Start with `payment.*` plus the subscription types you use; avoid `*` unless you really handle everything.
- Use one endpoint per consuming service so a failing consumer does not hide the others' deliveries.
- Verify `Ottu-Signature` on every request, including the first test event.
- Keep a description on each endpoint so support can find the right one.

## What's Next?

- [**Webhook Events (v3)**](/developers/webhooks/event-catalogue): what each endpoint will receive
- [**Delivery and Retries**](/developers/webhooks/delivery-and-retries): success rules and the retry schedule
- [**Verify Signatures**](/developers/webhooks/verify-signatures#ottu-signature-header): authenticate every request
- [**Migrating to v3**](/developers/webhooks/migrate-to-v3): switch your account to format 3

## Related

- [Webhooks Overview](/developers/webhooks)
- [Payment Events (formats 1 and 2)](/developers/webhooks/payment-events)
- [Operation Events (formats 1 and 2)](/developers/webhooks/operation-events)
- [AutoPay](/developers/payments/autopay/)
