// Sequence diagram from React Flow primitives: each actor is a card with a
// dashed lifeline; each message is an edge between two invisible points on
// the lifelines, one row per message. A message from an actor to itself
// (from === to) is drawn as a small loop on the right of its lifeline.
import React, { useMemo } from "react";
import { useColorMode } from "@docusaurus/theme-common";
import {
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  CardNode,
  Handles,
  Title,
  FitOnResize,
  fitPadding,
  edgeLook,
  edgeTypes,
  readOnlyFlow,
  sourceHandle,
  targetHandle,
  type CardData,
} from "./parts";
import {
  SEQ_LANE_GAP,
  SEQ_SELF_LABEL_W,
  SEQ_SELF_LOOP,
  SEQ_ROW,
  SEQ_TOP,
  sequenceBodyHeight,
  sequenceHeight,
  sequenceMinWidth,
  sequenceRight,
  seqCenter,
} from "./layout";
import type { SequenceProps, Side } from "./types";
import styles from "./styles.module.css";

function Lifeline(props: NodeProps): React.JSX.Element {
  const d = props.data as CardData & { height: number };
  return (
    <div className={styles.lifeline} style={{ height: d.height }}>
      <CardNode {...props} />
      <div className={styles.lifelineLine} />
    </div>
  );
}

const pointSides = [Position.Left, Position.Right];

function Point(): React.JSX.Element {
  return (
    <div className={styles.point}>
      <Handles sides={pointSides} />
    </div>
  );
}

// Invisible node at the far right so fitView keeps a self-call label in view.
function Spacer(): React.JSX.Element {
  return <div style={{ width: 1, height: 1 }} />;
}

const nodeTypes = { lane: Lifeline, point: Point, spacer: Spacer };
const SELF_DROP = 24;

export default function Sequence(props: SequenceProps): React.JSX.Element {
  const { title, sub, actors, messages, animate = true } = props;
  const { colorMode } = useColorMode();
  const body = sequenceBodyHeight(props);
  const right = sequenceRight(props);

  const nodes: Node[] = useMemo(
    () => [
      ...actors.map((a, i) => ({
        id: `lane-${i}`,
        type: "lane",
        position: { x: i * SEQ_LANE_GAP, y: 0 },
        data: { title: a.title, icon: a.icon, tone: a.tone, height: body + 20 },
        selectable: false,
      })),
      ...messages.flatMap(([from, to], row) =>
        [from, to].map((actor, k) => ({
          id: `p-${row}-${k}`,
          type: "point",
          position: {
            x: seqCenter(actor),
            // A self-call returns lower on the same lifeline.
            y:
              SEQ_TOP +
              row * SEQ_ROW +
              (from === to && k === 1 ? SELF_DROP : 0),
          },
          data: {},
          selectable: false,
          focusable: false,
        })),
      ),
      {
        id: "spacer",
        type: "spacer",
        position: { x: right - 1, y: 0 },
        data: {},
        selectable: false,
        focusable: false,
      },
    ],
    [actors, messages, body, right],
  );

  const edges: Edge[] = useMemo(
    () =>
      messages.map(([from, to, text, kind = "request"], row) => {
        const self = from === to;
        // Self-call: out of the right side and back into it, lower down.
        const out: Side = self || to > from ? "right" : "left";
        const back: Side = self ? "right" : to > from ? "left" : "right";
        return {
          id: `m-${row}`,
          type: "step",
          source: `p-${row}-0`,
          target: `p-${row}-1`,
          sourceHandle: sourceHandle(out),
          targetHandle: targetHandle(back),
          data: {
            step: row + 1,
            text,
            kind,
            ...(self
              ? {
                  loop: true,
                  offset: SEQ_SELF_LOOP,
                  labelAlign: "start" as const,
                  maxWidth: SEQ_SELF_LABEL_W,
                }
              : { straight: true }),
          },
          ...edgeLook(kind, animate),
        };
      }),
    [messages, animate],
  );

  return (
    <div className={styles.scroller}>
      <div
        className={`${styles.canvas} ${styles.frame}`}
        style={{
          height: sequenceHeight(props),
          minWidth: sequenceMinWidth(props),
        }}
      >
        <Title title={title} sub={sub} />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          colorMode={colorMode}
          fitView
          fitViewOptions={{ padding: fitPadding(4), maxZoom: 1 }}
          {...readOnlyFlow}
          nodesFocusable={false}
        >
          <FitOnResize pct={4} />
        </ReactFlow>
      </div>
    </div>
  );
}
