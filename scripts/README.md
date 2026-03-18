# OpenAPI Spec Enrichment Engine

Transforms the raw OpenAPI spec from Ottu core by adding permissions tables, better field descriptions, and cross-links to documentation pages — before the Docusaurus plugin generates the interactive API reference.

## Pipeline

```
Ottu Core /schema/public          static/api-enrichments/
        │                                   │
        ▼                                   ▼
static/Ottu_API.yaml  ──→  scripts/enrich-api-spec.ts  ──→  static/Ottu_API_enriched.yaml
   (raw, committed)                                            (generated, gitignored)
                                                                        │
                                                                        ▼
                                                          npx docusaurus gen-api-docs
                                                                        │
                                                                        ▼
                                                          docs/developers/apis/*.api.mdx
                                                              (generated, committed)
```

## Commands

| Command | What it does | When to use |
|---|---|---|
| `npm run fetch-api` | Downloads schema from Ottu core | When backend API changes |
| `npm run enrich-api` | Applies overlays → enriched YAML | When overlay files change |
| `npm run gen-api` | Enrich + clean + regenerate API docs | When schema or overlays change |
| `npm run update-api` | Fetch + enrich + clean + regenerate | Full pipeline: pull latest from core |
| `npm start` | Dev server (uses committed API docs) | Local development |
| `npm run build` | Build static site | CI/CD deployment |

## File Structure

```
static/
├── Ottu_API.yaml                        # Raw spec from Ottu core (committed)
├── Ottu_API_enriched.yaml               # Enriched spec (gitignored, generated)
├── api-sources.yaml                     # Schema source URLs and paths
└── api-enrichments/
    ├── _variables.yaml                  # Template variables ({{apiBaseUrl}}, etc.)
    ├── _shared/
    │   ├── permissions.yaml             # Reusable permission blocks
    │   └── fields.yaml                  # Shared field descriptions
    ├── operations/                      # Operation enrichments (one file per API tag)
    │   ├── checkout-api.yaml
    │   └── ...
    └── schemas/                         # Schema field overrides (one file per schema)
        ├── CheckoutPOSTRequest.yaml
        └── ...

scripts/
├── fetch-api-schema.ts                  # Downloads schema from Ottu core
└── enrich-api-spec.ts                   # Applies enrichment overlays
```

## How to Add Enrichments

### Override a field description

1. Find the schema name in `static/Ottu_API.yaml` under `components/schemas/`
2. Create (or edit) `static/api-enrichments/schemas/<SchemaName>.yaml`
3. Add the field under `properties:`:

```yaml
# schemas/CheckoutPOSTRequest.yaml
properties:
  amount:
    description: |
      The payment amount as a decimal string (e.g., `"10.500"`).
      See [Currency Formatting]({{apiBaseUrl}}/getting-started/api-fundamentals/#currencies).
```

4. Run `npm run gen-api` to see the change

### Add permissions to an operation

1. Find the `operationId` in `static/Ottu_API.yaml`
2. Create (or edit) `static/api-enrichments/operations/<tag-slug>.yaml`
3. Add the operation with a `permissions` array:

```yaml
# operations/checkout-api.yaml
operations:
  create_payment_transaction_checkout:
    permissions:
      - $perm:api_key_admin                    # Reference a shared block
      - $perm:basic_auth_create_checkout       # Reference a shared block
    description_append: |                      # Optional extra text
      :::info
      Additional note about this endpoint.
      :::
```

The transformer generates a standardized permissions table from the structured data.

### Add a shared permission block

Edit `static/api-enrichments/_shared/permissions.yaml`:

```yaml
basic_auth_create_invoice:
  auth_method: "[Basic Auth]({{apiBaseUrl}}/getting-started/authentication/#basic-auth)"
  permissions: "`Can add invoices`"
  extra: "`Can use pg_code` for the target payment gateway"   # Optional, shown below table
```

Then reference it in operation files: `$perm:basic_auth_create_invoice`

### Add a shared field description

Edit `static/api-enrichments/_shared/fields.yaml`:

```yaml
session_id:
  description: |
    Unique identifier for the payment session, returned by the
    [Checkout API]({{apiBaseUrl}}/payments/checkout-api/).
```

Then reference it in schema files: `session_id: $shared`

### Override nested properties

Mirror the schema structure with nested `properties`:

```yaml
# schemas/CheckoutPOSTRequest.yaml
properties:
  agreement:
    properties:
      id:
        description: |
          Auto-debit agreement ID for [recurring payments]({{apiBaseUrl}}/cards-and-tokens/recurring-payments/).
```

## Template Variables

Defined in `static/api-enrichments/_variables.yaml`. Resolved as `{{varName}}` in all enrichment files and the final spec.

| Variable | Default | Purpose |
|---|---|---|
| `apiBaseUrl` | `/developers` | Base path for developer doc links |
| `glossaryUrl` | `/glossary` | Base path for glossary links |
| `sandboxUrl` | `https://sandbox.ottu.dev` | Sandbox environment URL |

## Mapping Rules

| What you want to enrich | File location | How the transformer finds it |
|---|---|---|
| Operation description/permissions | `operations/<tag-slug>.yaml` | Matched by `operationId` |
| Schema field descriptions | `schemas/<SchemaName>.yaml` | Filename = schema name in `components/schemas/` |
| Shared field descriptions | `_shared/fields.yaml` | Referenced via `$shared` marker |
| Shared permission blocks | `_shared/permissions.yaml` | Referenced via `$perm:<key>` |

## Description Modifiers

Operations support these modifiers (applied in order):

1. `permissions:` — generates and appends a permissions table
2. `description_replace:` — replaces the entire description
3. `description_prepend:` — adds text before the existing description
4. `description_append:` — adds text after the existing description

## Schema Sources (`api-sources.yaml`)

Defines where schemas come from. Supports environment variable resolution:

```yaml
sources:
  payments:
    url: "${OTTU_SCHEMA_URL}/schema/public"   # Resolved from env or defaults
    output: "static/Ottu_API.yaml"
    enrichedOutput: "static/Ottu_API_enriched.yaml"
    enrichments: "static/api-enrichments"
    pluginId: "ottuApi"
```

Fetch a specific source: `npm run fetch-api -- --source=payments`

## Troubleshooting

### Common warnings

| Warning | Meaning | Fix |
|---|---|---|
| `Operation 'xyz' not found in spec` | Overlay references an operationId that doesn't exist in the YAML | Check the operationId spelling, or remove stale overlay entry |
| `Schema 'Xyz' not found in spec` | Schema file name doesn't match any schema | Rename the file to match the exact schema name |
| `Property 'foo' not found in schema` | Field override targets a property that doesn't exist | Check field name spelling or remove stale override |
| `Missing permission reference: $perm:xyz` | `$perm:` references a key not in `_shared/permissions.yaml` | Add the missing key to permissions.yaml |

### Debugging

1. Run `npm run enrich-api` alone to see enrichment output and warnings
2. Diff the raw vs enriched spec: `diff static/Ottu_API.yaml static/Ottu_API_enriched.yaml`
3. Check a specific field: `grep -A 3 'field_name:' static/Ottu_API_enriched.yaml`

### Build fails after gen-api

If `npm run build` fails after `npm run gen-api`, clear the Docusaurus cache:

```bash
npx docusaurus clear
npm run build
```
