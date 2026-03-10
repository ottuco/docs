---
description: Generate a Mermaid diagram using Ottu's semantic color system (usage: /mermaid describe the diagram you need)
allowed-tools:
  - Read
  - Edit
  - Write
  - Grep
  - Glob
---

# Generate Mermaid Diagram with Ottu Semantic Colors

Create or update a Mermaid diagram based on: **$ARGUMENTS**

If no arguments are provided, ask the user what diagram they need.

## Semantic Color System

Every diagram must use these semantic color roles consistently. Color communicates **responsibility**, not decoration.

| Role | Hex | Meaning | When to Use |
|------|-----|---------|-------------|
| Blue | `#1983BC` | **Services / APIs / Infrastructure** | Ottu APIs, workers, backends, SDKs, stateless services |
| Orange | `#F57D2D` | **Execution / Core Logic / Flow** | Orchestrators, pipelines, decision points, "where things happen" — **use sparingly (1-3 nodes max)** |
| Red | `#ED2833` | **Security / Risk / Failure** | PCI boundaries, encryption, error paths, alerts — reader should **pause** when they see red |
| Pink | `#F093BC` | **External / UI / Optional** | Merchant frontend, banks, third-party services, anything not under Ottu's control |
| Dark | `#302F37` | **Boundaries / Containers / Domains** | Subgraph backgrounds, domain labels, trust boundaries |
| Light | `#F4F4F4` | **Background / Neutral** | Diagram background — always light, never white or dark |

## Required Theme Config

Every diagram MUST start with this init block:

```
%%{init: {
  "theme": "base",
  "themeVariables": {
    "background": "#F4F4F4",
    "primaryColor": "#1983BC",
    "primaryTextColor": "#302F37",
    "primaryBorderColor": "#302F37",
    "lineColor": "#302F37",
    "secondaryColor": "#F57D2D",
    "tertiaryColor": "#F093BC"
  }
}}%%
```

## Class Definitions

Include only the classes you actually use in the diagram:

```
classDef service fill:#1983BC,color:#FFFFFF,stroke:#302F37
classDef execution fill:#F57D2D,color:#FFFFFF,stroke:#302F37
classDef external fill:#F093BC,color:#302F37,stroke:#302F37
classDef danger fill:#ED2833,color:#FFFFFF,stroke:#302F37
classDef boundary fill:#302F37,color:#FFFFFF,stroke:#302F37
```

## Rules

1. **Blue is the default** — if everything is blue, nothing is special. Only switch to orange to say "this part matters"
2. **Orange must be rare** — 1-3 orange nodes per diagram maximum
3. **Red must feel dangerous** — if red appears, the reader should pause. Never use for normal APIs or UI
4. **Pink is soft** — external, replaceable, not under Ottu's control
5. **Background always light** — `#F4F4F4`, keeps diagrams printable and readable
6. **Line semantics** — dashed for async/optional, thick for critical flow, red for failure paths

## Line Styling

```
linkStyle default stroke:#302F37,stroke-width:1.5px
```

For failure/error paths, use red lines where supported.

## Node Shape Guide

- `([text])` — rounded (people, external actors)
- `[text]` — rectangle (services, APIs)
- `{{text}}` — hexagon (data, tokens, artifacts)
- `{text}` — diamond (decisions)
- `[[text]]` — subroutine (sub-processes)

## Process

1. Read the target file if updating an existing diagram
2. Understand the concept being diagrammed
3. Choose the right diagram type (flowchart, sequence, state, etc.)
4. Assign semantic colors based on each node's **role**, not aesthetics
5. Write the diagram with the theme config, classDefs, and proper styling
6. Place it in the appropriate location in the document
