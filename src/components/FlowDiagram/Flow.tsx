// Free-layout diagram: cards placed by x/y, optional dashed groups, arrows
// between cards. Use it for architecture views where a story or a sequence
// doesn't fit.
import React, { useMemo } from "react";
import { useColorMode } from "@docusaurus/theme-common";
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Title,
  FitOnResize,
  fitPadding,
  edgeLook,
  edgeTypes,
  nodeTypes,
  readOnlyFlow,
  sourceHandle,
  targetHandle,
} from "./parts";
import { CARD_H, CARD_W, flowHeight, flowMinWidth } from "./layout";
import type { FlowArrow, FlowCard, FlowProps, Side } from "./types";
import styles from "./styles.module.css";

// The side of `a` that faces `b`, from the card centres.
function facing(
  a: { x: number; y: number },
  b: { x: number; y: number },
): [Side, Side] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dy) >= Math.abs(dx))
    return dy > 0 ? ["bottom", "top"] : ["top", "bottom"];
  return dx > 0 ? ["right", "left"] : ["left", "right"];
}

export default function Flow(props: FlowProps): React.JSX.Element {
  const { title, sub, cards, groups = [], arrows, animate = true } = props;
  const { colorMode } = useColorMode();

  const nodes: Node[] = useMemo(
    () => [
      // Groups first: React Flow needs a parent before its children.
      ...groups.map((g) => ({
        id: g.id,
        type: "group",
        position: { x: g.x, y: g.y },
        data: { label: g.label },
        style: { width: g.width, height: g.height },
        selectable: false,
      })),
      ...cards.map((c: FlowCard) => ({
        id: c.id,
        type: "card",
        position: { x: c.x, y: c.y },
        data: {
          title: c.title,
          sub: c.sub,
          icon: c.icon,
          tone: c.tone,
          width: c.width,
        },
        // An unknown `parent` is ignored: the card is placed on its own, the
        // same way flowMinWidth and the arrow sides treat it.
        ...(c.parent && groups.some((g) => g.id === c.parent)
          ? { parentId: c.parent, extent: "parent" as const }
          : {}),
      })),
    ],
    [cards, groups],
  );

  const edges: Edge[] = useMemo(() => {
    const groupAt = new Map(groups.map((g) => [g.id, g]));
    const centre = new Map(
      cards.map((c) => {
        const g = c.parent ? groupAt.get(c.parent) : undefined;
        return [
          c.id,
          {
            x: (g?.x ?? 0) + c.x + (c.width ?? CARD_W) / 2,
            y: (g?.y ?? 0) + c.y + CARD_H / 2,
          },
        ];
      }),
    );
    return arrows.map((a: FlowArrow, i) => {
      const [fs, ts] = facing(
        centre.get(a.from) ?? { x: 0, y: 0 },
        centre.get(a.to) ?? { x: 0, y: 0 },
      );
      return {
        id: `a-${i}-${a.from}-${a.to}`,
        type: "step",
        source: a.from,
        target: a.to,
        sourceHandle: sourceHandle(a.fromSide ?? fs),
        targetHandle: targetHandle(a.toSide ?? ts),
        data: {
          step: a.step,
          text: a.label,
          kind: a.kind,
          dx: a.dx,
          dy: a.dy,
          straight: a.straight,
        },
        ...edgeLook(a.kind, animate),
      };
    });
  }, [arrows, cards, groups, animate]);

  return (
    <div className={styles.scroller}>
      <div
        className={`${styles.canvas} ${styles.frame}`}
        style={{ height: flowHeight(props), minWidth: flowMinWidth(props) }}
      >
        <Title title={title} sub={sub} />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          colorMode={colorMode}
          fitView
          fitViewOptions={{ padding: fitPadding(6), maxZoom: 1 }}
          {...readOnlyFlow}
          nodesFocusable={false}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1}
            color="var(--o-dot)"
          />
          <FitOnResize pct={6} />
        </ReactFlow>
      </div>
    </div>
  );
}
