# Design Tokens

The exact, non-negotiable values an Ottu docs diagram uses. These are reconciled from three sources — the Ottu brand guide, the live dashboard Figma, and the docs site's own `src/css/custom.css` — so a diagram looks like it was always part of the page it sits on.

A diagram inherits **nothing** from the page (it's loaded as an `<img>`, a separate document). Every colour and font lives inside the SVG. That is why these tokens must be copied in verbatim rather than guessed.

## The one rule that governs colour

> **Almost everything is grey. Blue is a spotlight, not a paint job.**

Most nodes are neutral scaffolding — the reader's eye should slide over them and land on the **1–2** nodes that actually matter. Those get Ottu blue. If you find yourself colouring a third node, stop and ask "what is the ONE thing the reader must notice?" A 7-node diagram with 1 blue node reads as premium; the same diagram with 5 colours reads as a toy.

This is the same restraint the `/mermaid` convention uses, and the two shipped diagrams (`architecture-*`, `wallet-flow-*`) follow it exactly.

## Accent & semantic colours

| Class | Hex | Meaning | Budget per diagram |
|---|---|---|---|
| `accent` | `#0B82BE` | The key Ottu service/API the diagram is *about* | **1–2 nodes** |
| `danger` | `#ED2833` | Genuine risk only — a PCI boundary, an encryption step, a failure path | **0–1 nodes** |
| (neutral) | — | Everything else: actors, supporting services, data stores | the rest |

`#0B82BE` is the canonical Ottu blue used by the docs site (the `:::note` admonition border), the dashboard, and both shipped diagrams. The brand guide prints Secondary Blue as `#0A82BE` and the `/mermaid` *skill file* uses `#1983BC`; both are drift. **Use `#0B82BE`.**

The brand's *primary* colour is actually Orange (`#F77D1A`), but in the docs orange is the link colour, so orange nodes would read as clickable. Diagrams therefore accent with blue. Do not introduce orange, pink, green, or any other hue into a standard diagram — they carry no meaning here and only add noise.

## Typography — Poppins

The docs site sets `--ifm-font-family-base: "Poppins"`. Diagrams must match, or text in the image looks foreign next to the prose around it.

```
font-family: 'Poppins', system-ui, -apple-system, sans-serif;
```

The two shipped SVGs predate this and use Inter — that is the single biggest piece of drift this skill corrects. **Never emit `'Inter'` in a diagram.** (Mermaid is deliberately left on Trebuchet because it can't size Poppins without overflowing its auto-laid-out nodes; we hand-place every label, so Poppins is correct for us.)

### Type scale (calibrated to a ~1100-wide viewBox)

| Role | Class | Size / weight | Notes |
|---|---|---|---|
| Node title | `.label` / `.label-white` | 13px / 600 | `-white` for text on a filled accent/danger node |
| Node subtitle | `.sub` / `.sub-white` | 11px / 400 | one short clarifying line under the title |
| Container eyebrow | `.platform-label` | 10px / 700, `letter-spacing: 1.6px` | the all-caps boundary label, e.g. `OTTU PLATFORM` |
| Arrow label | `.arrow-label` | 10px / 500, `letter-spacing: 0.3px` | sits in a chip over the line |

These sizes assume the canvas is roughly 1100 units wide. If you scale the viewBox up or down a lot, keep the *rendered* text in this size range rather than keeping the raw numbers.

### How the font actually renders

Diagrams render **inline** — in the page DOM, via the `<Diagram>` component — not as an `<img>`. An inline SVG inherits the host page's fonts, so `font-family: 'Poppins'` resolves to the real Poppins the docs site already loads, for **every** visitor. No embedding, no fallback surprise.

Keep the `system-ui, -apple-system, sans-serif` tail anyway — it only matters if a diagram is ever opened as a standalone file (outside the site), where it degrades gracefully. Rendering inline rather than swapping `<img>` assets is *the* reason Poppins works here: an `<img>`-loaded SVG is an isolated document that can't see the page's web fonts and would fall back to system-ui.

## Light palette — the full `<style>` block

Copy this verbatim into a light-theme diagram. It styles every standard class; unclassed shapes fall back to these.

```css
.node { fill: #FFFFFF; stroke: #D4D4D4; stroke-width: 1.4; }
.accent { fill: #0B82BE; stroke: #0B82BE; stroke-width: 1.4; }
.danger { fill: #ED2833; stroke: #ED2833; stroke-width: 1.4; }
.container-bg { fill: #F6FAFD; stroke: #0B82BE; stroke-dasharray: 5 5; stroke-width: 1.2; opacity: 0.85; }
.platform-label { fill: #0B82BE; font: 700 10px 'Poppins', system-ui, sans-serif; letter-spacing: 1.6px; }
.label { fill: #302F37; font: 600 13px 'Poppins', system-ui, sans-serif; }
.label-white { fill: #FFFFFF; font: 600 13px 'Poppins', system-ui, sans-serif; }
.sub { fill: #6B6B72; font: 400 11px 'Poppins', system-ui, sans-serif; }
.sub-white { fill: #FFFFFF; font: 400 11px 'Poppins', system-ui, sans-serif; opacity: 0.9; }
.divider { stroke: #E0E0E3; stroke-width: 1; }
.arrow { fill: none; stroke: #8B8A90; stroke-width: 1.4; }
.arrow-head { fill: #8B8A90; }
.arrow-label { fill: #6B6B72; font: 500 10px 'Poppins', system-ui, sans-serif; letter-spacing: 0.3px; }
.arrow-label-bg { fill: #F6FAFD; }
```

`#302F37` (brand Charcoal, = the docs `--ifm-heading-color`) is the body text colour. The blue-tinted `#F6FAFD` container fill and chip background let the dashed blue boundary read without shouting.

## Dark palette — `[data-theme='dark']` overrides

There is **no second file.** `scripts/inline-svg.py` appends a `[data-theme='dark'] .ottu-dgm--<slug> …` block to the one SVG's `<style>`, overriding only the properties that change (it's a higher-specificity selector, so unspecified props like the font fall through to the light rule, and theme-independent classes — `accent`, `danger`, `*-white` — get no override at all). Don't hand-write these; the script is the source of truth. The full dark target values, for reference:

```css
.node { fill: #171A21; stroke: #1E2939; stroke-width: 1.4; }
.accent { fill: #0B82BE; stroke: #0B82BE; stroke-width: 1.4; }
.danger { fill: #ED2833; stroke: #ED2833; stroke-width: 1.4; }
.container-bg { fill: #0F1A22; stroke: #0B82BE; stroke-dasharray: 5 5; stroke-width: 1.2; opacity: 0.85; }
.platform-label { fill: #5CB4E1; font: 700 10px 'Poppins', system-ui, sans-serif; letter-spacing: 1.6px; }
.label { fill: #E5E7EB; font: 600 13px 'Poppins', system-ui, sans-serif; }
.label-white { fill: #FFFFFF; font: 600 13px 'Poppins', system-ui, sans-serif; }
.sub { fill: #A0A0A8; font: 400 11px 'Poppins', system-ui, sans-serif; }
.sub-white { fill: #FFFFFF; font: 400 11px 'Poppins', system-ui, sans-serif; opacity: 0.9; }
.divider { stroke: #1E2939; stroke-width: 1; }
.arrow { fill: none; stroke: #8A8A92; stroke-width: 1.4; }
.arrow-head { fill: #8A8A92; }
.arrow-label { fill: #A0A0A8; font: 500 10px 'Poppins', system-ui, sans-serif; letter-spacing: 0.3px; }
.arrow-label-bg { fill: #0F1A22; }
```

Why these values: the node fill `#171A21` and border `#1E2939` are the docs dark-theme surface and border tokens, so a dark-mode diagram node looks exactly like a dark-mode docs card. `#5CB4E1` is a lightened blue for the eyebrow label, because pure `#0B82BE` text is too dim on a near-black background. The accent and danger *fills* stay the same hex in both themes — a filled blue or red box reads correctly on either background.

## Shape → role grammar

Consistent shapes let a reader decode the diagram before reading a word.

| Shape | SVG | Role |
|---|---|---|
| Pill (`rx` ≈ half height) | `<rect rx="24">` | A person / external actor (Customer) |
| Rounded rect | `<rect rx="8">` | A service, API, or app (most nodes) |
| Dashed container | `<rect rx="14" class="container-bg">` | A trust/ownership boundary (the Ottu platform) |
| Hexagon / tag | path | A token, artifact, or data object (use sparingly) |

Rough sizing on the 1100-wide canvas: a titled service node is ~180–240 wide × 70 tall; a single-line pill is ~180 × 48; columns of nodes share an `x` and stack ~30–40px apart vertically. Keep columns aligned — misaligned boxes are the fastest way to make a diagram look amateur.

## Arrows

- **Solid** `.arrow` = a synchronous call / direct flow.
- **Dashed** (`stroke-dasharray="4 3"` on the path) = an asynchronous or return path (e.g. a webhook firing back).
- Every arrow ends in `marker-end="url(#arrow)"` (one shared marker — see `svg-conventions.md`).
- Label a flow only when the verb adds information ("enters card", "REST calls", "routes", "HMAC events"). Put the label in an `.arrow-label-bg` chip so it stays legible where it crosses a line.

## What never appears in a diagram

- `'Inter'` or any non-Poppins font.
- A third accent colour, or orange/green/pink in a standard diagram.
- Raster images, drop shadows, or gradients — these are flat vector diagrams.
- Hardcoded `width`/`height` on the root `<svg>` (use `viewBox` + `preserveAspectRatio` so it scales to the column).
- Delivery as an `<img>` / `<ThemedImage>` — that kills both theming and Poppins. Diagrams render **inline** via the `<Diagram>` component.
- Unscoped selectors or shared ids — every diagram is scoped to `.ottu-dgm--<slug>` with slug-suffixed ids (`arrow-<slug>`, …) so several can share one page without colliding. `scripts/inline-svg.py` does this for you.
