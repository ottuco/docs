# Authentication

Navigating the digital commerce and financial transactions landscape requires a keen understanding of security, specifically authentication methods. At Ottu, we support three distinct types of authentication to help ensure the safe and seamless operation of your payment system: [Basic Authentication](authentication.md#basic-auth), [Private Key (API-Key)](authentication.md#api-key-auth), and [Public Key](authentication.md#public-key).

## Basic Authentication {#basic-auth}

Basic Authentication employs a username and password combination. The access permissions associated with the username must be explicitly defined.

**Header:** `Authorization Basic <username:password>` **basic auth string**.

Please ensure that you follow best practices for credential security. Never **store** passwords in your code or on the client side. It’s recommended not to assign super-admin permissions via this method, but to carefully regulate the access permissions for each user. Securely store the credentials within the server environment.

## Private Key (API-Key) {#api-key-auth}

This key is a high-privilege access token used for server-side communication between your server and Ottu’s API. The private API key should be closely guarded and never shared.

**Header:** `Authorization`\
**Value:** `Api-Key {{api_key}}`

:::warning Shown only once

The private key is displayed **exactly once, at the moment it is created**. Ottu does not store it in a readable form, so it cannot be retrieved later — not even by an administrator. Copy it to your server’s secret storage immediately; if it is lost, create a new key and revoke the old one.

:::

An API key comes in one of two modes:

- **Full access** — the key can call every endpoint that accepts private-key authentication. All keys created before permission scoping was introduced work this way, and continue to work unchanged.
- **Scoped** — the key carries an explicit set of permissions and can only perform the operations those permissions allow. Every other request is rejected with `403`. See [API Key Permissions](../reference/api-key-permissions.md) for the full catalog.

:::warning

The private key should NEVER be embedded in SDKs or made public. Ensure it’s used on the server side and securely stored within the server environment, separate from your code. Prefer scoped keys for new integrations — a leaked refunds-only key is a far smaller incident than a leaked full-access key.

:::

## Public Key

The Public Key is used to initialize the [Checkout SDK](../payments/checkout-sdk/index.md) and can safely be shared with clients. This key doesn’t provide access to public API endpoints, making it secure for client-side use.

:::info

For detailed instructions on generating API keys for both [Public ](authentication.md#public-key)& [Private ](authentication.md#api-key-auth)Keys, kindly refer to the [Private Key (API-Key)](authentication.md#api-key-auth) section.

:::

## Token Authentication

Please note that Token Authentication, an earlier method, is now considered obsolete and isn’t recommended.

## Permissions

Permissions control what actions an authenticated user or application can perform. The permission model depends on which authentication method you use.

### API Key

A **full-access** [API Key](authentication.md#api-key-auth) is granted all permissions — no additional configuration is needed, and every key issued before permission scoping existed behaves this way.

A **scoped** API Key holds an explicit permission set and is authorized per operation, using the same permission vocabulary as Basic Authentication users below. A scoped key without the required permission receives `403 Forbidden`. The complete operation-to-permission mapping lives in [API Key Permissions](../reference/api-key-permissions.md).

### Basic Authentication

With [Basic Authentication](authentication.md#basic-auth), permissions must be explicitly assigned to each user. This provides granular control over what each user or integration can do.

#### Plugin-Based Permissions

Ottu supports different plugins for payment processing. Permissions are scoped per plugin:

| Plugin | Create | Update | View |
|---|---|---|---|
| **Payment Request** | `Can add payment requests` | `Can change payment requests` | `Can view payment requests` |
| **E-Commerce** | `Can add e-commerce payments` | `Can change e-commerce payments` | `Can view e-commerce payments` |

:::info
View permissions are automatically implied — if a user has `Can add` or `Can change` permission, they can also view transactions.
:::

#### Gateway Permissions

To use a specific payment gateway, the user must have the permission **`Can use pg_code`**, where `pg_code` is the code of the [payment gateway](../payments/payment-methods.md) (e.g., "Can use Credit Card", "Can use KNET").

#### Operation Permissions

For [post-payment operations](../operations.md) (refund, capture, void, etc.), each action has its own permission code:

| Permission Code | Operation |
|---|---|
| `payment.capture` | Capture |
| `payment.refund` | Refund |
| `payment.void` | Void |
| `payment.cancel` | Cancel |
| `payment.expire` | Expire |
| `payment.delete` | Delete |
| `payment.inquiry` | Inquiry |

#### Other Permissions

| Permission | Used By |
|---|---|
| `Can add Invoice` | [Invoice API](../invoices.mdx) |
| `report.can_view_report` | [Reports API](../reports.mdx) |

### Best Practices

- **Scope your API keys** — give each server integration a key holding only the permissions it needs (for example, a refunds-only key for your back-office tool). See [API Key Permissions](../reference/api-key-permissions.md).
- **Use Basic Auth for per-user access** — assign only the permissions each user needs, rather than sharing one key for everything.
- **Don’t share users** — create a separate user for each person or system that needs API access. Each action is logged and traceable to the user.
- **Rotate API Keys regularly** — if the API Key is compromised, rotate it immediately.
- **Secure credentials** — never store passwords or API Keys in client-side code. Keep them in server environment variables.

:::tip
Each API endpoint documents its specific permission requirements in its **Permissions** section. Check the API reference for the exact permissions needed for each operation.
:::

Understanding and implementing these authentication methods correctly are crucial steps toward ensuring the security of your transactions and the protection of your data. Secure key management significantly contributes to the overall safety and integrity of your operations.
