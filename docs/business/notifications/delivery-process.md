---
title: Notification Delivery Process
sidebar_label: Delivery Process
---

# Notification Delivery Process

Ottu supports two methods for delivering notifications to customers: **automatic** and **manual**. The delivery method depends on the notification channel being used.

## Automatic and Manual Channels

### Email, SMS, and Integrated WhatsApp

These channels support both automatic and manual notification delivery:

1. **Automatic Notification** -- A notification is automatically sent to the customer when a specific trigger state occurs (e.g., payment created, payment paid, refund processed). No merchant action is required.

2. **Manual Notification** -- Merchants can also manually trigger a notification at any time by clicking the three-dot menu under the **Action** column in the [Transaction Table](/business/payment-management/transaction-insights#transaction-table). Select the icon for the desired notification channel (Email, SMS, or WhatsApp) to send the notification.

:::tip
Manual notifications are useful when you need to resend a notification that the customer may have missed, or when you want to send an update at a specific time.
:::

### Manual WhatsApp Channel

The [Manual WhatsApp channel](./whatsapp/manual.md) does **not** send notifications automatically. Merchants must manually trigger every WhatsApp notification through the [Transaction Table](/business/payment-management/transaction-insights#transaction-table).

![Manual notification trigger in Transaction Table](/img/business/notifications/manual-notification-trigger.png)

## Delivery Summary

| Channel | Automatic | Manual |
|---------|:---------:|:------:|
| [Email](./email.md) | Yes | Yes |
| [SMS](./sms.md) | Yes | Yes |
| [Integrated WhatsApp](./whatsapp/integrated.md) | Yes | Yes |
| [Manual WhatsApp](./whatsapp/manual.md) | -- | Yes |

## How to Manually Trigger a Notification

1. Navigate to the [Transaction Table](/business/payment-management/transaction-insights#transaction-table) in the Ottu dashboard.
2. Locate the transaction you want to notify the customer about.
3. Click the three-dot menu (action icon) at the end of the transaction row.
4. Select the notification channel icon (Email, SMS, or WhatsApp).
5. The notification is sent to the customer using the configured template for that channel and payment state.

## What's Next?

- [Email Notifications](./email.md) -- Learn about email notification setup and states
- [SMS Notifications](./sms.md) -- Learn about SMS notification setup and states
- [WhatsApp Notifications](./whatsapp/) -- Explore WhatsApp notification options
- [Notification Templates](./templates.md) -- Understand template availability across channels
- [Transaction Insights](/business/payment-management/transaction-insights) -- Learn about the Transaction Table and payment monitoring
