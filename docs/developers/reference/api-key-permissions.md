# API Key Permissions

Private API keys come in two modes — **full access** and **scoped** — controlling which API operations a key may perform. This page is the catalog of permissions a scoped key needs for each operation. See [Authentication](../getting-started/authentication.md#api-key-auth) for how keys work and how to send them.

## Full access vs. scoped keys

- A **full-access** key can call every endpoint that accepts private-key authentication. All keys created before permission scoping was introduced are full access and keep working unchanged — nothing about your existing integration breaks.
- A **scoped** key carries an explicit permission set. It can only perform the operations listed for those permissions below; any other request is rejected with `403 Forbidden`.

:::tip Least privilege
Give each integration its own scoped key holding only what it needs. A back-office tool that only issues refunds needs exactly one permission (`Can do refund`) — if that key ever leaks, refunds are the only thing at risk.
:::

:::note Checkout SDK flows are unaffected
Your customers' browser and mobile checkout flows authenticate with the [public key](../getting-started/authentication.md#public-key) and are never blocked by key scoping.
:::

## Permission catalog

Permissions use the same vocabulary as dashboard users (Basic Authentication) — one shared model everywhere.

### Creating and reading payments

| Operation | Required permission |
|---|---|
| Create a checkout / payment ([Checkout API](../payments/checkout-api.mdx)) | `Can add payment requests` or `Can add e-commerce payments` (per plugin) |
| Read or update a checkout | `Can view payment requests` / `Can change payment requests` (per plugin) |
| Upload an attachment | `Can add payment requests` (per plugin) |
| Create an invoice ([Invoice API](../invoices.mdx)) | `Can add payment requests` and `Can add Invoice` |
| Payment status inquiry ([Operations](../operations.md)) | `Can do inquiry` |
| List available payment methods | `Can view PG MID` |

### Post-payment operations

| Operation | Required permission |
|---|---|
| Refund | `Can do refund` |
| Capture | `Can do capture` |
| Void | `Can do void` |
| Cancel | `Can cancel transaction` |
| Delete | `Can delete transaction` |
| Expire | `Can do expire` |
| Acknowledge a cash payment | `Can acknowledge payment` |

### Charging without the customer present

| Operation | Required permission |
|---|---|
| Auto-debit a saved card | `Can do autodebit` |
| Charge a stored card token | `Can do autodebit` |
| Native Apple Pay / Google Pay / wallet payment (server-to-server) | `Can execute native payment` |

### Driving a checkout session server-side

| Operation | Required permission |
|---|---|
| Submit payment for a session (SDK submit / gateway-specific submit and pay endpoints) | `Can submit payment` |
| Wallet session actions (reserve, submit, cancel, OTP) | `Can submit payment` |
| Read session details / finalization status | `Can view payment transaction` |

### Cards, notifications, reports, wallet

| Operation | Required permission |
|---|---|
| List a customer's saved cards | `Can view card` |
| Delete a saved card token | `Can delete card` |
| Send a customer notification (email / SMS / WhatsApp) | `Can send payment notification` |
| Read notification unit configuration; shorten a payment link | `Can send payment notification` |
| List and download reports ([Reports API](../reports.mdx)) | `Can view report` |
| Wallet accounts, entries and operations | `Can view wallet section` |
| Compute a webhook payload signature | `Can view webhook config` |

:::info
Dashboard-internal endpoints (transaction search, refund listings, access logs, and similar) follow the same permission model with their own permissions; they are listed in the dashboard's role configuration rather than here.
:::

## Behavior summary

| Key | Result |
|---|---|
| Full-access key | Every operation allowed (unchanged behavior) |
| Scoped key **with** the operation's permission | Allowed |
| Scoped key **without** the operation's permission | `403 Forbidden` |

Each endpoint's page in the API reference also lists its exact permission requirements in its **Permissions** section.

## What's Next?

- [Authentication](../getting-started/authentication.md) — the three authentication methods and how to store keys safely
- [Operations](../operations.md) — the post-payment operations these permissions gate
- [Checkout API](../payments/checkout-api.mdx) — creating payments
