import React from "react";
import {useColorMode} from "@docusaurus/theme-common";
import {Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {mdiAccount, mdiBankTransfer, mdiServer, mdiShieldCheckOutline} from "@mdi/js";
import {CardNode, Title, edgeTypes, type CardData} from "./parts";
import styles from "./styles.module.css";

// A sequence diagram from React Flow primitives: each lane is a card + a dashed
// line; each message is an edge between two invisible points on the lanes.
// To draw another sequence, change `lanes` and `messages` only.
const LANE_GAP = 185;
const ROW_GAP = 58;
const TOP = 100;
const LANE_W = 140;

const lanes: CardData[] = [
  {title: "Merchant", icon: mdiServer},
  {title: "Ottu", icon: mdiShieldCheckOutline, variant: "accent"},
  {title: "Customer", icon: mdiAccount},
  {title: "Gateway", icon: mdiBankTransfer},
];

// [from lane, to lane, label, reply?]
const messages: [number, number, string, boolean?][] = [
  [0, 1, "Checkout API"],
  [1, 0, "checkout_url", true],
  [0, 2, "Show checkout"],
  [2, 1, "Enter card · 3DS"],
  [1, 3, "Charge"],
  [3, 1, "Result", true],
  [1, 0, "Webhook", true],
  [1, 2, "Redirect back", true],
];

const height = messages.length * ROW_GAP + TOP;

function Lane(props: NodeProps): React.JSX.Element {
  return (
    <div className={styles.lifeline} style={{height: height + 20}}>
      <CardNode {...props} />
      <div className={styles.lifelineLine} />
    </div>
  );
}

function Point(): React.JSX.Element {
  return (
    <div className={styles.point}>
      {[Position.Left, Position.Right].map((p) => (
        <React.Fragment key={p}>
          <Handle type="source" position={p} id={`s-${p}`} className={styles.handle} />
          <Handle type="target" position={p} id={`t-${p}`} className={styles.handle} />
        </React.Fragment>
      ))}
    </div>
  );
}

const nodeTypes = {lane: Lane, point: Point};
const center = (lane: number) => lane * LANE_GAP + LANE_W / 2 - 1;

const nodes: Node[] = [
  ...lanes.map((data, i) => ({
    id: `lane-${i}`,
    type: "lane",
    position: {x: i * LANE_GAP, y: 0},
    data,
    draggable: false,
    selectable: false,
  })),
  ...messages.flatMap(([from, to], row) =>
    [from, to].map((lane, k) => ({
      id: `p-${row}-${k}`,
      type: "point",
      position: {x: center(lane), y: TOP + row * ROW_GAP},
      data: {},
      draggable: false,
      selectable: false,
    })),
  ),
];

const edges: Edge[] = messages.map(([from, to, text, reply], row) => {
  const right = to > from;
  return {
    id: `m-${row}`,
    type: "step",
    source: `p-${row}-0`,
    target: `p-${row}-1`,
    sourceHandle: right ? "s-right" : "s-left",
    targetHandle: right ? "t-left" : "t-right",
    data: {step: row + 1, text, straight: true, blue: reply},
    markerEnd: {type: MarkerType.ArrowClosed, width: 16, height: 16},
    style: reply ? {stroke: "var(--o-blue)", strokeWidth: 1.5, strokeDasharray: "6 4"} : {stroke: "#f77d1a", strokeWidth: 1.5},
  };
});

export default function Sequence(): React.JSX.Element {
  const {colorMode} = useColorMode();
  return (
    <div className={`${styles.canvas} ${styles.frame}`} style={{height: height + 110}}>
      <Title title="A card payment, step by step" sub="Orange = request · blue dashed = reply" />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={colorMode}
        fitView
        fitViewOptions={{padding: {top: 0.04, bottom: 0.04, left: 0.04, right: 0.04}}}
        nodesConnectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        preventScrolling={false}
      />
    </div>
  );
}
