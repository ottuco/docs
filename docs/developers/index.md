# Introduction

Ottu provides a unified payment API — integrate once, and we handle the complexity of multiple payment gateways, currencies, and payment methods behind a single interface.

## Key Concepts

Before diving into the technical details, familiarize yourself with a few concepts that recur throughout the documentation.

#### Payment Gateway

In Ottu, a payment gateway holds the MID (Merchant Identification Number) credentials provided by your bank. Our staff handle gateway configuration and provide you with the [pg_codes](payments/payment-methods.md#activating-payment-gateway-codes) needed for the API. You can also fetch these codes dynamically using the [Payment Methods API](payments/payment-methods.md).

#### Currency Configuration

Ottu supports multi-currency transactions. If your MID is set up for KWD but you want to display charges in USD, your customers see USD while funds arrive in your bank account in KWD. See [API Fundamentals](getting-started/api-fundamentals.md) for details on currency handling.

#### Payment Transaction

Every payment starts with a **payment transaction** — the metadata for the payment including amount, currency, customer data (email, phone, address), and more. A transaction's state changes throughout its lifecycle: `created`, `paid`, `expired`, `canceled`, etc. Learn more in the [Payment States](reference/payment-states.md) reference.

#### REST API

Ottu's REST API is the foundation for all integrations. Start with [Authentication](getting-started/authentication.md) to set up your API keys, then use the [Checkout API](payments/checkout-api.mdx) to create payments. Set up [Webhooks](webhooks/index.md) to get real-time notifications when payment states change — you specify a [webhook URL](payments/checkout-api.mdx) when creating a transaction, and Ottu sends status updates there.

#### Checkout SDK

For ecommerce websites and mobile apps, Ottu offers a drop-in [Checkout SDK](payments/checkout-sdk/index.md) that wraps the full checkout experience into a simple integration. The SDK:

- **Supports Apple Pay, Google Pay, and digital wallets** — automatically enabled on compatible devices
- **Simplifies integration** — load the SDK, initialize with your transaction session, and it handles rendering, payment options, and status transitions
- **Optimizes conversion** — consistent, smooth flow across devices

## Choose Your Integration Path

Based on your use case, start with the section that fits:

- **CRM or Internal Systems** — Use the [Checkout API](payments/checkout-api.mdx) to create payment links and share them with customers. They land on Ottu's hosted checkout page — no frontend work needed.

- **Ecommerce or Mobile Apps** — The [Checkout SDK](payments/checkout-sdk/index.md) integrates seamlessly with the Checkout API. Load the library, install it on your page, and it manages the entire payment flow.

- **Apple Pay, Google Pay, Digital Wallets** — These work through the [Checkout SDK](payments/checkout-sdk/index.md), which automatically enables supported services on your website or app.

- **Refund, Capture, or Void** — After familiarizing yourself with the [Checkout API](payments/checkout-api.mdx), see the [Operations](operations.md) section. Set up [Operation Webhooks](webhooks/operation-events.md) to get notified about operation results.

- **Subscriptions & Recurring Payments** — See [User Cards](cards-and-tokens/user-cards.mdx) for saving payment methods and [Recurring Payments](cards-and-tokens/recurring-payments.md) for auto-debit flows.

- **Security** — Ottu's sensitive API calls are signed for added security. See [Verify Signatures](webhooks/verify-signatures.md) for the HMAC signing mechanism.

## Getting Started

Ready to integrate? Start here:

1. [**Authentication**](getting-started/authentication.md) — Set up your API keys
2. [**API Fundamentals**](getting-started/api-fundamentals.md) — Base URLs, request format, error handling
3. [**Checkout API**](payments/checkout-api.mdx) — Create your first payment

For questions, contact your local Ottu representative. Happy integrating!
