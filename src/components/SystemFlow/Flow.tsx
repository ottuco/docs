import React from "react";
import {useColorMode} from "@docusaurus/theme-common";
import {Background, BackgroundVariant, Controls, MarkerType, ReactFlow, type Edge, type Node} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  mdiAccount,
  mdiApi,
  mdiBankTransfer,
  mdiCreditCardOutline,
  mdiMonitorCellphone,
  mdiServer,
  mdiSourceBranch,
  mdiWebhook,
} from "@mdi/js";
import {Title, edgeTypes, nodeTypes} from "./parts";
import styles from "./styles.module.css";

// Same content as the public ArchitectureDiagram (docs/overview/architecture),
// redrawn with React Flow to compare.
const nodes: Node[] = [
  {id: "backend", type: "card", position: {x: 0, y: 0}, data: {title: "Merchant backend", sub: "Your server", icon: mdiServer}},
  {id: "frontend", type: "card", position: {x: 240, y: 0}, data: {title: "Merchant frontend", sub: "Website or mobile app", icon: mdiMonitorCellphone}},
  {id: "customer", type: "card", position: {x: 480, y: 0}, data: {title: "Customer", sub: "Pays on your site or app", icon: mdiAccount}},

  {id: "platform", type: "group", position: {x: -20, y: 130}, data: {label: "OTTU PLATFORM"}, style: {width: 730, height: 250}, draggable: false, selectable: false},
  {id: "api", type: "card", parentId: "platform", extent: "parent", position: {x: 20, y: 40}, data: {title: "REST API", sub: "Api-Key · Basic auth", icon: mdiApi}},
  {id: "sdk", type: "card", parentId: "platform", extent: "parent", position: {x: 500, y: 40}, data: {title: "Checkout SDK", sub: "Web · iOS · Android · Flutter", icon: mdiCreditCardOutline}},
  {id: "engine", type: "card", parentId: "platform", extent: "parent", position: {x: 260, y: 160}, data: {title: "Orchestration", sub: "Smart routing · failover", icon: mdiSourceBranch, variant: "accent"}},
  {id: "webhooks", type: "card", parentId: "platform", extent: "parent", position: {x: 20, y: 160}, data: {title: "Webhooks", sub: "HMAC-signed events", icon: mdiWebhook, variant: "info"}},

  {id: "gateway", type: "card", position: {x: 240, y: 440}, data: {title: "Payment gateways", sub: "KNET · MPGS · Cybersource · +40", icon: mdiBankTransfer, variant: "success"}},
];

const arrow = {markerEnd: {type: MarkerType.ArrowClosed, width: 16, height: 16}};
const main = {stroke: "#f77d1a", strokeWidth: 1.5};

const edges: Edge[] = [
  {id: "e1", type: "step", source: "backend", target: "api", sourceHandle: "s-bottom", targetHandle: "t-top", data: {step: 1, text: "creates a payment"}, style: main, ...arrow},
  {id: "e2", type: "step", source: "frontend", target: "sdk", sourceHandle: "s-bottom", targetHandle: "t-left", data: {step: 2, text: "embeds the SDK", dy: 22}, ...arrow},
  {id: "e3", type: "step", source: "customer", target: "sdk", sourceHandle: "s-bottom", targetHandle: "t-top", data: {step: 3, text: "enters card"}, style: main, ...arrow},
  {id: "e4", type: "step", source: "sdk", target: "engine", sourceHandle: "s-bottom", targetHandle: "t-right", data: {step: 4, text: "submits"}, style: main, ...arrow},
  {id: "e4b", type: "step", source: "api", target: "engine", sourceHandle: "s-right", targetHandle: "t-top", ...arrow},
  {id: "e5", type: "step", source: "engine", target: "gateway", sourceHandle: "s-bottom", targetHandle: "t-top", data: {step: 5, text: "routes & charges"}, style: main, ...arrow},
  {id: "e6a", type: "step", source: "engine", target: "webhooks", sourceHandle: "s-left", targetHandle: "t-right", style: {stroke: "var(--o-blue)", strokeWidth: 1.5, strokeDasharray: "6 4"}, ...arrow},
  {id: "e6", type: "step", source: "webhooks", target: "backend", sourceHandle: "s-left", targetHandle: "t-left", data: {step: 6, text: "signed result", dy: 55, blue: true}, style: {stroke: "var(--o-blue)", strokeWidth: 1.5, strokeDasharray: "6 4"}, ...arrow},
];

export default function Flow(): React.JSX.Element {
  const {colorMode} = useColorMode();
  return (
    <div className={`${styles.canvas} ${styles.frame}`} style={{height: 600}}>
      <Title title="Ottu platform" sub="How a payment moves through Ottu" />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        colorMode={colorMode}
        fitView
        fitViewOptions={{padding: {top: 0.06, bottom: 0.04, left: 0.08, right: 0.04}, maxZoom: 1}}
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
