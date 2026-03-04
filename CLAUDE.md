# Claude Code Instructions for Ottu Documentation

## Project Identity

Ottu is a payment processing platform. This repository is its **official public documentation**, serving two distinct audiences:

- **Developers**: API integration, SDK usage, webhooks, payment operations, tokenization
- **Business users**: Dashboard configuration, payment management, merchant workflows

Built with Docusaurus 3.8.1 and TypeScript. Deployed on DigitalOcean App Platform. Follows a Stripe-inspired, domain-structured documentation approach where content is organized by business capability, not by API endpoint.

## Architecture & Technology

- **Framework**: Docusaurus 3.8.1 with TypeScript
- **Deployment**: DigitalOcean App Platform
- **Styling**: CSS modules with custom CSS + SCSS
- **Package Manager**: npm (not yarn)
- **API Docs Plugin**: `docusaurus-plugin-openapi-docs` + `docusaurus-theme-openapi-docs` — auto-generates interactive API reference from `static/Ottu_API.yaml`
- **Mermaid Diagrams**: `@docusaurus/theme-mermaid` — enabled via `markdown.mermaid: true` in `docusaurus.config.ts`

## Documentation Philosophy

### Domain-Structured
Content is organized by business domain (Payments, Operations, Cards & Tokenization, Webhooks), not by API endpoint or HTTP method. This matches how developers think about integration problems.

### Self-Contained Pages
Each page provides full context. Never assume the reader has read other pages. Repeat critical context with a link rather than writing "as described above" or "see the previous section." A reader landing on any page from a search engine should understand it without navigating elsewhere.

### Progressive Disclosure
Start simple. Lead with the most common use case. Use collapsible sections (`<details>` or Docusaurus `<Details>`) for advanced options, edge cases, and deep configuration.

### Cross-Referenced
Link liberally throughout body text — not just in a "Related" section at the bottom. Every mention of a payment concept, API endpoint, error code, or webhook event should be a hyperlink to its documentation. Include hints, notes, and admonitions pointing readers to related features they might need.

### Code-First for Developers
Working code before explanation. Show a complete, runnable example first, then explain what it does and why.

### Feature-Benefit for Business Users
Lead with what the feature does for their business. No code. Dashboard-focused with screenshots and step-by-step instructions.

## Writing Standards

### General Rules

- **Every page ends with "What's Next?" or "Related"** — link to the logical next steps and related topics
- **Admonitions**: Use consistently throughout:
  - `:::note` — supplementary info, clarifications
  - `:::tip` — best practices, recommended approaches
  - `:::warning` — gotchas, common mistakes, behavior that could break things
  - `:::danger` — security risks, data loss, irreversible actions
- **No jargon without definition** — first use of any payment domain term (MID, PG, tokenization, PCI DSS) links to the glossary
- **Hyperlinks throughout** — link inline in body text where concepts are mentioned, don't batch all links at the bottom
- **Code examples must be copy-paste ready** — runnable against the sandbox environment with only an API key substitution
- **Multi-language code tabs** — use Docusaurus `<Tabs>` with `groupId="language"` in this order: cURL, Python, Node.js, PHP
- **Self-contained** — don't redirect the reader to another page for essential information; include the key context on the current page with a link for deeper reading

### Developer Documentation

- **Code-first**: every guide starts with a minimal working example showing the happy path
- **Error handling**: immediately after the happy path, show common errors and how to handle them
- **Authentication in every example**: include the auth header/setup, with a link to the authentication page
- **Interactive API docs**: reference the auto-generated API reference for try-it-out exploration; link to specific endpoints
- **5-minute quickstarts**: each major feature should have a quickstart getting developers from zero to a working call quickly

### Business Documentation

- **Feature-benefit focused**: explain what the feature does for the merchant's business
- **Dashboard-first**: document UI workflows with screenshots and annotations
- **No code required**: reference developer docs for technical implementation details
- **Step-by-step**: numbered instructions for every workflow

## Content Structure Patterns

### Page Template (where applicable)

1. **Overview** — what this is and why you need it
2. **Use Cases** — when to use this feature
3. **Quick Implementation** — minimal working example
4. **Detailed Guide** — step-by-step walkthrough
5. **API Reference** — inline request/response or link to auto-generated docs
6. **Error Handling** — what can go wrong and how to handle it
7. **Best Practices** — recommendations and patterns
8. **What's Next? / Related** — logical next pages and related topics

### Cross-Linking Strategy

