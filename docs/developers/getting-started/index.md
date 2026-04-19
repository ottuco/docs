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

## 3. Configure Your Environment {#configure-your-environment}

Before making API calls, ensure your Ottu dashboard is configured:

### Enable Your Plugin

Ottu uses plugins to define payment types. Enable the one that matches your use case in the Admin Panel under **Plugin Config**:

- **Payment Request** — for invoices, payment links, and manual payment collection
- **E-Commerce** — for online store checkout flows

### Activate Payment Gateway Codes

Activate the payment gateways (`pg_codes`) you intend to use. Ensure all desired `pg_codes` are set to **active** status in your configuration. These codes are passed to the [Checkout API](../payments/checkout-api.mdx) to determine which payment methods the customer can choose from.

### Sandbox vs Production

- **Sandbox** (`type: sandbox`) — for testing with simulated transactions
- **Production** (`type: production`) — for live payments

:::info
Ensure you're in the correct mode before initiating payments.
:::

## 4. Make Your First API Call

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
Use the [Sandbox & Test Cards](../payments/sandbox.mdx) to simulate payments without processing real transactions.
:::

## 5. Boost Your Integration {#boost-your-integration}

Ottu offers multiple integration paths depending on your stack and use case:

| Approach | Best For | Get Started |
|---|---|---|
| **REST API** | Full control, any language | You're already here |
| **Checkout SDK** | Drop-in payment UI for web and mobile | [Web](../payments/checkout-sdk/web.mdx), [iOS](../payments/checkout-sdk/ios.md), [Android](../payments/checkout-sdk/android.md), [Flutter](../payments/checkout-sdk/flutter.md) |
| **Python SDK** (`ottu-py`) | Python backend integrations | [GitHub](https://github.com/ottuco/ottu-py) |
| **Django SDK** | Django projects with built-in session management, webhooks, and card operations | [GitHub](https://github.com/ottuco/ottu-py#django-integration) |
| **MCP Server** | AI-assisted integration with Claude Code, Cursor, or VS Code | Click **MCP** in the navbar |

### Python SDK (`ottu-py`)

The [ottu-py](https://github.com/ottuco/ottu-py) package provides an object-oriented interface to Ottu's REST APIs:

- **Checkout** — create, retrieve, and update payment sessions
- **User Cards** — list and delete saved customer cards
- **Operations** — refund, capture, void, and other post-payment actions
- **Auto-Debit** — recurring and subscription payments

Install with `pip install ottu-py`.

### Django SDK

The Django integration extends `ottu-py` with Django-specific tools:

- **Session management** — Django model for tracking payment sessions
- **Webhook handling** — built-in webhook receiver with signature verification
- **Template tags** — render checkout forms in Django templates

See the [Django Integration Guide](https://github.com/ottuco/ottu-py#django-integration) for setup instructions.

### MCP Server

The documentation site includes an [MCP server](https://modelcontextprotocol.io/) that lets AI tools query Ottu's docs programmatically. Add it to your AI tool:

```bash
# Claude Code
claude mcp add --transport http ottu-docs https://docs.ottu.net/mcp
```

Or click the **MCP** button in the navbar for setup instructions for Cursor, VS Code, and other tools.

## What's Next?

- [**Checkout API**](../payments/checkout-api.mdx) — Full guide to creating, retrieving, and updating payment transactions
- [**Checkout SDK**](../payments/checkout-sdk/index.md) — Drop-in UI for ecommerce and mobile apps
- [**Webhooks**](../webhooks/index.md) — Get real-time notifications when payment states change
- [**Authentication**](authentication.md) — API keys, Basic Auth, and permissions
