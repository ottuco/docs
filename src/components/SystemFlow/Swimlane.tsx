import React, {useCallback, useId, useMemo, useState} from "react";
import {useColorMode} from "@docusaurus/theme-common";
import {MarkerType, ReactFlow, type Edge, type Node, type NodeProps} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Icon from "@mdi/react";
import {mdiChevronLeft, mdiChevronRight} from "@mdi/js";
import {CardNode, Title, edgeTypes, type CardData} from "./parts";
import styles from "./styles.module.css";

// A story diagram: one column per actor, steps read top to bottom in time
// order, each box says what happens in plain words. To draw a new flow, pass
// lanes, steps and links only.
//
// Interaction: hover (or tap) an actor chip to see only that actor's part;
// hover a box to see only the steps it connects to. The focus is applied with
// a scoped <style> block, not by changing nodes/edges: rebuilding them on hover
// makes React Flow re-measure and re-fire hover events in a loop.
//
// Pass `about`, `detail` and `journeys` to get the side panel: click an actor or
// a step to read about it, or walk a journey one step at a time.
export type Lane = {title: string; icon: string; chip: string; about?: {does: string; relies: string}};
export type Step = {
  lane: number;
  title: string;
  sub?: string;
  icon: string;
  tone?: "accent" | "info" | "success";
  detail?: string;
};
export type Journey = {name: string; stops: {step: number; text: string}[]};
// [from step, to step, label?, reply?] — steps are 1-based, like the numbers shown.
export type Link = [number, number, string?, boolean?];

const ROW = 74;
const TOP = 44;

function LaneHead({data}: NodeProps): React.JSX.Element {
  const d = data as Lane & {height: number};
  return (
    <div className={styles.laneCol} style={{height: d.height}}>
      <div className={styles.laneHead}>
        <Icon path={d.icon} size={0.6} />
        {d.title}
      </div>
    </div>
  );
}

const nodeTypes = {card: CardNode, lane: LaneHead};

