---
description: Apply premium code block styling to API examples (usage: /code-blocks [file_path or description])
allowed-tools:
  - Read
  - Edit
  - Grep
  - Glob
---

# Premium Code Blocks

Add or fix code block titles on API request/response examples in: **$ARGUMENTS**

If no arguments are provided, ask which file to process.

## How It Works

Docusaurus renders code blocks with a `title` attribute as a labeled panel — a header bar above the code with the title text. Combined with the project's CSS (`.markdown .theme-code-block` — 700px max-width, 8px border-radius, subtle border), this creates a premium, Stripe-like presentation.

**No manual styling is needed.** Just add the `title` attribute — CSS handles the rest.

## Title Conventions

### API Requests

Format: `` ```language title="METHOD /path — Description" ``

```json title="POST /b/checkout/v1/pymt-txn/ — Create Payment Session"
{
  "amount": "20.00",
  "currency_code": "KWD"
}
```

```json title="GET /b/pbl/v2/card/ — Retrieve Saved Cards"
```

### API Responses

Format: `` ```language title="Response — Description" `` or `` ```language title="200 OK" ``

```json title="Response — Session Created"
{
  "session_id": "abc123",
  "state": "created"
}
```

### Webhook Payloads

Format: `` ```language title="Webhook Payload — Description" ``

```json title="Webhook Payload — Payment Completed"
{
  "result": "success",
  "state": "paid"
}
```

### Configuration / Setup

Format: `` ```language title="Description" `` (no method or path)

```html title="Include Checkout SDK"
<script src="https://assets.ottu.net/checkout/v3/checkout.min.js"></script>
```

```javascript title="Initialize Checkout SDK"
Checkout.init({ selector: 'checkout', merchant_id: '...' });
```

## When to Add Titles

- API request examples (POST, GET, PATCH, DELETE calls)
- API response examples
- Webhook payload examples
- SDK initialization / configuration examples
- Any code block the reader might reference or copy

## When NOT to Add Titles

- Inline variable examples (`const x = 1`)
- Shell commands (`npm install`, `curl ...` one-liners)
- Code fragments inside numbered steps that are self-explanatory from context
- Schema definitions or type declarations

## Process

1. Read the target file
2. Find all code blocks (` ```language `)
3. For each block that shows an API call, response, webhook, or config: add a `title` attribute
4. Use the conventions above for the title format
5. Don't add titles to short inline examples or commands
