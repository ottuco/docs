---
title: Notifications
sidebar_label: Notifications
hide_table_of_contents: true
---

import ApiDocEmbed from "@site/src/components/ApiDocEmbed";

## Message Notifications

This API provides a reliable interface to manually initiate message notifications for a specific transaction, based on either a provided [`session_id`](/docs/developers/payments/checkout-api) or [`order_no`](/docs/developers/payments/checkout-api). It is particularly useful in scenarios where message notifications, such as SMS, email, or WhatsApp, have not been delivered as expected, often due to issues with third-party services. Additionally, the API is helpful when customer contact information ([email](/docs/developers/payments/checkout-api) or [phone number](/docs/developers/payments/checkout-api)) has been updated, and you want to ensure the customer receives the relevant transaction message notifications again. By using this API, you can ensure that once the issue is resolved or contact details are updated, message notifications can be promptly sent to the customer without requiring a new transaction.

**Benefits:**

- **Error Recovery:** Allows businesses to resend message notifications after resolving issues with SMS gateways, email providers, or WhatsApp services.
- **Seamless Customer Communication:** Ensures that customers receive critical transaction updates, enhancing the overall payment experience.
- **Manual Control:** Offers manual flexibility for cases where automatic message notifications have failed or been delayed.
- **Contact Information Updates:** Enables re-notifying customers when their email or phone details have been changed.

## Setup

Before you can integrate with Ottu's `Message Notifications API`, several prerequisites must be fulfilled. These are essential to ensure the API functions correctly and securely.

1. **Checkout API Integration:**
   Prior to using the `Message Notifications API`, you must create a payment transaction via the [Checkout API](/docs/developers/payments/checkout-api). This step captures vital transaction details, such as:
   - **Customer Data**: Information like [`customer_phone`](/docs/developers/payments/checkout-api) for SMS and WhatsApp, and [`customer_email`](/docs/developers/payments/checkout-api) for email message notifications is collected.
   - **Optional Order Number**: The [`order_no`](/docs/developers/payments/checkout-api) may also be provided as an alternative reference for the required transaction.

   Upon successful creation of the payment transaction, a [`session_id`](/docs/developers/payments/checkout-api) is generated. This `session_id` or the `order_no` (if provided) becomes a key parameter for sending the message notifications using the `Message Notifications API`.

2. **Templates Configuration:**
   Ensure that all relevant message notifications templates (for SMS, email, WhatsApp, etc.) are pre-configured. The [Ottu support team](mailto:support@ottu.com) can assist with this setup to ensure that message notifications follow your desired format.
3. **Enabling Message Notifications Channels:**
   When creating the payment transaction, enable the required message notification channels (e.g., SMS, email, WhatsApp).
   - If the transaction is created via the `Checkout API`, message [notifications](/docs/developers/payments/checkout-api) parameters should be provided within the API call.
   - Alternatively, if the transaction is created from the **Ottu dashboard**, ensure that the designated checkbox for enabling message notifications is selected.

4. **Optional: SMS Notification Channel**
   If SMS message notifications are required, an SMS provider should be configured for your account. Contact the [Ottu support team](mailto:support@ottu.com) for assistance with configuring the SMS provider.
5. **Optional: Integrated WhatsApp Channel**
   The following requirements must be met:
   - **WhatsApp Business Account**: The merchant must have a registered WhatsApp Business account.
   - **Template Approval**: All WhatsApp templates and their content must be pre-approved by Meta/WhatsApp before being used for message notifications.
   - **WhatsApp Integration Authenticator**: This acts as the link between WhatsApp and Ottu. Contact the [Ottu support team](mailto:support@ottu.com) for assistance in configuring the integration.

## Authentication

**Supported Methods**

