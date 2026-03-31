---
title: Notification Templates
sidebar_label: Templates
---

# Notification Templates

Notification templates define the content and format of messages sent to customers through each channel. Template availability varies depending on the [plugin](/business/plugins/) being used and the payment phase.

## Template Availability Matrix

The table below summarizes which notification templates are available for [Payment Request](/business/plugins/payment-request) and [E-Commerce](/business/plugins/e-commerce) across different channels and payment phases.

| Payment Phase | Channel | E-Commerce | Payment Request |
|:---:|:---:|:---:|:---:|
| **Pre-payment** | SMS | -- | Yes |
| | Email | -- | Yes |
| | WhatsApp (Manual) | -- | Yes |
| | WhatsApp (Integrated) | -- | Yes |
| **Post-payment** | SMS | Yes | Yes |
| | Email | Yes | Yes |
| | WhatsApp (Manual) | Yes | Yes |
| | WhatsApp (Integrated) | Yes | Yes |
| **Post-operation** _(capture, refund, void)_ | SMS | Yes | Yes |
| | Email | Yes | Yes |
| | WhatsApp (Manual) | -- | -- |
| | WhatsApp (Integrated) | -- | -- |

### Key Takeaways

- **Pre-payment notifications** are only available for the [Payment Request](/business/plugins/payment-request) plugin. The [E-Commerce](/business/plugins/e-commerce) plugin does not support pre-payment notifications on any channel.
- **Post-payment notifications** are available across all channels for both plugins.
- **Post-operation notifications** (after capture, refund, or void) are supported only through [Email](./email.md) and [SMS](./sms.md). WhatsApp channels do not support post-operation notifications.

## Configuring Templates

Template configuration is managed by the [Ottu support team](mailto:support@ottu.com). To set up or modify notification templates:

1. **Contact support** -- Reach out to the [Ottu support team](mailto:support@ottu.com) with the channel(s) you want to configure.
2. **Provide template content** -- Supply the message content, including any dynamic fields (e.g., amount, order reference, payment status).
3. **Review and approve** -- The support team configures the template. Review it for accuracy before enabling it on your transactions.
4. **WhatsApp-specific step** -- For WhatsApp templates, you must also get approval from Meta/WhatsApp and provide the **Template Name** and **Namespace** to the Ottu support team. See [Integrated WhatsApp Channel](./whatsapp/integrated.md#prerequisites) for details.

## What's Next?

- [Email Notifications](./email.md) -- Learn about email notification setup and availability
- [SMS Notifications](./sms.md) -- Learn about SMS notification setup and availability
- [WhatsApp Notifications](./whatsapp/) -- Learn about WhatsApp notification options
- [Delivery Process](./delivery-process.md) -- Understand how notifications are delivered (automatic vs. manual)
