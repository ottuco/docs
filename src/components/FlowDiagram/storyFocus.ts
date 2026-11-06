// What a story lights up, and the CSS that does it.
//
// Focus is drawn with a scoped <style> block (dim everything, re-light a few
// things) instead of rebuilding nodes and edges: rebuilding them on hover
// makes React Flow re-measure and re-fire hover events in a loop.
import { laneId, linkId, stepId } from "./storyIds";
import type { StoryLink, StoryStep } from "./types";

/** What the reader clicked: one side, one step or one journey (or nothing). */
export type Pin = { kind: "lane" | "step" | "journey"; i: number } | null;

/** What the mouse (or keyboard focus) is on: a side chip or a card. */
export type Hover = { kind: "lane" | "step"; i: number } | null;

/** Everything focusCss needs, by name. */
export type Focus = {
  /** id of the element the CSS is scoped to. */
  scope: string;
  hover: Hover;
  pin: Pin;
  /** Steps of the pinned journey walked so far. */
  walked: number[];
  laneCount: number;
  steps: StoryStep[];
  links: StoryLink[];
};

type Lit = {
  steps: number[];
  /** Indexes into `links`. */
  links: number[];
  /** null = every lane. */
  lanes: number[] | null;
};

// A hover preview wins over the pin, so the reader can look around without
// losing what they picked.
function whatIsLit({ hover, pin, walked, steps, links }: Focus): Lit | null {
  const linkIndexes = (keep: (l: StoryLink) => boolean) =>
    links.flatMap((l, i) => (keep(l) ? [i] : []));

  const oneLane = (lane: number): Lit => ({
    steps: steps.flatMap((s, i) => (s.lane === lane ? [i + 1] : [])),
    links: linkIndexes(
      ([a, b]) => steps[a - 1].lane === lane || steps[b - 1].lane === lane,
    ),
    lanes: [lane],
  });

  const oneStep = (step: number): Lit => {
    const touching = linkIndexes(([a, b]) => a === step || b === step);
    return {
      steps: [step, ...touching.flatMap((i) => [links[i][0], links[i][1]])],
      links: touching,
      lanes: null,
    };
  };

  const look = hover ?? pin;
  if (!look) return null;
  if (look.kind === "lane") return oneLane(look.i);
  if (look.kind === "step") return oneStep(look.i);
  return {
    steps: walked,
    links: linkIndexes(([a, b]) => walked.includes(a) && walked.includes(b)),
    lanes: null,
  };
}

/** CSS for what the reader is looking at, scoped to the element `#scope`. */
export function focusCss(focus: Focus): string {
  const { scope, pin, walked, laneCount } = focus;
  const lit = whatIsLit(focus);
  if (!lit) return "";

  const s = `#${scope}`;
  const lanes = lit.lanes ?? [...Array(laneCount).keys()];
  const relit = [
    ...lit.steps.map((n) => `${s} [data-id="${stepId(n)}"]`),
    // The arrow, and its label (drawn in a separate layer).
    ...lit.links.map(
      (i) => `${s} [data-id="${linkId(i)}"], ${s} [data-edge="${linkId(i)}"]`,
    ),
    ...lanes.map((i) => `${s} [data-id="${laneId(i)}"]`),
  ];

  // Outline the journey's current stop, or the pinned step, but only when it
  // is lit: never an outline on a faded card.
  const current =
    pin?.kind === "journey"
      ? walked[walked.length - 1]
      : pin?.kind === "step"
        ? pin.i
        : null;
  const outline =
    current !== null && lit.steps.includes(current)
      ? `${s} [data-id="${stepId(current)}"] > div { outline: 2px solid var(--o-primary); outline-offset: 2px; }`
      : "";

  return [
    // Cards and edge labels keep 0.75 so their text stays AA-readable in both themes; only the lines fade harder.
    `${s} .react-flow__node, ${s} [data-edge] { opacity: 0.75; }`,
    `${s} .react-flow__edge { opacity: 0.3; }`,
    `${relit.join(",\n")} { opacity: 1; }`,
    outline,
  ].join("\n");
}
