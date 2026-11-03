import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import Link from "@docusaurus/Link";
import type { FlowDiagramProps } from "./types";
import styles from "./styles.module.css";

export type { FlowDiagramProps, FlowNode, FlowEdge, FlowNodeVariant } from "./types";

/**
 * Interactive node-and-edge diagram. Pages pass plain data (`nodes`, `edges`);
 * clicking a node opens a panel with what it does and an optional link.
 *
 * React Flow measures the DOM, so it only renders in the browser. The server
 * build (and a reader without JavaScript) gets the same nodes as a plain list.
 */
export default function FlowDiagram(props: FlowDiagramProps): React.JSX.Element {
  return (
    <BrowserOnly fallback={<FlowDiagramFallback {...props} />}>
      {() => {
        const FlowDiagramInner = require("./FlowDiagramInner").default;
        return <FlowDiagramInner {...props} />;
      }}
    </BrowserOnly>
  );
}

function FlowDiagramFallback({ nodes, title, caption }: FlowDiagramProps): React.JSX.Element {
  return (
    <figure className={styles.root} aria-label={title}>
      <ol className={styles.fallbackList}>
        {nodes.map((node) => (
          <li key={node.id}>
            <strong>{node.title ?? node.label}</strong>
            {node.kicker ? <span className={styles.fallbackKicker}> ({node.kicker})</span> : null}
            <div>{node.description}</div>
            {node.href ? <Link to={node.href}>{node.linkLabel ?? "Read more"}</Link> : null}
          </li>
        ))}
      </ol>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
