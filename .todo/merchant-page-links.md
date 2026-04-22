# Missing Merchant/Business Pages

These pages are referenced in API field descriptions but don't exist yet in the new docs structure.
When each page is created, update the corresponding field descriptions in `static/api-enrichments/` to replace the placeholder text with actual links.

## Pages Needed

### Currencies Configuration
- **Old path**: `../user-guide/currencies.md`
- **Suggested new path**: `/docs/business/currencies/` or `/docs/developers/reference/currencies/`
- **Referenced by fields**: `currency_code`, `amount`
- **Content needed**: Supported currencies, decimal precision per currency, currency exchange rules
- **Sections needed**:
  - Currency list with decimal places
  - `#currency-exchanges` — how currency conversions work

### Plugins Configuration
- **Old path**: `../user-guide/plugins/`
- **Suggested new path**: `/docs/business/plugins/`
- **Referenced by fields**: `type`
- **Content needed**: Overview of Payment Request and E-Commerce plugins, how to enable them
- **Sections needed**:
  - `#payment-request` — Payment Request plugin details
  - `#e-commerce` — E-Commerce plugin details

### URL Shortener Configuration
- **Old path**: `../user-guide/configuration/url-shortener-configuration.md`
- **Suggested new path**: `/docs/business/configuration/url-shortener/`
- **Referenced by fields**: `shortify_checkout_url`, `shortify_attachment_url`
- **Content needed**: How to configure external URL shortening services (e.g., Bitly)

### API Key Generation Guide
- **Old path**: `../user-guide/configuration/how-to-get-api-keys.md`
- **Suggested new path**: `/docs/business/configuration/api-keys/`
- **Referenced by fields**: general authentication references
- **Content needed**: Step-by-step guide to generating Private and Public API keys from the dashboard

### Payment Tracking / Transaction States
- **Old path**: `../user-guide/payment-tracking/`
- **Suggested new path**: `/docs/developers/reference/payment-states/` (page exists but is empty)
- **Referenced by fields**: `state`
- **Content needed**: Payment transaction state machine, state transitions, payment attempt states
- **Note**: `docs/developers/reference/payment-states.md` exists but needs content

### Payment Gateway Features
- **Old path**: `../user-guide/payment-gateway.md`
- **Suggested new path**: `/docs/business/payment-gateways/`
- **Referenced by fields**: `pg_codes`, `payment_methods`
- **Content needed**: PG features summary, which gateways support tokenization, supported payment methods per gateway

### Dashboard Configuration (Expiration)
- **Old path**: `admin panel > config > configuration page`
- **Suggested new path**: `/docs/business/configuration/`
- **Referenced by fields**: `expiration_time`
- **Content needed**: "Expire Payment Transactions?" toggle in admin configuration

## How to Update Links

When a page is created, search for `TODO:merchant-link` comments in `static/api-enrichments/` files.
Each comment includes the field name and the expected link target.

Example:
```yaml
# Before (placeholder):
description: |
  The currency code. <!-- TODO:merchant-link currencies page -->

# After (linked):
description: |
  The currency code. See [Currencies](/docs/business/currencies/) for supported currencies.
```
