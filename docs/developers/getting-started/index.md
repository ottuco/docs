# Getting Started

Set up your environment to start integrating with Ottu's payment API.

## 1. Get Your API Keys

You'll need API credentials to authenticate requests. Ottu supports multiple authentication methods depending on your use case:

- **API Key (Private Key)** — for server-side API calls
- **Basic Authentication** — username and password
- **Public Key** — for client-side SDK usage

See [Authentication](authentication.md) for setup instructions.

## 2. Understand the API

Familiarize yourself with the request format, base URLs, error handling, and conventions:

- **Sandbox**: `https://<your-merchant>.ottu.dev`
- **Production**: `https://<your-merchant>.ottu.com`

All requests and responses use JSON. See [API Fundamentals](api-fundamentals.md) for the complete reference on base URLs, authentication headers, error codes, pagination, and rate limiting.

## 3. Make Your First API Call

Create a payment transaction with a single API call:

```bash
curl -X POST https://<your-merchant>.ottu.dev/b/checkout/v1/pymt-txn/ \
  -H "Authorization: Api-Key your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_request",
    "pg_codes": ["your_pg_code"],
    "amount": "10.000",
    "currency_code": "KWD",
    "customer_email": "customer@example.com"
  }'
```

The response includes a `session_id` and `payment_url`. Open the `payment_url` to see Ottu's checkout page.

:::tip
Use the [Sandbox & Test Cards](../payments/sandbox.md) to simulate payments without processing real transactions.
:::

## What's Next?

- [**Checkout API**](../payments/checkout-api.mdx) — Full guide to creating, retrieving, and updating payment transactions
- [**Checkout SDK**](../payments/checkout-sdk.md) — Drop-in UI for ecommerce and mobile apps
- [**Webhooks**](../webhooks/index.md) — Get real-time notifications when payment states change
