// Native payments: the client's result reaches the backend, which can confirm with an inquiry.
// Usage in MDX:  import NativePaymentResultFlow from "@site/src/diagrams/flow/NativePaymentResultFlow";  <NativePaymentResultFlow />
import React from "react";
import { mdiAccount, mdiFileDocumentEditOutline, mdiMagnify, mdiServer, mdiShieldCheckOutline } from "@mdi/js";
import { FlowDiagram, type FlowArrow, type FlowCard } from "@site/src/components/FlowDiagram";

const cards: FlowCard[] = [
  { id: "client", x: 0, y: 55, title: "Client", sub: "Your app", icon: mdiAccount },
  { id: "ottu", x: 270, y: 55, title: "Ottu", sub: "Checks the response", icon: mdiShieldCheckOutline, tone: "accent" },
  { id: "backend", x: 540, y: 0, title: "Backend", sub: "Your server", icon: mdiServer },
  { id: "log", x: 540, y: 125, title: "Log", sub: "Keep the failure", icon: mdiFileDocumentEditOutline },
  { id: "inquiry", x: 810, y: 0, title: "Inquiry", sub: "Payment Status Query", icon: mdiMagnify },
];
const arrows: FlowArrow[] = [
  { from: "client", to: "ottu" },
  { from: "ottu", to: "backend", label: "OK" },
  { from: "ottu", to: "log", label: "Not OK" },
  { from: "backend", to: "inquiry" },
];

export default function NativePaymentResultFlow(): React.JSX.Element {
  return <FlowDiagram title="Native payment result" sub="The backend confirms with an inquiry" cards={cards} arrows={arrows} height={290} />;
}
