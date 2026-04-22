---
title: WhatsApp Notifications
sidebar_label: WhatsApp
---

# WhatsApp Notifications

WhatsApp provides a conversational way to communicate payment information to customers. With its widespread adoption, WhatsApp notifications offer a familiar and user-friendly platform for receiving payment updates -- especially in regions where WhatsApp is commonly used for business communications.

Ottu supports two approaches for sending WhatsApp notifications:

## Integrated WhatsApp Channel

The [Integrated WhatsApp Channel](./integrated.md) automatically sends payment-related notifications to customers using their phone numbers. Integrated with Ottu's [Payment Request](/business/plugins/payment-request) and [E-Commerce](/business/plugins/e-commerce) plugins, it provides a hands-off approach to customer communication -- notifications are triggered automatically when payment states change.

**Best for:** Merchants who want fully automated WhatsApp notifications without manual intervention.

## Manual WhatsApp Channel

The [Manual WhatsApp Channel](./manual.md) lets merchants manually trigger WhatsApp notifications. When a merchant initiates the notification, they are redirected to the WhatsApp server where a pre-configured template is displayed, ready to send to the customer.

**Best for:** Merchants who want control over when WhatsApp notifications are sent, or who need to send notifications selectively.

:::note
WhatsApp notifications are currently supported only for the [Payment Request](/business/plugins/payment-request) and [E-Commerce](/business/plugins/e-commerce) plugins, and are limited to pre-payment and post-payment states. Post-operation notifications (capture, refund, void) are not available via WhatsApp.
:::

## What's Next?

- [Integrated WhatsApp Channel](./integrated.md) -- Set up automatic WhatsApp notifications
- [Manual WhatsApp Channel](./manual.md) -- Learn about manually triggered WhatsApp notifications
- [Email Notifications](../email.md) -- Consider email as a complementary channel
- [SMS Notifications](../sms.md) -- Consider SMS as a complementary channel
- [Notification Templates](../templates.md) -- See the full template availability matrix
