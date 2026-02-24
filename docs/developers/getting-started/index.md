# Getting Started

## [Ottu API](getting-started.md#ottu-api)

Welcome to Ottu’s API documentation! We have designed our platform to offer a unified API experience across all our endpoints. No matter which [payment gateway](../user-guide/payment-gateway.md) you choose, you’ll find the same intuitive interface, allowing you to integrate just once and leave the heavy lifting to us. Before diving into the technical details, you should familiarize yourself with a few key concepts that will recur throughout our documentation.

## [Key Concepts](getting-started.md#key-concepts)

#### [1. Payment Gateway](getting-started.md#1.-payment-gateway)

In the context of Ottu, the payment gateway holds the MID (Merchant ID) credentials provided by your bank. For more details on this, check the [Payment Gateway section](../user-guide/payment-gateway.md). Currently, our staff handle this configuration and will provide you with the [pg_codes](checkout-api.md#pg_codes-array-required) needed for the API. Alternatively, you can fetch these codes using our Payment Methods API.

#### [2. Currency Configuration](getting-started.md#2.-currency-configuration)

Currency configuration involves setting up the currencies you want to charge your customers. Ottu supports multi-currency transactions. If your MID is set up for KWD, but you want to display the charge amount to your customers in USD, we’ve got you covered. Your customers will see the amount in USD, but the actual funds will arrive in your bank account in KWD. Find more details in our [Currency Configuration section](../user-guide/currencies.md#currency-configuration).

#### [3. Payment Transaction](getting-started.md#3.-payment-transaction)

Every payment or API operation starts with or involves a payment transaction. Essentially, this is the metadata for the payment. It includes information like amount, currency, customer data (email, phone number, address), and more. A payment transaction’s state can change based on the flow `created`, `paid`, `expired`, `canceled`, etc.). Learn more in the [Payment Transaction section](../user-guide/payment-tracking/#payment-transaction).

#### [4. REST API](getting-started.md#4.-rest-api)

To get started with Ottu’s REST API, first understand our authentication methods in the [Authentication section](authentication.md). Then proceed to the [Checkout API section](checkout-api.md) to learn how to create payments and charge customers. Following this, you might want to explore the [Payment Notification Webhook](webhooks/payment-notification.md). This feature is crucial if you want to integrate Ottu with a system and get notified about payment status updates. After creating a payment transaction, you can specify a [webhook URL](checkout-api.md#webhook_url-string-optional) where Ottu will send updates about the payment status. This will keep your systems up to date in real-time with payment events. See [Webhook](webhooks/).

#### [**5. Checkout SDK**](getting-started.md#id-5.-checkout-sdk)

If you're building an ecommerce website or mobile app, Ottu offers a flexible and easy-to-integrate [Checkout SDK](checkout-sdk/) that wraps the full checkout experience into a simple drop-in solution. The SDK is available for both web and mobile platforms and is designed to work seamlessly with the [Checkout API](checkout-api.md), ensuring you don’t need to handle payment logic manually.

Key features include:

- **Built-in support for Apple Pay, Google Pay, and other digital wallets**, automatically enabled when the SDK is used on compatible devices.
- **Simplified integration**: Load the SDK, initialize it with your transaction session, and let it handle rendering, payment options, and status transitions.
- **Optimized user experience**: The SDK ensures a consistent and smooth flow across devices, helping you reduce development time and increase conversion.

For details on installation and usage, check out the [Checkout SDK ](checkout-sdk/)documentation.

## [API Selection Guide](getting-started.md#api-selection-guide)

Based on your specific needs, you can proceed to the sections that apply to your business:

- #### [CRM or Other Internal Systems](getting-started.md#crm-or-other-internal-systems)

  You don’t need to perform any additional steps. Just use the [Checkout API](checkout-api.md) to create payment links and share them with your customers. They’ll land on Ottu’s checkout page, where we handle everything.

- #### [Ecommerce or Similar APPs](getting-started.md#ecommerce-or-similar-apps)

  Our [Checkout SDK](checkout-sdk/) is perfect for you. Available for both web and mobile apps, it integrates seamlessly with the [Checkout API](checkout-api.md). Simply load the library and install it on your page, and it will manage the entire payment process.

- #### [Apple Pay, Google Pay, and Other Payment Services](getting-started.md#apple-pay-google-pay-and-other-payment-services)

  These services work only with the [Checkout SDK](checkout-sdk/). The SDK automatically enables these services on your website or app without any further configuration.

- #### [Refund, Capture, or Void Operations](getting-started.md#refund-capture-or-void-operations)

  After familiarizing yourself with the [Checkout API](checkout-api.md), check the [Operations section](operations.md) to understand how they work. If you wish to use these operations, the next step is to check the [Webhook Operation Notification section](webhooks/operation-notification.md).

- #### [Subscription, Recurring Payments, and Offline Payments](getting-started.md#subscription-recurring-payments-and-offline-payments)

  Check the [User Cards](user-cards.md) and [Auto-Debit](auto-debit.md) Docs.

- #### [Concerned about Security?](getting-started.md#concerned-about-security)

  Our sensitive API calls are signed for added security. Check out the [Signing Mechanism section](webhooks/signing-mechanism.md).

For any other questions, please feel free to contact your local Ottu representative.\
Happy integration!
