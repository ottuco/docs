// React Flow ids of a story's nodes and edges, in one place. The focus CSS
// finds them through the `data-id` attribute React Flow puts on each one.

/** Card of step `n` (1-based). */
export const stepId = (n: number): string => `s-${n}`;

/** Column of lane `i` (0-based). */
export const laneId = (i: number): string => `lane-${i}`;

/** Arrow for link `i` (index in `links`, so two links between the same
 * steps stay distinct). */
export const linkId = (i: number): string => `l-${i}`;

/** Step number of a card id, or null when the id is not a card. */
export const stepOf = (id: string): number | null =>
  id.startsWith("s-") ? Number(id.slice(2)) : null;
