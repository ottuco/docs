---
title: Notifications
sidebar_label: Notifications
---

# Notifications

Ottu provides several notification channels to keep customers informed about the status of their payments -- whether during the payment processing lifecycle or when operations such as capture, refund, or void are performed. These notifications ensure transparency throughout the transaction lifecycle and enhance the overall customer experience.

## Notification Channels

Ottu supports three channels for sending payment notifications to customers:

| Channel | Description |
|---------|-------------|
| [Email](./email.md) | Widely used and reliable. Ideal for detailed payment confirmations, receipts, and status updates. |
| [SMS](./sms.md) | Fast and concise. Best for time-sensitive alerts like payment confirmations and critical status changes. |
| [WhatsApp](./whatsapp/) | Conversational and familiar. Great for regions where WhatsApp is commonly used for business communications. |

## How Notifications Work

Each channel can deliver notifications at different stages of a payment's lifecycle:

- **Pre-payment** -- When a payment session is created and the customer needs to complete payment (e.g., payment link sent).
- **Post-payment** -- After the customer completes the payment (e.g., confirmation of a successful payment, or notification of failure/cancellation).
- **Post-operation** -- After an operation is performed on an existing payment (e.g., refund processed, payment voided, amount captured).

:::tip
Not all channels support all phases. See the [Notification Templates](./templates.md) page for a complete availability matrix by channel, plugin, and payment phase.
:::

## Getting Started

1. **Choose your channels** -- Decide which notification channels you want to enable for your customers.
2. **Configure templates** -- Work with the [Ottu support team](mailto:support@ottu.com) to set up notification templates for each channel.
3. **Enable notifications** -- Activate the appropriate templates during payment transaction creation by selecting the corresponding checkboxes.
4. **Test delivery** -- Verify that notifications are being sent correctly for each payment state.

## What's Next?

- [Email Notifications](./email.md) -- Set up email-based payment notifications
- [SMS Notifications](./sms.md) -- Configure SMS alerts for your customers
- [WhatsApp Notifications](./whatsapp/) -- Enable WhatsApp as a notification channel
- [Notification Templates](./templates.md) -- Understand template availability across channels and plugins
- [Delivery Process](./delivery-process.md) -- Learn how automatic and manual notification delivery works
