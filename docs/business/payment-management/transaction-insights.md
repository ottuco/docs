---
title: Transaction Insights
sidebar_label: Transaction Insights
---

# Transaction Insights

Ottu provides detailed transaction tables and visual dashboard charts so you can monitor, analyze, and manage your payments from one place.

## Transaction Table

Every installed [plugin](/docs/business/plugins) includes a transaction table that gives you full visibility into your transaction history. From the transaction table, you can perform payment [operations](/docs/business/operations) such as voiding, refunding, and capturing.

:::note
To access the transaction table, navigate to the **Transactions** tab located under each installed [plugin](/docs/business/plugins).
:::

### Proxy Fields

Ottu lets you customize which columns (headers) appear in each plugin's transaction table, so you can surface the information that matters most to your business.

#### How to Activate Headers Settings

1. From the **Ottu Dashboard**, navigate to the **Administration Panel**.
2. Access the **Plugin Config** for the desired transaction table.
3. Enable the **Individual Proxy Fields** option by ticking the checkbox.

![Activating proxy fields in Plugin Config](/img/business/placeholder.png)

#### Managing the Header List

1. From the **Ottu Dashboard**, go to the desired **Plugin** tab.
2. Access **Settings**.
3. In the **Table Headers** section, add or remove headers by dragging them between the available and selected columns (right to left or vice versa).

![Adding or removing transaction table headers](/img/business/placeholder.png)

#### Child Table Transactions

[Child transactions](#child-transactions) are generated from capture, refund, or void [operations](/docs/business/operations). These transactions are linked to the original payment transaction (the **parent transaction**) and displayed beneath it. Child transaction headers inherit from the parent transaction's headers for consistency.

![Child transaction headers under a parent transaction](/img/business/placeholder.png)

### Amounts Breakdown

The transaction table supports multiple amount-related columns. You can add or remove these via [proxy fields](#proxy-fields). Each amount header serves a specific role in the payment process:

#### Amount

The initial amount when the transaction is first created.

#### Settled Amount

The amount in the same currency as the initial amount.

- **Editable amount:** The amount the customer entered at checkout. If the customer pays the full required amount, this equals the initial [amount](#amount).
- **Non-editable amount:** The settled amount is the same as the initial [amount](#amount).

#### Paid Amount

The amount transferred or credited to the merchant's bank account.

- **For purchase transactions:** The settled amount including any fee.
- **For authorize transactions:** The total amount captured by staff.

:::note
Whether a transaction is a purchase or authorization is determined by the [payment gateway](/docs/business/payments/gateways) configuration -- specifically the gateway settings (MID) operation configuration.
:::

#### Remaining Amount

The difference between the initial [Amount](#amount) and the [Settled Amount](#settled-amount):

> Remaining Amount = Amount - Settled Amount

#### Fee

An additional amount added on top of the initial [amount](#amount), which the customer pays.

:::note
Depending on [currency configuration](/docs/business/payments/currencies) and the selected [payment gateway](/docs/business/payments/gateways), fees may or may not apply to transactions in the default or foreign currency.
:::

#### Refunded Amount

The amount returned to the customer's bank account, deducted from the [paid amount](#paid-amount).

#### Voided Amount

The full transaction amount credited back to the customer's bank account when a void (rollback) is completed. Voiding is only applicable for authorized payments that have not been fully or partially captured.

:::note
- **Capture** can include the entire amount (settled amount + fee).
- **Refund** can only return the settled amount (without the fee).
- **Void** nullifies the entire amount, including any associated fee.
:::

## Dashboard Charts

The Ottu Dashboard provides visual charts so you can track transactions and sales performance at a glance. These charts update in real time and are available from the main dashboard.

### Total Transactions

Shows the total transaction value and overall success rate across different time periods.

![Total Transactions chart](/img/business/placeholder.png)

### Average Transaction

Displays the average transaction value over the selected period.

![Average Transaction chart](/img/business/placeholder.png)

### Product-Wise Sales

Breaks down sales by product, helping you identify top performers.

![Product-Wise Sales chart](/img/business/placeholder.png)

### Recent Orders Report

Lists the most recent orders for quick review.

![Recent Orders Report](/img/business/placeholder.png)

---

## What's Next?

- [Transaction States](/docs/business/payment-management/transaction-states) -- Understand what each payment state means
- [Search & Filter Payments](/docs/business/payment-management/search-and-filter) -- Find specific transactions quickly
- [Operations](/docs/business/operations) -- Perform refunds, voids, and captures
- [Transaction Reports](/docs/business/settings/transaction-reports) -- Export your transaction data
