# API Fundamentals

This page covers the conventions and patterns you'll encounter across all Ottu API endpoints — URL structure, request/response format, authentication, amounts, pagination, and testing. Read this before diving into specific API guides.

## Your API URL

Every Ottu merchant gets a dedicated instance with its own URL:

```
https://<your-domain>.ottu.net
```

All API paths are relative to this base URL. For example, to create a payment transaction:

```
POST https://<your-domain>.ottu.net/b/checkout/v1/pymt-txn/
```

:::info Sandbox vs Production
There are no separate sandbox and production URLs. The **MID (Merchant Identification Number)** configuration in the Ottu admin panel determines whether a payment gateway runs in sandbox or production mode. You can test with:

- **Your own instance** — configure a MID as sandbox in the admin panel. Recommended for testing your specific gateway configuration.
- **Shared sandbox** — `sandbox.ottu.net` has all payment gateways active in sandbox mode. Useful for quick tests without configuring your own instance.
:::

## API Endpoints

| Domain | Endpoint | Method | Purpose |
|--------|----------|:------:|---------|
| **Checkout** | `/b/checkout/v1/pymt-txn/` | POST | [Create payment transaction](/developers/payments/checkout-api) |
| | `/b/checkout/v1/pymt-txn/{session_id}/` | GET | [Retrieve payment transaction](/developers/payments/checkout-api) |
| | `/b/checkout/v1/pymt-txn/{session_id}/` | PATCH | [Update payment transaction](/developers/payments/checkout-api) |
| **Payment Methods** | `/b/pbl/v2/payment-methods/` | POST | [Discover available gateways](/developers/payments/payment-methods) |
| **Operations** | `/b/pbl/v2/operation/` | POST | [Refund, capture, void, cancel, expire, delete](/developers/operations) |
| **PSQ** | `/b/pbl/v2/inquiry/` | POST | [Check payment status](/developers/payments/psq) |
| **Native Payments** | `/b/pbl/v2/payment/apple-pay/` | POST | [Apple Pay direct payment](/developers/payments/native-payments) |
| | `/b/pbl/v2/payment/google-pay/` | POST | [Google Pay direct payment](/developers/payments/native-payments) |
| | `/b/pbl/v2/payment/auto-debit/` | POST | [Charge saved card](/developers/payments/native-payments) |
| **User Cards** | `/b/pbl/v2/card/` | GET | [List saved cards](/developers/cards-and-tokens/user-cards) |
| | `/b/pbl/v2/card/{token}/` | DELETE | [Delete saved card](/developers/cards-and-tokens/user-cards) |
| **Invoices** | `/b/invoice/v1/invoice/` | POST | [Create invoice](/developers/invoices) |
| **Notifications** | `/b/pbl/v2/message-notification/` | POST | [Resend payment notification](/developers/notifications) |
| **Reports** | `/b/api/v1/reports/files/` | GET | [List transaction reports](/developers/reports) |
| | `/b/api/v1/reports/files/{token}/download/` | GET | [Download report file](/developers/reports) |

## Authentication

Ottu supports two authentication methods for API calls:

| Method | Header | Access Level |
|--------|--------|-------------|
| **API Key** | `Authorization: Api-Key <your_private_key>` | Admin — all permissions |
| **Basic Auth** | `Authorization: Basic <base64(username:password)>` | Granular — explicit permissions per user |

A third key type — the **Public Key** — is used only for [Checkout SDK](/developers/payments/checkout-sdk/) initialization, not for API calls.

For setup instructions and permission details, see [Authentication](./authentication).

## Request Format

All API requests use JSON:

```bash
curl -X POST "https://<your-domain>.ottu.net/b/checkout/v1/pymt-txn/" \
  -H "Authorization: Api-Key your_private_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_request",
    "amount": "20.000",
    "currency_code": "KWD",
    "pg_codes": ["kpay"],
    "customer_email": "customer@example.com",
    "order_no": "ORD-12345"
  }'
```

**Supported content types:**
- `application/json` (recommended)
- `application/x-www-form-urlencoded`
- `multipart/form-data` (for file uploads)

## Response Format

**Success** — returns the created or updated object directly (no wrapper):

