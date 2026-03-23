---
description: Add a new payment gateway to the centralized gateway data (usage: /add-gateway gateway-name)
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
---

# Add Payment Gateway

Add a new payment gateway to `static/data/gateways.json` — the single source of truth for all gateway data across the documentation.

**Gateway to add:** $ARGUMENTS

## Process

1. **Read** `static/data/gateways.json` to understand the current schema and entries
2. **Ask** for any missing details:
   - `slug` — internal identifier (must match the backend `core/gateway/` directory name)
   - `name` — display name (e.g., "KNET", "MPGS")
   - `country` — country or region (e.g., "Kuwait", "GCC", "Global")
   - `countryFlag` — emoji flag
   - `currencies` — array of supported ISO 4217 currency codes
   - `inquiryMinutes` — auto inquiry time in minutes (positive number, 0 for no inquiry support, null for unknown)
   - `operations` — supported operations: `[]`, `["refund"]`, or `["refund", "capture", "void"]`
   - `type` — `"redirect"` or `"wallet"`
   - `operationMode` — `"purchase"` or `"purchase_authorize"`
   - `logo` — SVG filename (must exist in `static/img/gateways/`)
   - `testCards` — array of test cards (card number, expiry, cvv, brand, status, statusLabel, optional note)
   - `testCardNotes` — optional free-text notes
   - `docsUrl` — optional external documentation URL
3. **Add** the new entry to `gateways.json` maintaining alphabetical order by `slug`
4. **Copy** the logo SVG to `static/img/gateways/` if provided from the backend (`/Users/jabez/Desktop/dev/ottu/ottu_backend/static/images/pg_icons/`)
5. **Report** which pages will automatically update:
   - PSQ page (Gateway Timing Chart) — if `inquiryMinutes` is set
   - Test Cards page (TestCardsTable) — if `testCards` is non-empty
   - Any future component that imports `gateways.json`

## Inquiry Minutes Reference

Check the backend setting: look for `{GATEWAY}_CALLBACK_MINUTES` in:
- `/Users/jabez/Desktop/dev/ottu/ottu_backend/ottu/settings/base.py`
- `/Users/jabez/Desktop/dev/ottu/ottu_backend/core/gateway/choices.py` (INQUIRY_MINUTES_MAP)

Default is 8 minutes if not explicitly configured.

## Logo Reference

Check for existing logos in:
- `/Users/jabez/Desktop/dev/ottu/ottu_backend/static/images/pg_icons/`
- `/Users/jabez/Desktop/dev/ottu/ottu_backend/core/gateway/choices.py` (LOGO_MAPPING_BY_EXTENSION)
