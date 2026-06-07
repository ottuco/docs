# Worked Examples

Two diagrams already ship in this style, **both migrated to the inline approach** — read them before building a new one:

- **Architecture** — `src/diagrams/ArchitectureDiagram.tsx`, on `/overview/architecture/`.
- **Wallet flow** — `src/diagrams/WalletFlowDiagram.tsx`, on `/developers/payments/wallet/`.

Each is a faithful reference for the **finished inline form**: scoped `.ottu-dgm--<slug>`, one `<style>` with light rules + `[data-theme='dark']` overrides, slug-suffixed ids, Poppins, rendered through `<Diagram>`. The annotations below explain *why* the architecture diagram is built the way it is, so you can reuse the judgement rather than the coordinates.

## Architecture diagram, annotated

The canvas is `1100 × 460`. Read it left-to-right: the merchant's world on the left, the Ottu platform boxed in the middle, the gateway on the right.

**Layout decisions worth copying:**

- **A boundary that means something.** A single dashed `container-bg` rectangle wraps the four Ottu services with an `OTTU PLATFORM` eyebrow. The dashed blue border says "this is ours" without filling space with colour. The merchant's frontend/backend sit *outside* it, the gateway sits *outside* it — the picture teaches the trust boundary at a glance.
- **Columns.** Merchant nodes share `x=30`; Ottu services occupy two inner columns (`x=340` and `x=600`); the gateway is one tall node at `x=900`. Shared x-positions and shared widths are what make it look engineered rather than sketched.
- **Two accent nodes, chosen deliberately.** Only `REST API` and `Orchestration Engine` are blue — the two pieces a developer integrates against. The Checkout SDK, Webhooks, and Gateway stay neutral. Five of seven inner nodes are grey; that restraint is the whole effect.
- **The gateway as a list node.** Rather than 45 boxes, one node lists five real gateways, a divider, and `+ 40 more gateways` in italic. This is how you represent "many" without clutter.
- **Arrows carry the verbs.** `enters card`, `embeds`, `REST calls`, `routes`, `HMAC events` — each label is a verb that advances the story. The internal SDK→API and API→Orchestration arrows are left unlabelled because the proximity already implies the link. The webhook return is a long dashed curve sweeping under the diagram back to the merchant backend — async, visually distinct from the solid synchronous calls.

**What it deliberately omits:** retry counts, status codes, protocol details. A diagram is a map, not the territory — those belong in prose next to it.

## The recurring spine

Both shipped diagrams share a spine you'll reuse constantly:

```
ACTOR ──▶ [ OTTU SERVICE (accent) ] ──▶ [ supporting service ] ──▶ EXTERNAL
                     │
                     └───── dashed async return ─────▶ ACTOR
```

Left-to-right primary flow, one or two accent nodes for the Ottu pieces that matter, a dashed return path for anything asynchronous (webhooks, callbacks, settlement). Start from this and adapt.

## A minimal complete diagram

This is the smallest thing that's still "in style" — a three-node flow. Note: well-formed root, a11y block, single marker, Poppins via the style block, exactly one accent node, a labelled arrow with a chip. Use it as a sanity reference for structure.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 200"
     role="img" aria-labelledby="ex-title ex-desc" preserveAspectRatio="xMidYMid meet">
  <title id="ex-title">Token capture flow</title>
  <desc id="ex-desc">The merchant backend calls Ottu's Tokenization API, which stores the card at the gateway vault and returns a token.</desc>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path class="arrow-head" d="M0,1 L9,5 L0,9 z" />
    </marker>
    <style>
      .node { fill: #FFFFFF; stroke: #D4D4D4; stroke-width: 1.4; }
      .accent { fill: #0B82BE; stroke: #0B82BE; stroke-width: 1.4; }
      .label { fill: #302F37; font: 600 13px 'Poppins', system-ui, sans-serif; }
      .label-white { fill: #FFFFFF; font: 600 13px 'Poppins', system-ui, sans-serif; }
      .sub { fill: #6B6B72; font: 400 11px 'Poppins', system-ui, sans-serif; }
      .sub-white { fill: #FFFFFF; font: 400 11px 'Poppins', system-ui, sans-serif; opacity: 0.9; }
      .arrow { fill: none; stroke: #8B8A90; stroke-width: 1.4; }
      .arrow-head { fill: #8B8A90; }
      .arrow-label { fill: #6B6B72; font: 500 10px 'Poppins', system-ui, sans-serif; }
      .arrow-label-bg { fill: #FFFFFF; }
    </style>
  </defs>

  <rect class="node" x="30" y="75" width="200" height="60" rx="8" />
  <text class="label" x="130" y="110" text-anchor="middle">Merchant Backend</text>

  <rect class="accent" x="290" y="70" width="200" height="70" rx="8" />
  <text class="label-white" x="390" y="100" text-anchor="middle">Tokenization API</text>
  <text class="sub-white" x="390" y="120" text-anchor="middle">Api-Key auth</text>

  <rect class="node" x="550" y="75" width="200" height="60" rx="8" />
  <text class="label" x="650" y="103" text-anchor="middle">Gateway Vault</text>
  <text class="sub" x="650" y="121" text-anchor="middle">PCI-compliant</text>

  <path class="arrow" d="M 230 105 L 290 105" marker-end="url(#arrow)" />
  <path class="arrow" d="M 490 105 L 550 105" marker-end="url(#arrow)" />
  <rect class="arrow-label-bg" x="500" y="93" width="32" height="14" rx="3" />
  <text class="arrow-label" x="516" y="104" text-anchor="middle">store</text>
</svg>
```

Run `scripts/inline-svg.py <file> <slug>` on it, drop the result into a `src/diagrams/<Name>.tsx` module, and render it with `<Diagram>` — one file, theme-aware.
