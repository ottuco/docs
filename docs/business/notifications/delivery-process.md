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

## My customer did not get the SMS or email

When a customer says the SMS, email or WhatsApp message was not received, first check whether Ottu sent it, then send it again.

**Who can do it:** any dashboard user who can see the transaction. Only an administrator can see why a message failed.

### Check whether the message was sent

1. In the Ottu Dashboard sidebar, open the [plugin](/business/plugins), for example **Payment Request**, and click **Transactions**.
2. Find the transaction and open its details. See [How do I find one transaction?](/business/payment-management/search-and-filter#how-do-i-find-one-transaction)
3. Open the **Mail Logs** tab. Despite its name, it lists every email, SMS and WhatsApp message Ottu tried to send for this transaction.
4. Open an entry and read:
   - **Is sent**: a green icon means the message was sent, a red icon means it was not;
   - **Backend**: the channel, `mail`, `sms` or `whatsapp`;
   - the address or phone number the message went to.

What the result means:

- **No entry for the channel**: Ottu did not try to send. The channel was not chosen for this transaction, or it is not set up. See [Notifications](/business/notifications/).
- **Sent, but to a wrong address or number**: correct the customer's details on a new payment, or copy the payment link and send it yourself.
- **Sent to the right address or number**: Ottu handed the message to the email, SMS or WhatsApp provider. Ask the customer to check their spam folder or blocked senders, then send it again.
- **Not sent**: ask your administrator to read the reason (below).

### See why a message failed (administrators)

1. Click the three-dot menu in the top-right corner of the dashboard and click **Administration panel**.
2. In the top menu, click **DB Mailer**, then **Mail logs**.
3. Find the message. You can search by the customer's email or phone number, and filter by **Is sent**.
4. Open it and read **Error message**.

### Send the message again

1. In the **Transactions** table, click the three-dot menu at the start of the transaction's row.
2. Choose **Email**, **SMS** or **WhatsApp**.
3. In the **Are you sure?** window, click **Yes**. The message **Customer notified.** appears.

For a payment link, the menu offers a channel only if it was chosen when the link was created and the link can still be paid. Otherwise [copy the link and send it yourself](/business/plugins/create-payment-link#copy-the-link-and-send-it-yourself).

## What's Next?

- [Email Notifications](./email.md) -- Learn about email notification setup and states
- [SMS Notifications](./sms.md) -- Learn about SMS notification setup and states
- [WhatsApp Notifications](/business/notifications/whatsapp/) -- Explore WhatsApp notification options
- [Notification Templates](./templates.md) -- Understand template availability across channels
- [Transaction Insights](/business/payment-management/transaction-insights) -- Learn about the Transaction Table and payment monitoring
