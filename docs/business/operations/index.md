---
title: Operations & Controls
sidebar_label: Operations & Controls
---

# Operations & Controls

Operations & Controls covers the security and authorization features that govern post-payment actions on the Ottu platform — specifically **refunds** and **voids**. These features let you define who can perform these operations and what approval workflow they must follow.

## Available Features

| Feature | Description |
|---------|-------------|
| [Refund & Void Access Control](./refund-void-access-control.mdx) | Assign refund and void permissions to specific users |
| [Two-Step Refund & Void Authorization](./two-step-authorization.mdx) | Require maker-checker approval before refunds or voids are executed |

## Why This Matters

Without controls, any dashboard user could potentially issue refunds or void transactions. For businesses handling high transaction volumes or sensitive operations, this creates risk. Ottu's operations controls let you:

- **Limit who can refund or void** — Grant permissions only to specific staff members
- **Require approval workflows** — Implement a maker-checker process where one user requests and another approves
- **Audit every action** — Track who requested, approved, or rejected each operation
- **Auto-expire stale requests** — Pending requests are automatically canceled after 48 hours (configurable)

:::tip
Start with [Refund & Void Access Control](./refund-void-access-control.mdx) to understand the permission model, then read [Two-Step Authorization](./two-step-authorization.mdx) to set up the approval workflow.
:::

## What's Next?

- [Refund & Void Access Control](./refund-void-access-control.mdx) — Set up user permissions for refunds and voids
- [Two-Step Refund & Void Authorization](./two-step-authorization.mdx) — Configure the maker-checker approval workflow
- [Payment Management](../payment-management/index.md) — View and manage all transactions
- [Settings](../settings/index.md) — Configure global dashboard settings
