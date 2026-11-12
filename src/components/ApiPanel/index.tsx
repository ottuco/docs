import React from "react";
import styles from "./styles.module.css";

export default function ApiPanel({
  label,
  data,
  maxHeight,
  className,
}: {
  label: string;
  data: any;
  /** Overrides the body's default max height (a CSS length). */
  maxHeight?: string;
  /** Extra class on the root, e.g. to drop the border inside another box. */
  className?: string;
}) {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return (
    <div
      className={
        className ? `${styles.apiPanel} ${className}` : styles.apiPanel
      }
    >
      <div className={styles.apiPanelHeader}>
        <span>{label}</span>
        <button
          className={styles.apiPanelCopy}
          onClick={() => navigator.clipboard?.writeText(text)}
        >
          Copy
        </button>
      </div>
      <div
        className={styles.apiPanelBody}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <pre>{text}</pre>
      </div>
    </div>
  );
}
