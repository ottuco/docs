# Figma Design System Rules — Ottu Documentation

Reference document for translating Figma designs into this codebase via the Model Context Protocol (MCP).

**Figma source:** [Ottu Docs Pages](https://www.figma.com/design/6fMWZqRrv9Ofp9X5hpRYZm/Ottu-Docs-pages?node-id=25-6795&m=dev)

---

## 1. Token Definitions

**Source:** `src/css/custom.css` — CSS custom properties overriding the Infima framework.

### Typography

**Font family:** Poppins (imported from Google Fonts), with system font fallbacks.

```css
--ifm-font-family-base: 'Poppins', system-ui, -apple-system, sans-serif;
--ifm-heading-font-family: 'Poppins', system-ui, -apple-system, sans-serif;
--ifm-font-family-monospace: 'Consolas', 'Monaco', 'Courier New', monospace;
```

**Font sizes (from Figma):**

| Style | Size | Weight | CSS Variable | Figma Source |
|-------|------|--------|-------------|-------------|
| Headline 1 | 32px / 2rem | Bold (700) | `--ifm-h1-font-size` | `text-[32px]` on H1 nodes |
| Subheading 3 | 24px / 1.5rem | SemiBold (600) | `--ifm-h2-font-size` | `text-[24px]` on H2 nodes |
| Subheading 4 | 20px / 1.25rem | SemiBold (600) | `--ifm-h3-font-size` | `text-[20px]` on H3 nodes |
| Basic text | 16px / 1rem | Regular (400) | `--ifm-font-size-base` | `text-[16px]` on paragraph nodes |
| Buttons | 16px | Medium (500) | — | `Poppins:Medium` on buttons |
| Description/Notes | 14px | Regular (400) | — | `text-[14px]` on sidebar, footer |
| Small text | 12px | Medium (500) | — | `text-[12px]` on labels |
| Code | 14px | Regular (400) | — | `Consolas:Regular` on code blocks |

### Color Palette

**Values from Figma** (marked with source) **vs computed shades** (marked as derived):

| Token | Light Mode | Dark Mode | Figma Source |
|-------|-----------|-----------|--------------|
| `--ifm-color-primary` | `#f27e20` | `#f27e20` | `text-[#f27e20]` on links, active sidebar |
| `--ifm-color-primary-dark` | `#da711d` | — | Derived (Infima shade scale) |
| `--ifm-color-primary-darker` | `#ce6b1b` | — | Derived |
| `--ifm-color-primary-darkest` | `#a95816` | — | Derived |
| `--ifm-color-primary-light` | `#f4913d` | — | Derived |
| `--ifm-color-primary-lighter` | `#f59d52` | — | Derived |
| `--ifm-color-primary-lightest` | `#f8bc83` | — | Derived |
| `--ifm-background-color` | `#ffffff` | `#0f1117` | `bg-[var(--background,white)]` on containers |
| `--ifm-background-surface-color` | `#fafafa` | `#171a21` | `bg-[var(--page-bg,#fafafa)]` on URL bars |
| `--ifm-font-color-base` | `#4a4a4a` | `#e5e7eb` | `text-[color:var(--secondary-text,#4a4a4a)]` on body text |
| `--ifm-heading-color` | `#302f37` | `#ffffff` | `text-[#302f37]` on all headings |
| `--ifm-navbar-background-color` | `#ffffff` | `#0b0d12` | `bg-[var(--background,white)]` on header |
| `--ifm-footer-background-color` | `#f7f7f7` | `#0b0d12` | `bg-[var(--background,white)]` on footer |
| `--ifm-link-color` | `#f27e20` | `#f57d2d` | `text-[#f27e20]` on inline links |
| `--ifm-link-hover-color` | `#da711d` | `#fabf97` | Derived (no hover state in Figma) |
| `--ifm-global-border-color` | `#e5e5e5` | `#1e2939` | — |
| `--ifm-code-background` | `#f2f2f2` | `#020617` | — |
| `--ifm-code-color` | `#1d1d1d` | — | — |
| `--ifm-menu-color-background-active` | `#f2f2f2` | `#1e2939` | `bg-[...#f2f2f2]` on active sidebar item |

**Note:** Some Figma values differ from what's currently active in the CSS. The Figma design shows:
- Borders: `#dadada` (from `border-[var(--border,#dadada)]`) — currently `#e5e5e5` in the CSS variable; `#dadada` is used directly for the sidebar container border
- Dark mode text: `#d1d5dc` — currently `#e5e7eb` in CSS
- Dark mode headings: `#e5e7eb` — currently `#ffffff` in CSS

These Figma values exist as commented-out alternatives in `custom.css`.

### Figma-Specific Colors (not in CSS variables)

These colors appear in Figma but are used directly in component styles or are commented out:

| Color | Where in Figma | Purpose |
|-------|---------------|---------|
| `#8e8e93` | Sidebar category labels | Gray text for "Payments" etc. |
| `#1a1a1a` | Admonition body text | `var(--basic-text)` in Figma |
| `#0b82be` | Info admonition border, POST badge | Blue accent |
| `#f0252b` | Required badge, error status codes | Red accent |
| `#ffba00` | PATCH/PUT method badge | Amber accent |
| `#364153` | Inline code text | Dark gray for code |
| `#e5e7eb` | Inline code background | Light gray for code bg |
| `#dadada` | Borders (header, sidebar, footer) | Border color |
| `#0d542b` / `#7bf1a8` | Response 200 OK badge | Green bg / green text |
| `#51a2ff` | Quick links in API explorer | Blue link color |
| `#101828` | API explorer sidebar bg | Dark panel bg |
| `#1e2939` | API explorer secondary bg | Dark secondary bg |
| `#030712` | API explorer code block bg | Darkest code bg |
| `#d1d5dc` | API explorer code text | Light code text |
| `#99a1af` | API explorer labels | Muted label text |

### Admonition / Alert Colors

Only the **info** admonition is directly from Figma. Others use original or partially updated values.

| Type | Background (Light) | Border | Source |
|------|-------------------|--------|--------|
| Note | `#f7f7f7` | `#d9d9d9` | Original (no note in Figma) |
| Info | `rgba(11, 130, 190, 0.08)` | `#0b82be` | **Figma** — `bg-[rgba(11,130,190,0.08)]` + `border-[var(--color,#0b82be)]` |
| Tip | `#eaf7f0` | `#22c55e` | Original |
| Warning | `#fff4ed` | `#f27e20` | Border updated to Figma orange |
| Danger | `#fde8ea` | `#ed2833` | Original |

Alert styling from Figma: `border-left-width: 4px`, `border-radius: 8px`, title `18px bold`, body `14px / 20px line-height`.

### Mermaid Diagram Semantic Colors

Colors communicate **responsibility**, not aesthetics:

| Role | Hex | Meaning |
|------|-----|---------|
| Blue | `#1983BC` | Ottu services, APIs, infrastructure |
| Orange | `#F57D2D` | Core execution, orchestration (use sparingly, 1–3 nodes) |
| Red | `#ED2833` | Security, PCI boundaries, encryption, failure |
| Pink | `#F093BC` | External actors, merchant UI, banks, third parties |
| Dark | `#302F37` | Boundaries, containers, trust domains |
| Light | `#F4F4F4` | Background |

### Spacing

No formal spacing scale — uses Infima defaults. Notable custom values:

- Grid gap: `2.5rem`
- Stepper circle: `24px` width/height
- Stepper padding: `18px` bottom, `36px` left offset
- Alert left border: `4px` (from Figma, was `6px`)
- Alert border-radius: `8px` (from Figma)
- Checkout SDK images: `16px` gap, `320px` max-width

---

## 2. Sidebar Styling (from Figma)

These are actively applied in the CSS:

| Element | Font | Size | Weight | Color | Figma Source |
|---------|------|------|--------|-------|--------------|
| All menu links | Poppins | 14px | 400 (Regular) | `#302f37` | `font-['Poppins:Regular'] text-[#302f37] text-[14px]` |
| Category labels | Poppins | 14px | 400 (Regular) | `#8e8e93` | `font-['Poppins:Regular'] text-[color:var(--grays/gray,#8e8e93)]` |
| Active item text | Poppins | 14px | 600 (SemiBold) | `var(--ifm-menu-color-active)` | `font-['Poppins:SemiBold'] text-[#f27e20]` |
| Active category bg | — | — | — | `#f2f2f2` (light) / `#1e2939` (dark) | `bg-[...#f2f2f2]` on active collapsible |
| Sidebar border | — | — | — | `#dadada` (light) / `#1e2939` (dark) | `border-[var(--border,#dadada)]` on sidebar container |
| Link border-radius | — | — | — | `8px` | `rounded-[8px]` on menu items |
| Link padding | — | — | — | `12px 8px` | `p-[12px]` on active item |

---

## 3. Inline Code Styling (from Figma)

Actively applied in `.markdown code`:

| Property | Light Mode | Dark Mode | Figma Source |
|----------|-----------|-----------|--------------|
| Background | `#e5e7eb` | `#1e2939` | `bg-[#e5e7eb]` on code badges like "PG_code" |
| Text color | `#364153` | `#d1d5dc` | `text-[#364153]` on code badge text |
| Border radius | `4px` | — | `rounded-[4px]` on code badges |
| Padding | `4px 8px` | — | `px-[8px] py-[4px]` on code badges |
| Font family | Consolas | — | `font-['Consolas:Regular']` |
| Font size | 14px / 0.875rem | — | `text-[14px]` |
| Font weight | 400 | — | Regular weight |

---

## 4. OpenAPI Schema Colors (from Figma — currently commented out)

These values were extracted from Figma but are **commented out** in `custom.css` (using plugin defaults instead):

| Element | Figma Color | Figma Source |
|---------|-------------|--------------|
| POST badge | `#0b82be` | `bg-[var(--color,#0b82be)]` on POST method container |
| GET badge | `#f27e20` | `bg-[#f27e20]` on GET method container |
| PATCH badge | `#ffba00` | `bg-[#ffba00]` on PATCH method container |
| DELETE badge | `#f0252b` | Implied from error color pattern |
| Required label | `#f0252b` | `text-[#f0252b]` on "Required" text |
| Active tab border | `#f27e20` | `border-[#f27e20]` on selected tabs |
| Active tab text | `#f27e20` | `text-[#f27e20]` on selected tab text |
| Inactive tab text | `#302f37` | `text-[#302f37]` on unselected tabs |
| Error status code bg | `#f0252b` | `bg-[#f0252b]` on 400/401 response tabs |
| Field name | Poppins SemiBold 16px `#302f37` | `font-['Poppins:SemiBold'] text-[#302f37]` |
| Type label | Poppins Regular 14px `#4a4a4a` | `font-['Poppins:Regular'] text-[14px]` |

To activate these, uncomment the relevant sections in `custom.css`.

---

## 5. Component Library

**Custom components:** `src/components/`
**Swizzled theme components:** `src/theme/`

| Component | Path | Purpose |
|-----------|------|---------|
| `HomepageFeatures` | `src/components/HomepageFeatures/index.tsx` | 3-column feature grid on homepage |
| `McpButton` | `src/components/McpButton.tsx` | MCP server install button (navbar) |
| `ApiDocEmbed` | `src/components/ApiDocEmbed.tsx` | Embeds auto-generated API docs inline |
| `Schema` | `src/theme/Schema/index.tsx` | OpenAPI schema renderer with deep linking |
| `SchemaItem` | `src/theme/SchemaItem/index.tsx` | Leaf property renderer with anchors |
| `DocSidebarItem/Category` | `src/theme/DocSidebarItem/Category/` | Sidebar categories with `targetHref` |
| `Authorization` | `src/theme/ApiExplorer/Authorization/` | API explorer auth form |
| `NavbarItem/ComponentTypes` | `src/theme/NavbarItem/ComponentTypes.tsx` | Extends navbar with `custom-mcpButton` |

### Component Pattern

```tsx
import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

export default function MyComponent(): React.JSX.Element {
  return <div className={clsx(styles.wrapper)}>{/* ... */}</div>;
}
```

No Storybook. No shared component library. Components are documentation-specific.

---

## 6. Frameworks & Libraries

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Docusaurus | 3.8.1 |
| UI Library | React | 18.3.1 |
| Language | TypeScript | ~5.6.2 |
| CSS Framework | Infima (Docusaurus built-in) | — |
| SCSS | sass | ^1.97.1 |
| Icons | @mdi/js + @mdi/react | ^7.4.47 / ^1.6.1 |
| Class Composition | clsx | ^2.0.0 |
| Syntax Highlighting | prism-react-renderer | ^2.3.0 |
| API Docs Plugin | docusaurus-plugin-openapi-docs | ^4.5.1 |
| Search | @easyops-cn/docusaurus-search-local | ^0.55.1 |
| MCP Server | docusaurus-plugin-mcp-server | ^0.11.0 |
| Diagrams | @docusaurus/theme-mermaid | ^3.8.1 |
| Package Manager | npm | — |
| Bundler | Webpack (via Docusaurus) | — |
| Code themes | GitHub (light), Dracula (dark) | — |

---

## 7. Asset Management

**Location:** `static/` — served at site root.

```
static/
├── img/
│   ├── cards-and-tokens/    # Card tokenization screenshots
│   ├── checkout-sdk/        # Checkout SDK screenshots
│   ├── invoices/            # Invoice workflow images
│   ├── payments/            # Payment workflow images
│   ├── reports/             # Reports feature images
│   ├── webhooks/            # Webhook flow diagrams
│   ├── ottu-api.svg         # Feature illustration (orange accents)
│   ├── ottu-gateway.svg     # Feature illustration
│   ├── ottu-global.svg      # Feature illustration
│   ├── ottu_logo.avif       # Brand logo (AVIF, optimized)
│   ├── ottu_home_page.png   # Hero image
│   ├── logo.svg             # Docusaurus logo
│   └── favicon.ico
├── Ottu_API.yaml            # Raw OpenAPI spec (committed)
├── api-sources.yaml         # Fetch configuration
└── api-enrichments/         # Enrichment overlays (YAML)
```

### Referencing Assets

- **In React:** `require("@site/static/img/ottu-api.svg").default`
- **In Markdown:** `![alt](/img/path.png)` or relative `../img/path.png`
- **Formats:** SVG (icons/illustrations), PNG (screenshots), AVIF (logo), JPG (social card)
- **No CDN** — assets served directly from the static build output

---

## 8. Icon System

### Material Design Icons (Primary)

```tsx
import { mdiLinkVariant } from "@mdi/js";
import Icon from "@mdi/react";

<Icon
  path={mdiLinkVariant}
  size={0.75}
  style={{ display: "inline-block", verticalAlign: "middle" }}
/>
```

### Custom SVG Illustrations

Located in `static/img/`:
- `ottu-api.svg` — API feature icon
- `ottu-gateway.svg` — Gateway feature icon
- `ottu-global.svg` — Global reach feature icon

### Conventions

- No icon font system (no FontAwesome)
- MDI icons for dynamic/programmatic use (anchors, badges)
- SVG files in `static/img/` for static illustrations
- PNG files for screenshots and raster content

---

## 9. Styling Approach

### Methodology: Global CSS + CSS Modules + SCSS

| Layer | File(s) | Scope |
|-------|---------|-------|
| Global tokens & overrides | `src/css/custom.css` | Site-wide |
| Component styles | `*.module.css` alongside component | Scoped per component |
| Schema styles | `src/theme/SchemaItem/_SchemaItem.scss` | SCSS with nesting |

### Dark Mode

Toggle via `[data-theme="dark"]` selector in `custom.css`. All color tokens are re-declared — no separate stylesheet.

### Responsive Design

Single breakpoint at `996px` (Docusaurus default).

### Scroll Behavior

```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: calc(var(--ifm-navbar-height));
}
:target {
  scroll-margin-top: calc(var(--ifm-navbar-height));
}
```

---

## 10. Project Structure

```
ottu-docs/
├── docs/                        # Markdown content (domain-structured)
│   ├── overview/                # About Ottu, Architecture, Changelog
│   ├── developers/
│   │   ├── getting-started/     # Auth, API fundamentals, sandbox
│   │   ├── payments/            # Checkout API, SDK, payment methods
│   │   ├── cards-and-tokens/    # Tokenization, recurring payments
│   │   ├── webhooks/            # Webhook setup, events, signatures
│   │   ├── reference/           # Error codes, payment states, glossary
│   │   └── apis/                # Auto-generated API reference (DO NOT EDIT)
│   ├── business/                # Dashboard & business user guides
│   ├── glossary/                # Payment terminology
│   └── resources/               # Support, tools
├── src/
│   ├── clientModules/           # Client-side modules (sidebar hash active link)
│   ├── components/              # Custom React components
│   ├── css/custom.css           # Global styles & tokens
│   ├── pages/                   # Standalone pages (homepage)
│   ├── theme/                   # Swizzled Docusaurus components
│   ├── types/                   # TypeScript declarations
│   └── utils/index.ts           # getFragmentId, copyAnchorUrl
├── static/                      # Static assets
│   ├── img/                     # Images, icons, screenshots
│   ├── Ottu_API.yaml            # Raw OpenAPI spec
│   ├── api-sources.yaml         # Fetch config
│   └── api-enrichments/         # Enrichment overlays
├── scripts/                     # Build scripts (API enrichment engine)
├── .scratch/                    # Planning docs (git-ignored)
├── docusaurus.config.ts         # Main Docusaurus config
├── sidebars.ts                  # Navigation structure
├── package.json
├── tsconfig.json
├── CLAUDE.md                    # Claude Code instructions
└── README.md
```

---

## Figma → Code Integration Guide

When translating Figma designs into this codebase:

1. **Colors** — Map Figma fills to CSS custom properties (`--ifm-color-primary`, etc.), not raw hex values. If a color doesn't match an existing token, define a new CSS variable in `src/css/custom.css`.

2. **Typography** — Use Poppins font family. Map Figma text styles: Bold (700) for H1, SemiBold (600) for H2–H4, Regular (400) for body, Medium (500) for buttons.

3. **Layout** — Use Infima utility classes for grid (`container`, `row`, `col--*`) and buttons. Use CSS Grid with `auto-fit` for responsive card layouts.

4. **New Components** — Create in `src/components/ComponentName/` with `index.tsx` + `styles.module.css`. Use CSS Modules for scoping. Use `clsx` for conditional classes.

5. **Icons** — Check `@mdi/js` for Material Design Icons first. For custom illustrations, export as SVG to `static/img/`.

6. **Dark Mode** — Define both light and dark variants. Use `[data-theme="dark"]` CSS variable overrides in `custom.css`.

7. **Responsive** — Single breakpoint at `996px`. Use Infima grid auto-fit and flexbox wrapping for mobile.

8. **Images** — Place in `static/img/` subdirectory matching the feature area. Use AVIF/SVG when possible; PNG for screenshots.

9. **Spacing** — Follow Infima defaults. Use `rem` units for custom spacing. No formal design token scale — match existing patterns in `custom.css`.

10. **Shadows & Borders** — Minimal shadows (`none` on navbar). `4px` left border on alerts with `8px` border-radius. `#e5e5e5` for borders in light mode.

11. **Commented-out Figma values** — `custom.css` contains commented-out sections with additional Figma-extracted values (OpenAPI badges, dark mode colors, navbar/footer fonts). Uncomment as needed when implementing those areas.
