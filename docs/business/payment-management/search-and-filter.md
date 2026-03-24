---
title: Search & Filter Payments
sidebar_label: Search & Filter
---

# Search & Filter Payments

This guide explains how to display and filter payment links within the Ottu Dashboard. By following these steps, you can view payment links created by a specific user or processed through a specific [payment gateway](/docs/business/payments/gateways).

## Step-by-Step Instructions

### 1. Access the Transactions Section

From the Ottu Dashboard, open the **Payment Request** [plugin](/docs/business/plugins) and go to the **Transactions** subsection. All transactions performed via the Payment Request plugin are listed here.

### 2. Add Payment Link Headers

To display payment links and gateway names in the transactions table:

1. Navigate to the **Table Headers** subsection under **Settings**.
2. From the available headers, search for **Payment URL** and add it to the selected headers.
3. Also add **Gateway Name** to the selected headers.

When you return to the **Transactions** table, the **Payment URL** and **Gateway Name** columns will be visible.

:::tip
You can customize which columns appear in any transaction table. See [Proxy Fields](/docs/business/payment-management/transaction-insights#proxy-fields) for details on managing table headers.
:::

### 3. Filter by User

1. Click the **Filter** option.
2. In the **Created By** field, enter the username.
3. Click **Search**.

All payment links created by the specified user are displayed.

### 4. Filter by Payment Gateway

1. In the filter options, specify the desired **Payment Gateway**.
2. Click **Search**.

All payment links associated with the selected payment gateway are displayed.

## Video Demonstration

A tutorial video is available to provide a visual walkthrough of the filtering process:

<a href="https://drive.google.com/file/d/15hT4UKNmbXPppT6CdjwS0Hwi3cw_96mA/view?usp=sharing" target="_blank">Watch the video tutorial</a>

---

## What's Next?

- [Transaction Insights](/docs/business/payment-management/transaction-insights) -- Explore your transaction data and dashboard charts
- [Transaction States](/docs/business/payment-management/transaction-states) -- Understand the lifecycle of a payment
- [Plugins](/docs/business/plugins) -- Learn about Payment Request, E-Commerce, and Bulk plugins
