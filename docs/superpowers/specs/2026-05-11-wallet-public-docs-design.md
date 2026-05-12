# Wallet Public Documentation — Design

**Ticket:** [Redmine #150388](https://pm.kuwaitnet.com/issues/150388) — Wallet Service Integration for Merchant Refund Credits
**Docs subticket:** [Redmine #150394](https://pm.kuwaitnet.com/issues/150394) — Public Integration Documentation for Merchants
**Branch:** `task/150388-wallet-docs` (forked from `dev`)
**Date:** 2026-05-11

## Overview

Add public documentation for the Wallet feature to `docs.ottu.com` covering both developer and business audiences. Wallet is a stored balance keyed by `merchant_id + customer_id + currency`. Merchants can refund payments to wallet credit instead of returning funds via the original payment gateway; customers can later spend that credit at checkout (fully or partially).

The documentation must explain the feature in plain terms for business/merchant-admin users, give developers a complete integration path including the new refund destination and the three read APIs, and ship an interactive demo (`<WalletDemo />`) that seeds a wallet on the fly and launches the Checkout SDK with wallet enabled.

## Goals

- Single self-contained developer page describing wallet behavior, the journey, the live demo, and the three read APIs.
- Compact integrated section on each Checkout SDK page (Web / iOS / Android / Flutter) presented as a horizontal `<StepGuide>` carousel.
- Surface the refund-to-wallet API change in the existing `operations.md` (single source of truth for the refund endpoint), with full schema-enrichment pipeline updates.
- Four-page business section (`business/wallet/`) covering overview, the dashboard refund workflow, the customer's checkout experience, and reporting.
- Live demo that hides OAuth + seeding behind a slick progress UI.

## Non-Goals

- Documenting manual-review queues, manual wallet adjustments, or reconciliation internals — these are dashboard-internal and out of scope for public docs.
- Webhook events for wallet — the ticket does not list any; revisit if the engineering tickets add them.
- Authorized-transaction wallet support — wallet is hidden for authorize-only sessions and that restriction is documented, not relaxed.
- Customer-chosen partial amounts — Ottu computes the wallet amount automatically; we document the rule, not a configuration knob.
- Three-year expiry behavior — not implemented yet; docs say "no expiry" today and will be updated when shipped.

## Audience and Scope Split

| Audience | Mental model | Where it lives |
|----------|--------------|----------------|
| Developer integrating the SDK / APIs | Code-first, copy-paste examples, deep-link from Payment Methods to wallet method | `docs/developers/payments/wallet/` + new sections inside `docs/developers/payments/checkout-sdk/*` + new subsection in `docs/developers/operations.md` |
| Merchant admin in the dashboard | Feature-benefit, dashboard-first, screenshots | `docs/business/wallet/` (four pages) |

## Information Architecture

### New files

```
docs/developers/payments/wallet/
└── index.mdx                                    NEW   single self-contained page

docs/developers/payments/checkout-sdk/
├── web.mdx                                      EDIT  add ## Wallet section (StepGuide carousel)
├── ios.md                                       EDIT  add ## Wallet section
├── android.md                                   EDIT  add ## Wallet section
└── flutter.md                                   EDIT  add ## Wallet section

docs/developers/operations.md                    EDIT  add ### Refund to Wallet subsection

docs/business/wallet/
├── index.md                                     NEW   overview
├── refund-to-wallet.md                          NEW   dashboard workflow
├── using-wallet-at-checkout.md                  NEW   customer experience
└── reporting.md                                 NEW   accounts / ledger / operations screens

src/components/WalletDemo/
├── index.tsx                                    NEW   BrowserOnly wrapper
├── WalletDemo.tsx                               NEW   state machine + UI
└── styles.module.css                            NEW

src/utils/sandbox.ts                             EDIT  add createSandboxWalletCredit(...)

static/api-enrichments/operations/wallet.yaml    NEW   3 wallet read operations
static/api-enrichments/operations/payment-operations.yaml   EDIT  mention wallet destination
static/api-enrichments/schemas/WalletAccount.yaml           NEW   response shape
static/api-enrichments/schemas/WalletLedgerEntry.yaml       NEW   response shape
static/api-enrichments/schemas/WalletOperation.yaml         NEW   response shape
static/api-enrichments/schemas/PaymentOperationRequest.yaml NEW   destination field
static/api-enrichments/_shared/permissions.yaml             EDIT  add basic_auth_wallet_read

static/img/developers/wallet/                    NEW   screenshot folder (5 SDK screens)
static/img/business/wallet/                      NEW   screenshot folder (~15 dashboard screens)

sidebars.ts                                      EDIT  add Wallet to developerSidebar and businessSidebar

src/data/glossary-terms.ts                       EDIT  add Wallet, Wallet Credit, Wallet Reservation
```

### Sidebar placement

**`developerSidebar` → Payments** — insert `Wallet` between `Native Payments` and `Checkout SDK`:

```ts
{
  type: 'category',
  label: 'Wallet',
  link: {type: 'doc', id: 'developers/payments/wallet/index'},
  items: [
    {type: 'link', label: 'When to Use',     href: '/developers/payments/wallet#when-to-use'},
    {type: 'link', label: 'Guide',           href: '/developers/payments/wallet#guide'},
    {type: 'link', label: 'API Reference',   href: '/developers/payments/wallet#api-reference'},
    {type: 'link', label: 'Best Practices',  href: '/developers/payments/wallet#best-practices'},
    {type: 'link', label: 'FAQ',             href: '/developers/payments/wallet#faq'},
  ],
},
```

**`businessSidebar`** — insert new top-level category `Wallet` between `Payment Management` and `Plugins`:

```ts
{
  type: 'category',
  label: 'Wallet',
  link: {type: 'doc', id: 'business/wallet/index'},
  items: [
    'business/wallet/index',
    'business/wallet/refund-to-wallet',
    'business/wallet/using-wallet-at-checkout',
    'business/wallet/reporting',
  ],
},
```

### Cross-links to add in existing pages

| Page | Change |
|------|--------|
| `developers/payments/payment-methods.md` | Note `wallet` is a discoverable payment method via Payment Methods API; link to wallet page. |
| `developers/operations.md` | Add `### Refund to Wallet` subsection under Refund (spec'd below). |
| `developers/payments/index.md` | List Wallet under "available payment methods". |
| `glossary/index` | Add Wallet, Wallet Credit, Wallet Reservation terms. |
| `business/payment-management/transaction-states.md` | Note refund destination can now be "wallet". |

## Developer Documentation

### `developers/payments/wallet/index.mdx` — content outline

Standard developer page template (per `developers/CLAUDE.md`). Frontmatter sets `hide_table_of_contents: true` because of `<ApiDocEmbed>`.

```
Overview paragraph — Wallet lets merchants refund customer payments to a stored
balance keyed by merchant + customer + currency, then let the customer spend that
credit at any future Ottu checkout in the same currency. No PII stored on the
wallet service. Service-to-service authentication uses OAuth 2.0 (client
credentials grant); merchants do not configure this — Ottu API keys handle
merchant-facing calls as usual.

:::tip Boost Your Integration ... (standard block)

## When to Use
- Refunding without returning funds to the original card/PG (loyalty, goodwill, voucher)
- Letting customers carry over balance between sessions
- Reducing PG fees by spending wallet credit before charging cards
- Multi-currency merchants — each currency maintains its own wallet account

## Guide
  ### Workflow      ← Mermaid diagram, monochrome + 1 accent (Wallet Service in Ottu blue)
  ### Live Demo     ← <WalletDemo />
  ### Step-by-Step
    1. Discover wallet availability via Payment Methods API
    2. Initialize Checkout with wallet enabled (pass customer_id)
    3. Customer applies wallet credit at checkout (reservation lifecycle)
    4. Read wallet state from your backend (the 3 read APIs)
  ### Use Cases
    #### Partial payments (the 3 balance-vs-amount cases)
    #### Reservation lifecycle (reserved → committed; 4h auto-release on abandon/fail/cancel)
    #### Wallet hidden for authorize-only sessions
    #### Refunding to wallet (link to operations.md#refund-to-wallet)

    :::warning Cross-currency wallet payments are not supported
    A KWD wallet cannot be used to pay a SAR order, and vice versa. Each
    currency maintains a separate wallet account.
    :::

## API Reference
<Tabs>
  <TabItem value="accounts" label="List Wallet Accounts">
    <ApiDocEmbed path="developers/apis/wallet-accounts-list" />
  </TabItem>
  <TabItem value="ledger" label="List Ledger Entries">
    <ApiDocEmbed path="developers/apis/wallet-ledger-list" />
  </TabItem>
  <TabItem value="operation" label="Get Operation by ID">
    <ApiDocEmbed path="developers/apis/wallet-operation-retrieve" />
  </TabItem>
</Tabs>

## Best Practices
- Always discover wallet via Payment Methods API per session — don't assume from prior call
- Display balance by calling List Accounts on page load; cache short-term only
- Treat the ledger as append-only — never derive balance client-side from history
- For multi-currency merchants, present only the wallet matching the session currency

## FAQ
#### Can a customer choose how much wallet credit to apply?
No. Ottu computes it automatically based on session amount vs balance.

#### What happens to a reservation if the customer abandons checkout?
It is automatically released ~4 hours after the abandoned, cancelled, or failed
payment. No human intervention.

#### Is wallet available for authorization-only payments?
No, wallet only supports immediate-capture sessions.

#### Where does refund-to-wallet data go?
The original payment session is linked to the wallet credit entry, visible in both
the wallet ledger and the operation log.

#### Does the wallet store any customer PII?
No. The service holds only ledger entries scoped by merchant_id, customer_id, currency.

#### Does wallet credit expire?
No. Wallet credit does not expire today. (A future change may introduce a
three-year expiry; docs will be updated when shipped.)

## What's Next?
- Refund to Wallet (Operations)
- Checkout SDK — Wallet section
- Payment Methods API
- Wallet for merchants (business docs)
```

### Checkout SDK pages — Wallet StepGuide carousel

Single new `## Wallet` H2 inserted between `## Wallet Configuration` and `## Onsite Checkout` on each platform page. Uses the existing `<StepGuide>` carousel component to keep the section compact.

```mdx
import StepGuide from "@site/src/components/StepGuide";

## Wallet

When a customer has wallet credit in the session currency, the SDK renders a
"Wallet" payment method automatically — no init config required. Pass the
customer_id when creating the session, and either include `'wallet'` in
`formsOfPayment` or omit `formsOfPayment` to show all available methods.
Wallet is hidden for authorize-only sessions.

For a deep dive on balance behavior, partial payments, and the 4-hour reservation
auto-release, see the [Wallet section](../wallet/).

:::warning Cross-currency wallet payments are not supported
The wallet only appears when its currency matches the order currency.
:::

<StepGuide steps={[
  { title: "Wallet appears as a method",
    description: <>When the customer has positive balance in the session
    currency, "Wallet (10.000 KWD)" renders alongside cards and other gateways.
    No SDK config needed beyond passing <code>customer_id</code> on the
    Checkout API session.</>,
    image: "/img/developers/wallet/sdk-01-wallet-method.png",
    imageAlt: "Checkout SDK showing Wallet as a payment method with balance" },
  { title: "Full coverage: balance ≥ amount",
    description: <>Customer selects Wallet → SDK shows "10.000 KWD will be
    applied" → submits → only the session amount is deducted; surplus stays in
    the wallet.</>,
    image: "/img/developers/wallet/sdk-02-full-coverage.png",
    imageAlt: "Wallet selected with full coverage of the session amount" },
  { title: "Partial coverage: balance < amount",
    description: <>Customer selects Wallet → SDK shows "10.000 KWD will be
    applied; pick a method for the remaining 5.000 KWD" → adds a card → both
    reservations confirm together at submit.</>,
    image: "/img/developers/wallet/sdk-03-partial-coverage.png",
    imageAlt: "Wallet plus card combined for partial coverage" },
  { title: "Authorize-only: wallet hidden",
    description: <>When the session is configured for authorization-only,
    wallet is not offered. Wallet only supports immediate-capture flows.</>,
    image: "/img/developers/wallet/sdk-04-authorize-hidden.png",
    imageAlt: "Authorize-only checkout without wallet method" },
  { title: "Try it",
    description: <>The live demo seeds a fresh wallet for a generated
    customer_id and launches the SDK with wallet enabled. Use the demo on the
    <a href="../wallet/">Wallet overview page</a>.</>,
    image: "/img/developers/wallet/sdk-05-live-demo.png",
    imageAlt: "Wallet live demo entry point" },
]} />
```

Mobile pages (iOS / Android / Flutter): same skeleton, swap screenshots for native UI captures, keep narrative identical. The live demo lives on the Wallet overview only; SDK pages link to it.

### `developers/operations.md` — Refund to Wallet subsection

New `### Refund to Wallet` subsection added under the existing Refund content. Behavior described in prose; the request/response shape is rendered via the existing `<ApiDocEmbed path="public-operations.api.mdx" />` and picks up the new `destination` field from the schema enrichment.

```
### Refund to Wallet

Instead of returning funds through the original payment gateway, you can refund
a payment directly to the customer's wallet balance. The customer can then spend
that credit at any future Ottu checkout in the same currency.

When to use:
- The customer's original card has expired or been reissued
- You want to issue store credit / loyalty / goodwill without PG fees
- The original PG doesn't support refunds for that transaction type

[Code tabs: cURL / Python / Node / PHP]

POST /b/pbl/v2/operation/
{
  "session_id": "...",
  "operation": "refund",
  "amount": "10.000",
  "destination": "wallet",    ← new field; "gateway" (default) or "wallet"
  "metadata": { ... }
}

Behavior:
- A wallet account is created automatically if one doesn't exist for
  (merchant, customer, currency)
- The credit is recorded as an immutable ledger entry
- The original payment session is linked to the credit entry for audit
- No PII is stored on the wallet service
- Disputes against the original payment after a refund-to-wallet can be
  resolved manually — contact csd@ottu.com to raise a reversal

Errors:
| HTTP | code | when |
| 400  | account_inactive    | Wallet account is suspended |
| 400  | policy_violation    | Refund amount violates a wallet policy rule |
| 409  | idempotency_conflict | Same Idempotency-Key reused with different payload |
| 422  | validation_error    | Schema validation failed on the refund payload |

Cross-references:
- Wallet section: /developers/payments/wallet/#guide
- Business workflow: /business/wallet/refund-to-wallet
```

## Business Documentation

### `business/wallet/index.md` — Wallet Overview

Plain-language explainer. Section order:

1. **Why use Wallet** — three bullets (refund without card, goodwill credit, reduce PG fees)
2. **How it works** — four-step horizontal explainer (customer pays → you refund to wallet → customer comes back → pays with wallet)
3. **When wallet is offered to the customer** — positive balance in order currency; capture-immediate orders only
4. **Things to know** — one wallet per currency, no PII, automatic 4-hour release, immutable history, cross-currency not supported (`:::warning`)
5. **What's Next?**

### `business/wallet/refund-to-wallet.md`

Dashboard workflow page, `<StepGuide>` carousel with 5 cards: open transaction → click Refund → choose destination Wallet → confirm amount → see confirmation.

FAQs include:
- Partial refunds: yes
- Refund to non-existent wallet: yes, account created automatically
- Undo: not possible; issue an opposing entry instead
- Customer notification: no, customers are not notified for wallet credits today; merchants can message through their own channels if desired

### `business/wallet/using-wallet-at-checkout.md`

What the customer sees. `<StepGuide>` carousel with 5 cards: method appears → full coverage → partial coverage → reservation while paying → automatic release.

`:::warning` for cross-currency restriction. `:::note` calling out the 4-hour release prominently.

FAQs include:
- Why doesn't wallet show for some orders? (authorize-only / zero balance / customer_id mismatch)
- What happens on dispute? Contact csd@ottu.com to raise a manual reversal.
- Wallet credit expiry: no, does not expire today.
- 4-hour restoration: explicit customer-facing answer to "if I cancel / fail, when do I get my wallet back?"

### `business/wallet/reporting.md`

Three dashboard screens:
- **Accounts** — `<StepGuide>` carousel (Open → Search/filter → Open detail)
- **Ledger** — screenshot + column descriptions
- **Operations** — list view with filter/export notes

Exporting: CSV and XLSX both available.

FAQs:
- Can I edit a wallet entry? No, immutable; use reversals.
- Can I close a customer's wallet? No. It opens automatically on first refund and behaves as non-existent when balance is zero — no maintenance needed.

## Live Demo Component (`<WalletDemo />`)

The interactive demo seeds a wallet on the fly for a fresh customer per session, then launches the Checkout SDK with wallet enabled. The seeding hides OAuth client_credentials + the wallet credit endpoint behind a progress UI.

### User-visible state machine

```
[IDLE]      "Try Wallet at Checkout" button
   ↓
[SEEDING]   Spinner + "Setting up your demo wallet…"
            (server-side: OAuth client_credentials → POST /wallet/credits
             with generated customer_id, 10.000 KWD, idempotency key)
   ↓
[READY]     "Wallet funded: 10.000 KWD ✓" (1.5s auto-advance)
   ↓
[CHECKOUT]  Checkout SDK mounted with session, formsOfPayment: ['wallet', 'ottu_sandbox']
            Customer interacts with real wallet method + real sandbox card method
   ↓
[DONE]      "Paid X with wallet + Y with card. Remaining balance: Z."
            Button: "Try again with a new wallet"

[SEED_ERROR] Friendly message + "Retry" button
[PAY_ERROR]  Friendly message + "Try again" button
```

### File layout (mirrors existing `CheckoutDemo`)

```
src/components/WalletDemo/
├── index.tsx                ← <BrowserOnly> wrapper
├── WalletDemo.tsx           ← state machine + UI
└── styles.module.css

src/utils/sandbox.ts         ← add createSandboxWalletCredit({ amount, currency, pg_code })
                                wrapping a server-side proxy call
```

### Server-side proxy contract (implementation detail to confirm)

The component calls a server-side endpoint that:
1. Acquires an OAuth token via `client_credentials` grant against the merchant Keycloak realm
2. Generates a unique `customer_id` (e.g., `demo_<random>`)
3. POSTs to `{{wallet_base_url}}/wallet/credits` with `Merchant-Id` + `Idempotency-Key` headers
4. Returns `{ customer_id, balance, currency }` to the browser

Host and route to be confirmed during planning. Should follow whatever pattern the existing sandbox utilities use (likely the same docs.ottu.dev / docs.ottu.com infrastructure that powers `createSandboxSession`).

## OpenAPI Schema Pipeline Updates

The schema-side work feeds the auto-generated `<ApiDocEmbed>` outputs for both the refund-to-wallet field and the three new read APIs.

### Enrichments for refund-to-wallet

`static/api-enrichments/operations/payment-operations.yaml` — extend the `public_operations` description to mention wallet as a refund destination.

`static/api-enrichments/schemas/PaymentOperationRequest.yaml` (new) — describe the `destination` field (`"gateway"` default, `"wallet"` option), with the auto-create-account behavior and immutability rule.

### Enrichments for the 3 read APIs

`static/api-enrichments/operations/wallet.yaml` (new) — one entry per operation:
- `wallet_accounts_list` — list wallet accounts for a customer (one per currency)
- `wallet_ledger_list` — list ledger entries on an account (cursor pagination)
- `wallet_operation_retrieve` — single operation by id

Each operation enrichment includes a permission reference (`$perm:basic_auth_wallet_read`) and a description.

`static/api-enrichments/_shared/permissions.yaml` — add `basic_auth_wallet_read` block.

Schema enrichments in `static/api-enrichments/schemas/`:
- `WalletAccount.yaml` — account_uuid, customer_id, currency, balance, status
- `WalletLedgerEntry.yaml` — entry_id, operation_id, type (credit/debit/reservation), amount, funding_source_type, session_id, created_at
- `WalletOperation.yaml` — operation_id, type, amount, status, related entries

### Sequencing dependency

The Connect team must merge:
1. The refund operation `destination` field (subticket 150893)
2. The wallet API proxy endpoints (subticket 150892)

Before either is in `Ottu_API.yaml`, the enrichments can be drafted but the auto-generated `<ApiDocEmbed>` won't show the new fields. Sequencing handled in the implementation plan: draft markdown + enrichments now, run `npm run update-api` once Connect's changes hit dev/staging.

## Glossary Additions

Add to `src/data/glossary-terms.ts`:

- **Wallet** — A stored balance held by Ottu for a customer in a specific currency, used as a payment method at checkout.
- **Wallet Credit** — An immutable ledger entry that adds funds to a wallet, typically from a refund.
- **Wallet Reservation** — A temporary hold on wallet funds during checkout. Reservations commit on payment success and auto-release ~4 hours after abandonment, cancellation, or failure.

## Diagrams

The wallet workflow Mermaid diagram on `developers/payments/wallet/index.mdx#workflow` follows the project's monochrome-plus-one-accent rule (`/mermaid` skill).

- Most nodes: neutral default fill / gray border
- Single accent (`#0B82BE`): the Wallet Service node
- No danger color needed (no PCI boundary in this flow)

The diagram shows: Merchant API call → Connect → Wallet Service (credit), then later session: Customer → Checkout SDK → Payment Methods (wallet appears) → Reserve → Commit / Release / PG remainder.

## Screenshots and Placeholders

- `static/img/developers/wallet/` — 5 screens for SDK carousels (web only; mobile use platform-specific captures)
- `static/img/business/wallet/` — ~15 dashboard screens across refund flow, checkout flow, reporting

Initial PRs ship with placeholder PNGs and clear filename conventions. Final screenshots produced once engineering builds are testable on dev/staging.

## Definition of Done

- All new and edited markdown pages build with `npm run build` without errors
- All internal links resolve (verified via build output)
- Sidebar entries appear correctly in both developer and business sidebars
- Cross-currency `:::warning` is present on wallet overview, SDK section, and business pages
- 4-hour auto-release behavior is documented in all four customer-facing contexts (dev wallet page, SDK section, business overview, business checkout page)
- `<WalletDemo />` runs end-to-end on a local dev server using the seeding proxy
- Schema enrichments produce a clean `Ottu_API_enriched.yaml` and updated `<ApiDocEmbed>` outputs after `npm run update-api`
- Glossary entries appear and link correctly from first-use references
- Refund-to-wallet subsection in `operations.md` matches the actual field name shipped by subticket 150893

## Open Items to Resolve During Implementation

- Confirm the exact field name on the public refund endpoint (assumed `destination`)
- Confirm the wallet proxy endpoint paths exposed by Connect (subticket 150892) to wire `<ApiDocEmbed path="...">` correctly
- Confirm the host/route for the demo server-side seeding proxy
- Capture final dashboard screenshots once the wallet UI ships on staging
- Capture final SDK screenshots once wallet method renders end-to-end on the sandbox

## Out of Scope (Tracked Separately if Needed)

- Manual wallet adjustment APIs and dashboard (subticket 153005)
- Manual review queues (subticket 153004) — no longer relevant: release is fully automatic
- Three-year wallet credit expiry (future)
- Wallet-specific webhook events (none in current ticket)
