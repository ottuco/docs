---
name: svg-diagram
description: >-
  Create or update a documentation diagram for the Ottu docs as a single,
  hand-built, theme-aware inline SVG rendered through the <Diagram> React
  component. This is the PRIMARY way to make any docs diagram — architecture
  diagrams, payment/data flows, sequence-style flows, system overviews, "how it
  works" visuals. Use it whenever the user asks to add, create, draw, design,
  build, illustrate, or visualize a diagram, flow, architecture, or system
  picture on a docs page — even if they don't say "SVG" — and whenever they ask
  to replace, upgrade, or restyle an existing Mermaid diagram. Mermaid is now
  only a fallback left over from content migration; prefer this skill and
  convert Mermaid diagrams to inline SVG as you encounter them. Also triggers on
  "diagram for this page", "make this look better", or "we need a visual here".
---

# Ottu SVG Diagram

Produce documentation diagrams as **a single, hand-built, theme-aware inline SVG** — premium, restrained, on-brand. The diagram renders *in the page DOM* (via the `<Diagram>` component), so it inherits the site's **Poppins** font and switches light/dark instantly with the page. One file, no `<img>`, no second file to keep in sync.

The diagrams on `/overview/architecture/` and `/developers/payments/wallet/` are the bar. New diagrams match them; Mermaid diagrams get converted to this style over time.

**What you deliver:** one inline SVG (scoped + dual-theme), embedded in a tiny `src/diagrams/<Name>.tsx` module, rendered on the page with `<YourDiagram />`.

## Why inline SVG (and not Mermaid, and not `<img>`)

- **Not Mermaid:** Mermaid auto-lays-out nodes and can't render Poppins without overflow, so it's locked to a generic look. Hand-built SVG gives full control over composition, type, and the palette — the point of a *premium* diagram. Mermaid stays a quick fallback but is being phased out.
- **Not `<img>`/ThemedImage:** an `<img>`-loaded SVG is an isolated document — it can't use the page's Poppins and can't react to the theme toggle, which forces a second dark file. Rendering the SVG **inline** (in the DOM) is the frontend best practice: one file, true Poppins, instant CSS theme switch, nothing to drift.

## The aesthetic, in one line

> **Almost everything is grey. Blue is a spotlight, not a paint job.**

Most nodes are neutral scaffolding; only the 1–2 nodes the diagram is *about* get Ottu blue (`#0B82BE`). Stripe docs / Apple keynote, not a rainbow flowchart. The locked palette, fonts, and shape grammar live in [`references/design-tokens.md`](references/design-tokens.md) — read it before choosing any colour or font.

## Workflow

### 1. Understand the flow before drawing it

A diagram is a teaching tool, not decoration. Pin down: the **actors/pieces** (respect the payment-domain roles in the repo `CLAUDE.md` — merchant calls APIs, customer only touches checkout UI, Ottu sits between merchant and gateway); the **direction** (usually left-to-right); the **ONE thing to notice** (the 1–2 Ottu pieces that become the accent nodes); and **what to leave out** (status codes, retries, protocol minutiae belong in prose beside the diagram). If the request is vague, read the surrounding page and let the prose tell you what to illustrate.

### 2. Design pass — borrow the eye of `frontend-design`, keep Ottu's rails

Invoke the **`frontend-design`** skill for the composition judgement: hierarchy, alignment, balance, whitespace, the "is this actually premium?" eye. But it defaults to **bold, grid-breaking, anti-Inter maximalism**, which would shatter a brand-locked system — so hold the rails firm:

- **Palette is locked** to the Ottu tokens — `#0B82BE` accent, neutral greys, `#ED2833` for genuine risk only. No new hues, no gradients.
- **Font is locked** to Poppins.
- **The aesthetic is refined restraint**, which `frontend-design` explicitly supports ("Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details"). That's the part you want.

**`frontend-design` supplies the eye; Ottu's tokens supply the rails. Apply the craft *within* the constraints.**

