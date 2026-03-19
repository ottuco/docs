# Developer Documentation Instructions

Context-specific guidance for the developer documentation section. Supplements the root `CLAUDE.md`.

## Audience

- **Primary**: Software developers integrating Ottu's payment APIs and SDKs
- **Secondary**: Technical product managers evaluating Ottu's capabilities
- **Assumed knowledge**: HTTP/REST basics, JSON, at least one programming language
- **NOT assumed**: Payment domain expertise — always link to the glossary on first use of domain terms

## Writing Style: Stripe-Inspired Developer Docs

- **Code-first**: Every guide starts with a minimal working example showing the happy path
- **Multi-language tabs**: Use Docusaurus `<Tabs>` with `groupId="language"` in this order: cURL, Python, Node.js, PHP
- **Error-first after happy path**: Immediately after the working example, show common error responses and how to handle them
- **Copy-paste ready**: Every code snippet must work against the sandbox environment with only an API key substitution
- **5-minute quickstarts**: Each major feature should have a quickstart getting developers from zero to a working call quickly
- **Interactive**: Reference the auto-generated API docs at `apis/` for try-it-out exploration; link to specific endpoints using deep-link anchors
- **Self-contained**: Each page provides full context. Include authentication setup, prerequisites, and essential context inline — don't redirect the reader elsewhere for critical information

## Directory Map

```
docs/developers/
├── index.md                        # Developer hub landing page (Key Concepts + Integration Paths)
├── invoices.md                     # Invoice creation and management
├── notifications.md                # SMS/email notification API
├── operations.md                   # Refund, capture, void, cancel, expire, delete
├── reports.md                      # Transaction report listing and download
│
├── getting-started/
│   ├── index.md                    # Getting started overview — setup, first API call
│   ├── authentication.md           # API keys, basic auth, public key setup
│   └── api-fundamentals.md         # Request/response format, currencies, pagination
│
├── payments/
│   ├── index.md                    # Payments overview (EMPTY — needs content)
│   ├── checkout-api.mdx            # Core: create/retrieve/update payment transactions
│   ├── checkout-sdk/               # Drop-in SDK for web and mobile (split by platform)
│   │   ├── index.md                # Overview and shared SDK flow diagrams
│   │   ├── web.md                  # JavaScript/Web SDK
│   │   ├── ios.md                  # iOS Swift SDK
│   │   ├── android.md              # Android Kotlin SDK
│   │   └── flutter.md              # Flutter SDK
│   ├── payment-methods.md          # Discovering available payment methods via pg_codes
│   ├── native-payments.md          # Apple Pay, Google Pay direct payments
│   └── sandbox.md                  # Sandbox environment, test cards per gateway
│
├── cards-and-tokens/
│   ├── index.md                    # Section overview — save, manage, charge saved cards
│   ├── tokenization.md             # How to save cards (with/without payment)
│   ├── user-cards.mdx              # List/delete saved customer cards
│   └── recurring-payments.md       # Auto-debit, CIT/MIT, agreement setup, recurring billing
│
├── webhooks/
│   ├── index.md                    # Webhook setup, retries, delivery guarantees
│   ├── payment-events.md           # Payment webhook payload reference
│   ├── operation-events.md         # Operation webhook payload reference
│   └── verify-signatures.md        # HMAC-SHA256 signature verification with code examples
│
├── reference/
│   ├── error-codes.md              # Error code reference (EMPTY — needs content)
│   ├── payment-states.md           # Payment state machine (EMPTY — needs content)
│   └── glossary.md                 # Developer glossary (EMPTY — needs content)
│
└── apis/                           # Auto-generated from OpenAPI spec — DO NOT EDIT
    ├── sidebar.ts                  # API sidebar configuration
    ├── ottu-api.info.mdx           # API introduction page
    └── *.api.mdx                   # One file per endpoint (~43 endpoints)
```

## Page Template

Standard structure for developer API/feature pages. Apply sections as relevant — not every page needs every section, but the **order must be consistent**:

```
# Page Title

[Overview paragraph — what this is and why you need it]

## Setup
  - Prerequisites / checklist
  - Enabling the plugin (if applicable)
  - Activating payment gateway codes (if applicable)
  - :::tip Boost Your Integration (one-liner linking to getting-started)

---
<ApiDocEmbed ... />   ← auto-generated API reference (permissions are injected via enrichment engine)
---

## Guide
  - Step-by-step walkthrough with code examples
  - Workflow diagram (if applicable)

## Best Practices

## FAQ

## What's Next?
```

### Page Structure Rules

- **No standalone Authentication or Permissions sections** — authentication is documented in `getting-started/authentication.md`, and per-endpoint permissions are injected into the API reference via the enrichment engine (`static/api-enrichments/`). Do not duplicate this on individual pages.
- **No per-page SDK/package callouts** — all integration options (REST API, Checkout SDK, Python SDK, Django SDK, MCP Server) are documented centrally in `getting-started/index.md#boost-your-integration`. Individual pages use a brief `:::tip` linking back:
  ```markdown
  :::tip Boost Your Integration
  Ottu offers SDKs and tools to speed up your integration. See [Getting Started](../getting-started/#boost-your-integration) for all available options.
  :::
  ```
