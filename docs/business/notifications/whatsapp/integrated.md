---
title: Integrated WhatsApp Channel
sidebar_label: Integrated Channel
---

# Integrated WhatsApp Channel

The integrated WhatsApp channel streamlines payment notifications by automatically sending pre-payment and post-payment updates to customers via WhatsApp -- no manual intervention required.

## Prerequisites

Before integrated WhatsApp notifications can be sent, the following must be in place:

1. **Customer Phone Number** -- The customer's phone number must be collected during transaction creation. To add the customer phone number field, contact the [Ottu support team](mailto:support@ottu.com).

   <!-- TODO: Screenshot of customer phone number field in transaction creation -->

2. **WhatsApp Business Account and Template Approval** -- The merchant must have a WhatsApp Business account. All notification templates and their content must be approved by Meta/WhatsApp before they can be used.

3. **WhatsApp Integration Authenticator** -- This acts as the link between WhatsApp and Ottu. To configure it, contact the [Ottu support team](mailto:support@ottu.com).

4. **WhatsApp Template Configuration** -- Merchants create templates on the WhatsApp server. These templates must then be linked through the WhatsApp Integration Authenticator. Provide the Ottu support team with the **Template Name** and **Namespace** used when creating your templates on the WhatsApp server. The [Ottu support team](mailto:support@ottu.com) will configure these templates within the Ottu system.

5. **Enable WhatsApp Templates** -- Activate WhatsApp notifications by selecting the checkbox designated for WhatsApp templates during payment transaction creation. Templates can be enabled for pre-payment, post-payment, or both, depending on your requirements.

   <!-- TODO: Screenshot of WhatsApp template checkboxes in transaction creation -->

## Notification Availability

Ottu sends integrated WhatsApp notifications to customers at key stages of the payment process, ensuring timely updates on important transaction states.

### Pre/Post Payment States

WhatsApp notifications are triggered for the following [payment states](/business/payment-management/transaction-states):

| State | Description |
|-------|-------------|
| `created` | Payment session has been created |
| `paid` | Payment completed successfully |
| `authorized` | Payment authorized (pending capture) |
| `canceled` | Payment was canceled |
| `failed` | Payment attempt failed |
| `expired` | Payment session expired |

:::note
The integrated WhatsApp channel does not support notifications for operation states (capture, refund, void). For operation-level notifications, use [Email](../email.md) or [SMS](../sms.md) channels instead.
:::

:::note
For the [E-Commerce](/business/plugins/e-commerce) plugin, pre-payment WhatsApp notifications are not available. Only post-payment notifications are supported via this channel.
:::

## What's Next?

- [Manual WhatsApp Channel](./manual.md) -- Learn about the manually triggered WhatsApp option
- [Notification Templates](../templates.md) -- See the full template availability matrix
- [Delivery Process](../delivery-process.md) -- Understand automatic vs. manual notification delivery
