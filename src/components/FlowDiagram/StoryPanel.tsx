// The panel under a story diagram: describes the pinned actor or step, or
// walks a journey one stop at a time. Only shown when the story has journeys.
import React from "react";
import Icon from "@mdi/react";
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";
import type { StoryJourney, StoryLane, StoryStep } from "./types";
import styles from "./styles.module.css";

type Props = {
  lanes: StoryLane[];
  steps: StoryStep[];
  journey: StoryJourney | null;
  /** Current stop in the journey (0-based). */
  stop: number;
  pinnedLane: number | null;
  pinnedStep: number | null;
  onStop: (stop: number) => void;
  onEscape: () => void;
  id?: string;
};

export default function StoryPanel(p: Props): React.JSX.Element {
  const step = p.pinnedStep !== null ? p.steps[p.pinnedStep - 1] : null;
  const actor = p.pinnedLane !== null ? p.lanes[p.pinnedLane] : null;

  let text: React.ReactNode;
  if (p.journey) {
    const stop = p.journey.stops[p.stop];
    const at = p.steps[stop.step - 1];
    // Name the actor too: in a scrolled story the lane heads may be out of view.
    text = (
      <>
        <div className={styles.panelEyebrow}>
          {p.journey.name} · {p.lanes[at.lane].title}
        </div>
        <h4>{at.title}</h4>
        <p>{stop.text}</p>
      </>
    );
  } else if (step) {
    // The card cuts a long sub-line; the panel shows it whole.
    text = (
      <>
        <div className={styles.panelEyebrow}>{p.lanes[step.lane].title}</div>
        <h4>{step.title}</h4>
        {step.sub ? <div className={styles.panelSub}>{step.sub}</div> : null}
        {step.detail ? <p>{step.detail}</p> : null}
      </>
    );
  } else if (actor) {
    text = (
      <>
        <div className={styles.panelEyebrow}>{actor.title}</div>
        {actor.about?.does ? <p>{actor.about.does}</p> : null}
        {actor.about?.relies ? (
          <p>
            <strong>Relies on:</strong> {actor.about.relies}
          </p>
        ) : null}
      </>
    );
  } else {
    text = (
      <p>
        Click a side or a step to read about it, or pick a journey to walk it
        one step at a time.
      </p>
    );
  }

  return (
    <aside
      id={p.id}
      className={styles.panel}
      onKeyDown={(e) => e.key === "Escape" && p.onEscape()}
    >
      {/* Only the text is a live region: a screen reader reads the new step,
          not the buttons and the counter as well. */}
      <div aria-live="polite" aria-atomic="true">
        {text}
      </div>
      {p.journey ? (
        <Player
          stop={p.stop}
          count={p.journey.stops.length}
          onStop={p.onStop}
        />
      ) : null}
    </aside>
  );
}

// ◀ n / m ▶. aria-disabled, not disabled: a disabled button drops keyboard
// focus to <body> at the first and last stop.
function Player({
  stop,
  count,
  onStop,
}: {
  stop: number;
  count: number;
  onStop: (stop: number) => void;
}): React.JSX.Element {
  const first = stop === 0;
  const last = stop === count - 1;
  return (
    <div className={styles.player}>
      <button
        type="button"
        aria-label="Previous step"
        aria-disabled={first}
        onClick={() => !first && onStop(stop - 1)}
      >
        <Icon path={mdiChevronLeft} size={0.8} />
      </button>
      <span>
        {stop + 1} / {count}
      </span>
      <button
        type="button"
        aria-label="Next step"
        aria-disabled={last}
        onClick={() => !last && onStop(stop + 1)}
      >
        <Icon path={mdiChevronRight} size={0.8} />
      </button>
    </div>
  );
}
