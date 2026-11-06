// Building blocks shared by every diagram kind: the card node, the dashed
// group box, the numbered edge label, the title, and the edge colours.
import React, { useEffect } from "react";
import Icon from "@mdi/react";
import Link from "@docusaurus/Link";
import {
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  Position,
  getSmoothStepPath,
  getStraightPath,
  useReactFlow,
  useStore,
  type Edge,
  type EdgeProps,
  type FitViewOptions,
  type NodeProps,
} from "@xyflow/react";
import type { EdgeKind, Side, Tone } from "./types";
import styles from "./styles.module.css";

export type CardData = {
  title: string;
  sub?: string;
  icon?: string;
  tone?: Tone;
  num?: number;
  width?: number;
  href?: string;
};

const allSides = [Position.Top, Position.Right, Position.Bottom, Position.Left];

// A source + target handle on each given side (every side by default) so an
// edge can leave from whichever side is cleanest. Handles stay invisible
// (opacity, never display:none, which breaks React Flow's measuring).
export function Handles({
  sides = allSides,
}: {
  sides?: Position[];
}): React.JSX.Element {
  return (
    <>
      {sides.map((p) => (
        <React.Fragment key={p}>
          <Handle
            type="source"
            position={p}
            id={`s-${p}`}
            className={styles.handle}
          />
          <Handle
            type="target"
            position={p}
            id={`t-${p}`}
            className={styles.handle}
          />
        </React.Fragment>
      ))}
    </>
  );
}

export function CardNode({ data }: NodeProps): React.JSX.Element {
  const d = data as CardData;
  const cls = [styles.node, d.tone ? styles[d.tone] : ""].join(" ");
  const body = (
    <div
      className={cls}
      style={d.width ? { width: d.width } : undefined}
      title={d.sub ? `${d.title}: ${d.sub}` : d.title}
    >
      <Handles />
      {d.icon ? (
        <span className={styles.icon}>
          <Icon path={d.icon} size={0.8} />
        </span>
      ) : null}
      <span>
        <div className={styles.nodeTitle}>
          {d.num ? <span className={styles.nodeNum}>{d.num}</span> : null}
          {d.title}
        </div>
        {d.sub ? <div className={styles.nodeSub}>{d.sub}</div> : null}
      </span>
    </div>
  );
  return d.href ? (
    <Link to={d.href} className={`${styles.cardLink} nodrag nopan`}>
      {body}
    </Link>
  ) : (
    body
  );
}

export function GroupNode({ data }: NodeProps): React.JSX.Element {
  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>
        {(data as { label: string }).label}
      </span>
    </div>
  );
}

export type StepData = {
  // ----- the label pill -----
  text?: string;
  /** Number shown in the pill. */
  step?: number;
  kind?: EdgeKind;
  /** Nudge the label (px). */
  dx?: number;
  dy?: number;
  /** Wrap the label at this width (px). */
  maxWidth?: number;
  /** `start` = right of the line, `end` = left of it. Default: centred on it. */
  labelAlign?: "start" | "end";
  /** Row pitch (px) of a story: put the label in the empty band between two
   * rows of cards, below the upper end (default) or above the lower end. */
  rowGap?: number;
  labelBand?: "upper" | "lower";

  // ----- the line -----
  straight?: boolean;
  /** Both ends on the same side of a card: a loop, `offset` wide. */
  loop?: boolean;
  /** How far the elbow leaves the card before turning (px). */
  offset?: number;
  /** x of the elbow's vertical part, e.g. the gap between two lanes. */
  centerX?: number;
};

/** Where the label pill goes, and which point of the pill sits there. */
function labelPlace(
  e: EdgeProps,
  d: StepData,
  pathX: number,
  pathY: number,
): { x: number; y: number; anchor: string } {
  const lineX = d.loop ? e.sourceX + (d.offset ?? 20) : (d.centerX ?? pathX);
  const top = Math.min(e.sourceY, e.targetY);
  const bottom = Math.max(e.sourceY, e.targetY);

  let y = pathY;
  if (d.rowGap) {
    y = d.labelBand === "lower" ? bottom - d.rowGap / 2 : top + d.rowGap / 2;
  } else if (d.loop) {
    y = (top + bottom) / 2;
  }

  if (d.labelAlign === "start") return { x: lineX + 6, y, anchor: "0" };
  if (d.labelAlign === "end") return { x: lineX - 6, y, anchor: "-100%" };
  return { x: lineX, y, anchor: "-50%" };
}

