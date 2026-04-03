# Writing Standards & Conventions

## Documentation Philosophy
- **Domain-structured** — organized by business domain (Payments, Cards, Webhooks), not by API endpoint
- **Self-contained pages** — every page provides full context, never assume reader has read other pages
- **Progressive disclosure** — start simple, use collapsible sections for advanced content
- **Cross-referenced** — link liberally inline, every mention of a concept should be a hyperlink
- **Code-first for developers** — working example before explanation
- **Feature-benefit for business** — lead with business value, no code, dashboard-focused

## Page Template
1. Overview — what and why
2. Use Cases — when to use
3. Quick Implementation — minimal working example
4. Detailed Guide — step-by-step
5. API Reference — inline or link to auto-generated docs
6. Error Handling — what can go wrong
7. Best Practices — recommendations
8. What's Next? / Related — logical next steps

## Admonitions
- `:::note` — supplementary info
- `:::tip` — best practices
- `:::warning` — gotchas, common mistakes
- `:::danger` — security risks, data loss

## Code Examples
- Must be copy-paste ready, runnable against sandbox
- Multi-language tabs: cURL, Python, Node.js, PHP (use `<Tabs groupId="language">`)
- Include auth header in every example

## Mermaid Diagrams
- Monochrome + one accent (#1983BC for key Ottu nodes)
- Default nodes: #FAFAFA fill, #BFBFBF border
- Max 1-2 colored nodes per diagram, rest neutral

## TypeScript
- Strict mode enabled
- TSConfig enforced
