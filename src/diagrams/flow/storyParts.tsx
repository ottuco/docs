// Shared pieces for our story diagrams placed in `<Beside>`: the diagram's
// buttons in the text column, the diagram alone in the `<Visual>` column.
//
//   <Beside wideVisual>
//   …text…
//   <WebhookDeliveryControls />
//   <Visual><WebhookDeliveryStory /></Visual>
//   </Beside>
//
// FlowDiagram has no prop to render its buttons elsewhere or to control them
// from outside, and it is not ours to change. So:
// - StoryFrame mounts the real StoryDiagram (client-only, see below), hides
//   its two button groups by their stable `role="group"` + `aria-label`, and
//   scales it down to its column with CSS `zoom` when the lanes are wider
//   than the column (never under MIN_ZOOM: below that it keeps its own
//   sideways scroll, as on phones).
// - StoryControls renders our own buttons. A click is passed to the hidden
//   button with the same label (`.click()`, so the diagram's own state and
//   logic run unchanged), hover and focus are passed as mouseover/mouseout,
//   and a MutationObserver mirrors each hidden button's `aria-pressed` back,
//   so our pressed state always follows the diagram's (its own clicks on a
//   card or the pane included, and its re-renders).
// - Both find each other through `data-story-key`, so they can sit anywhere
//   on the page.
//
// Client-only mount: FlowDiagram's server placeholder for a story with
// journeys contains an inline <style> whose CSS the production HTML minifier
// rewrites, so hydration fails (React #418). StoryFrame renders its own
// placeholder instead (same size, CSS from a module, plus the diagram as text
// for search, the docs MCP and screen readers) and mounts the diagram after
// hydration.
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import Icon from "@mdi/react";
import { StoryDiagram, captionClass, type StoryProps } from "@site/src/components/FlowDiagram";
import styles from "./ourDiagrams.module.css";

/** Smallest scale before the diagram keeps its natural size and scrolls. */
export const MIN_ZOOM = 0.8;

const LANE_GROUP = '[role="group"][aria-label="Show one side only"]';
const JOURNEY_GROUP = '[role="group"][aria-label="Walk a journey"]';

