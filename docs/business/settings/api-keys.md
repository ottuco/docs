---
title: How to Get API Keys
sidebar_label: API Keys
---

# How to Get API Keys

API keys allow your developers to authenticate with the Ottu API and integrate payment functionality into your application. Each key pair consists of a **private key** (for server-side API calls) and a **public key** (for client-side SDK initialization).

For technical details on how API keys are used in authentication, see the [developer authentication guide](/docs/developers/getting-started/authentication).

## Step 1: Navigate to API Keys

1. Open the Ottu Dashboard
2. Click the three dots in the top-right corner to open the **Administration Panel**
3. Navigate to **API Auth** > **API Keys**
4. Click **Add API Key**

![API Keys navigation](/img/business/placeholder.png)

![Add API Key button](/img/business/placeholder.png)

## Step 2: Fill in Key Details

Complete the required fields and click **Save**.

![API Key creation form](/img/business/placeholder.png)

| Field | Required | Description |
|-------|----------|-------------|
| **Name** | Yes | A descriptive name for this API key (max 50 characters). Use something meaningful like "Production Backend" or "Staging Server" |
| **Revoke** | No | When checked, the API key is permanently deactivated and can no longer be used |
| **Expires** | No | An optional expiration date. Once expired, the key can no longer be used |

:::tip
Use descriptive names for your API keys so you can easily identify which key is used by which application or environment. Create separate keys for production and staging.
:::

## Step 3: Retrieve Your Keys

After saving, click on the newly created API key entry (e.g., "Production Backend") to view the generated keys.

![API Key details showing private and public keys](/img/business/placeholder.png)

You will see two keys:

- **Private key (API key)** — used on your server for [API authentication](/docs/developers/getting-started/authentication). Keep this secret and never expose it in client-side code.
- **Public key** — used for client-side SDK initialization (e.g., [Checkout SDK](/docs/developers/checkout-sdk/)).

:::danger
Never share your private API key publicly or include it in client-side code, mobile apps, or version control. If a key is compromised, immediately revoke it and generate a new one.
:::

## What's Next?

- **[Global Configuration](./global)** — Configure your merchant identity and system-wide settings
- **[Authentication (Developer Guide)](/docs/developers/getting-started/authentication)** — Learn how to use API keys in your integration
- **[Webhooks Configuration](./webhooks)** — Set up webhook notifications for payment events
