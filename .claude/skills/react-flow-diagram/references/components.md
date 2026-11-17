# FlowDiagram components

Everything is in `src/components/FlowDiagram/`:

| File | What it holds |
|---|---|
| `index.tsx` | the three public components. Cleans bad references once; server build = same-height placeholder + hidden text version; browser = React Flow. |
| `types.ts` | the props for each diagram kind (no React Flow import) |
| `layout.ts` | row heights, gaps, canvas heights and min widths (shared by server and browser) |
| `parts.tsx` | `CardNode`, `GroupNode`, `StepEdge`, `Title`, `edgeLook()`, `readOnlyFlow` |
| `Story.tsx`, `Sequence.tsx`, `Flow.tsx` | the three diagram kinds |
| `storyRoutes.ts` | how a story arrow is drawn (down / across / loop / elbow) so it never crosses a card |
| `storyFocus.ts` | what a story lights up on hover, pin or journey, and the CSS for it |
| `storyIds.ts` | the ids of a story's cards, lanes and arrows |
| `StoryPanel.tsx` | the panel under a story with journeys |
| `styles.module.css` | tokens + all styling, light and dark |

Import only from the index:

```tsx
import {StoryDiagram, SequenceDiagram, FlowDiagram} from "@site/src/components/FlowDiagram";
import type {StoryLane, StoryStep, StoryLink, StoryJourney} from "@site/src/components/FlowDiagram";
```

Icons are `@mdi/js` paths (`mdiServer`, `mdiAccount`, `mdiShieldCheckOutline`,
`mdiBankTransfer`, `mdiWebhook`, `mdiCreditCardOutline`, ...). Search names at
https://pictogrammers.com/library/mdi/.

## StoryDiagram

```ts
<StoryDiagram
  title="How AutoPay works"
  sub="Read top to bottom · hover a box or a part below to focus on it"
  lanes={lanes}       // StoryLane[]: {title, icon, chip, about?: {does, relies}}
  steps={steps}       // StoryStep[]: {lane, title, sub?, icon, tone?, detail?}
  links={links}       // StoryLink[]: [fromStep, toStep, label?, kind?]  (steps are 1-based)
  journeys={journeys} // optional StoryJourney[]: {name, stops: [{step, text}]}
  maxHeight={500}     // optional: lanes area at most this tall (px); a longer story scrolls
  controls="side"     // optional: side and journey buttons in a column left of the lanes
/>
```

- Steps are drawn one per row, in array order, so the array order **is** the
  time order. Step numbers on the cards are `index + 1`.
- Each lane is one actor. 3–4 lanes fit; 5 is the most.
- Long story (10+ steps) on a page with a lot around it: set `maxHeight` to
  cap the lanes-and-cards area (at least 160px); it scrolls while the title,
  chips and panel stay in view, and walking a journey scrolls to the current
  card. Leave it unset (the default) to show the whole story.
- `controls="side"` puts the side buttons, a separator and the journey
  buttons in a column on the left, and the figure is only as wide as the
  buttons plus the lanes (no empty band beside the lanes on a wide page).
  Below 996px it falls back to the buttons above the lanes. AutoPay uses it;
  the default stays `"top"`.
- A link between two steps in the same lane goes bottom → top; across lanes
  it leaves from the side facing the target.
- Interaction you get for free: hover/tap a lane chip to show that actor's
  part, hover a card to light up its links.
- Card text: a story card shows its title on up to 2 lines and `sub` on 1
  line (cut with … beyond that; the full text is in the tooltip and the
  panel). With 4 lanes keep `title` under ~30 characters and `sub` under ~18;
  put the rest in `detail`. A story without journeys has no panel, so there
  the limits are firm.
- Links: a link back up the same lane (a retry), or one that would cross
  cards in its lane, loops round the right side in the gap beside the cards;
  a link into a lane with cards above the target enters from the side. Keep
  link labels short on these (they sit in the band between two rows). A step linked to itself, or a link to a
  missing step, is skipped (Sequence and Flow drop bad actor / card refs too).
- Readers hover a chip or card to preview it, click / tap / Enter to pin it,
  click empty canvas or press Escape to see the whole story again.
- With `journeys`, a side panel appears: click a lane chip or a card to read
  `about` / `detail`, or pick a journey and step through it with ◀ n/m ▶.
  Without `journeys`, `about` and `detail` are not shown.

## SequenceDiagram

```ts
<SequenceDiagram
  title="A card payment, step by step"
  sub="Orange = request · blue = reply"
  actors={actors}     // SequenceActor[]: {title, icon?, tone?}
  messages={messages} // SequenceMessage[]: [fromActor, toActor, label, kind?] (actors are 0-based)
                      // fromActor === toActor draws a self-call loop (e.g. Ottu picks the gateway)
/>
```

- One row per message, numbered. Default kind is `request`; use `reply` for
  anything coming back.
- 3–5 actors, up to ~12 messages. Longer = split into two diagrams.

## FlowDiagram

```ts
<FlowDiagram
  title="Ottu platform"
  sub="How a payment moves through Ottu"
  groups={groups} // optional FlowGroup[]: {id, x, y, width, height, label}
  cards={cards}   // FlowCard[]: {id, x, y, title, sub?, icon?, tone?, width?, parent?}
  arrows={arrows} // FlowArrow[]: {from, to, fromSide?, toSide?, step?, label?, kind?, dx?, dy?, straight?}
  height={600}    // canvas height in px, title included
/>
```

- `x`/`y` is the top-left of the card. A card with `parent` is placed relative
  to its group's top-left.
- Default card is 190×54. Leave ~50px between cards horizontally and ~70px
  vertically so labels have room. Lay out on a grid: columns at x = 0, 240, 480.
- Without `fromSide`/`toSide`, the arrow uses the sides facing each other.
  Set them when an arrow would cross a card.
- A label sitting on a card: nudge it with `dx`/`dy`.

## Adding something new

Prefer data over code: most needs are a new diagram file. If you really need a
new node or edge type, add it in `parts.tsx` (register it in `nodeTypes` /
`edgeTypes`, which must stay module-level constants), style it in
`styles.module.css` with `--o-*` tokens only, and read
`references/react-flow/custom-nodes.md` or `custom-edges.md` first.

Rules from React Flow that this code already follows and you must keep:

- `nodeTypes` / `edgeTypes` defined outside components.
- Handles hidden with `opacity: 0`, never `display: none`.
- Each handle on a node has a unique `id` (`s-top`, `t-left`, ...).
- `@xyflow/react/dist/style.css` imported in each diagram kind.
- The canvas has a real height (from `layout.ts`).
- Focus/dimming is done with a scoped `<style>` block, not by rebuilding
  nodes/edges on hover (that loops React Flow's hover events).
