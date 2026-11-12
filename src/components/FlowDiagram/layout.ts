// Layout numbers shared by the server placeholder and the browser diagram, so
// the page doesn't jump when React Flow takes over. No React Flow import here.
import type { FlowProps, SequenceProps, StoryProps } from "./types";

export const CARD_W = 190;
export const CARD_H = 54;

// Story. The canvas is, top to bottom: a header (title + side chips), the
// journey chips (only with journeys), then the body with the lanes and cards.
// The canvas grows with its content; only the body has a fixed height.
export const STORY_ROW = 80; // one card per row
export const STORY_TOP = 44; // lane heads, above the first card
/** Room around the cards in the body (fit padding + React Flow's badge). */
export const STORY_BODY_PAD = 20;
/** Smallest body a `maxHeight` can ask for: about two rows of cards. */
export const STORY_MIN_BODY_H = 160;
/** Usual height of the title + side chips, and of the journey chips. Only
 * used to size the placeholder before the browser renders the real thing. */
export const STORY_HEADER_H = 92;
export const STORY_JOURNEYS_H = 40;
/** With `controls="side"`: the title alone above, the buttons in a column left of the body. */
export const STORY_TITLE_H = 56;
export const STORY_CONTROLS_W = 168;
export const STORY_CONTROLS_GAP = 16;
const controlsBeside = (p: StoryProps): boolean => p.controls === "side";
/** The panel under a story with journeys, and the gap above it. The panel
 * height is fixed so pinning or walking never moves the page below; longer
 * text scrolls inside it. */
export const STORY_PANEL_H = 128;
export const STORY_PANEL_GAP = 12;

export const hasJourneys = (p: StoryProps): boolean =>
  (p.journeys?.length ?? 0) > 0;
export const storyGap = (lanes: number): number =>
  Math.max(180, Math.floor(660 / Math.max(1, lanes)));
export const storyCardW = (lanes: number): number =>
  Math.min(196, storyGap(lanes) - 20);
/** Widest card with `fillWidth`, and the room it leaves either side in its lane. */
const FILL_CARD_MAX = 240;
const FILL_CARD_MARGIN = 24;
/** Extra room (%) for rounding, so the lanes never overflow the body. */
const FILL_SLACK_PCT = 1;
/**
 * Lane width with `fillWidth`: the body's width shared by the lanes (less the
 * fit padding, `padPct` % each side), never under the usual width.
 */
export const storyFillGap = (
  lanes: number,
  bodyWidth: number,
  padPct: number,
): number =>
  Math.max(
    storyGap(lanes),
    Math.floor(
      (bodyWidth * (1 - (2 * padPct + FILL_SLACK_PCT) / 100)) /
        Math.max(1, lanes),
    ),
  );
export const storyFillCardW = (gap: number): number =>
  Math.min(FILL_CARD_MAX, gap - 2 * FILL_CARD_MARGIN);
/** Height the lanes and cards need. */
export const storyLanesHeight = (p: StoryProps): number =>
  STORY_TOP + p.steps.length * STORY_ROW;
/** Height of the body: all the lanes, or `maxHeight` (then it scrolls). */
export const storyBodyHeight = (p: StoryProps): number => {
  const full = storyLanesHeight(p) + STORY_BODY_PAD;
  if (!p.maxHeight) return full;
  return Math.min(full, Math.max(p.maxHeight, STORY_MIN_BODY_H));
};
/** The whole figure, for the placeholder: header, journey chips, body and
 * the panel under it. */
export const storyFigureHeight = (p: StoryProps): number =>
  (controlsBeside(p) ? STORY_TITLE_H : STORY_HEADER_H) +
  storyBodyHeight(p) +
  (hasJourneys(p) && !controlsBeside(p) ? STORY_JOURNEYS_H : 0) +
  (hasJourneys(p) ? STORY_PANEL_GAP + STORY_PANEL_H : 0);
/**
 * With `controls="side"`, the widest the figure needs to be: the buttons, the
 * gap, and the lanes at full size (plus the fit padding and the canvas
 * padding). Wider, React Flow would centre the lanes in an empty band. With
 * `fillWidth` there is no limit: the lanes widen instead.
 */
export const storyMaxWidth = (p: StoryProps): number | undefined =>
  controlsBeside(p) && !p.fillWidth
    ? Math.round(
        18 +
          STORY_CONTROLS_W +
          STORY_CONTROLS_GAP +
          p.lanes.length * storyGap(p.lanes.length) * 1.06 +
          18,
      )
    : undefined;
export const storyMinWidth = (p: StoryProps): number =>
  Math.round(p.lanes.length * storyGap(p.lanes.length) * 0.95) +
  (controlsBeside(p) ? STORY_CONTROLS_W + STORY_CONTROLS_GAP : 0);

// Sequence
export const SEQ_LANE_GAP = 185;
export const SEQ_ROW = 58;
export const SEQ_TOP = 100;
export const SEQ_LANE_W = 140;
export const sequenceBodyHeight = (p: SequenceProps): number =>
  p.messages.length * SEQ_ROW + SEQ_TOP;
export const sequenceHeight = (p: SequenceProps): number =>
  sequenceBodyHeight(p) + 110;
/** x of an actor's lifeline. */
export const seqCenter = (actor: number): number =>
  actor * SEQ_LANE_GAP + SEQ_LANE_W / 2 - 1;
/** Width of a self-call loop, right of the lifeline. */
export const SEQ_SELF_LOOP = 30;
/** Max width of a self-call label: it wraps to stay clear of the next lifeline. */
export const SEQ_SELF_LABEL_W = SEQ_LANE_GAP - SEQ_SELF_LOOP - 6 - 12;
/** Rough width of a self-call label pill (number badge + text at 11px). */
const pillWidth = (text: string): number =>
  Math.min(SEQ_SELF_LABEL_W, 40 + text.length * 6.5);
/** Right edge of the drawing: the last actor card, or a self-call label past it. */
export const sequenceRight = (p: SequenceProps): number =>
  Math.max(
    0,
    (p.actors.length - 1) * SEQ_LANE_GAP + SEQ_LANE_W,
    ...p.messages
      .filter(([from, to]) => from === to)
      .map(
        ([a, , text]) => seqCenter(a) + 2 + SEQ_SELF_LOOP + 6 + pillWidth(text),
      ),
  );
export const sequenceMinWidth = (p: SequenceProps): number =>
  Math.round(sequenceRight(p) * 0.95);

// Flow
export const flowHeight = (p: FlowProps): number => p.height;
export function flowMinWidth(p: FlowProps): number {
  if (p.cards.length === 0 && (p.groups ?? []).length === 0) return 0;
  const groupX = new Map((p.groups ?? []).map((g) => [g.id, g.x]));
  const xs = p.cards.map(
    (c) => (c.parent ? (groupX.get(c.parent) ?? 0) : 0) + c.x,
  );
  const right = Math.max(
    ...p.cards.map((c, i) => xs[i] + (c.width ?? CARD_W)),
    ...(p.groups ?? []).map((g) => g.x + g.width),
  );
  const left = Math.min(...xs, ...(p.groups ?? []).map((g) => g.x));
  return Math.round((right - left) * 0.95);
}
