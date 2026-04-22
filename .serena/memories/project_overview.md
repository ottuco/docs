# Public-Docs — Project Overview

Ottu's official public documentation site. Serves two audiences:
- **Developers**: API integration, SDK usage, webhooks, payment operations, tokenization
- **Business users**: Dashboard configuration, payment management, merchant workflows

## Tech Stack
- **Framework**: Docusaurus 3.8.1 with TypeScript
- **Package Manager**: npm (NOT yarn)
- **Deployment**: DigitalOcean App Platform
- **Styling**: CSS modules + custom CSS/SCSS
- **API Docs**: `docusaurus-plugin-openapi-docs` auto-generates from enriched OpenAPI spec
- **Search**: `@easyops-cn/docusaurus-search-local`
- **Diagrams**: Mermaid via `@docusaurus/theme-mermaid`
- **MCP Server**: `docusaurus-plugin-mcp-server` exposes docs for AI tools

## Branches
- `main` → production (docs.ottu.net)
- `dev` → staging (docs.ottu.dev)

## Structure
```
docs/
├── overview/              # About Ottu, Architecture, Changelog
├── developers/            # API docs, SDK guides, webhooks, operations
│   ├── getting-started/   # Auth, API fundamentals, sandbox
│   ├── payments/          # Checkout API, SDK, payment methods
│   ├── cards-and-tokens/  # Tokenization, recurring payments
│   ├── webhooks/          # Setup, events, signatures
│   ├── reference/         # Error codes, payment states, glossary
│   └── apis/              # Auto-generated OpenAPI reference (DO NOT EDIT)
├── business/              # Dashboard and business user guides
├── glossary/              # Payment terminology
└── resources/             # Support, tools
```

## API Documentation Pipeline
Raw spec → Enrichment overlays → Enriched spec → Plugin generates .api.mdx files
- `static/Ottu_API.yaml` — raw OpenAPI spec
- `static/api-enrichments/` — YAML overlays (permissions, descriptions, cross-links)
- `static/Ottu_API_enriched.yaml` — generated output (gitignored)
- `docs/developers/apis/` — auto-generated, DO NOT manually edit
