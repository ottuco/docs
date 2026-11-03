import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import {
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FlowDiagramProps, FlowNode, FlowNodeVariant } from "./types";
import styles from "./styles.module.css";

// Layout box of one node. Must match `.node` width in styles.module.css.
const NODE_WIDTH = 220;
const NODE_HEIGHT = 64;
const GAP_VERTICAL = 44;
const GAP_HORIZONTAL = 64;
const CANVAS_PADDING = 48;
const MIN_HEIGHT = 240;
const MAX_HEIGHT = 720;

type Side = "top" | "right" | "bottom" | "left";

const SIDES: Record<Side, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

type StepNodeData = {
  label: string;
  kicker?: string;
  badge?: string | number;
  variant: FlowNodeVariant;
  selected: boolean;
  panelId: string;
  onSelect: (id: string) => void;
};

type StepNode = Node<StepNodeData, "step">;

function StepNodeView({ id, data }: NodeProps<StepNode>): React.JSX.Element {
  return (
    <>
      {(Object.keys(SIDES) as Side[]).map((side) => (
        <React.Fragment key={side}>
          <Handle type="target" id={`t-${side}`} position={SIDES[side]} className={styles.handle} isConnectable={false} />
          <Handle type="source" id={`s-${side}`} position={SIDES[side]} className={styles.handle} isConnectable={false} />
        </React.Fragment>
      ))}
      <button
        type="button"
        className={clsx(styles.node, styles[`node_${data.variant}`], data.selected && styles.nodeSelected)}
        aria-pressed={data.selected}
        aria-controls={data.panelId}
        onClick={() => data.onSelect(id)}
      >
        {data.badge !== undefined ? (
          <span className={styles.badge} aria-hidden="true">
            {data.badge}
          </span>
        ) : null}
        <span className={styles.nodeText}>
          {data.kicker ? <span className={styles.kicker}>{data.kicker}</span> : null}
          <span className={styles.label}>{data.label}</span>
        </span>
      </button>
    </>
  );
}

const nodeTypes = { step: StepNodeView };

/** Nodes without a `position` are laid out in array order along `direction`. */
function layout(nodes: FlowNode[], direction: "vertical" | "horizontal") {
  const custom = nodes.every((n) => n.position);
  return nodes.map((n, i) => ({
    node: n,
    position: custom
      ? n.position!
      : direction === "vertical"
        ? { x: 0, y: i * (NODE_HEIGHT + GAP_VERTICAL) }
        : { x: i * (NODE_WIDTH + GAP_HORIZONTAL), y: 0 },
  }));
}

/** Connect each edge on the sides that face each other, so authors never pick handles. */
function facingSides(
  from: { x: number; y: number },
  to: { x: number; y: number },
): { source: Side; target: Side } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? { source: "right", target: "left" } : { source: "left", target: "right" };
  }
  return dy >= 0 ? { source: "bottom", target: "top" } : { source: "top", target: "bottom" };
}

/** Re-fit the whole diagram whenever its box changes size (rotation, panel stacking). */
function FitOnResize({ target }: { target: React.RefObject<HTMLDivElement | null> }): null {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const el = target.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => {
      void fitView({ padding: 0.15, maxZoom: 1 });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fitView, target]);
  return null;
}

export default function FlowDiagramInner({
  nodes,
  edges,
  title,
  direction = "vertical",
  height,
  defaultSelectedId,
  hint = "Select an item in the diagram to see what it does.",
  caption,
}: FlowDiagramProps): React.JSX.Element {
  const panelId = useId();
  const canvasRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>(defaultSelectedId);
  const userSelected = useRef(false);

  const onSelect = useCallback((id: string) => {
    userSelected.current = true;
    setSelectedId(id);
  }, []);

  // When the panel is stacked under the diagram (phones), bring it into view on selection.
  useEffect(() => {
    if (!userSelected.current || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId]);

  const placed = useMemo(() => layout(nodes, direction), [nodes, direction]);

  const flowNodes = useMemo<StepNode[]>(
    () =>
      placed.map(({ node, position }) => ({
        id: node.id,
        type: "step",
        position,
        width: NODE_WIDTH,
        data: {
          label: node.label,
          kicker: node.kicker,
          badge: node.badge,
          variant: node.variant ?? "default",
          selected: node.id === selectedId,
          panelId,
          onSelect,
        },
      })),
    [placed, selectedId, panelId, onSelect],
  );

  const flowEdges = useMemo<Edge[]>(() => {
    const at = new Map(placed.map(({ node, position }) => [node.id, position]));
    return edges
      .filter((e) => at.has(e.source) && at.has(e.target))
      .map((e) => {
        const sides = facingSides(at.get(e.source)!, at.get(e.target)!);
        return {
          id: e.id ?? `${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          sourceHandle: `s-${sides.source}`,
          targetHandle: `t-${sides.target}`,
          type: "smoothstep",
          label: e.label,
          markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
          className: clsx(styles.edge, e.dashed && styles.edgeDashed),
          labelBgPadding: [6, 3] as [number, number],
          labelBgBorderRadius: 4,
        };
      });
  }, [edges, placed]);

  const canvasHeight = useMemo(() => {
    if (height) return height;
    const bottom = Math.max(...placed.map(({ position }) => position.y)) + NODE_HEIGHT;
    const top = Math.min(...placed.map(({ position }) => position.y));
    return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, bottom - top + CANVAS_PADDING * 2));
  }, [height, placed]);

  const selected = nodes.find((n) => n.id === selectedId);

  return (
    <figure className={styles.root} role="group" aria-label={title}>
      <div className={styles.layout}>
        <div ref={canvasRef} className={styles.canvas} style={{ height: canvasHeight }}>
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
            minZoom={0.3}
            maxZoom={2}
            nodesDraggable={false}
            nodesConnectable={false}
            nodesFocusable={false}
            edgesFocusable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            onPaneClick={() => setSelectedId(undefined)}
          >
            <Controls showInteractive={false} position="bottom-left" />
            <FitOnResize target={canvasRef} />
          </ReactFlow>
        </div>
        <div ref={panelRef} id={panelId} className={styles.panel} aria-live="polite">
          {selected ? (
            <>
              {selected.kicker ? <p className={styles.panelKicker}>{selected.kicker}</p> : null}
              <p className={styles.panelTitle}>{selected.title ?? selected.label}</p>
              <div className={styles.panelBody}>{selected.description}</div>
              {selected.href ? (
                <Link className={styles.panelLink} to={selected.href}>
                  {selected.linkLabel ?? "Read more"} →
                </Link>
              ) : null}
            </>
          ) : (
            <p className={styles.panelHint}>{hint}</p>
          )}
        </div>
      </div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