- **Inline**: link terms, concepts, and endpoints as they appear in text
- **Callout boxes**: use `:::tip` blocks for guided workflow suggestions (e.g., "Want to save the card for later? See [Tokenization](../cards-and-tokens/)")
- **Related section**: 3-5 links at page end to directly related topics
- **What's Next**: suggest the logical next step in the developer/merchant journey

## Documentation Structure

```
docs/
├── overview/              # About Ottu, Architecture, Changelog
├── quick-start/           # Developer & Merchant quick start guides
├── developers/            # API docs, SDK guides, webhooks, operations
│   ├── getting-started/   # Authentication, API fundamentals, sandbox
│   ├── payments/          # Checkout API, SDK, payment methods, native payments
│   ├── cards-and-tokens/  # Tokenization, user cards, recurring payments
│   ├── webhooks/          # Setup, payment events, operation events, signatures
│   ├── reference/         # Error codes, payment states, glossary
│   └── apis/              # Auto-generated OpenAPI reference (do not edit)
├── business/              # Dashboard and business user guides
├── glossary/              # Payment terminology and concepts
└── resources/             # Support, tools, additional resources
```

## Interactive API Documentation

- **OpenAPI spec**: `static/Ottu_API.yaml` (source of truth for all API endpoints)
- **Auto-generated output**: `docs/developers/apis/` — `.api.mdx` + `.RequestSchema.json` + `.StatusCodes.json` + `.ParamsDetails.json` per endpoint
- **Regenerate**: `npx docusaurus gen-api-docs ottuApi`
- **Do NOT manually edit** files in `docs/developers/apis/` — they are overwritten on regeneration
- Deep-nested schema permalink support via swizzled components (see Swizzled OpenAPI Schema Components section below)

## Key Configuration

- **Base URL**: `/` (root)
- **Branch Strategy**: main → production (docs.ottu.net), dev → staging (docs.ottu.dev)

## Development Commands

```bash
npm install                            # Install dependencies
npm start                             # Development server
npm run build                         # Production build
npm run serve                         # Test production build
npm run typecheck                     # TypeScript validation
npx docusaurus gen-api-docs ottuApi   # Regenerate API docs from OpenAPI spec
```

## Deployment

- **Platform**: DigitalOcean App Platform
- **Production**: `main` branch → https://docs.ottu.net
- **Staging**: `dev` branch → https://docs.ottu.dev

## Navigation Structure

- **Main Sidebar** (`mainSidebar`): Overview, Quick Start, Glossary & Resources
- **Developer Sidebar** (`developerSidebar`): Deep collapsible categories with method badges, `customProps.targetHref` for in-page section links
- **Business Sidebar** (`businessSidebar`): User-focused documentation flow

All sidebars defined in `sidebars.ts`. Auto-generated API reference uses `{type: 'autogenerated', dirName: 'developers/apis'}`.

## Technical Constraints

- Build must pass without errors (`onBrokenLinks` is currently `'warn'`, goal is to move to `'throw'` once all links resolve)
- TypeScript strict mode enabled
- All content must work offline
- No external API dependencies for core functionality

## Quality Standards

- All documentation must build successfully (`npm run build`)
- All internal links must resolve correctly
- TypeScript must compile without errors (`npm run typecheck`)
- Code examples must be copy-paste ready and runnable against sandbox
- Content must be self-contained and comprehensive
- Follow existing code style and sidebar patterns in `sidebars.ts`

## File Management

- Static assets in `static/` folder
- React components in `src/components/`
- Custom CSS in `src/css/custom.css`
- Swizzled theme components in `src/theme/`
- Utility functions in `src/utils/`

## Mermaid Diagrams

All diagrams use a semantic color system where color communicates **responsibility**:

- **Blue** (`#1983BC`) — Ottu services, APIs, infrastructure (Ottu owns it)
- **Orange** (`#F57D2D`) — Core execution, orchestration, decision points (Ottu executes it) — **use sparingly, 1-3 nodes max**
- **Red** (`#ED2833`) — Security, PCI boundaries, encryption, failure paths (Ottu protects it)
- **Pink** (`#F093BC`) — External actors, merchant UI, banks, third parties (Ottu integrates with it)
- **Dark** (`#302F37`) — Boundaries, containers, trust domains (Ottu isolates it)
- **Light** (`#F4F4F4`) — Background (always light, never white or dark)

Use the `/mermaid` skill (`.claude/commands/mermaid.md`) for the full spec including theme config, classDefs, node shapes, and rules.

