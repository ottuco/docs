# React Flow general reference (vendored)

These files are copied unchanged from [framara/react-flow-skill](https://github.com/framara/react-flow-skill)
(commit `b060a63`, 2026-09-28, MIT, see `LICENSE`). They cover `@xyflow/react` v12 in general, not
the Ottu docs. Read them only when you go past what `src/components/FlowDiagram/` already does,
for example a new node type, a new edge shape, or an auto-layout.

| File | Read it when |
|---|---|
| `fundamentals.md` | nodes, edges, viewport basics |
| `custom-nodes.md` | adding a node type next to `CardNode` |
| `custom-edges.md` | adding an edge type next to `StepEdge`, markers, labels |
| `layouting.md` | positions by dagre/elkjs instead of hand-placed x/y, sub-flows |
| `performance-and-styling.md` | CSS variables, theming, memoization |
| `accessibility.md` | keyboard and screen-reader behaviour |
| `ssr-and-hydration.md` | why our diagrams render in `BrowserOnly` and how SSR could work |
| `troubleshooting.md` | blank canvas, missing edges, warnings |

To refresh: copy the same files again from the upstream repo and update the commit above.
