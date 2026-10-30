import React from "react";
import Icon from "@mdi/react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  Position,
  getSmoothStepPath,
  getStraightPath,
  type EdgeProps,
  type NodeProps,
} from "@xyflow/react";
import styles from "./styles.module.css";

export type CardData = {
  title: string;
  sub?: string;
  icon?: string;
  variant?: "accent" | "success" | "info";
  num?: number;
  width?: number;
};

const sides = [Position.Top, Position.Right, Position.Bottom, Position.Left];

// Every card gets a source + target handle on each side so edges can pick the
// cleanest side; the handles themselves stay invisible.
function Handles(): React.JSX.Element {
  return (
    <>
      {sides.map((p) => (
        <React.Fragment key={p}>
          <Handle type="source" position={p} id={`s-${p}`} className={styles.handle} />
          <Handle type="target" position={p} id={`t-${p}`} className={styles.handle} />
        </React.Fragment>
      ))}
    </>
  );
}

export function CardNode({data}: NodeProps): React.JSX.Element {
  const d = data as CardData;
  const cls = [styles.node, d.variant ? styles[d.variant] : ""].join(" ");
  return (
    <div className={cls} style={d.width ? {width: d.width} : undefined}>
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
}

export function GroupNode({data}: NodeProps): React.JSX.Element {
  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>{(data as {label: string}).label}</span>
    </div>
  );
}

export type StepData = {step?: number; text?: string; straight?: boolean; dx?: number; dy?: number; blue?: boolean};

// Edge with a numbered pill label, so the reader can follow the order.
export function StepEdge(props: EdgeProps): React.JSX.Element {
  const d = (props.data ?? {}) as StepData;
  const [path, x, y] = d.straight
    ? getStraightPath(props)
    : getSmoothStepPath({...props, borderRadius: 12});
  return (
    <>
      <BaseEdge id={props.id} path={path} markerEnd={props.markerEnd} style={props.style} />
      {d.text ? (
        <EdgeLabelRenderer>
          <div
            className={`${styles.step} nodrag nopan`}
            data-edge={props.id}
            style={{position: "absolute", transform: `translate(-50%, -50%) translate(${x + (d.dx ?? 0)}px, ${y + (d.dy ?? 0)}px)`}}
          >
            {d.step ? <span className={`${styles.stepNum} ${d.blue ? styles.stepBlue : ""}`}>{d.step}</span> : null}
            {d.text}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export function Title({title, sub}: {title: string; sub: string}): React.JSX.Element {
  return (
    <div className={styles.title}>
      {title}
      <span>{sub}</span>
    </div>
  );
}

export const nodeTypes = {card: CardNode, group: GroupNode};
export const edgeTypes = {step: StepEdge};
