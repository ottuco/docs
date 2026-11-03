import type { ReactNode } from "react";

/** Visual emphasis of a node. Keep to the docs' "monochrome + one accent" rule. */
export type FlowNodeVariant = "default" | "accent" | "danger";

export interface FlowNode {
  /** Unique id. Edges refer to nodes by this id. */
  id: string;
  /** Short text shown on the node itself. */
  label: string;
  /** Small line above the label, e.g. the actor: "You", "Your customer", "Ottu". */
  kicker?: string;
  /** Badge shown on the node, e.g. a step number. */
  badge?: string | number;
  /** Panel heading. Defaults to `label`. */
  title?: string;
  /** What this node does, shown in the side panel and in the text fallback. */
  description: ReactNode;
  /** Link shown in the panel, e.g. "#subscription-states" or "/developers/...". */
  href?: string;
  /** Text of the panel link. Defaults to "Read more". */
  linkLabel?: string;
  /**
   * Top-left corner in px. Omit on every node to lay them out automatically in
   * array order along `direction`; set it on every node for a custom layout
   * (state machines, branches).
   */
  position?: { x: number; y: number };
  variant?: FlowNodeVariant;
}

export interface FlowEdge {
  /** Defaults to `${source}-${target}`. */
  id?: string;
  source: string;
  target: string;
  /** Short text drawn on the edge, e.g. "payment fails". */
  label?: string;
  /** Dashed line, for asynchronous or optional transitions. */
  dashed?: boolean;
}

export interface FlowDiagramProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  /** Accessible name of the diagram, e.g. "AutoPay workflow". */
  title: string;
  /** Auto-layout direction when nodes carry no `position`. Default "vertical". */
  direction?: "vertical" | "horizontal";
  /** Canvas height in px. Defaults to the height of the laid-out nodes. */
  height?: number;
  /** Node selected on first render. Default: none (the panel shows a hint). */
  defaultSelectedId?: string;
  /** Panel text before anything is selected. */
  hint?: string;
  /** Optional caption under the diagram. */
  caption?: ReactNode;
}