// Edge with an optional pill label (and number), so the reader can follow the order.
export function StepEdge(props: EdgeProps): React.JSX.Element {
  const d = (props.data ?? {}) as StepData;
  const [path, pathX, pathY] = d.straight
    ? getStraightPath(props)
    : getSmoothStepPath({
        ...props,
        borderRadius: d.loop ? 6 : 12,
        offset: d.offset,
        centerX: d.centerX,
      });
  const label = labelPlace(props, d, pathX, pathY);
  return (
    <>
      <BaseEdge
        id={props.id}
        path={path}
        markerEnd={props.markerEnd}
        style={props.style}
      />
      {d.text ? (
        <EdgeLabelRenderer>
          <div
            className={`${styles.step} ${d.maxWidth ? styles.stepWrap : ""} nodrag nopan`}
            data-edge={props.id}
            style={{
              position: "absolute",
              maxWidth: d.maxWidth,
              transform: `translate(${label.anchor}, -50%) translate(${label.x + (d.dx ?? 0)}px, ${label.y + (d.dy ?? 0)}px)`,
            }}
          >
            {d.step ? (
              <span
                className={`${styles.stepNum} ${d.kind === "reply" ? styles.stepBlue : ""}`}
              >
                {d.step}
              </span>
            ) : null}
            {d.text}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export function Title({
  title,
  sub,
}: {
  title: string;
  sub?: string;
}): React.JSX.Element {
  return (
    <div className={styles.title}>
      {title}
      {sub ? <span>{sub}</span> : null}
    </div>
  );
}

const lineColour: Record<EdgeKind, string> = {
  request: "var(--o-primary)",
  reply: "var(--o-blue)",
  plain: "var(--o-edge)",
};

/** Line style + arrowhead for an edge kind. Spread into an Edge object. */
export function edgeLook(
  kind: EdgeKind = "request",
  animate = true,
): Pick<Edge, "style" | "markerEnd" | "animated"> {
  // Request and reply arrows flow (dashes moving from source to target);
  // plain arrows stay still. The motion is in styles.module.css and stops
  // under prefers-reduced-motion.
  const flowing = animate && kind !== "plain";
  return {
    animated: flowing,
    style: {
      stroke: lineColour[kind],
      strokeWidth: 1.5,
      // Replies are always dashed (inline, so it holds under reduced motion,
      // when requests turn solid again); flowing requests get their dashes
      // from the `.animated` CSS rule.
      ...(kind === "reply" ? { strokeDasharray: "6 4" } : {}),
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 14,
      height: 14,
      color: lineColour[kind],
    },
  };
}

type Padding = NonNullable<FitViewOptions["padding"]>;

/** fitView padding: `pct` % around the diagram, plus room at the bottom for
 * React Flow's attribution badge (kept: React Flow asks free users to). */
export const fitPadding = (pct: number): Padding => ({
  top: `${pct}%`,
  right: `${pct}%`,
  left: `${pct}%`,
  bottom: "22px",
});

/** Put inside <ReactFlow>: fits the diagram again whenever the canvas is
 * resized (window resize, phone rotation), since panning and zooming are off
 * and the reader could not bring a cut-off part back into view. */
export function FitOnResize({ pct }: { pct: number }): null {
  const { fitView } = useReactFlow();
  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);
  // Depends on numbers only, so a hover re-render never refits.
  useEffect(() => {
    if (width && height) void fitView({ padding: fitPadding(pct), maxZoom: 1 });
  }, [width, height, pct, fitView]);
  return null;
}

/** Maps a side name to the matching handle id on a card. */
export const sourceHandle = (s: Side): string => `s-${s}`;
export const targetHandle = (s: Side): string => `t-${s}`;

export const nodeTypes = { card: CardNode, group: GroupNode };
export const edgeTypes = { step: StepEdge };

/** Props every diagram passes to <ReactFlow>: a read-only, page-scroll-friendly canvas. */
export const readOnlyFlow = {
  nodesConnectable: false,
  nodesDraggable: false,
  elementsSelectable: true,
  panOnDrag: false,
  zoomOnScroll: false,
  zoomOnPinch: false,
  zoomOnDoubleClick: false,
  preventScrolling: false,
  // Space pins a story step; it must not also switch on React Flow's pan mode.
  panActivationKeyCode: null,
  // Arrows have nothing to do on Enter, so they are not tab stops.
  edgesFocusable: false,
} as const;
