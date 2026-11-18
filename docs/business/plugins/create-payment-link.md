---
title: Create a Payment Link and Send It to Your Customer
sidebar_label: Create & Send a Payment Link
description: How to create a payment link in the Ottu Dashboard and send it to your customer by SMS, email or WhatsApp, copy the link, and send it again.
---

import StepShow, { Step } from "@site/src/components/StepShow";

# Create a Payment Link and Send It to Your Customer

A payment link is a secure page where your customer pays the amount you set. You create it in the Ottu Dashboard with the [Payment Request](/business/plugins/payment-request) plugin, and Ottu can send it to the customer by email, SMS or WhatsApp. You can also copy the link and send it yourself.

**Who can do it:** a user with the **Can add payment requests** permission. If you do not see **Create** under **Payment Request**, ask your account administrator for it. See [Users and Access](/business/users-and-access/).

## How do I send a payment link to my customer?

<StepShow>

<Step image="/img/business/dashboard/sidebar-create.png" spot="19.8,36.2,36.4,13.5" alt="The dashboard sidebar with Create under Payment Request">

In the Ottu Dashboard sidebar, click **Payment Request**, then **Create**.

</Step>

<Step image="/img/business/dashboard/create-form-top.png" spot="1.7,29.7,53.4,8.4" alt="The Payment request form with Currency code and Amount">

Enter the **Amount**. If your account has several currencies, choose the **Currency code** first.

</Step>

<Step image="/img/business/dashboard/create-form-top.png" spot="1.7,53.5,94.9,9.1" alt="The Gateway field of the Payment request form">

Choose the **Gateway** the customer will pay through. If you have only one, it is already selected.

</Step>

<Step image="/img/business/dashboard/create-form-top.png" spot="1.7,64.1,94.9,10.2" alt="The Language field of the Payment request form">

Choose the **Language** of the payment page: English or Arabic.

</Step>

<Step image="/img/business/dashboard/create-form-top.png" spot="1.7,78.7,94.9,8.8" alt="The Customer email field of the Payment request form">

Fill in the customer's details. To send the link by email, enter the **Customer email**. To send it by SMS or WhatsApp, enter the **Phone**.

</Step>

<Step image="/img/business/dashboard/create-form-top.png" spot="17.7,90.8,14.8,8" alt="Email Notification with the Pre-payment and Post-payment checkboxes">

Choose how Ottu sends the link. Tick **Pre-payment** next to each channel you want:

- **Email Notification:** > **Pre-payment**
- **SMS Notification:** > **Pre-payment**
- **Whatsapp Notification:** > **Pre-payment**

</Step>

<Step>

Optional: tick **Post-payment** for a channel to also tell the customer the result, for example that the payment was received.

</Step>

<Step image="/img/business/dashboard/create-form-bottom.png" spot="1.7,78.7,94.9,7.3" alt="The Config section of the form, with Expiration time">

Optional: under **Config**, change the **Expiration time**. After it, the link can no longer be paid.

</Step>

<Step image="/img/business/dashboard/create-form-bottom.png" spot="43.9,91.8,12.3,6.2" alt="The Submit button at the bottom of the Payment request form">

Click **Submit**.

</Step>

</StepShow>

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

<StepShow>

<Step image="/img/business/payment-management/export-sidebar.png" spot="19,53,42,13" alt="The dashboard sidebar with Payment Request open and Transactions selected">

Open **Payment Request** > **Transactions** and find the payment request.

</Step>

<Step image="/img/business/dashboard/row-actions.png" spot="26.8,69.7,9.9,27.1" alt="The three-dot menu at the start of a row, in the Actions column">

Click the three-dot menu at the start of its row.

</Step>

<Step>

Choose **Email**, **SMS** or **WhatsApp**.

</Step>

<Step image="/img/business/dashboard/are-you-sure.png" spot="30.9,61.3,19.8,27" alt="The Are you sure? window with Yes and No">

In the **Are you sure?** window, click **Yes**. The message **Customer notified.** appears.

</Step>

</StepShow>

The menu offers a channel only if you ticked **Pre-payment** for it when you created the link. If the channel you need is not there, copy the **Payment URL** and send it yourself, or create a new payment link.

To check whether a message was really sent, see [My customer did not get the SMS or email](/business/notifications/delivery-process#my-customer-did-not-get-the-sms-or-email).

## What happens next?

When the customer opens the link and pays, the payment request becomes **Paid** in **Payment Request** > **Transactions**. See [How can I see which transactions are paid and which are not?](/business/payment-management/search-and-filter#how-can-i-see-which-transactions-are-paid-and-which-are-not)

## What's Next?

- [Payment Request](/business/plugins/payment-request) -- Configure the plugin, its form fields and fees
- [Bulk Payment Request](/business/plugins/bulk-payment-request) -- Send payment links to many customers at once
- [Notifications](/business/notifications) -- Set up email, SMS and WhatsApp
- [Search & Filter Payments](/business/payment-management/search-and-filter) -- Find a payment link or list the ones a user created
