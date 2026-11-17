---
title: Deleted Transactions and How to Restore Them
sidebar_label: Deleted Transactions
description: A paid transaction was deleted by mistake. Where to find deleted transactions in the Ottu Dashboard and how to restore one.
---

# Deleted Transactions and How to Restore Them

A paid transaction that was deleted by mistake is not lost. Ottu keeps it in a separate list, **Deleted Paid Transactions**, and you can bring it back to the transactions table from there.

## A paid transaction was deleted by mistake. How do I bring it back?

**Who can do it:** a user with the **Can restore payment requests** permission (for the E-Commerce plugin: **Can restore e-commerce payments**). If you do not see the menu or the **Restore** action, ask your account administrator to restore the transaction or to give you the permission. See [Users and Access](/business/users-and-access/).

1. In the Ottu Dashboard sidebar, open the [plugin](/business/plugins) the transaction belongs to, for example **Payment Request**.
2. Click **Deleted Paid Transactions**.
3. Find the transaction. The list has the same **Filter** and search as the transactions table: see [Search & Filter Payments](/business/payment-management/search-and-filter).
4. Click the three-dot menu at the start of the transaction's row and choose **Restore**.
5. In the **Are you sure?** window, click **Yes**.

The message **Transaction restored.** appears and the transaction is back in the plugin's **Transactions** table, in the same [state](/business/payment-management/transaction-states) it had before.

To restore several transactions at once, tick their rows, click **Actions** and choose **Restore**.

## Which deleted transactions can be restored?

| The deleted transaction | Can it be restored? |
|---|---|
| Was paid, authorized, refunded, voided, expired or canceled, or the customer had made a successful payment attempt on it | Yes. It is in **Deleted Paid Transactions**. |
| Was never paid and had no successful attempt (state Created, Pending, Attempted or Failed) | No. It is removed for good. Create the payment again. |

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
