// Pages this rework removed, and where they live now. One source for:
// - the redirect docs (docs/developers/**, each `<MovedTo from="…" />`),
// - docusaurus.config.ts, which keeps these routes out of the search index
//   and the MCP server,
// - scripts/md-export.ts drops their Markdown copy (they are `unlisted`), so
//   scripts/llms-txt.ts does not list them either.
// No React here: docusaurus.config.ts imports this file.

export type Moved = {
  /** The page the route moved to. */
  to: string;
  /** Anchor to land on when the old URL has no hash, or one the new page lacks. */
  defaultHash?: string;
  /** Old anchors that were renamed (without "#"). An old hash not listed is kept. */
  renames?: Record<string, string>;
  /** Old anchors other pages link to that keep their name on the new page.
   * Registered for Docusaurus' broken-anchor check (any other kept hash
   * works too; HashAlias falls back to `defaultHash` when it is missing). */
  keep?: string[];
  /** Text of the visible link (for readers without JavaScript, and crawlers). */
  label: string;
};

export const MOVED: Record<string, Moved> = {
  "/developers/webhooks/event-catalogue/": {
    to: "/developers/webhooks/",
    defaultHash: "api-reference",
    renames: { "quick-implementation": "step-by-step", examples: "api-reference", workflow: "workflow" },
    keep: [
      "catalogue",
      "envelope",
      "data-keys",
      "subscription-events",
      "actor",
      "is-sandbox",
      "ordering",
      "event-data-connector-params",
      "event-data-connector-responses",
    ],
    label: "Webhooks: API Reference (events)",
  },
  "/developers/webhooks/delivery-and-retries/": {
    to: "/developers/webhooks/",
    defaultHash: "delivery-and-retries",
    renames: {
      "quick-implementation": "drop-duplicates",
      "same-url": "where-events-go",
      "the-delivery-flow": "workflow",
      responses: "success-rules",
    },
    keep: ["retry-schedule", "idempotency-key", "failure-email", "webhook-endpoints", "success-rules"],
    label: "Webhooks: Delivery and retries",
  },
  "/developers/webhooks/troubleshooting/": {
    to: "/developers/webhooks/",
    defaultHash: "troubleshooting",
    renames: { "signature-causes": "signature-mismatch" },
    keep: ["never-received", "signature-mismatch"],
    label: "Webhooks: Troubleshooting",
  },
  "/developers/webhooks/setup/": {
    to: "/developers/webhooks/",
    defaultHash: "admin-setup",
    label: "Webhooks: Admin setup",
  },
  "/developers/webhooks/quickstart/": {
    to: "/developers/webhooks/",
    defaultHash: "step-by-step",
    label: "Webhooks: Step-by-Step",
  },
  "/developers/operations/legacy/": {
    to: "/developers/operations/",
    label: "Operations (v2)",
  },
  "/developers/payments/psq/legacy/": {
    to: "/developers/payments/psq/",
    label: "Payment Status Query (v2)",
  },
};

/** The moved routes as regular expressions, trailing slash optional. */
export const MOVED_ROUTE_PATTERNS: RegExp[] = Object.keys(MOVED).map(
  (route) => new RegExp(`^/?${route.replace(/^\//, "").replace(/\/$/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?$`),
);

/** Session key the redirect leaves for HashAlias: the anchor to use when the kept one is missing. */
export const MOVED_FALLBACK_KEY = "ottu-moved-fallback";
