// Data shapes for the three React Flow diagram kinds. Kept free of any
// @xyflow/react import so the server build (which never loads React Flow) can
// use them to size the placeholder box and write the screen-reader text.

/** Card colour. Leave it unset for almost every card: grey is the default. */
export type Tone = "accent" | "info" | "success" | "danger";

/** Which side of a card an arrow leaves from or arrives at. */
export type Side = "top" | "right" | "bottom" | "left";

/** Arrow style: `request` = orange, `reply` = blue, `plain` = still grey. Request and reply arrows flow unless the diagram sets `animate={false}`. */
export type EdgeKind = "request" | "reply" | "plain";

// ---------- Story (swimlane) ----------

export type StoryLane = {
  title: string;
  /** Material Design icon path from `@mdi/js`. */
  icon: string;
  /** Short label for the "show one side" chip, e.g. "Your part". */
  chip: string;
  /** Text for the side panel. Only shown when the story has journeys. */
  about?: { does: string; relies: string };
};

export type StoryStep = {
  /** Index into `lanes` (0-based). */
  lane: number;
  title: string;
  sub?: string;
  icon: string;
  tone?: Tone;
  /** Text for the side panel when the step is clicked. */
  detail?: string;
};

/** [from step, to step, label?, kind?]. Steps are 1-based, like the numbers on the cards. */
export type StoryLink = [number, number, string?, EdgeKind?];

export type StoryJourney = {
  name: string;
  stops: { step: number; text: string }[];
};

export type StoryProps = {
  title: string;
  sub?: string;
  lanes: StoryLane[];
  steps: StoryStep[];
  links: StoryLink[];
  journeys?: StoryJourney[];
  /** Height (px) of the lanes-and-cards area, at most: a longer story scrolls
   * inside it while the title, chips and panel stay in view. At least 160
   * (two rows). Leave unset to show the whole story. */
  maxHeight?: number;
  /** Request and reply arrows flow (moving dashes). Set false for a still diagram. Default true. */
  animate?: boolean;
  /**
   * Where the side and journey buttons go: "top" (default), in rows above the
   * lanes; "side", in a column left of the lanes, the journeys under a
   * separator, so a wide page has no empty band beside the lanes.
   */
  controls?: "top" | "side";
};

// ---------- Sequence ----------

export type SequenceActor = { title: string; icon?: string; tone?: Tone };

/** [from actor, to actor, label, kind?]. Actors are 0-based. Default kind is `request`. */
export type SequenceMessage = [number, number, string, EdgeKind?];

export type SequenceProps = {
  title: string;
  sub?: string;
  actors: SequenceActor[];
  messages: SequenceMessage[];
  /** Request and reply arrows flow (moving dashes). Set false for a still diagram. Default true. */
  animate?: boolean;
};

// ---------- Flow (free layout) ----------

export type FlowCard = {
  id: string;
  /** Top-left corner. Relative to the group when `parent` is set. */
  x: number;
  y: number;
  title: string;
  sub?: string;
  icon?: string;
  tone?: Tone;
  /** Card width in px. Default 190. */
  width?: number;
  /** Id of a FlowGroup this card sits inside. */
  parent?: string;
};

/** A dashed box with a small caps label, drawn behind the cards it holds. */
export type FlowGroup = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

export type FlowArrow = {
  from: string;
  to: string;
  /** Leave unset to pick the side facing the other card. */
  fromSide?: Side;
  toSide?: Side;
  /** Number shown in the pill, for "read in this order" diagrams. */
  step?: number;
  label?: string;
  kind?: EdgeKind;
  /** Nudge the label (px) when it sits on top of a card. */
  dx?: number;
  dy?: number;
  /** Straight line instead of the rounded elbow. */
  straight?: boolean;
};

export type FlowProps = {
  title: string;
  sub?: string;
  cards: FlowCard[];
  groups?: FlowGroup[];
  arrows: FlowArrow[];
  /** Canvas height in px, title included. */
  height: number;
  /** Request and reply arrows flow (moving dashes). Set false for a still diagram. Default true. */
  animate?: boolean;
};
