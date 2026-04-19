---
title: Email Notifications
sidebar_label: Email
---

# Email Notifications

Email is a widely used and reliable channel for sending payment-related notifications to customers. It provides a secure way to communicate important payment details such as payment confirmations, status updates, and notifications for actions performed on a transaction (e.g., refunds, voids).

## Prerequisites

Before email notifications can be sent, the following must be in place:

1. **Customer Email** -- The customer's email address must be collected during payment transaction creation. To make the email field mandatory, contact the [Ottu support team](mailto:support@ottu.com).

   ![Customer email field](/img/business/notifications/email-customer-email-field.png)

2. **Template Configured** -- The email template must be fully configured and reviewed for accuracy before enabling email notifications. To configure email templates, contact the [Ottu support team](mailto:support@ottu.com).

3. **Enable Email Templates** -- Merchants activate email notifications by selecting the appropriate checkboxes during payment transaction creation. Templates can be enabled for pre-payment, post-payment, or both, depending on the requirement.

   ![Email notification checkboxes](/img/business/notifications/email-notification-checkboxes.png)

## Notification Availability

Ottu sends email notifications to customers based on specific states in the payment lifecycle.

### Pre/Post Payment States

Email notifications are triggered for the following [payment states](/business/payment-management/transaction-states):

| State | Description |
|-------|-------------|
| `created` | Payment session has been created |
| `paid` | Payment completed successfully |
| `authorized` | Payment authorized (pending capture) |
| `canceled` | Payment was canceled |
| `failed` | Payment attempt failed |
| `expired` | Payment session expired |

### Operation States

Email notifications are also triggered for the following [operation states](/business/operations/):

| State | Description |
|-------|-------------|
| `captured` | Authorized amount was captured |
| `refunded` | Payment was refunded |
| `voided` | Authorized payment was voided |

:::note
For the [E-Commerce](/business/plugins/e-commerce) plugin, pre-payment email notifications are not available. Only post-payment and post-operation email notifications are supported.
:::

## What's Next?

- [SMS Notifications](./sms.md) -- Configure SMS as an additional notification channel
- [WhatsApp Notifications](/business/notifications/whatsapp/) -- Set up WhatsApp notifications for your customers
- [Notification Templates](./templates.md) -- See the full template availability matrix
- [Delivery Process](./delivery-process.md) -- Understand automatic vs. manual notification delivery
