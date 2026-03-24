---
title: SMS Notifications
sidebar_label: SMS
---

# SMS Notifications

SMS is a fast and convenient channel for sending payment-related notifications to customers. With high open rates and immediate delivery, SMS is ideal for concise, time-sensitive updates such as payment confirmations, status changes, and critical actions performed on a transaction (e.g., refunds, voids).

## Prerequisites

Before SMS notifications can be sent, the following must be in place:

1. **Customer Phone Number** -- The customer's phone number must be collected during payment transaction creation. To make the phone number field mandatory, contact the [Ottu support team](mailto:support@ottu.com).

   <!-- TODO: Screenshot of customer phone number field in transaction creation -->

2. **SMS Template Configuration** -- SMS templates must be fully configured and reviewed for accuracy before enabling SMS notifications. To configure SMS templates, contact the [Ottu support team](mailto:support@ottu.com).

3. **Enable SMS Templates** -- Merchants activate SMS notifications by selecting the corresponding checkboxes during payment transaction creation. Templates can be enabled for pre-payment, post-payment, or both, depending on the requirement.

   <!-- TODO: Screenshot of SMS template checkboxes in transaction creation -->

4. **SMS Provider** -- A dedicated SMS provider must be configured. Contact the [Ottu support team](mailto:support@ottu.com) to add and set up your SMS provider.

## Notification Availability

Ottu sends SMS notifications to customers based on key states in the payment lifecycle, ensuring timely updates on important transaction events.

### Pre/Post Payment States

SMS notifications are triggered for the following [payment states](/docs/business/payment-management/transaction-states):

| State | Description |
|-------|-------------|
| `created` | Payment session has been created |
| `paid` | Payment completed successfully |
| `authorized` | Payment authorized (pending capture) |
| `canceled` | Payment was canceled |
| `failed` | Payment attempt failed |
| `expired` | Payment session expired |

### Operation States

SMS notifications are also triggered for the following [operation states](/docs/business/operations/):

| State | Description |
|-------|-------------|
| `captured` | Authorized amount was captured |
| `refunded` | Payment was refunded |
| `voided` | Authorized payment was voided |

:::note
For the [E-Commerce](/docs/business/plugins/e-commerce) plugin, pre-payment SMS notifications are not available. Only post-payment and post-operation SMS notifications are supported.
:::

## What's Next?

- [Email Notifications](./email.md) -- Set up email as a notification channel
- [WhatsApp Notifications](./whatsapp/) -- Enable WhatsApp notifications for your customers
- [Notification Templates](./templates.md) -- See the full template availability matrix
- [Delivery Process](./delivery-process.md) -- Understand automatic vs. manual notification delivery
