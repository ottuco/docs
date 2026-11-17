---
title: Create a Payment Link and Send It to Your Customer
sidebar_label: Create & Send a Payment Link
description: How to create a payment link in the Ottu Dashboard and send it to your customer by SMS, email or WhatsApp, copy the link, and send it again.
---

# Create a Payment Link and Send It to Your Customer

A payment link is a secure page where your customer pays the amount you set. You create it in the Ottu Dashboard with the [Payment Request](/business/plugins/payment-request) plugin, and Ottu can send it to the customer by email, SMS or WhatsApp. You can also copy the link and send it yourself.

**Who can do it:** a user with the **Can add payment requests** permission. If you do not see **Create** under **Payment Request**, ask your account administrator for it. See [Users and Access](/business/users-and-access/).

## How do I send a payment link to my customer?

1. In the Ottu Dashboard sidebar, click **Payment Request**, then **Create**.
2. Enter the **Amount**. If your account has several currencies, choose the **Currency code** first.
3. Choose the **Gateway** the customer will pay through. If you have only one, it is already selected.
4. Choose the **Language** of the payment page: English or Arabic.
5. Fill in the customer's details. To send the link by email, enter the **Customer email**. To send it by SMS or WhatsApp, enter the **Phone**.
6. Choose how Ottu sends the link. Tick **Pre-payment** next to each channel you want:
   - **Email Notification:** > **Pre-payment**
   - **SMS Notification:** > **Pre-payment**
   - **Whatsapp Notification:** > **Pre-payment**
7. Optional: tick **Post-payment** for a channel to also tell the customer the result, for example that the payment was received.
8. Optional: under **Config**, change the **Expiration time**. After it, the link can no longer be paid.
9. Click **Submit**.

Ottu creates the payment link, sends it through the channels you ticked, and opens the details of the new payment request.

:::note
You only see the fields and channels that are set up on your account. A notification channel appears when it has a provider and a message template: see [Notifications](/business/notifications). Fields such as **First Name**, **Last Name** and **Phone** appear when an administrator added them to the form: see [Plugin Fields Configuration](/business/plugins/payment-request#plugin-fields-configuration).
:::

## Copy the link and send it yourself

After you click **Submit**, the details page of the payment request shows the **Payment URL**.

1. Click the copy icon next to **Payment URL**. The message **Copied to clipboard** appears.
2. Paste the link into your own message to the customer, in any app.

The **Payment URL** is shown as long as the link can still be paid. To find it later, open **Payment Request** > **Transactions** and open the payment request's details.

## Send the link again

If the customer did not receive the link or lost it, send it again while it can still be paid:

1. Open **Payment Request** > **Transactions** and find the payment request.
2. Click the three-dot menu at the start of its row.
3. Choose **Email**, **SMS** or **WhatsApp**.
4. In the **Are you sure?** window, click **Yes**. The message **Customer notified.** appears.

The menu offers a channel only if you ticked **Pre-payment** for it when you created the link. If the channel you need is not there, copy the **Payment URL** and send it yourself, or create a new payment link.

To check whether a message was really sent, see [My customer did not get the SMS or email](/business/notifications/delivery-process#my-customer-did-not-get-the-sms-or-email).

## What happens next?

When the customer opens the link and pays, the payment request becomes **Paid** in **Payment Request** > **Transactions**. See [How can I see which transactions are paid and which are not?](/business/payment-management/search-and-filter#how-can-i-see-which-transactions-are-paid-and-which-are-not)

## What's Next?

- [Payment Request](/business/plugins/payment-request) -- Configure the plugin, its form fields and fees
- [Bulk Payment Request](/business/plugins/bulk-payment-request) -- Send payment links to many customers at once
- [Notifications](/business/notifications) -- Set up email, SMS and WhatsApp
- [Search & Filter Payments](/business/payment-management/search-and-filter) -- Find a payment link or list the ones a user created
