// Story (swimlane) diagram: one column per actor, steps read top to bottom in
// time order, each card says what happens in plain words.
//
// How the reader uses it:
// - Hover an actor chip or a card to preview it (that actor's steps, or the
//   card and the steps it links to).
// - Click, tap or press Enter on a chip or a card to pin it; again to unpin.
//   Click empty canvas or press Escape to see the whole story again.
// - With `journeys`, a panel under the diagram describes what is pinned, or
//   walks a journey one stop at a time.
//
// Arrow shapes live in storyRoutes.ts, the focus CSS in storyFocus.ts, the
// node ids in storyIds.ts and the panel in StoryPanel.tsx.
import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useColorMode } from "@docusaurus/theme-common";
import { ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Icon from "@mdi/react";
import {
  CardNode,
  FitOnResize,
  Title,
  edgeLook,
  edgeTypes,
  fitPadding,
  readOnlyFlow,
  type CardData,
} from "./parts";
import {
  STORY_PANEL_GAP,
  STORY_ROW,
  STORY_TOP,
  STORY_BODY_PAD,
  storyBodyHeight,
  storyCardW,
  storyGap,
  storyLanesHeight,
  storyMinWidth,
  storySideAt,
} from "./layout";
import { routeLink } from "./storyRoutes";
import { focusCss, type Hover, type Pin } from "./storyFocus";
import { laneId, linkId, stepId, stepOf } from "./storyIds";
import StoryPanel from "./StoryPanel";
import type { StoryLane, StoryProps } from "./types";
import styles from "./styles.module.css";

function LaneHead({ data }: NodeProps): React.JSX.Element {
  const d = data as StoryLane & { height: number };
  return (
    <div className={styles.laneCol} style={{ height: d.height }}>
      <div className={styles.laneHead}>
        <Icon path={d.icon} size={0.6} />
        {d.title}
      </div>
    </div>
  );
}

const nodeTypes = { card: CardNode, lane: LaneHead };

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Data reaching here is already cleaned by StoryDiagram (index.tsx): lanes in
// range, no links or journey stops pointing at missing steps.
export default function Story(props: StoryProps): React.JSX.Element {
  const { title, sub, lanes, steps, links, animate = true, maxHeight } = props;
  const journeys = props.journeys ?? [];
  const hasPanel = journeys.length > 0;
  const { colorMode } = useColorMode();
  const scope = `fd-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  // What the reader is looking at: one thing pinned, one thing hovered.
  const [pin, setPin] = useState<Pin>(null);
  const [hover, setHover] = useState<Hover>(null);
  const [stop, setStop] = useState(0); // current stop of the pinned journey

  /** Index of what is pinned, if it is of this kind. */
  const pinnedOf = (kind: NonNullable<Pin>["kind"]) =>
    pin?.kind === kind ? pin.i : null;
  const journeyIndex = pinnedOf("journey");
  const journey = journeyIndex !== null ? journeys[journeyIndex] : null;
  const walked = journey
    ? journey.stops.slice(0, stop + 1).map((x) => x.step)
    : [];

  const gap = storyGap(lanes.length);
  const cardW = storyCardW(lanes.length);
  const lanesHeight = storyLanesHeight(props);

  const nodes: Node[] = useMemo(() => {
    const cardX = (lane: number) => lane * gap + (gap - cardW) / 2;
    return [
      ...lanes.map((l, i) => ({
        id: laneId(i),
        type: "lane",
        position: { x: i * gap, y: 0 },
        data: { ...l, height: lanesHeight },
        style: { width: gap },
        selectable: false,
        focusable: false,
        zIndex: -1,
      })),
      ...steps.map((s, i) => ({
        id: stepId(i + 1),
        type: "card",
        position: { x: cardX(s.lane), y: STORY_TOP + i * STORY_ROW },
        ariaLabel: `Step ${i + 1}: ${s.title}${s.sub ? `, ${s.sub}` : ""}`,
        data: {
          title: s.title,
          sub: s.sub,
          icon: s.icon,
          tone: s.tone,
          num: i + 1,
          width: cardW,
        } as CardData,
      })),
    ];
  }, [lanes, steps, gap, cardW, lanesHeight]);

  const edges: Edge[] = useMemo(
    () =>
      links.map(([from, to, text, kind], i) => {
        const route = routeLink(steps, from, to, gap, cardW);
        return {
          id: linkId(i),
          type: "step",
          source: stepId(from),
          target: stepId(to),
          sourceHandle: route.sourceHandle,
          targetHandle: route.targetHandle,
          data: { text, kind, ...route.data },
          ...edgeLook(kind, animate),
        };
      }),
    [links, steps, gap, cardW, animate],
  );

  // With `maxHeight` the body scrolls: keep the journey's current card in
  // view. Scroll the body ourselves; scrollIntoView would also scroll React
  // Flow's own pane.
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = body.current;
    if (!maxHeight || !el || !journey) return;
    const card = el.querySelector(
      `[data-id="${stepId(journey.stops[stop].step)}"]`,
    );
    if (!card) return;
    const y =
      el.scrollTop +
      card.getBoundingClientRect().top -
      el.getBoundingClientRect().top -
      el.clientHeight / 3;
    el.scrollTo({
      top: Math.max(0, y),
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }, [maxHeight, journey, stop]);

  // The caption goes beside the diagram only when diagram + caption fit the
  // container; measured, not guessed from the viewport.
  const wrap = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(false);
  const needed = storySideAt(props);
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el || !hasPanel) return;
    setSide(el.clientWidth >= needed); // before first paint: no flash
    // Measure in the next frame: changing layout inside the observer callback
    // triggers "ResizeObserver loop" errors.
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSide(el.clientWidth >= needed));
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [hasPanel, needed]);

  // On a narrow screen the panel sits below the diagram. After a click, scroll
  // down just enough to show it, but never so far that the clicked step
  // leaves the screen.
  useEffect(() => {
    if (!pin || side) return;
    const panel = document.getElementById(`${scope}-panel`);
    if (!panel) return;
    let delta =
      panel.getBoundingClientRect().bottom - (window.innerHeight - 12);
    if (delta <= 0) return;
    const stepNo =
      pin.kind === "step"
        ? pin.i
        : pin.kind === "journey"
          ? walked[walked.length - 1]
          : null;
    const node = stepNo
      ? document.querySelector(`#${scope} [data-id="${stepId(stepNo)}"]`)
      : null;
    if (node) {
      const NAVBAR = 72; // navbar plus a little air
      delta = Math.min(
        delta,
        Math.max(0, node.getBoundingClientRect().top - NAVBAR),
      );
    }
    if (delta > 0)
      window.scrollBy({
        top: delta,
        behavior: reducedMotion() ? "auto" : "smooth",
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `walked` follows `stop`
  }, [scope, pin, stop, side]);

  // Clicking the pinned thing again unpins it. A click also drops the hover
  // preview: touch never sends mouseleave, and after unpinning the reader
  // should see the whole story.
  const toggle = (next: NonNullable<Pin>) => {
    setHover(null);
    setStop(0);
    setPin(pinnedOf(next.kind) === next.i ? null : next);
  };
  const showAll = () => {
    setHover(null);
    setPin(null);
  };
  // A card pins its step; a lane column is empty canvas, so it shows all.
  const pickNode = (id: string) => {
    const step = stepOf(id);
    if (step === null) showAll();
    else toggle({ kind: "step", i: step });
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return showAll();
    if (e.key !== "Enter" && e.key !== " ") return;
    // React Flow does not fire onNodeClick from the keyboard.
    const id = (e.target as HTMLElement)
      .closest(".react-flow__node")
      ?.getAttribute("data-id");
    if (id) {
      e.preventDefault();
      pickNode(id);
    }
  };

  const css = focusCss({
    scope,
    hover,
    pin,
    walked,
    laneCount: lanes.length,
    steps,
    links,
  });

  const diagram = (
    <div className={styles.scroller}>
      <div
        id={scope}
        onKeyDown={onKeyDown}
        className={`${styles.canvas} ${styles.frame} ${styles.story}`}
        // Height follows the content: the title and chips may wrap.
        style={{ height: "auto", minWidth: storyMinWidth(props) }}
      >
        {css ? <style>{css}</style> : null}
        <Title title={title} sub={sub} />
        <div
          className={styles.chips}
          role="group"
          aria-label="Show one side only"
        >
          {lanes.map((l, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.chip} ${pinnedOf("lane") === i ? styles.chipOn : ""}`}
              aria-pressed={pinnedOf("lane") === i}
              onMouseEnter={() => setHover({ kind: "lane", i })}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover({ kind: "lane", i })}
              onBlur={() => setHover(null)}
              onClick={() => toggle({ kind: "lane", i })}
            >
              <Icon path={l.icon} size={0.55} />
              {l.chip}
            </button>
          ))}
        </div>
        {hasPanel ? (
          <div
            className={styles.chips}
            role="group"
            aria-label="Walk a journey"
          >
            {journeys.map((j, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.chip} ${pinnedOf("journey") === i ? styles.chipOn : ""}`}
                aria-pressed={pinnedOf("journey") === i}
                onClick={() => toggle({ kind: "journey", i })}
              >
                {j.name}
              </button>
            ))}
          </div>
        ) : null}
        {/* The body: lanes and cards. With `maxHeight` it is shorter than
            the lanes and scrolls; the title and chips stay in view. */}
        <div
          ref={body}
          className={styles.storyBody}
          style={{ height: storyBodyHeight(props) }}
        >
          <div
            className={styles.frame}
            style={{ height: lanesHeight + STORY_BODY_PAD }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              colorMode={colorMode}
              fitView
              fitViewOptions={{ padding: fitPadding(3), maxZoom: 1 }}
              {...readOnlyFlow}
              onNodeMouseEnter={(_, n) => {
                const step = stepOf(n.id);
                if (step !== null) setHover({ kind: "step", i: step });
              }}
              onNodeMouseLeave={() => setHover(null)}
              onNodeClick={(_, n) => pickNode(n.id)}
              onPaneClick={showAll}
            >
              <FitOnResize pct={3} />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );

  if (!hasPanel) return diagram;

  return (
    <div
      ref={wrap}
      className={`${styles.storyWrap} ${side ? styles.storyWrapSide : ""}`}
      style={{ gap: STORY_PANEL_GAP }}
    >
      {diagram}
      <StoryPanel
        id={`${scope}-panel`}
        lanes={lanes}
        steps={steps}
        journey={journey}
        stop={stop}
        pinnedLane={pinnedOf("lane")}
        pinnedStep={pinnedOf("step")}
        onStop={setStop}
        onEscape={showAll}
      />
    </div>
  );
}
