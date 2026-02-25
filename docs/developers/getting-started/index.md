# Getting Started

## [Ottu API](#ottu-api)

Welcome to Ottu’s API documentation! We have designed our platform to offer a unified API experience across all our endpoints. No matter which [payment gateway](/docs/developers/payments/payment-methods#activating-payment-gateway-codes) you choose, you’ll find the same intuitive interface, allowing you to integrate just once and leave the heavy lifting to us. Before diving into the technical details, you should familiarize yourself with a few key concepts that will recur throughout our documentation.

## [Key Concepts](#key-concepts)

#### [1. Payment Gateway](#1.-payment-gateway)

In the context of Ottu, the payment gateway holds the MID (Merchant ID) credentials provided by your bank. For more details on this, check the [Payment Gateway section](/docs/developers/payments/payment-methods#activating-payment-gateway-codes). Currently, our staff handle this configuration and will provide you with the [pg_codes](/docs/developers/payments/checkout-api#pg_codes-array-required) needed for the API. Alternatively, you can fetch these codes using our Payment Methods API.

#### [2. Currency Configuration](#2.-currency-configuration)

Currency configuration involves setting up the currencies you want to charge your customers. Ottu supports multi-currency transactions. If your MID is set up for KWD, but you want to display the charge amount to your customers in USD, we’ve got you covered. Your customers will see the amount in USD, but the actual funds will arrive in your bank account in KWD. Find more details in our [API Fundamentals section](api-fundamentals.md).

#### [3. Payment Transaction](#3.-payment-transaction)

Every payment or API operation starts with or involves a payment transaction. Essentially, this is the metadata for the payment. It includes information like amount, currency, customer data (email, phone number, address), and more. A payment transaction’s state can change based on the flow `created`, `paid`, `expired`, `canceled`, etc.). Learn more in the [Payment States section](../reference/payment-states.md).

#### [4. REST API](#4.-rest-api)

To get started with Ottu’s REST API, first understand our authentication methods in the [Authentication section](authentication.md). Then proceed to the [Checkout API section](/docs/developers/payments/checkout-api) to learn how to create payments and charge customers. Following this, you might want to explore the [Payment Notification Webhook](/docs/developers/webhooks-and-events/payment-events). This feature is crucial if you want to integrate Ottu with a system and get notified about payment status updates. After creating a payment transaction, you can specify a [webhook URL](/docs/developers/payments/checkout-api#webhook_url-string-optional) where Ottu will send updates about the payment status. This will keep your systems up to date in real-time with payment events. See [Webhook](/docs/developers/webhooks-and-events).

#### [**5. Checkout SDK**](#id-5.-checkout-sdk)

If you're building an ecommerce website or mobile app, Ottu offers a flexible and easy-to-integrate [Checkout SDK](/docs/developers/payments/checkout-sdk) that wraps the full checkout experience into a simple drop-in solution. The SDK is available for both web and mobile platforms and is designed to work seamlessly with the [Checkout API](/docs/developers/payments/checkout-api), ensuring you don’t need to handle payment logic manually.

Key features include:

- **Built-in support for Apple Pay, Google Pay, and other digital wallets**, automatically enabled when the SDK is used on compatible devices.
- **Simplified integration**: Load the SDK, initialize it with your transaction session, and let it handle rendering, payment options, and status transitions.
- **Optimized user experience**: The SDK ensures a consistent and smooth flow across devices, helping you reduce development time and increase conversion.

For details on installation and usage, check out the [Checkout SDK ](/docs/developers/payments/checkout-sdk)documentation.

## [API Selection Guide](#api-selection-guide)

Based on your specific needs, you can proceed to the sections that apply to your business:

- #### [CRM or Other Internal Systems](#crm-or-other-internal-systems)

  You don’t need to perform any additional steps. Just use the [Checkout API](/docs/developers/payments/checkout-api) to create payment links and share them with your customers. They’ll land on Ottu’s checkout page, where we handle everything.

- #### [Ecommerce or Similar APPs](#ecommerce-or-similar-apps)

  Our [Checkout SDK](/docs/developers/payments/checkout-sdk) is perfect for you. Available for both web and mobile apps, it integrates seamlessly with the [Checkout API](/docs/developers/payments/checkout-api). Simply load the library and install it on your page, and it will manage the entire payment process.

- #### [Apple Pay, Google Pay, and Other Payment Services](#apple-pay-google-pay-and-other-payment-services)

  These services work only with the [Checkout SDK](/docs/developers/payments/checkout-sdk). The SDK automatically enables these services on your website or app without any further configuration.

- #### [Refund, Capture, or Void Operations](#refund-capture-or-void-operations)

  After familiarizing yourself with the [Checkout API](/docs/developers/payments/checkout-api), check the [Operations section](/docs/developers/operations) to understand how they work. If you wish to use these operations, the next step is to check the [Webhook Operation Notification section](/docs/developers/webhooks-and-events/operation-events).

- #### [Subscription, Recurring Payments, and Offline Payments](#subscription-recurring-payments-and-offline-payments)

  Check the [User Cards](/docs/developers/cards-and-tokens/user-cards) and [Auto-Debit](/docs/developers/cards-and-tokens/recurring-payments) Docs.

- #### [Concerned about Security?](#concerned-about-security)

  Our sensitive API calls are signed for added security. Check out the [Signing Mechanism section](/docs/developers/webhooks-and-events/verify-signatures).

For any other questions, please feel free to contact your local Ottu representative.\
Happy integration!