## Planning & Scratch Files

`.scratch/` directory contains planning and analysis documents (migration plans, structure proposals, architecture options). Git-ignored, not deployed. Use for design exploration before implementing changes.

## Maintenance Notes

- Remove/avoid unnecessary blog content
- Keep repository clean of local settings
- Use npm for all package management
- Follow semantic commit messages
- Test builds locally before pushing

## Payment Domain Context

### Actors

- **Merchant** — the business integrating with Ottu. Calls server-side APIs (Checkout, User Cards, Auto-Debit, Operations). The primary audience of developer documentation. The merchant's backend creates payment sessions, receives webhook notifications, and initiates operations like refunds or auto-debit charges.
- **Customer** — the end user making a payment. Interacts only with the checkout UI (Checkout SDK, redirect to hosted page, or payment gateway page). **Never calls Ottu's API directly.** The customer enters card details, authenticates (3DS), and sees payment results.
- **Ottu** — the payment platform. Provides APIs, SDKs, hosted checkout pages, and webhook notifications. Sits between the merchant and the payment gateway.
- **Payment Gateway (PG)** — the bank or processor behind the scenes (e.g., KNET, MPGS, Cybersource). Configured by Ottu staff; the merchant receives `pg_codes` to reference gateways in API calls.

### Key Flow Pattern

Every payment follows this pattern — always get this right in documentation:

1. **Merchant → Ottu API**: Merchant's server calls an API (e.g., Checkout API) to create a session
2. **Ottu → Merchant**: Returns `session_id`, `checkout_url`, and/or SDK initialization data
3. **Merchant → Customer**: Presents the checkout UI (SDK embed, redirect, or link)
4. **Customer → Ottu**: Customer interacts with checkout (enters card, authenticates)
5. **Ottu → PG**: Ottu processes the payment through the gateway
6. **Ottu → Merchant**: Sends result via webhook to merchant's `webhook_url`
7. **Ottu → Customer**: Redirects customer to merchant's `redirect_url`

The merchant is always the API caller. The customer is always the UI user. Never show a customer calling an API endpoint.

## Swizzled OpenAPI Schema Components

The OpenAPI schema rendering components (`Schema` and `SchemaItem`) are swizzled from `docusaurus-theme-openapi-docs` to add deep-nested permalink support. These live in `src/theme/Schema/index.tsx` and `src/theme/SchemaItem/index.tsx`.

### Why These Components Were Swizzled

The upstream `docusaurus-theme-openapi-docs` plugin renders OpenAPI request/response schemas but provides no way to link directly to individual properties. For deeply nested API schemas, users need shareable URLs that point to a specific field and auto-open all ancestor collapsibles.

### How Deep Nested Hyperlinking Works

Every schema property gets a unique fragment ID built from its full path in the schema tree. The ID is generated by `src/utils/index.ts`:

```ts
getFragmentId(...keys: (string | undefined)[]) => keys.filter(Boolean).join("-")
```

For a schema like `response > payment > details > amount`, the generated IDs are:

- `response-payment` (collapsible header for `payment`)
- `response-payment-details` (collapsible header for `details`)
- `response-payment-details-amount` (leaf property `amount`)

For a oneOf/anyOf schema like `response > payment > [CreditCard] > card_number`, the IDs include the variant label:

- `response-payment` (collapsible header for `payment`)
- `response-payment-CreditCard-card_number` (leaf inside the CreditCard variant)
- `response-payment-BankTransfer-iban` (leaf inside the BankTransfer variant)

### Key Architectural Decisions

**`parentSchemaName` prop accumulation**: The `parentSchemaName` prop carries the accumulated path through the recursive component tree. Each nesting level concatenates its own name before passing it down. **Every** component that renders children must forward `parentSchemaName`:

- `SchemaNode` receives `parentSchemaName` and passes it to `DiscriminatorNode`, `AnyOneOf`, `Properties`, `AdditionalProperties`, `Items`, `SchemaItem`, and through `renderChildren`
- `renderChildren` forwards it to `AnyOneOf`, `Properties`, `AdditionalProperties`, and `Items`
- `AnyOneOf` passes it to `Properties`, `SchemaNode`, `Items`, and `SchemaItem`
- `Properties` passes it to each `SchemaEdge`
- `SchemaEdge` passes it to `SchemaNodeDetails`, `SchemaItem`, or `PropertyDiscriminator`
- `SchemaNodeDetails` **accumulates** via `getFragmentId(parentSchemaName, name)` before passing to its child `SchemaNode` — this is the only place the path grows
- `DiscriminatorNode` passes it to `PropertyDiscriminator`
- `PropertyDiscriminator` passes it to `SchemaNode` and `SchemaEdge`
- `AdditionalProperties` passes it to `SchemaNodeDetails` and `SchemaItem`
- `Items` passes it to `AnyOneOf`, `Properties`, `AdditionalProperties`, `SchemaEdge`, and `SchemaItem`

