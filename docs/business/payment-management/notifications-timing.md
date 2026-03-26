---
title: Notifications, URLs & Timing
sidebar_label: Notifications & Timing
---

# Notifications, URLs & Timing

Ottu keeps you informed about every stage of a payment's lifecycle through configurable notifications, provides short URLs for efficient SMS delivery, and lets you control how long payment links remain active.

## Notifications

Ottu's notification system lets you choose your preferred channels -- [Email](/business/notifications/email), [SMS](/business/notifications/sms), and [WhatsApp](/business/notifications/whatsapp) -- and sends alerts automatically when key payment events occur.

| Notification Event | Triggered When |
|---|---|
| **Created** | The payment transaction is successfully initiated. |
| **Failed** | The payment encounters an error, preventing completion (transitions to `failed` state). |
| **Authorized** | The payment is successfully authorized. |
| **Paid** | The payment is successfully processed (transitions to `paid` state). |
| **Canceled** | The payment is canceled. |
| **Expired** | The payment has reached its expiration date. |
| **Voided** | The payment transitions to the `voided` state. |
| **Refunded** | The payment transitions to the `refunded` state. |
| **Captured** | The payment is captured. |

:::tip
Configure which events trigger notifications and through which channels in the [Notification Channels](/business/notifications) settings. You can also customize notification templates -- see [Notification Templates](/business/notifications/templates).
:::

## Payment Short URL

Ottu's [URL shortener](/business/settings/url-shortener) automatically shortens payment links for SMS delivery, reducing SMS character consumption and making links easier to share. This is especially useful when sending payment links via SMS or WhatsApp, where message length directly affects cost.

:::note
The URL shortener must be configured before short URLs are generated. See [URL Shortener Settings](/business/settings/url-shortener) for setup instructions.
:::

## Payment Expiration Time

The expiration time defines how long a payment link remains active. During this window, a failed transaction can be retried by the customer. Once the expiration time elapses, the payment can no longer be processed and transitions to the `expired` [state](/business/payment-management/transaction-states).

Key points about expiration:

- **Default expiration** is configured at the plugin level and applies to all payment links created through that plugin.
- **Custom expiration** can be set per transaction when creating a payment via the API.
- Once expired, the payment link shows an expiration message to the customer instead of the checkout page.

:::warning
Ensure your expiration time is long enough for your use case. For payment links sent via SMS or email, consider that customers may not open the link immediately. A common practice is setting expiration to 24-72 hours for payment links and shorter windows (15-30 minutes) for checkout sessions.
:::

---

## What's Next?

- [Notification Channels](/business/notifications) -- Set up email, SMS, and WhatsApp notifications
- [Notification Templates](/business/notifications/templates) -- Customize the content of your notifications
- [Transaction States](/business/payment-management/transaction-states) -- Understand what each payment state means
- [URL Shortener Settings](/business/settings/url-shortener) -- Configure short URL generation
