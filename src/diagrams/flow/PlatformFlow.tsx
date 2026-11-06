// Reference free-layout diagram: the Ottu platform, same content as
// ArchitectureDiagram on /overview/architecture/.
import React from "react";
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
import {
  FlowDiagram,
  type FlowArrow,
  type FlowCard,
  type FlowGroup,
} from "@site/src/components/FlowDiagram";

const groups: FlowGroup[] = [
  {
    id: "platform",
    x: -20,
    y: 130,
    width: 730,
    height: 250,
    label: "OTTU PLATFORM",
  },
];

const cards: FlowCard[] = [
  {
    id: "backend",
    x: 0,
    y: 0,
    title: "Merchant backend",
    sub: "Your server",
    icon: mdiServer,
  },
  {
    id: "frontend",
    x: 240,
    y: 0,
    title: "Merchant frontend",
    sub: "Website or mobile app",
    icon: mdiMonitorCellphone,
  },
  {
    id: "customer",
    x: 480,
    y: 0,
    title: "Customer",
    sub: "Pays on your site or app",
    icon: mdiAccount,
  },
  {
    id: "api",
    parent: "platform",
    x: 20,
    y: 40,
    title: "REST API",
    sub: "Api-Key · Basic auth",
    icon: mdiApi,
  },
  {
    id: "sdk",
    parent: "platform",
    x: 500,
    y: 40,
    title: "Checkout SDK",
    sub: "Web · iOS · Android · Flutter",
    icon: mdiCreditCardOutline,
  },
  {
    id: "engine",
    parent: "platform",
    x: 260,
    y: 160,
    title: "Orchestration",
    sub: "Smart routing · failover",
    icon: mdiSourceBranch,
    tone: "accent",
  },
  {
    id: "webhooks",
    parent: "platform",
    x: 20,
    y: 160,
    title: "Webhooks",
    sub: "HMAC-signed events",
    icon: mdiWebhook,
    tone: "info",
  },
  {
    id: "gateway",
    x: 240,
    y: 440,
    title: "Payment gateways",
    sub: "KNET · MPGS · Cybersource · +40",
    icon: mdiBankTransfer,
    tone: "success",
  },
];

const arrows: FlowArrow[] = [
  {
    from: "backend",
    to: "api",
    step: 1,
    label: "creates a payment",
    dy: -22,
  },
  {
    from: "frontend",
    to: "sdk",
    fromSide: "bottom",
    toSide: "left",
    step: 2,
    label: "embeds the SDK",
    kind: "plain",
    dy: 22,
  },
  { from: "customer", to: "sdk", step: 3, label: "enters card" },
  {
    from: "sdk",
    to: "engine",
    fromSide: "bottom",
    toSide: "right",
    step: 4,
    label: "submits",
  },
  {
    from: "api",
    to: "engine",
    fromSide: "bottom",
    toSide: "top",
    kind: "plain",
  },
  { from: "engine", to: "gateway", step: 5, label: "routes & charges" },
  { from: "engine", to: "webhooks", kind: "reply" },
  {
    from: "webhooks",
    to: "backend",
    fromSide: "left",
    toSide: "left",
    step: 6,
    label: "signed result",
    kind: "reply",
    dy: 78,
  },
];

export default function PlatformFlow(): React.JSX.Element {
  return (
    <FlowDiagram
      title="Ottu platform"
      sub="How a payment moves through Ottu"
      groups={groups}
      cards={cards}
      arrows={arrows}
      height={600}
    />
  );
}