### 3. Author the light SVG

Start from [`assets/template.svg`](assets/template.svg) — root element, accessibility block, the single shared arrow marker, and the light `<style>`. Compose with the building blocks and rules in [`references/svg-conventions.md`](references/svg-conventions.md), and study [`references/examples.md`](references/examples.md). You only author the **light** theme and a normal `<style>` — the next step adds dark + scoping mechanically.

Keep columns aligned, give the focal node room, label arrows with verbs, and write a real `<title>`/`<desc>`.

### 4. Make it inline-ready (scope + theme) with one command

A single command turns your authored light SVG into the final inline SVG — scoped to a unique class, ids made unique (so several diagrams can share a page), and a `[data-theme='dark']` override block appended from the dark token map:

```bash
python .claude/skills/svg-diagram/scripts/inline-svg.py <your-light>.svg <slug>
```

`<slug>` is kebab-case and unique per diagram (e.g. `webhook-signing`). It prints the finished SVG to stdout. **Don't hand-write the dark rules or the scoping** — the script is the source of truth and keeps every diagram consistent.

### 5. Drop it into a diagram module

Create `src/diagrams/<Name>.tsx` holding the SVG as a `String.raw` template literal and rendering it through the shared component:

```tsx
import React from "react";
import Diagram from "@site/src/components/Diagram";

const SVG = String.raw`<svg ...>...the inline-svg.py output...</svg>`;

export default function WebhookSigning(): React.JSX.Element {
  return <Diagram svg={SVG} alt="One-sentence summary, mirroring the SVG's <desc>." />;
}
```

`<Diagram>` (`src/components/Diagram/index.tsx`) injects the SVG inline so it gets Poppins and theme-switching; it also takes an optional `caption`. SVG markup never contains backticks or `${`, so `String.raw` is safe.

### 6. Render it on the page

```mdx
import WebhookSigning from '@site/src/diagrams/WebhookSigning';

<WebhookSigning />
```

The page must be `.mdx` (not `.md`) to import a component — rename it and update any sidebar `id` if needed.

### 7. Self-check

Run the checklist at the end of [`references/svg-conventions.md`](references/svg-conventions.md). Essentials:

- The SVG parses as well-formed XML; `<style>` has a `[data-theme='dark']` override block.
- Every selector is scoped under `.ottu-dgm--<slug>`; ids (`marker`, `title`, `desc`) are suffixed with the slug.
- Poppins everywhere; the string `Inter` appears nowhere.
- At most 1–2 `accent` nodes, at most 1 `danger`.
- `role="img"` plus a descriptive `<title>` and `<desc>`.
- No `width`/`height` on the root `<svg>` (so it scales).
- `npm run typecheck` passes. If a dev server is running, the page renders in both themes (toggle and check the focal node colour changes).

## Replacing an existing Mermaid diagram

1. Read the ```mermaid``` block and reconstruct the flow — nodes, edges, direction, focus.
2. Author the light SVG, run `inline-svg.py`, and create the `src/diagrams/<Name>.tsx` module.
3. Delete the ```mermaid``` fence and render `<YourDiagram />` in its place (add the import).
4. Mention the conversion so it's reviewable.

## Reference files

- [`references/design-tokens.md`](references/design-tokens.md) — locked palette (light + dark overrides), Poppins type scale, shape→role grammar. **The colour/font source of truth.**
- [`references/svg-conventions.md`](references/svg-conventions.md) — the SVG skeleton, accessibility, the single shared arrow marker, the inline/scoping contract, building-block snippets, the self-check.
- [`references/examples.md`](references/examples.md) — the shipped diagrams annotated, plus a minimal complete one.
- [`assets/template.svg`](assets/template.svg) — the light authoring scaffold. Run `scripts/inline-svg.py` on it to produce the final inline SVG.
- `scripts/inline-svg.py` — scope + id-uniquify + append the dark overrides. (`scripts/make-dark.py` is retired — it produced the old second file.)
