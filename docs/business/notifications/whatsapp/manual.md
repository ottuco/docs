---
title: Manual WhatsApp Channel
sidebar_label: Manual Channel
---

# Manual WhatsApp Channel

The manual WhatsApp channel lets merchants notify customers about payment updates via WhatsApp on demand. Rather than sending notifications automatically, merchants trigger each notification manually from the Ottu dashboard, giving full control over when and to whom WhatsApp messages are sent.

## Prerequisites

Before manual WhatsApp notifications can be sent, the following must be in place:

1. **Customer Phone Number** -- The customer's phone number must be collected during transaction creation. To add the customer phone number field, contact the [Ottu support team](mailto:support@ottu.com).

   <!-- TODO: Screenshot of customer phone number field in transaction creation -->

2. **WhatsApp Template Configuration** -- WhatsApp notification templates must be fully configured. To set up the required templates, contact the [Ottu support team](mailto:support@ottu.com).

3. **Enable WhatsApp Notification** -- Merchants activate the manual WhatsApp channel by selecting the corresponding checkbox during payment transaction creation.

   <!-- TODO: Screenshot of WhatsApp notification checkbox in transaction creation -->

## Notification Availability

Merchants can manually trigger WhatsApp notifications when the payment is in one of the following states:

| State | Description |
|-------|-------------|
| `created` | Payment session has been created |
| `pending` | Payment is in progress |
| `attempted` | A payment attempt has been made |

:::warning
The Manual WhatsApp channel and the [Integrated WhatsApp channel](./integrated.md) cannot be activated simultaneously. You must choose one or the other for a given transaction.
:::

## How It Works

When a merchant initiates a manual WhatsApp notification:

1. The merchant clicks the WhatsApp notification action in the [Transaction Table](/docs/business/payment-management/transaction-insights#transaction-table).
2. The merchant is redirected to the WhatsApp server.
3. The pre-configured notification template is displayed.
4. The merchant reviews and sends the notification to the customer.

For more details on triggering manual notifications, see the [Delivery Process](../delivery-process.md) page.

## What's Next?

- [Integrated WhatsApp Channel](./integrated.md) -- Learn about the fully automated WhatsApp option
- [Notification Templates](../templates.md) -- See the full template availability matrix
- [Delivery Process](../delivery-process.md) -- Understand automatic vs. manual notification delivery
