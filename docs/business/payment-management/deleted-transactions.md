---
title: Deleted Transactions and How to Restore Them
sidebar_label: Deleted Transactions
description: A paid transaction was deleted by mistake. Where to find deleted transactions in the Ottu Dashboard and how to restore one.
---

import StepShow, { Step } from "@site/src/components/StepShow";

# Deleted Transactions and How to Restore Them

A paid transaction that was deleted by mistake is not lost. Ottu keeps it in a separate list, **Deleted Paid Transactions**, and you can bring it back to the transactions table from there.

## A paid transaction was deleted by mistake. How do I bring it back?

**Who can do it:** a user with the **Can restore payment requests** permission (for the E-Commerce plugin: **Can restore e-commerce payments**). If you do not see **Deleted Paid Transactions** in the sidebar or **Restore** under **Actions**, ask your account administrator to restore the transaction or to give you the permission. See [Users and Access](/business/users-and-access/).

<StepShow>

<Step image="/img/business/dashboard/sidebar-deleted.png" alt="The dashboard sidebar with Payment Request open">

In the Ottu Dashboard sidebar, open the [plugin](/business/plugins) the transaction belongs to, for example **Payment Request**.

</Step>

<Step image="/img/business/dashboard/sidebar-deleted.png" spot="20.5,68.7,68.8,13.5" alt="Deleted Paid Transactions in the sidebar, under Payment Request">

Click **Deleted Paid Transactions**.

</Step>

<Step image="/img/business/dashboard/search-bar.png" alt="The search above the transactions table: Select field, the Search box and the Search button">

Find the transaction. The list has the same **Filter** and search as the transactions table: see [Search & Filter Payments](/business/payment-management/search-and-filter).

</Step>

<Step image="/img/business/dashboard/row-actions.png" spot="4.5,75,8,21" alt="The checkbox at the start of a row in the table">

Tick the checkbox at the start of the transaction's row. To restore several transactions at once, tick each of them.

</Step>

<Step image="/img/business/payment-management/export-toolbar.png" spot="20.8,25.8,17.8,31" alt="The Actions button above the table, next to Export Transactions">

Click **Actions** above the table and choose **Restore**.

</Step>

<Step image="/img/business/dashboard/are-you-sure.png" spot="30.9,61.3,19.8,27" alt="The Are you sure? window with Yes and No">

In the **Are you sure?** window, click **Yes**.

</Step>

</StepShow>

The message **Transaction restored.** appears and the transaction is back in the plugin's **Transactions** table, in the same [state](/business/payment-management/transaction-states) it had before.

**Restore** is only in **Actions** above the table. The three-dot menu of a row does not have it.

## Which deleted transactions can be restored?

- **Can be restored:** a transaction that was paid, authorized, refunded, voided, expired or canceled, or on which the customer had made a successful payment attempt. It is in **Deleted Paid Transactions**.
- **Cannot be restored:** a transaction that was never paid and had no successful attempt (state Created, Pending, Attempted or Failed). It is removed for good. Create the payment again.

Deleting a transaction in Ottu does not refund or cancel the payment at the bank. The customer's payment stays as it was.

## How does a transaction get deleted?

A user with the **Can delete payment requests** permission can delete a transaction from the transactions table: three-dot menu of the row > **Delete** > **Yes**.

Ottu refuses to delete a transaction in two cases:

- The customer is paying right now. Wait until the customer finishes.
- The transaction is authorized and still holds the customer's funds. [Void](/business/operations) it first.

## What's Next?

- [Search & Filter Payments](/business/payment-management/search-and-filter) -- Find a transaction in a table
- [Users and Access](/business/users-and-access/) -- See who is on your account and what they can do
- [Transaction States](/business/payment-management/transaction-states) -- What each state means
