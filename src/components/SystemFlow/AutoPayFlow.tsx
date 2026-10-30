import React from "react";
import {useColorMode} from "@docusaurus/theme-common";
import {Background, BackgroundVariant, Controls, MarkerType, ReactFlow, type Edge, type Node} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  mdiAccount,
  mdiAccountCogOutline,
  mdiCalendarSync,
  mdiCreditCardCheckOutline,
  mdiRepeat,
  mdiServer,
} from "@mdi/js";
import {Title, edgeTypes, nodeTypes} from "./parts";
import styles from "./styles.module.css";

// The AutoPay "Workflow" on /developers/payments/autopay, redrawn with React Flow.
// Same public surface as AutoPayFlowDiagram: only what a merchant calls and sees.
const nodes: Node[] = [
  {id: "merchant", type: "card", position: {x: 0, y: 0}, data: {title: "Merchant backend", sub: "Your server", icon: mdiServer}},
  {id: "customer", type: "card", position: {x: 480, y: 0}, data: {title: "Customer", sub: "Your subscriber", icon: mdiAccount}},
  {id: "checkout", type: "card", position: {x: 480, y: 130}, data: {title: "Checkout page", sub: "Ottu-hosted or SDK embed", icon: mdiCreditCardCheckOutline}},

  {id: "platform", type: "group", position: {x: -20, y: 260}, data: {label: "HANDLED BY OTTU"}, style: {width: 730, height: 240}, draggable: false, selectable: false},
  {id: "subscription", type: "card", parentId: "platform", extent: "parent", position: {x: 260, y: 35}, data: {title: "Subscription", sub: "Created by your checkout call", icon: mdiRepeat, variant: "accent"}},
  {id: "billing", type: "card", parentId: "platform", extent: "parent", position: {x: 20, y: 160}, data: {title: "Every cycle", sub: "Charge · retries · emails", icon: mdiCalendarSync}},
  {id: "portal", type: "card", parentId: "platform", extent: "parent", position: {x: 500, y: 160}, data: {title: "Self-service page", sub: "Cards · history · cancel", icon: mdiAccountCogOutline, variant: "success"}},
];

const arrow = {markerEnd: {type: MarkerType.ArrowClosed, width: 16, height: 16}};
const main = {stroke: "#f77d1a", strokeWidth: 1.5};

const edges: Edge[] = [
  {id: "e1", type: "step", source: "merchant", target: "subscription", sourceHandle: "s-bottom", targetHandle: "t-left", data: {step: 1, text: "Checkout API · auto_pay"}, style: main, ...arrow},
  {id: "e2", type: "step", source: "customer", target: "checkout", sourceHandle: "s-bottom", targetHandle: "t-top", data: {step: 2, text: "pays first charge"}, style: main, ...arrow},
  {id: "e2b", type: "step", source: "checkout", target: "subscription", sourceHandle: "s-bottom", targetHandle: "t-right", data: {text: "card saved"}, ...arrow},
  {id: "e3", type: "step", source: "subscription", target: "merchant", sourceHandle: "s-top", targetHandle: "t-right", data: {step: 3, text: "webhook · result", blue: true}, style: {stroke: "var(--o-blue)", strokeWidth: 1.5, strokeDasharray: "6 4"}, ...arrow},
  {id: "e4", type: "step", source: "subscription", target: "billing", sourceHandle: "s-bottom", targetHandle: "t-top", data: {step: 4, text: "bills each cycle"}, style: main, ...arrow},
  {id: "e5", type: "step", source: "customer", target: "portal", sourceHandle: "s-right", targetHandle: "t-right", data: {step: 5, text: "manages it"}, style: main, ...arrow},
];

export default function AutoPayFlow(): React.JSX.Element {
  const {colorMode} = useColorMode();
  return (
    <div className={`${styles.canvas} ${styles.frame}`} style={{height: 640}}>
      <Title title="AutoPay" sub="One checkout call, Ottu runs the rest" />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={colorMode}
        fitView
        fitViewOptions={{padding: {top: 0.06, bottom: 0.04, left: 0.04, right: 0.08}, maxZoom: 1}}
        nodesConnectable={false}
        zoomOnScroll={false}
        preventScrolling={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="var(--o-dot)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
