// How each story arrow is drawn, so it never runs through a card.
//
// Every row holds exactly one card, so an arrow only has to avoid the cards
// in the lane it runs down. That gives four shapes:
//
//   down    same lane, nothing in between      bottom of one card → top of the next
//   across  other lane, nothing in the way     side of the card → top of the target
//   loop    same lane, going back up or        round the right side of the cards
//           skipping cards (a retry, a jump)
//   elbow   other lane, going up or with       into the side of the target, the
//           cards above the target             vertical part in the gap between lanes
//
// `margin` is the space between a card and its lane border, so the gap
// between two lanes' cards is 2 × margin wide. It has three tracks, so arrows
// sharing a gap never draw on top of each other:
//
//   border − margin/2   loops of the lane on the left
//   border              elbows going right
//   border + margin/2   elbows going left
import { STORY_ROW } from "./layout";
import { sourceHandle, targetHandle, type StepData } from "./parts";
import type { StoryStep } from "./types";

export type Route = {
  sourceHandle: string;
  targetHandle: string;
  /** Extra StepEdge data for this shape (loop, elbow position, label place). */
  data: Partial<StepData>;
};

export function routeLink(
  steps: StoryStep[],
  from: number,
  to: number,
  gap: number,
  cardW: number,
): Route {
  const fromLane = steps[from - 1].lane;
  const toLane = steps[to - 1].lane;
  const margin = (gap - cardW) / 2;

  const goingUp = to < from;
  const [top, bottom] = goingUp ? [to, from] : [from, to];
  const cardsInTheWay = steps
    .slice(top, bottom - 1) // the steps strictly between the two
    .some((s) => s.lane === toLane);
  const needsDetour = goingUp || cardsInTheWay;

  // down
  if (fromLane === toLane && !needsDetour) {
    return {
      sourceHandle: sourceHandle("bottom"),
      targetHandle: targetHandle("top"),
      data: {},
    };
  }

  const goingRight = toLane > fromLane;

  // across
  if (!needsDetour) {
    return {
      sourceHandle: sourceHandle(goingRight ? "right" : "left"),
      targetHandle: targetHandle("top"),
      data: {},
    };
  }

  // loop: the label sits left of the loop line, in the band between rows.
  if (fromLane === toLane) {
    return {
      sourceHandle: sourceHandle("right"),
      targetHandle: targetHandle("right"),
      data: {
        loop: true,
        offset: margin / 2,
        labelAlign: "end",
        rowGap: STORY_ROW,
      },
    };
  }

  // elbow: a small offset keeps both bends inside the gap, so the vertical
  // part really runs on its track. Labels of right- and left-going elbows
  // sit on opposite sides and bands, so they never overlap.
  const border = goingRight ? toLane * gap : (toLane + 1) * gap;
  return {
    sourceHandle: sourceHandle(goingRight ? "right" : "left"),
    targetHandle: targetHandle(goingRight ? "left" : "right"),
    data: {
      centerX: goingRight ? border : border + margin / 2,
      offset: Math.max(2, margin / 2 - 1),
      rowGap: STORY_ROW,
      labelAlign: goingRight ? "start" : "end",
      labelBand: goingRight ? "upper" : "lower",
    },
  };
}
