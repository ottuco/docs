---
name: react-flow-diagram
description: >-
  Create or update an interactive React Flow diagram for the Ottu docs in the
  Ottu design system: a story (swimlane) diagram that walks through a flow
  actor by actor, a sequence diagram of calls between actors, or a free-layout
  architecture view. Use it whenever the user asks for an interactive diagram,
  a React Flow / xyflow diagram, a "story" or "journey" diagram, a swimlane, a
  diagram the reader can hover, click or step through, or wants to convert a
  static diagram on a docs page into an interactive one. For a static picture
  use the svg-diagram skill; Mermaid is a fallback only.
---

# Ottu React Flow diagram

Build docs diagrams with **React Flow** (`@xyflow/react` v12) through the
shared components in `src/components/FlowDiagram/`. A diagram is a small data
file in `src/diagrams/flow/<Name>.tsx`: lanes, steps, cards and arrows. The
component draws it in the Ottu design system, in light and dark mode, readable
at phone width, with no styling in the diagram file.

Live reference of all three kinds: `/diagrams/react-flow/` (source
`src/pages/diagrams/react-flow.mdx`).

## React Flow, SVG or Mermaid?

| Pick | When |
|---|---|
| **React Flow (this skill)** | The reader should explore: focus one actor, click a step to read more, walk a journey one step at a time. Flows with 6+ steps across 3–4 actors. "How it works" sections on feature pages. |
| **SVG** (`svg-diagram` skill) | A static picture is enough: a small architecture or data flow, something that must look identical in print, the MCP export, or the page's `.md` source. |
| **Mermaid** | Only a quick draft, or a page you're not allowed to restyle. Being phased out. |

When unsure, ask: "will the reader click on it?" If not, use SVG.

## Workflow

### 1. Understand the flow before drawing it

Read the page the diagram goes on. Pin down:

- **The actors** (the lanes). Respect the payment roles in the repo
  `CLAUDE.md`: the merchant calls APIs, the customer only touches the
  checkout UI, Ottu sits between merchant and gateway. **Never draw a
  microservice (AutoPay, Wallet, ...) as its own actor** — it's Ottu.
- **The steps in time order**, each as "who does what" in 2–5 plain words
  (`Creates the subscription`, not `POST /b/checkout/v1/pymt-txn/`). Put the
  API name in `sub`.
- **The ONE thing to notice**: the 1–2 Ottu steps that become `accent`.
- **What to leave out**: status codes, retries, field names go in `detail`
  or in the prose beside the diagram.

### 2. Pick the kind

- **Story** — default for "how it works". One lane per actor, top to bottom.
- **Sequence** — when the order of calls is the point (auth handshakes,
  webhook/redirect timing).
- **Flow** — architecture: groups (e.g. "OTTU PLATFORM") with cards inside.

### 3. Write the data file

Create `src/diagrams/flow/<Name>.tsx`. Start from the closest reference file
and change only the data:

| Kind | Copy from |
|---|---|
| Story | `src/diagrams/flow/CardPaymentStory.tsx` |
| Sequence | `src/diagrams/flow/CardPaymentSequence.tsx` |
| Flow | `src/diagrams/flow/PlatformFlow.tsx` |

Props and layout rules: [`references/components.md`](references/components.md).
Colour rules: [`references/design-tokens.md`](references/design-tokens.md) —
read it before choosing any `tone` or arrow `kind`.

Rules for the data:

- **Tones are a budget**: 1–2 `accent` (3 in a long story), 1–2 `info`, 1–2 `success`, 0–1
  `danger`. Everything else has no tone.
- **Arrows**: `request` (default, orange) for things going forward, `reply`
  (blue) for results coming back, `plain` (still grey) for a link the reader
  can skip. Request and reply arrows flow (moving dashes) by default; pass
  `animate={false}` for a still diagram.
- **Titles**: `title` names the flow ("How AutoPay works"); `sub` says how to
  read it ("Read top to bottom · click a step").
- **Text is plain English**, sentence case, no marketing words, 2–5 words per
  card title, ≤ 5 words per `sub`. `detail` and journey `text` are one or two
  full sentences.
- Never set colours, fonts, sizes or `style` in a diagram file. If the look
  needs to change, change the tokens in `styles.module.css` for every diagram.

### 4. Put it on the page

The page must be `.mdx`:

```mdx
import AutoPayStory from "@site/src/diagrams/flow/AutoPayStory";

<AutoPayStory />
```

The component already renders a same-height placeholder on the server and a
hidden text version (steps as a list) for search, the MCP server and screen
readers, so the page needs no `<BrowserOnly>` of its own.

### 5. Check it

1. `npm run typecheck`
2. With the dev server running (`npx docusaurus start --port 3000`), open the
   page and check:
   - every card and label is visible, no label sits on a card (nudge with
     `dx`/`dy` in a Flow), no arrow crosses a card;
   - light **and** dark mode (toggle in the navbar);
   - phone width (~400px): text stays readable, the figure scrolls sideways;
   - hover a chip and a card; for stories with journeys, click a card and
     walk each journey to the end.
3. `npm run build` passes (catches SSR problems).

## If you need more than the components do

Adding a node type, an edge type or auto-layout: read
[`references/components.md`](references/components.md) § "Adding something
new", then the general React Flow guidance in
[`references/react-flow/`](references/react-flow/README.md) (vendored from
framara/react-flow-skill, MIT). Keep the rules there: stable `nodeTypes` /
`edgeTypes`, handles hidden with opacity, unique handle ids, sized canvas,
new objects on every update.

## Reference files

- [`references/components.md`](references/components.md) — props of `StoryDiagram`, `SequenceDiagram`, `FlowDiagram`; layout rules; extending.
- [`references/design-tokens.md`](references/design-tokens.md) — colours (light + dark), tone and arrow budgets, type, spacing, phone behaviour. **The colour source of truth.**
- [`references/react-flow/`](references/react-flow/README.md) — general `@xyflow/react` v12 reference.
- [`evals/evals.json`](evals/evals.json) — test prompts for the skill.
