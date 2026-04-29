# Resources & Support

A curated list of what's actually available to developers and merchants integrating with Ottu. If a link doesn't appear here, it isn't something we publish today — reach out to your account manager for anything you can't find.

## Developer Resources

### API Reference

- **[Interactive API Reference](/developers/apis/ottu-api/)** — browse every endpoint, view request and response schemas, and try calls directly in the browser.
- **[Authentication](/developers/getting-started/authentication/)** — API keys, Basic Auth, and Public Key for the Checkout SDK.
- **[API Fundamentals](/developers/getting-started/api-fundamentals/)** — pagination, rate limits, error handling, and amount formatting.
- **[Sandbox & Test Cards](/developers/payments/sandbox/)** — the shared sandbox environment and test card numbers for each gateway.

### SDKs

#### Checkout SDK — embeddable payment UI

The Checkout SDK collects card details, handles 3-D Secure, and routes payment submission to Ottu. It's available for four platforms:

- [Web](/developers/payments/checkout-sdk/web/)
- [iOS](/developers/payments/checkout-sdk/ios/)
- [Android](/developers/payments/checkout-sdk/android/)
- [Flutter](/developers/payments/checkout-sdk/flutter/)

#### Server-side integration

- **[Python SDK](https://github.com/ottuco/ottu-python)** — Python wrapper around the REST API.
- **[Django SDK](/developers/getting-started/#django-sdk)** — Django-specific integration with built-in session management, webhooks, and card operations.

:::note
Ottu does not publish server-side SDKs for other languages. Integrate directly via REST using the [Interactive API Reference](/developers/apis/ottu-api/) — every endpoint page includes request examples in cURL, Python, Node.js, and PHP.
:::

## Business Resources

### E-commerce & Platform Integrations

Pre-built Ottu integrations for common e-commerce and ERP platforms, documented in [Integrations](/business/integrations/):

- Shopify (with automated billing)
- WooCommerce
- Magento
- OpenCart
- CS-Cart
- PrestaShop
- Microsoft Dynamics NAV
- SAP Hybris
- Odoo
- nopCommerce

### Industry Solutions

- **[Real Estate](/business/industry/real-estate/)** — property portfolio, tenant and contract lifecycle, invoicing, maintenance tracking, and auditing.
- **[Satellite](/business/industry/satellite/)** — multi-installation dashboard for operators managing many merchant accounts, with Shopify billing automation.

### Compliance

See [Compliance & Security](/business/compliance/) for the authoritative posture. In summary:

- **PCI DSS Level 1** — the highest tier of the Payment Card Industry Data Security Standard.
- **ISO/IEC 27001** — information security management system certification.
- **Data Processing Agreement (DPA)** — GDPR-compliant data processing terms available on request.

Contact `support@ottu.com` to request certificates or a DPA.

## Support

### Contact

- **Support**: [support@ottu.com](mailto:support@ottu.com)
- **Sales and partnerships**: via [ottu.com](https://ottu.com)
- **Live chat**: available in the merchant dashboard once you're signed in.

### When contacting support

To help us resolve issues quickly, include:

- **The exact error message** (copy-paste, not a screenshot description)
- **What you were trying to do** (the API call, the dashboard flow, the SDK action)
- **A minimal reproducible code snippet** with any sensitive data removed
- **Your environment** — programming language/framework, SDK version, whether you're hitting sandbox or production

### Status

- [status.ottu.com](https://status.ottu.com) — real-time platform status and incident history.

## Documentation

- [About Ottu](/overview/about/)
- [Architecture](/overview/architecture/)
- [Developer Docs](/developers/getting-started/)
- [Business Guide](/business/)
- [Glossary](/glossary/)

---

**Need immediate assistance?** Email [support@ottu.com](mailto:support@ottu.com) or use the live chat in your dashboard.