- **Every page ends with "What's Next?"** — 3-5 links to the logical next steps in the developer journey.
- **FAQ is always second-to-last** (before What's Next). Use bold text for sub-groupings within FAQ, not H3 headings (H3s create sidebar entries).
- **Guide sections use "Guide" as the heading** — not "Implementation", "Quick Start", or "How to Use". Keep it consistent.
- **Section headings use H2 (##)** — sub-sections use H3 (###). H4 (####) only for items within a section (e.g., FAQ questions).
- **Interactive API reference is mandatory** — every page that documents a REST API endpoint must include an `<ApiDocEmbed>` with the full interactive schema. If a page covers multiple related endpoints (e.g., Native Payments with Apple Pay, Google Pay, Auto-Debit), use `<Tabs>` wrapping multiple `<ApiDocEmbed>` components so the reader can switch between them without scrolling through separate schema sections.

## API Documentation

- **Source of truth**: `static/Ottu_API.yaml` (OpenAPI 3.1.1, ~641KB)
- **Auto-generated output**: `docs/developers/apis/`
- **Generated files per endpoint**: `{slug}.api.mdx`, `{slug}.RequestSchema.json`, `{slug}.StatusCodes.json`, `{slug}.ParamsDetails.json`
- **Regenerate**: `npx docusaurus gen-api-docs ottuApi`
- **Never manually edit** files in `apis/` — they are overwritten on regeneration
- **Deep-link to response fields**: use fragment ID pattern `#response-{path}-{to}-{field}` (see root CLAUDE.md for full schema permalink documentation)
- Swizzled `Schema` and `SchemaItem` components in `src/theme/` provide deep-nested permalink support

## Sidebar Configuration

- Developer sidebar defined in `sidebars.ts` under `developerSidebar`
- Uses deeply nested collapsible categories
- `customProps.targetHref` points to in-page anchors for section-level navigation
- API endpoints use `customProps: {method: 'POST'}` (or GET, PATCH, DELETE) for method badges
- Auto-generated API reference: `{type: 'autogenerated', dirName: 'developers/apis'}`
- When adding new pages: add to `sidebars.ts` in the appropriate category following existing patterns

## Cross-Referencing Rules

These links are mandatory whenever the topic is mentioned:

| When you mention... | Link to... |
|---------------------|------------|
| Authentication / API keys | `getting-started/authentication.md` |
| pg_codes / payment gateways | `payments/payment-methods.md` |
| Webhook events / notifications | `webhooks/` (specific events page) |
| Error responses / error codes | `reference/error-codes.md` |
| Payment states (created, paid, etc.) | `reference/payment-states.md` |
| Domain terms (MID, PG, PCI DSS, tokenization) | Glossary (first use per page) |
| Checkout API / session_id | `payments/checkout-api.mdx` |
| Operations (refund, capture, void) | `operations.md` |

Use relative links within the developers section (e.g., `../webhooks/payment-events.md`). Use absolute paths when linking outside (e.g., `/docs/glossary/`).

## Payment Domain Context

Key concepts that recur throughout developer docs:

- **Payment Transaction**: Core entity with a lifecycle of states. Created via the Checkout API. Identified by `session_id`.
- **pg_codes**: Payment gateway codes identifying which MID/gateway to route the payment through. Discovered via the Payment Methods API.
- **session_id**: Unique identifier for a payment session, returned by the Checkout API. Used to retrieve, update, and track transactions.
- **Checkout SDK**: Drop-in UI component wrapping the Checkout API for web and mobile. Handles form rendering, validation, and payment submission.
- **Operations**: Post-payment actions on existing transactions — refund, capture, void, cancel, expire, delete.
- **Webhooks**: Server-to-server notifications sent when payment or operation events occur. Must be verified with HMAC signatures.
- **Tokenization**: Saving card details for future payments. PCI-compliant via the payment gateway. Enables recurring payments and auto-debit.

## Files Needing Content

These files exist but are empty (0 bytes). Priority for content creation:

| File | Purpose |
|------|---------|
| `index.md` | Developer hub landing page — overview of all developer resources |
| `payments/index.md` | Payments section overview — what Ottu's payment capabilities are |
| `reference/error-codes.md` | Comprehensive error code reference table |
| `reference/payment-states.md` | Payment state machine diagram and transitions |
| `reference/glossary.md` | Developer-focused payment glossary |
| `cards-and-tokens/recurring-payments.md` | Auto-debit and recurring payment guide |

## Testing & Sandbox

- Sandbox environment details in `payments/sandbox.md`
- Test cards documented per payment gateway (Ottu PG, KNET, Apple Pay, etc.)
- All code examples should use sandbox base URL
- Webhook testing: developers can use ngrok or webhook.site for local development
