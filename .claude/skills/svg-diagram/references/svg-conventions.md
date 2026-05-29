# SVG Conventions

How an Ottu diagram is structured. The palette lives in `design-tokens.md`; this file is the *skeleton* — the root element, accessibility, the arrow marker, the building blocks, and how the finished SVG gets delivered inline.

**You author a clean, light-only SVG** (plain class names, a plain `<style>`, a single `<marker id="arrow">`). One command — `scripts/inline-svg.py` — then turns it into the final inline SVG by scoping every selector, making ids unique, and appending the `[data-theme='dark']` overrides. So while authoring, don't worry about scoping or dark mode; write the light diagram cleanly and let the script finish it.

## Root element

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 460"
     role="img" aria-labelledby="diagram-title diagram-desc"
     preserveAspectRatio="xMidYMid meet">
```

- **`viewBox`, no `width`/`height`** — the diagram scales to its column. `1100`-wide is the house default; height fits the content (≈360–520).
- **`role="img"` + `aria-labelledby`** point at a `<title>` and `<desc>`. Author the ids plainly (`diagram-title`, `diagram-desc`); `inline-svg.py` suffixes them with the slug so multiple diagrams on a page don't collide.
- **`preserveAspectRatio="xMidYMid meet"`** centres and never distorts.

## Accessibility block — required

```xml
<title id="diagram-title">Ottu Wallet Refund Flow</title>
<desc id="diagram-desc">The merchant backend refunds a payment to wallet through Ottu Connect, which credits the wallet service. On the next checkout the SDK discovers the balance, reserves it, and charges any remainder through the payment gateway.</desc>
```

The `<desc>` should read like the sentence you'd say out loud — it's the description a screen reader gets, and it should match the `alt` you pass to `<Diagram>`.

## `<defs>`: one shared arrow marker

```xml
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto">
    <path class="arrow-head" d="M0,1 L9,5 L0,9 z" />
  </marker>
  <style>
    /* the LIGHT rules from design-tokens.md — unscoped; the script scopes them */
  </style>
</defs>
```

The arrowhead's colour comes from the `.arrow-head` **class** (so the dark override restyles it for free). Author `id="arrow"` plainly; `inline-svg.py` renames it to `arrow-<slug>` and rewrites the `url(#arrow)` references.

## Building blocks

Assemble from these. Coordinates are illustrative — align columns and rows deliberately.

### Boundary container (draw first, behind the nodes)

```xml
<rect class="container-bg" x="320" y="70" width="550" height="290" rx="14" />
<text class="platform-label" x="340" y="96">OTTU PLATFORM</text>
```

### External actor (pill)

```xml
<rect class="node" x="30" y="36" width="180" height="48" rx="24" />
<text class="label" x="120" y="66" text-anchor="middle">Customer</text>
```

### Service node (title + subtitle)

```xml
<rect class="node" x="30" y="120" width="180" height="70" rx="8" />
<text class="label" x="120" y="150" text-anchor="middle">Merchant Backend</text>
<text class="sub"   x="120" y="170" text-anchor="middle">Your server</text>
```

### The accent node — the one the diagram is about

```xml
<rect class="accent" x="340" y="215" width="220" height="70" rx="8" />
<text class="label-white" x="450" y="245" text-anchor="middle">REST API</text>
<text class="sub-white"   x="450" y="265" text-anchor="middle">Api-Key · Basic auth</text>
```

Text on a filled `accent`/`danger` node uses the `-white` classes. A node is `accent` **only** if it's the focal point — see the colour budget in `design-tokens.md`.

### A multi-line list node (e.g. a gateway with examples)

```xml
<rect class="node" x="900" y="100" width="180" height="210" rx="8" />
<text class="label" x="990" y="135" text-anchor="middle">Payment Gateway</text>
<line class="divider" x1="930" y1="150" x2="1050" y2="150" />
<text class="sub" x="990" y="175" text-anchor="middle">KNET</text>
<text class="sub" x="990" y="247" text-anchor="middle" font-style="italic">+ 40 more</text>
```

### Solid arrow with a label chip

```xml
<path class="arrow" d="M 210 250 L 340 250" marker-end="url(#arrow)" />
<rect class="arrow-label-bg" x="240" y="238" width="70" height="14" rx="3" />
<text class="arrow-label" x="275" y="249" text-anchor="middle">REST calls</text>
```

Size the chip to the text (~`7px × characters`) and centre it on the line's midpoint so the rule doesn't strike through the words.

### Async / return arrow (dashed)

```xml
<path class="arrow" d="M 600 275 Q 420 410 210 290" stroke-dasharray="4 3" marker-end="url(#arrow)" />
```

Use a gentle curve for long return paths so they sweep around the diagram instead of cutting through it.

## Text legibility rules

- **Centre** labels with `text-anchor="middle"` at the node's centre; title baseline ≈ `y + 30` of a 70-tall node, subtitle ≈ `y + 50`.
- Titles ~2–3 words, subtitles one short line. If a node needs a paragraph, it's two nodes.
- Never let text overflow — widen the node or shorten the text. SVG `<text>` doesn't wrap.

## Making it inline-ready, then delivering it

After the light SVG is final:

```bash
python .claude/skills/svg-diagram/scripts/inline-svg.py <your-light>.svg <slug>
```

This prints the finished inline SVG: root class `ottu-dgm--<slug>`, ids suffixed, every selector scoped, and a `[data-theme='dark']` override block appended. Then embed it:

```tsx
// src/diagrams/WebhookSigning.tsx
import React from "react";
import Diagram from "@site/src/components/Diagram";

const SVG = String.raw`<svg ...>…inline-svg.py output…</svg>`;

export default function WebhookSigning(): React.JSX.Element {
  return <Diagram svg={SVG} alt="…one-sentence summary, mirroring <desc>…" />;
}
```

```mdx
import WebhookSigning from '@site/src/diagrams/WebhookSigning';

<WebhookSigning />
```

`<Diagram>` renders the SVG inline (in the page DOM) so it gets Poppins and theme-switching. Pass an optional `caption` for a small line under the diagram.

## Self-check before delivering

- [ ] `python -c "import xml.dom.minidom,sys; xml.dom.minidom.parse(sys.argv[1])" <svg>` parses — well-formed.
- [ ] `<title>` and `<desc>` are present and descriptive; `role="img"` is set.
- [ ] Font is Poppins everywhere; the string `Inter` appears nowhere.
- [ ] Every selector is scoped under `.ottu-dgm--<slug>`, and the `<style>` has a `[data-theme='dark']` override block.
- [ ] Only standard classes from `design-tokens.md` — `inline-svg.py` **warns** if a class has no dark-theme override (it would keep its light colour in dark mode, e.g. a white chip on a dark background). Heed that warning.
- [ ] ids are slug-suffixed (`arrow-<slug>`, `diagram-title-<slug>`, …) and the `url(#…)`/`aria-labelledby` refs match.
- [ ] At most 1–2 `accent` nodes, at most 1 `danger`.
- [ ] No `width`/`height` on the root `<svg>`; `viewBox` present.
- [ ] `npm run typecheck` passes. If a dev server is up, the page renders and the focal node recolours when you toggle the theme.