```json
{
  "session_id": "bb7fc280827c2f177a9690299cfefa4128dbbd60",
  "checkout_url": "https://<your-domain>.ottu.net/b/checkout/redirect/start/?session_id=bb7fc...",
  "amount": "20.000",
  "currency_code": "KWD",
  "state": "created",
  "payment_methods": [
    {
      "code": "kpay",
      "name": "KNET",
      "amount": "20.000",
      "currency_code": "KWD",
      "fee": "0.000",
      "icon": "https://.../knet_icon.svg"
    }
  ]
}
```

**Error** — returns field-level errors or a generic message:

```json
{
  "amount": ["This field is required."],
  "currency_code": ["This field is required."]
}
```

For the complete error reference, see [Error Codes](/developers/reference/error-codes).

## Amounts & Currencies

Amounts are **decimal strings**, not integers in cents. The precision depends on the currency, following [ISO 4217](https://www.iso.org/iso-4217-currency-codes.html):

| Decimal Places | Currencies | Example |
|:-:|---|---|
| 3 | KWD, BHD, OMR, IQD, JOD, LYD | `"20.000"` |
| 2 | USD, EUR, AED, SAR, QAR, EGP | `"20.00"` |
| 0 | JPY, KRW | `"20"` |

Always send amounts as strings: `"20"`, `"20.00"`, or `"20.000"`. The API returns amounts in the same string format.

:::warning
Do NOT send integer amounts in the smallest currency unit (e.g., `2000` for $20.00). Send the actual decimal value as a string: `"20.00"`.
:::

## Identifiers

| Identifier | Format | Who creates it | Used for |
|-----------|--------|---------------|----------|
| `session_id` | SHA1 hash (40 chars) | Ottu (auto-generated) | Uniquely identify a payment transaction |
| `order_no` | String (up to 128 chars) | Merchant (you set this) | Your internal reference — optional but recommended |
| `encrypted_id` | Encoded string | Ottu (auto-generated) | Report downloads, prevents ID enumeration |

Use `session_id` to retrieve, update, and track payment transactions. Use `order_no` as your internal cross-reference between your system and Ottu.

## Custom Data

Use the `extra` field to attach arbitrary key-value data to a payment transaction:

```json
{
  "amount": "20.000",
  "currency_code": "KWD",
  "pg_codes": ["kpay"],
  "extra": {
    "order_id": "ORD-12345",
    "department": "sales",
    "customer_tier": "premium"
  }
}
```

The `extra` object is stored with the transaction and included in [webhook payloads](/developers/webhooks/payment-events) — use it to pass context your backend needs when processing the payment result.

## Pagination

Endpoints that return lists (reports, cards) use `limit` and `offset` parameters:

```
GET /b/api/v1/reports/files/?limit=50&offset=100
```

**Response:**

```json
{
  "count": 243,
  "next": "?limit=50&offset=150",
  "previous": "?limit=50&offset=50",
  "results": [...]
}
```

- `count` — total number of items
- `next` / `previous` — URL for the next/previous page (`null` when at the end/start)
- `results` — array of items for the current page
- Default page size: 10 items

## Rate Limiting

| Scope | Limit |
|-------|-------|
| General API | 90,000 requests/day per user |
| Report downloads | 25 requests/hour |
| Utility endpoints | 10 requests/minute |

When you exceed the limit, the API returns `429 Too Many Requests`. Implement exponential backoff in your retry logic.

## Sandbox & Testing

| Option | URL | Best for |
|--------|-----|----------|
| **Shared sandbox** | `sandbox.ottu.net` | Quick tests — all gateways active, public credentials available |
| **Your own instance** | `<your-domain>.ottu.net` | Integration testing — verify your specific MID and gateway configuration |

**Recommended workflow:** Start with the shared sandbox for rapid prototyping, then switch to your own instance to test with your actual gateway configuration before going live.

For test card numbers per gateway, see [Sandbox & Test Cards](../payments/sandbox).

## What's Next?

- [**Authentication**](./authentication) — Set up API keys and permissions
- [**Payment Journey**](../payments/payment-journey) — Interactive integration walkthrough
- [**Checkout API**](../payments/checkout-api) — Create your first payment transaction
- [**Error Codes**](/developers/reference/error-codes) — Error response reference
- [**Payment States**](/developers/reference/payment-states) — Transaction lifecycle and state machine
