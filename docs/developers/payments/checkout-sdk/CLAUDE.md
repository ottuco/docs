# Checkout SDK Section Instructions

Rules for structuring Checkout SDK documentation pages (Web, iOS, Android, Flutter). Applied to `web.md` as the reference implementation — apply the same patterns to all other SDK pages.

## Page Structure

Every SDK page follows this exact heading skeleton. Skip sections that don't apply to the platform, but never reorder.

```
---
toc_min_heading_level: 2
toc_max_heading_level: 3
---

[Overview paragraph — what the SDK does on this platform]

<CheckoutDemo />              ← Web only; no heading wrapper needed

## Installation

## Initialization
  ### Checkout.init (or platform equivalent)
  ### Checkout.reload (or platform equivalent)

## Properties
  ### Required Properties      ← selector/container, merchant_id, apiKey, session_id
  ### Display Options          ← lang, formsOfPayment, displayMode
  ### Preloading               ← setupPreload (if supported)
  ### Theme                    ← theme object, example themes, scenarios, supported values

## Wallet Configuration
  ### Apple Pay                ← init config + button customization + gateway-specific notes (e.g., KNET)
  ### Google Pay               ← init config + button customization
  ### stc pay                  ← init config + button customization
  ### urpay                    ← init config + button customization

## Callbacks
  ### errorCallback
  ### cancelCallback
  ### successCallback
  ### beforePayment Hook
  ### validatePayment Hook

## Data Reference
  ### data Object              ← the data object passed to callbacks + child parameters
  ### showPopup                ← Checkout.showPopup utility (if supported)

## Examples
  ### Basic Example            ← minimal working code
  ### Full Example             ← complete integration with callbacks, wallet init, theme

## FAQ
```

## Heading Rules

- **H2 (`##`)** — major sections: Installation, Properties, Callbacks, etc. These appear as top-level entries in the right-hand TOC.
- **H3 (`###`)** — subsections within a major section: Checkout.init, Required Properties, Apple Pay, errorCallback. These appear as children in the TOC.
- **H4 (`####`)** — individual items within a subsection: specific properties (`selector`, `merchant_id`), FAQ questions, customize button, KNET integration. NOT visible in the TOC.
- **H5 (`#####`)** — sub-items within H4s: supported/unsupported properties lists, implementation steps. Never in TOC.
- **`toc_max_heading_level: 3`** — always set this in frontmatter. H4+ headings must never appear in the right-hand TOC.

## TOC Configuration

```yaml
---
toc_min_heading_level: 2
toc_max_heading_level: 3
---
```

This ensures the right-hand TOC shows only H2 (top-level sections) and H3 (their children). No deeper.

## Intro Rules

**Include:**
- 1-2 paragraphs explaining what the SDK does on this platform
- `:::warning` about Checkout API dependency + server-side REST API calls
- `<CheckoutDemo />` (Web only) — no heading, no description paragraph around it

**Do NOT include:**
- References to older SDK versions or links to legacy documentation
- Empty or redundant headings (no `### Checkout SDK` before Demo)
- "Below is a demo of..." description text — the component is self-explanatory
- Conclusion paragraphs at the end of the page

## Property Grouping

Properties are grouped into categories under `## Properties`, each as a `###`:

| Category | Properties | Description |
|----------|-----------|-------------|
| `### Required Properties` | selector, merchant_id, apiKey, session_id | Must be provided in every init call |
| `### Display Options` | lang, formsOfPayment, displayMode | Control what the checkout shows and how |
| `### Preloading` | setupPreload | Performance optimization — pre-fetched transaction details |
| `### Theme` | theme object | Appearance customization — examples, scenarios, supported CSS classes |

Wallet-specific init objects (`applePayInit`, `googlePayInit`) are **NOT** properties — they belong under `## Wallet Configuration > ### [Wallet Name]`.

## Wallet Configuration

All wallet-specific content is consolidated under `## Wallet Configuration`, grouped by wallet:

```
## Wallet Configuration
  ### Apple Pay
    #### applePayInit            ← init object, supported/unsupported properties
    #### Customize Button        ← button appearance, theme overrides
    #### KNET Integration        ← gateway-specific notes (if applicable)
  ### Google Pay
    #### googlePayInit
    #### Customize Button
  ### stc pay
    #### Customize Button
  ### urpay
    #### Customize Button
```

**Rules:**
- Each wallet gets its own `###` section
- Init config objects (`applePayInit`, `googlePayInit`) live here, not under Properties
- Button customization is `#### Customize Button` (not "Customize Apple Pay button")
- Gateway-specific notes (KNET-Apple Pay) fold into the wallet section as a `####`, not a standalone `###`

## Callbacks

**Naming:** Use the function name without `window.` or `windows.` prefix.
- `### errorCallback` (not `### window.errorCallback`)
- `### beforePayment Hook` (not `### windows.beforePayment Hook`)

**Structure:**
- Each callback is a `###`
- Related examples (e.g., "Apply Discount Based on Card PAN") are `####` under the relevant callback
- Sub-sections like "How to Implement", "Best Practices" are `#####`

## Examples

Two examples, consolidated under `## Examples`:

| Subsection | Content |
|-----------|---------|
| `### Basic Example` | Minimal init + callbacks, no wallet-specific config |
| `### Full Example` | Complete integration: HTML + JS with all callbacks, wallet init, theme |

**Do NOT** use names like "Example Without googlePayInit/ApplePayInit" or "Extended example" — use "Basic" and "Full".

## Images

SDK page images use a CSS rule that makes them 40% smaller and centered:

```css
.theme-doc-markdown figure img[src*="checkout-sdk"],
.theme-doc-markdown figure img[src*="googleusercontent"] {
  max-width: 60%;
  height: auto;
  display: block;
  margin: 0 auto;
}
```

This is defined in `src/css/custom.css`. Images use `<figure><img>` HTML format throughout. No width attributes needed — the CSS handles sizing.

## Live Demo (Web Only)

The Web SDK page uses a `<CheckoutDemo />` React component that replaces the old CodePen iframe:

- **Component:** `src/components/CheckoutDemo/` (BrowserOnly wrapper + state machine)
- **Session utility:** `src/utils/sandbox.ts` — reusable `createSandboxSession({ pg_codes })` function
- **No heading needed** — place `<CheckoutDemo />` directly after the intro paragraphs

For mobile SDK pages, consider recorded screen captures or Flutter Web compilation instead.

## Platform-Specific Notes

Not all sections apply to all platforms:

| Section | Web | iOS | Android | Flutter |
|---------|-----|-----|---------|---------|
| Installation | script tag | CocoaPods/SPM | Gradle | pub.dev |
| Live Demo | CheckoutDemo component | N/A | N/A | Possible via Flutter Web |
| Theme | Full CSS customization | Platform-specific | Platform-specific | Platform-specific |
| Wallet Config | applePayInit, googlePayInit | Apple Pay native | Google Pay native | Both |
| showPopup | Supported | May differ | May differ | May differ |

Adapt section content to the platform, but keep the heading names and order consistent.