const rootOf = (key: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(`[data-story-key="${key}"]`);

/** The diagram's own (hidden) button with this label, if it is mounted. */
function realButton(key: string, group: string, label: string): HTMLButtonElement | null {
  const buttons = rootOf(key)?.querySelectorAll<HTMLButtonElement>(`${group} button`) ?? [];
  return [...buttons].find((b) => b.textContent?.trim() === label) ?? null;
}

/** The diagram as text: what FlowDiagram's own server render carries. */
function StoryText({ props }: { props: StoryProps }): React.JSX.Element {
  return (
    <div className={styles.srOnly}>
      {props.title}
      <ol>
        {props.steps.map((s, i) => (
          <li key={i}>
            {`${props.lanes[s.lane]?.title}: ${s.title}${s.sub ? ` (${s.sub})` : ""}${s.detail ? `. ${s.detail}` : ""}`}
          </li>
        ))}
      </ol>
      <ul>
        {props.lanes.map((l, i) =>
          l.about ? <li key={i}>{`${l.title}: ${l.about.does} Relies on: ${l.about.relies}`}</li> : null,
        )}
      </ul>
      {(props.journeys ?? []).map((j, i) => (
        <React.Fragment key={i}>
          {j.name}
          <ol>
            {j.stops.map((x, k) => (
              <li key={k}>{x.text}</li>
            ))}
          </ol>
        </React.Fragment>
      ))}
    </div>
  );
}

/** The live diagram, scaled to the frame's width. */
function Zoomed({
  outer,
  props,
  width,
}: {
  outer: React.RefObject<HTMLDivElement | null>;
  props: StoryProps;
  width: number;
}): React.JSX.Element {
  const [zoom, setZoom] = useState(1);
  // Before paint, so the diagram never shows at the wrong size.
  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const fit = () => {
      const z = Math.min(1, el.clientWidth / width);
      setZoom(z >= MIN_ZOOM ? z : 1);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [outer, width]);
  return (
    <div className={styles.zoomed} style={{ zoom }}>
      <StoryDiagram {...props} />
    </div>
  );
}

/**
 * The diagram alone: its buttons hidden (StoryControls shows them), scaled to
 * the column. `width` and `height` are the diagram's natural size without its
 * buttons, used for the server placeholder so nothing moves on mount.
 */
export function StoryFrame({
  storyKey,
  props,
  width,
  height,
}: {
  storyKey: string;
  props: StoryProps;
  width: number;
  height: number;
}): React.JSX.Element {
  const outer = useRef<HTMLDivElement>(null);
  const size = {
    "--story-w": `${width}px`,
    "--story-h": `${height}px`,
    "--story-ratio": `${width} / ${height}`,
  } as React.CSSProperties;
  return (
    <div ref={outer} className={styles.frame} data-story-key={storyKey} style={size}>
      <BrowserOnly
        fallback={
          <>
            <div className={styles.placeholder} />
            <StoryText props={props} />
          </>
        }
      >
        {() => <Zoomed outer={outer} props={props} width={width} />}
      </BrowserOnly>
    </div>
  );
}

type Chip = { label: string; icon?: string; group: string };

/** Our copy of the diagram's buttons, for the text column. */
export function StoryControls({
  storyKey,
  props,
  hint,
}: {
  storyKey: string;
  props: StoryProps;
  /** One line under the buttons, e.g. "Read top to bottom · click a step". */
  hint?: string;
}): React.JSX.Element {
  const lanes: Chip[] = props.lanes
    .map((l, i) => ({ l, i }))
    .sort((a, b) => (a.l.chipOrder ?? a.i) - (b.l.chipOrder ?? b.i))
    .map(({ l }) => ({ label: l.chip, icon: l.icon, group: LANE_GROUP }));
  const journeys: Chip[] = (props.journeys ?? []).map((j) => ({ label: j.name, group: JOURNEY_GROUP }));
  const [pressed, setPressed] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  // Mirror the diagram's pressed state, whenever its buttons change.
  useEffect(() => {
    const root = rootOf(storyKey);
    if (!root) return;
    const sync = () => {
      const next: Record<string, boolean> = {};
      let found = false;
      for (const c of [...lanes, ...journeys]) {
        const b = realButton(storyKey, c.group, c.label);
        if (b) found = true;
        next[`${c.group}|${c.label}`] = b?.getAttribute("aria-pressed") === "true";
      }
      setReady(found);
      setPressed((prev) =>
        Object.keys(next).every((k) => prev[k] === next[k]) && Object.keys(prev).length === Object.keys(next).length
          ? prev
          : next,
      );
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-pressed"] });
    return () => observer.disconnect();
    // The chip lists come from static data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyKey]);

  const send = (c: Chip, type: "click" | "mouseover" | "mouseout") => {
    const b = realButton(storyKey, c.group, c.label);
    if (!b) return;
    if (type === "click") b.click();
    else b.dispatchEvent(new MouseEvent(type, { bubbles: true, relatedTarget: document.body }));
  };

  const row = (title: string, chips: Chip[]) =>
    chips.length === 0 ? null : (
      <div className={styles.controlGroup}>
        <div className={styles.controlLabel}>{title}</div>
        <div className={captionClass.chips} role="group" aria-label={title}>
          {chips.map((c) => {
            const on = pressed[`${c.group}|${c.label}`] ?? false;
            return (
              <button
                key={c.label}
                type="button"
                className={`${captionClass.chip} ${on ? captionClass.chipOn : ""} ${on ? styles.chipPressed : ""}`}
                aria-pressed={on}
                disabled={!ready}
                onClick={() => send(c, "click")}
                onMouseEnter={() => send(c, "mouseover")}
                onMouseLeave={() => send(c, "mouseout")}
                onFocus={() => send(c, "mouseover")}
                onBlur={() => send(c, "mouseout")}
              >
                {c.icon ? <Icon path={c.icon} size={0.55} /> : null}
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
    );

  return (
    <div className={styles.controls}>
      {row("Show one side", lanes)}
      {row("Walk a journey", journeys)}
      {hint ? <div className={styles.controlHint}>{hint}</div> : null}
    </div>
  );
}