- [Private API Key](/docs/developers/getting-started/authentication#private-key-api-key)
- [Basic Authentication](/docs/developers/getting-started/authentication#basic-authentication)

For further information, please refer to the [Authentication](/docs/developers/getting-started/authentication) section.

## How It Works

The `Message Notifications API` allows merchants to manually resend message notifications for specific transactions, following a structured process. Here's how it works:

1. **Obtain** [`session_id`](/docs/developers/payments/checkout-api) **or** [`order_no`](/docs/developers/payments/checkout-api):
   Once the payment transaction is initiated via Ottu dashboard or `Checkout API` and all setup requirements are fulfilled, the merchant will take the generated `session_id` or the provided `order_no` (if applicable). These identifiers are crucial parameters for the `Message Notifications API`.
2. **Send Request via** `Message Notifications API`:
   The merchant sends a request to the `Message Notifications API`, including the following key parameters:
   - `session_id` or `order_no`: To identify the transaction for which the message notifications should be sent.
   - **Notification Channels**: The merchant specifies the required channels (e.g., SMS, email, WhatsApp) through which the message notifications should be sent.

<ApiDocEmbed path="message-notifications.api.mdx" />

## Guide

Follow these guidelines to send message notifications for specific payment states using the `Message Notifications API`.

1. **Initiating the Transaction:**
   Ensure that all setup requirements are implemented and provide the necessary request payload parameters via the [Checkout API](/docs/developers/payments/checkout-api). Here's an example of a transaction initiation request:

```json
{
  "type": "payment_request",
  "pg_codes": ["credit_card"],
  "amount": "22",
  "currency_code": "SAR",
  "order_no": "example_order_no",
  "customer_email": "example@example.com",
  "customer_phone": "123456789",
  "notifications": {
    "email": [
      "created",
      "paid",
      "canceled",
      "failed",
      "expired",
      "authorized",
      "voided",
      "refunded",
      "captured"
    ],
    "SMS": [
      "created",
      "paid",
      "canceled",
      "failed",
      "expired",
      "authorized",
      "voided",
      "refunded",
      "captured"
    ],
    "whatsapp": [
      "created",
      "paid",
      "canceled",
      "failed",
      "expired",
      "authorized"
    ]
  }
}
```

This initiates the transaction and sets up message notifications across the specified channels (email, SMS, and WhatsApp) for the listed states.

2. **Send Message Notifications for** `created` **State:**
   Once the transaction has been initiated, obtain the generated `session_id` or use the provided `order_no` (in this example, `order_no`: `example_order_no`).
   To send the message notifications for the `created` state, use the following request payload to specify the message notifications channels:

```json
{
  "order_no": "example_order_no",
  "channels": ["sms", "email", "whatsapp"]
}
```

This request will send message notifications via the specified channels (SMS, email, WhatsApp) for the transaction linked to `order_no`.

3. **Successful Message Notifications Response:**
   If the customer is successfully notified, the merchant will receive the following response payload:

```json
{
  "message": "Customer notified."
}
```

4. **Re-send Message Notifications for the Same or Different States:**
   - Merchants can notify the customer for the same payment state (e.g., `created`) as many times as needed.
   - To notify the customer for the same or different state, repeat the process outlined in Step 2, using the same `order_no` or `session_id` of the origin transaction.

## Best Practices

To ensure optimal use of the `Message Notifications API`, follow these best practices to improve efficiency, security, and reliability in your message notifications process:

1. **Ensure Setup Requirements Are Complete:** Before sending message notifications, confirm that:
   - All necessary message notifications templates (SMS, email, WhatsApp) are configured properly.
   - Message notification channels are enabled during the transaction setup via the `Checkout API` or **Ottu Dashboard**.
   - SMS and WhatsApp providers are configured in advance with the help of the [Ottu support team](mailto:support@ottu.com), especially for critical channels like WhatsApp Business.

2. **Leverage** [`order_no`](/docs/developers/payments/checkout-api) **for Consistency:** Whenever possible, use the `order_no` to send message notifications, especially if it is consistent across multiple systems. This can help maintain uniformity across different services and databases, ensuring message notifications are tied to a well-understood reference.
3. **Validate Payment States Before Sending Message Notifications:** Only send message notifications for valid payment states, as per the following rules:
   - **Email & SMS**: Supported for all payment states such as `created`, `paid`, `canceled`, `failed`, etc.
   - **WhatsApp**: Supported only for select states (e.g., `created`, `paid`, `authorized`).

   Ensure that the state you're notifying about matches the appropriate channel capabilities.

4. **Avoid Redundant Message Notifications:** While the API allows you to notify the customer for the same payment state multiple times, it is recommended to avoid redundant notifications unless necessary (e.g., only resend notifications if prior communication failed or needs verification). Overuse can lead to customer frustration and unnecessary SMS or email costs.
5. **Handle Response and Errors Gracefully:** Always check the API response to ensure the message notifications was successfully sent. If the response indicates an error or failure (e.g., issues with a third-party service like an SMS gateway), build in retry mechanisms or alerts for your team to address the issue promptly.
6. **Secure the API Requests:**
   - Use proper authentication (e.g., API keys, public/private key pairs) to safeguard your message notifications API requests.
   - Ensure HTTPS is used for all API communications to prevent data interception.

   Security is paramount when sending customer-related message notifications containing sensitive transaction data.

7. **Test Message Notifications Before Going Live:** Before enabling the `Message Notifications API` in your production environment, thoroughly test message notifications across all intended channels (SMS, email, WhatsApp). Use test transactions and confirm receipt to ensure all message notification templates and channels function as expected.
8. **Monitor Third-Party Message Notification Services:** Stay proactive by monitoring the health and performance of third-party message notification services (SMS, email, WhatsApp) that your system relies on. Ensure any outages or issues are promptly identified and resolved to prevent missed customer message notifications.

## FAQ

#### 1. **What is the purpose of the Message Notifications API?**

The `Message Notifications API` allows merchants to manually resend message notifications for a specific transaction based on `session_id` or `order_no`. It is useful when message notifications (e.g., SMS, email, WhatsApp) have failed due to issues with third-party providers and need to be resent.

#### 2. **What are the key parameters required to send a message notification?**

To send a message notification, you need to provide:

- Either the `session_id` or `order_no` of the transaction.
- A list of the message notifications channels you want to send (e.g., SMS, email, WhatsApp).

#### 3. **Which payment states can message notifications be sent for?**

Message notifications can only be sent for certain payment states, depending on the channel:

- **Email & SMS**: Message notifications can be sent for `created`, `paid`, `canceled`, `failed`, `expired`, `authorized`, `voided`, `refunded`, `captured` states.
- **WhatsApp**: Message notifications can only be sent for `created`, `paid`, `canceled`, `failed`, `expired`, `authorized`.

#### 4. **How many times can I send a message notification for the same state?**

There is no limit on how many times you can send a message notification for the same state. However, it's recommended to avoid redundant message notifications unless necessary (e.g., a prior message notification failed).

#### 5. **What happens if the customer is successfully notified?**

If the customer is successfully notified, the API will return the following response:

```json
{
  "message": "Customer notified."
}
```

#### 6. **Can I send message notifications for a transaction if it wasn't created via the Checkout API?**

Yes, as long as the `order_no` or `session_id` is available, message notifications can be sent. However, message notifications and channels should have been properly set up during the transaction creation.

#### 7. **What should I do if the message notification doesn't get delivered?**

If a message notification doesn't get delivered (due to third-party issues with SMS, email, or WhatsApp providers), you can manually send it again using the `Message Notifications API` once the issue is resolved. Additionally, ensure that third-party providers are correctly configured.

#### 8. **How can I configure my SMS or WhatsApp provider?**

To configure your SMS or WhatsApp provider, contact the [Ottu support team](mailto:support@ottu.com) for assistance. They will help set up the necessary integrations for sending message notifications through these channels.

#### 9. **Is it possible to send message notifications for different channels in a single API call?**

Yes, you can specify multiple channels (e.g., [`sms`, `email`, `whatsapp`]) in a single API call to send message notifications via multiple platforms simultaneously.
