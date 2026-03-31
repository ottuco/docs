---
title: Satellite
sidebar_label: Satellite
---

# Satellite

Ottu Satellite is a multi-installation management dashboard. It provides a centralized view of all your Ottu installations, automates Shopify billing, and manages subscriptions — all from one place.

## Purpose

| Feature | Description |
|---------|-------------|
| **Comprehensive Overview** | A holistic view of all merchant installations at a glance |
| **Transaction Insights** | Detailed insights into transactions across all installations |
| **Shopify Billing Automation** | Automatic invoice generation based on agreed transaction percentages |
| **Subscription Dashboard** | Manage yearly Ottu subscriptions and monthly Shopify billing |

## Installments and Transactions Summary

### Ottu Installments Summary

From the **Overview** section on the Satellite Dashboard, you get a centralized view of all installations associated with your Ottu account:

| Field | Description |
|-------|-------------|
| **Plugin Type** | Category of the plugin used to facilitate transactions |
| **Count** | Total number of transactions sharing the same plugin type and currency |
| **Amount** | Cumulative monetary value of all transactions for a given plugin type and currency |
| **Currency** | Three-letter currency code used in transactions |

**Search and Filter:** Find installations by plugin type, installation name, and creation/modification dates.

![Installments Overview](/img/business/satellite/installments-overview.png)

### Transactions

The **Transactions** section provides an overview of all transactions across related installations:

| Field | Description |
|-------|-------------|
| **Order No** | Unique identifier for the transaction |
| **Merchant** | Installation name |
| **Plugin Type** | Plugin category used for the transaction |
| **Amount** | Transaction amount |
| **Currency Code** | Currency of the transaction |
| **Status** | Current state of the transaction. See [Transaction States](/business/payment-management/transaction-states) |
| **Created** | Date the transaction was created |
| **Modified** | Date the transaction was last updated |

**Search and Filter:** Find transactions by plugin type, installation name, payment gateway name/code, status, and creation/modification dates.

![Transactions Overview](/img/business/satellite/transactions-overview.png)

## Shopify Billing Automation

Satellite automates the entire billing process for merchants using the Shopify plugin:

1. **Detection** — On the first day of each month, Satellite detects all Shopify transactions for every merchant
2. **Invoice Generation** — Automatically creates invoices based on the agreed-upon percentage between the Shopify merchant and Ottu
3. **Notification** — Merchants receive an email with charge details and a payment link

This eliminates manual report compilation and invoice creation, reducing processing time and communication gaps.

## Subscription Management

The **Subscriptions** tab provides an overview of all active subscriptions and billing details:

- **Shopify Invoices** — Review invoices with a breakdown for each billing cycle
- **Yearly Subscription Management** — Manage your Ottu subscription
- **Invoice Operations** — Download invoices or click **Pay Now** to be redirected to the Ottu checkout page

![Subscription Invoice Operations](/img/business/satellite/subscription-invoice-operations.png)

- **Subscription History** — Complete view of all past payments through the subscription board

![Subscription History](/img/business/satellite/subscription-history.png)

## FAQ

**What kind of transaction insights does Satellite provide?**
Satellite provides granular data on transactions across all installations, including plugin type, amount, currency, and status — enabling informed business decisions.

**What advantages does Shopify billing automation bring?**
It eliminates manual effort, reduces processing time, and ensures transparent, timely communication with merchants through automated invoice generation and email notifications.

**Can merchants perform operations on their invoices?**
Yes — merchants can download invoices and initiate payments. The **Pay Now** button redirects to the Ottu checkout page for seamless payment.

## What's Next?

- **[Real Estate](/business/industry/real-estate/)** — Property management, tenant contracts, and invoicing
- **[Integrations](/business/integrations)** — Shopify and other e-commerce platform integrations
- **[Payment Management](/business/payment-management/)** — Track transactions across all installations
