# Design tokens

The diagram look comes from the Ottu design system. The values live in
**one place**:
`src/components/FlowDiagram/styles.module.css`, as `--o-*` CSS variables on
`.canvas`, with a `html[data-theme="dark"]` block for dark mode.

A diagram file never sets a colour, a font or a size. It picks a `tone` or an
edge `kind`, and the component maps that to a token. To change the look of
every diagram, change the variable.

## Colours

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--o-bg` | `#FFFFFF` (Background) | `#1E1E22` | card fill, label pills |
| `--o-page` | `#FAFAFA` (Page Background) | `#141417` | canvas background |
| `--o-text` | `#1A1A1A` (Basic Text) | `#F2F2F2` | card titles |
| `--o-text-2` | `#4A4A4A` (Secondary Text) | `#B8B8B8` | card subtitles, lane heads, edge labels |
| `--o-border` | `#DADADA` (Border) | `#3A3A40` | card and canvas borders, lifelines, lane lines |
| `--o-primary` | `#F77D1A` (Primary) | `#F77D1A` | `accent` cards, `request` arrows, step numbers, chips on hover |
| `--o-blue` | `#0B82BE` | `#4FB3E6` | `info` cards, `reply` arrows (dashed) |
| `--o-success` | `#007E33` (Success) | `#3CCF7A` | `success` cards |
| `--o-error` | `#B00020` (Error) | `#FF5C74` | `danger` cards |
| `--o-edge` | `#9A9A9A` | `#6F6F78` | `plain` arrows |
| `--o-dot` | `#E4E4E4` | `#2A2A30` | dotted background (Flow only) |

The design system's purple Accent (`#8E44AD`) and grey Secondary Button
(`#D2D2D2`) are not used in diagrams.

## The colour rule

**Almost everything is grey. Colour is a spotlight.**

| Tone | Meaning | Budget per diagram |
|---|---|---|
| none (default) | actors, supporting steps, data stores | the rest |
| `accent` | the Ottu piece the diagram is about | **1–2 cards** (a long story can have up to 3) |
| `info` | a result coming back: webhook, callback | 1–2 cards |
| `success` | the happy end state: approved, paid, active | 1–2 cards |
| `danger` | real risk or failure only: PCI boundary, declined, past due | **0–1 card** |

Arrows:

| Kind | Look | Meaning |
|---|---|---|
| `request` (default) | orange, flowing dashes (solid when still) | something is asked or sent forward |
| `reply` | blue, flowing dashes (dashed when still) | a result coming back |
| `plain` | solid grey, still | a supporting link the reader can skip |

Request and reply arrows flow: the dashes move from source to target, so the
reader sees the direction without reading the arrowhead. For readers with
"reduce motion" turned on (and with `animate={false}`) nothing moves: requests
are solid and replies dashed, so the two differ without relying on colour. Pass `animate={false}` to a diagram to
make every arrow still (for example a page with several diagrams in a row).

## Type

Poppins everywhere (inherited from the site). Sizes inside the canvas are
smaller than the page text because the canvas is a figure:

| Element | Size / weight |
|---|---|
| Diagram title | 13px / 600 |
| Diagram subtitle | 11px / 400 |
| Card title | 13px / 600 (12px in a story) |
| Card subtitle | 11px / 400 (10.5px in a story) |
| Lane head | 11–12px / 600, upper case |
| Edge label | 11px / 400 |

## Spacing and shape

From the design system scale (4 / 8 / 12 / 16 / 24 / 32): card padding
10×12 (6×10 in a story), icon gap 8–10, chips gap 8, canvas radius 12, card
radius 10 (8 in a story), icon box radius 8.

## Breakpoints

The canvas has a `minWidth` (95% of the laid-out width). Below that, at phone
width (320px+), the reader scrolls sideways inside the figure instead of the
whole diagram shrinking to unreadable text. The side panel of a story sits
under the diagram and sticks to the bottom of the screen while the story is
in view.
