---
description: Add an SMS or WhatsApp provider to the message provider catalog (usage: /add-message-provider provider-name)
allowed-tools:
  - Read
  - Edit
  - Bash
  - Glob
---

# Add Message Provider

Add a provider to `static/data/message-providers.json`, the single source for the catalog on `/business/notifications/message-providers` (`src/components/ProviderCatalog`).

**Provider to add:** $ARGUMENTS

## Where the facts come from

Connect's code, `ottu_backend/contrib/communication/sms` or `/whatsapp`:

- `slug`: the `provider` value of the model in `models.py`.
- `name`: the model's `verbose_name`. Change it only when the code itself shows the company's real name (the model "country" calls `api.smscountry.com`, so it is listed as SMSCountry).
- `credentials`: the field labels in `forms.py` for the fields the admin shows (`admin.py`). Leave out `is_current` and the API URL. These are what the merchant gets from the provider.
- `countries`: only what you can show. First the code (a country domain or a country in the API host, such as `api.taqnyat.sa`), then the provider's own website. If neither states it, use `[]`: the catalog then lists the provider under "Other". Never guess from the name.
- `international`: `true` only when the provider's own site says it serves many countries.
- `website`: the provider's official site, opened and checked. Leave it out if you could not open it.

## Steps

1. Read the JSON file for the current shape and order (by `channel`, then name).
2. Add the entry.
3. Run `npm run build`, then check the page text the docs MCP returns (`build/mcp/docs.json`) contains the new name under the right country.
4. In the PR, say for each of `countries` and `website` whether it came from the code or from the provider's website.