**Path accumulation happens in two places**:

1. **`SchemaNodeDetails`**: accumulates via `getFragmentId(parentSchemaName, name)` — grows the path when entering a collapsible nested object property.
2. **`AnyOneOf`**: accumulates via `getFragmentId(parentSchemaName, label)` — grows the path when entering a specific oneOf/anyOf variant tab. The `label` is derived from `variant.title || variant.type`. Without this, all variants' children would share identical IDs, making deep links ambiguous.

**Auto-opening ancestor collapsibles**: `SchemaNodeDetails` checks if the URL hash starts with its own prefix (`getFragmentId(schemaType, parentSchemaName, name)`). If it does, the `<Details>` element renders with `open={true}`, ensuring all ancestors of a deep-linked property are expanded on page load.

**Auto-selecting oneOf/anyOf tabs**: `AnyOneOf` computes a `defaultValue` for `SchemaTabs` by checking which variant's prefix matches the URL hash. It uses prefix matching (`hash.startsWith(prefix + "-")`) rather than splitting the hash by `-`, which avoids false matches when labels contain dashes.

**SSR safety**: `window.location.hash` is accessed in `SchemaNodeDetails` and `AnyOneOf` render bodies, so it is guarded with `typeof window !== "undefined"`. The `useLayoutEffect` hooks in `Summary` and `SchemaItem` use Docusaurus's `useIsomorphicLayoutEffect` which is SSR-safe.

### Component Rendering Flow

```
SchemaNode (entry point, exported)
  ├─ DiscriminatorNode → PropertyDiscriminator → DiscriminatorTabs → SchemaNode (recursive)
  ├─ (allOf) → merge → AnyOneOf / Properties / Items
  ├─ (primitive) → SchemaItem (leaf)
  └─ renderChildren()
       ├─ AnyOneOf → SchemaTabs/TabItem → SchemaItem / Properties / SchemaNode (recursive)
       ├─ Properties → SchemaEdge (per property)
       │    ├─ PropertyDiscriminator (discriminated property)
       │    ├─ SchemaNodeDetails → Details + Summary → SchemaNode (recursive)
       │    └─ SchemaItem (leaf)
       ├─ AdditionalProperties → SchemaItem / SchemaNodeDetails
       └─ Items → [array brackets] → AnyOneOf / Properties / SchemaItem
```

- **`SchemaNode`**: Root decision node. Routes based on schema shape (discriminator, allOf, primitive, or delegates to `renderChildren`).
- **`SchemaEdge`**: Per-property router. Decides between `SchemaNodeDetails` (collapsible, for nested objects) and `SchemaItem` (leaf, for primitives). Filters `readOnly`/`writeOnly` based on `schemaType`.
- **`SchemaNodeDetails`**: Wraps nested schemas in a collapsible `<Details>` with a `<Summary>` header containing the anchor link. Accumulates `parentSchemaName` for its children.
- **`SchemaItem`**: Terminal leaf renderer. Displays the property name with anchor link, type, badges (required/deprecated/nullable), description, enum table, default value, and example.
- **`Summary`**: Renders the clickable header for collapsible sections with an anchor link icon.

### Dependencies Added for Hyperlinking

- `@mdi/js` and `@mdi/react`: Material Design Icons, used for the link icon (`mdiLinkVariant`) on each property anchor.

### Modifying These Components

When making changes to the schema rendering:

- Always pass `parentSchemaName` through any new rendering path to maintain deep linking.
- Any new component that renders child `SchemaNode`, `SchemaEdge`, or `SchemaItem` must forward `parentSchemaName`.
- If adding a new tabbed component (like oneOf/anyOf), include the tab label in `parentSchemaName` via `getFragmentId(parentSchemaName, label)` to disambiguate variants. Also compute a `defaultValue` for auto-tab-selection using prefix matching against the URL hash.
- Test with deeply nested schemas (3+ levels) to verify IDs accumulate correctly.
- Run `npm run build` to verify SSR does not crash on `window` access.
