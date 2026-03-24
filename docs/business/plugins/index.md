---
title: Plugins
sidebar_label: Plugins
---

# Plugins

Ottu is a plugin-based online payment management system (OPMS). Plugins let you extend your dashboard with additional capabilities — from generating payment links and managing e-commerce transactions to sending bulk payment requests. Install only what your business needs, and remove anything you don't.

## Available Plugins

| Plugin | Description |
|--------|-------------|
| [Payment Request](./payment-request.md) | Create and share individual payment links with customers |
| [E-Commerce](./e-commerce.md) | Integrate with e-commerce platforms for seamless checkout |
| [Bulk Payment Request](./bulk-payment-request.md) | Send payment requests to multiple customers at once |

## Adding or Removing Plugins

You can add or remove plugins directly from the dashboard in a few steps:

1. **Open the Administration Panel** — From the Ottu Dashboard, click the three-dot menu in the top-right corner and select **Administration Panel**.

   ![Administration Panel access](/img/business/placeholder.png)

2. **Go to Installed Plugins** — Click on the **Plugins** tab, then open the **Installed Plugins** section to see your currently active plugins.

   ![Installed Plugins section](/img/business/placeholder.png)

3. **Add a plugin** — Click the **Plugins** area to see all available plugins. Select any plugin to install it.

4. **Remove a plugin** — Locate the **X** icon next to the plugin you want to remove and click it.

   ![Add and remove plugins](/img/business/placeholder.png)

:::tip
Only install the plugins your business actually uses. Fewer plugins means a cleaner dashboard and less configuration overhead.
:::

## E-Commerce Platform Compatibility

The table below summarizes Ottu's compatibility with popular e-commerce platforms, including supported versions, hosted checkout availability, wallet support, and active payment gateways.

| Platform | Supported Version | Hosted Checkout | Wallet Support | Active Payment Gateways |
|----------|-------------------|-----------------|----------------|-------------------------|
| WooCommerce (WordPress) | WordPress V5.9+, WooCommerce V6.2+ | Yes | Yes | MiGS, FSS, MPGS, OmanNet, Cybersource, Benefit |
| Magento | V2.4+ | Yes | Yes | MiGS, FSS, MPGS, OmanNet, Cybersource, Paybylink |
| OpenCart | V3.0 | Yes | Yes | MPGS, Benefit |
| CS-Cart | V5.5.48 | Yes | N/A | MPGS |
| Shopify | N/A | Yes | Yes | MPGS |
| PrestaShop | N/A | N/A | N/A | Paybylink |
| Microsoft Dynamics NAV | V4.13.1 SP1 | Yes | N/A | MPGS |
| SAP Hybris | N/A | Yes | N/A | Cybersource |
| Odoo | V15.0 | Yes | N/A | MPGS, OmanNet, Cybersource |
| nopCommerce | V4.20 | Yes | N/A | MPGS |

:::note
For details on connecting your specific e-commerce platform, see the [Integrations](../integrations.md) page or contact the Ottu support team for guided assistance.
:::

## What's Next?

- [Payment Request](./payment-request.md) — Learn how to create and share individual payment links
- [E-Commerce](./e-commerce.md) — Set up Ottu for your online store
- [Bulk Payment Request](./bulk-payment-request.md) — Send payment requests in batch
- [Payment Gateways](../payments/gateways.mdx) — Review available gateways and their capabilities