export default function Swimlane({
  title,
  sub,
  lanes,
  steps,
  links,
  journeys = [],
}: {
  title: string;
  sub: string;
  lanes: Lane[];
  steps: Step[];
  links: Link[];
  journeys?: Journey[];
}): React.JSX.Element {
  const {colorMode} = useColorMode();
  const scope = `sl-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [lane, setLane] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinnedLane, setPinnedLane] = useState<number | null>(null);
  const [pinnedStep, setPinnedStep] = useState<number | null>(null);
  const [journey, setJourney] = useState<number | null>(null);
  const [stop, setStop] = useState(0);
  const hasPanel = journeys.length > 0;

  const gap = Math.max(180, Math.floor(660 / lanes.length));
  const cardW = Math.min(196, gap - 20);
  const height = TOP + steps.length * ROW;

  const nodes: Node[] = useMemo(() => {
    const x = (l: number) => l * gap + (gap - cardW) / 2;
    return [
      ...lanes.map((l, i) => ({
        id: `lane-${i}`,
        type: "lane",
        position: {x: i * gap, y: 0},
        data: {...l, height},
        style: {width: gap},
        draggable: false,
        selectable: false,
        zIndex: -1,
      })),
      ...steps.map((s, i) => ({
        id: `s-${i + 1}`,
        type: "card",
        position: {x: x(s.lane), y: TOP + i * ROW},
        data: {title: s.title, sub: s.sub, icon: s.icon, variant: s.tone, num: i + 1, width: cardW} as CardData,
        draggable: false,
      })),
    ];
  }, [lanes, steps, gap, cardW, height]);

  const edges: Edge[] = useMemo(
    () =>
      links.map(([from, to, text, reply]) => {
        const a = steps[from - 1].lane;
        const b = steps[to - 1].lane;
        const [sh, th] = a === b ? ["s-bottom", "t-top"] : b > a ? ["s-right", "t-top"] : ["s-left", "t-top"];
        return {
          id: `l-${from}-${to}`,
          type: "step",
          source: `s-${from}`,
          target: `s-${to}`,
          sourceHandle: sh,
          targetHandle: th,
          data: {text, blue: reply},
          markerEnd: {type: MarkerType.ArrowClosed, width: 14, height: 14},
          style: reply
            ? {stroke: "var(--o-blue)", strokeWidth: 1.5, strokeDasharray: "6 4"}
            : {stroke: "#f77d1a", strokeWidth: 1.5},
        };
      }),
    [links, steps],
  );

  // CSS that dims everything, then re-lights the focused steps and arrows.
  const focusCss = useMemo(() => {
    let litSteps: number[];
    let litLinks: Link[];
    let litLanes: number[];
    const shownLane = lane ?? pinnedLane;
    let current: number | null = pinnedStep;
    if (journey !== null) {
      const walked = journeys[journey].stops.slice(0, stop + 1).map((x) => x.step);
      litSteps = walked;
      litLinks = links.filter(([a, b]) => walked.includes(a) && walked.includes(b));
      litLanes = lanes.map((_, i) => i);
      current = walked[walked.length - 1];
    } else if (shownLane !== null) {
      litSteps = steps.flatMap((s, i) => (s.lane === shownLane ? [i + 1] : []));
      litLinks = links.filter(([a, b]) => steps[a - 1].lane === shownLane || steps[b - 1].lane === shownLane);
      litLanes = [shownLane];
    } else if (hovered !== null) {
      litLinks = links.filter(([a, b]) => a === hovered || b === hovered);
      litSteps = [hovered, ...litLinks.flatMap(([a, b]) => [a, b])];
      litLanes = lanes.map((_, i) => i);
    } else if (pinnedStep !== null) {
      litLinks = links.filter(([a, b]) => a === pinnedStep || b === pinnedStep);
      litSteps = [pinnedStep, ...litLinks.flatMap(([a, b]) => [a, b])];
      litLanes = lanes.map((_, i) => i);
    } else {
      return "";
    }
    const s = `#${scope}`;
    const on = [
      ...litSteps.map((n) => `${s} [data-id="s-${n}"]`),
      ...litLinks.map(([a, b]) => `${s} [data-testid="rf__edge-l-${a}-${b}"], ${s} [data-edge="l-${a}-${b}"]`),
      ...litLanes.map((n) => `${s} [data-id="lane-${n}"]`),
    ];
    return (
      `${s} .react-flow__node, ${s} .react-flow__edge, ${s} [data-edge] { opacity: 0.15; }\n` +
      `${on.join(",\n")} { opacity: 1; }` +
      (current ? `\n${s} [data-id="s-${current}"] > div { outline: 2px solid #f77d1a; outline-offset: 2px; }` : "")
    );
  }, [lane, pinnedLane, pinnedStep, journey, stop, journeys, hovered, steps, links, lanes, scope]);

  const showLane = (i: number) => {
    setJourney(null);
    setPinnedStep(null);
    setPinnedLane(pinnedLane === i ? null : i);
  };
  const onNodeClick = useCallback((_: unknown, n: Node) => {
    setJourney(null);
    if (n.type === "card") {
      setPinnedLane(null);
      setPinnedStep(Number(n.id.slice(2)));
    } else {
      setPinnedStep(null);
      setPinnedLane(Number(n.id.slice(5)));
    }
  }, []);
  const startJourney = (i: number) => {
    setPinnedLane(null);
    setPinnedStep(null);
    setStop(0);
    setJourney(journey === i ? null : i);
  };
  const walk = journey !== null ? journeys[journey] : null;

  const onEnter = useCallback((_: unknown, n: Node) => {
    if (n.type === "card") setHovered(Number(n.id.slice(2)));
  }, []);
  const onLeave = useCallback(() => setHovered(null), []);

  const diagram = (
    <div
      id={scope}
      className={`${styles.canvas} ${styles.frame} ${styles.story}`}
      style={{height: height + (hasPanel ? 144 : 104)}}
    >
      {focusCss ? <style>{focusCss}</style> : null}
      <Title title={title} sub={sub} />
      <div className={styles.chips} role="group" aria-label="Show one side only">
        {lanes.map((l, i) => (
          <button
            key={l.title}
            type="button"
            className={`${styles.chip} ${lane === i ? styles.chipOn : ""}`}
            aria-pressed={lane === i}
            onMouseEnter={() => setLane(i)}
            onMouseLeave={() => setLane(null)}
            onFocus={() => setLane(i)}
            onBlur={() => setLane(null)}
            onClick={() => (hasPanel ? showLane(i) : setLane(lane === i ? null : i))}
          >
            <Icon path={l.icon} size={0.55} />
            {l.chip}
          </button>
        ))}
      </div>
      {hasPanel ? (
        <div className={styles.chips} role="group" aria-label="Walk a journey">
          {journeys.map((j, i) => (
            <button
              key={j.name}
              type="button"
              className={`${styles.chip} ${journey === i ? styles.chipOn : ""}`}
              aria-pressed={journey === i}
              onClick={() => startJourney(i)}
            >
              {j.name}
            </button>
          ))}
        </div>
      ) : null}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={colorMode}
        fitView
        fitViewOptions={{padding: 0.03, maxZoom: 1}}
        nodesConnectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        preventScrolling={false}
        onNodeMouseEnter={onEnter}
        onNodeMouseLeave={onLeave}
        onNodeClick={hasPanel ? onNodeClick : undefined}
      />
    </div>
  );

  if (!hasPanel) return diagram;

  const shown = pinnedStep !== null ? steps[pinnedStep - 1] : null;
  const actor = pinnedLane !== null ? lanes[pinnedLane] : null;
  return (
    <div className={styles.storyWrap}>
      {diagram}
      <aside className={styles.panel} aria-live="polite">
        {walk ? (
          <>
            <div className={styles.panelEyebrow}>{walk.name}</div>
            <h4>{steps[walk.stops[stop].step - 1].title}</h4>
            <p>{walk.stops[stop].text}</p>
            <div className={styles.player}>
              <button type="button" aria-label="Previous step" disabled={stop === 0} onClick={() => setStop(stop - 1)}>
                <Icon path={mdiChevronLeft} size={0.8} />
              </button>
              <span>
                {stop + 1} / {walk.stops.length}
              </span>
              <button
                type="button"
                aria-label="Next step"
                disabled={stop === walk.stops.length - 1}
                onClick={() => setStop(stop + 1)}
              >
                <Icon path={mdiChevronRight} size={0.8} />
              </button>
            </div>
          </>
        ) : shown ? (
          <>
            <div className={styles.panelEyebrow}>{lanes[shown.lane].title}</div>
            <h4>{shown.title}</h4>
            <p>{shown.detail}</p>
          </>
        ) : actor ? (
          <>
            <div className={styles.panelEyebrow}>{actor.title}</div>
            <h4>What it does</h4>
            <p>{actor.about?.does}</p>
            <h4>Who relies on it</h4>
            <p>{actor.about?.relies}</p>
          </>
        ) : (
          <p>Click a side or a step to read about it, or pick a journey to walk it one step at a time.</p>
        )}
      </aside>
    </div>
  );
}
