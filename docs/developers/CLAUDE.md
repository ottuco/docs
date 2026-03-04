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
│   ├── checkout-sdk.md             # Drop-in SDK for web and mobile (largest file ~5K lines)
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

Standard structure for developer documentation pages (apply sections as relevant):

1. **Overview** — what this feature is and why you need it
2. **Prerequisites** — what the developer needs before starting (with links)
3. **Authentication** — which method to use, link to `getting-started/authentication.md`
4. **How It Works** — conceptual explanation of the flow
5. **Code Examples** — multi-language tabs with complete, runnable examples
6. **Error Handling** — common errors, what they mean, how to fix them
7. **Best Practices** — recommended patterns and approaches
8. **What's Next? / Related** — logical next steps and related topics

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
