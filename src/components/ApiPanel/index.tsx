import React from "react";
import styles from "./styles.module.css";

export default function ApiPanel({
  label,
  data,
  maxHeight,
  className,
  marked,
}: {
  label: string;
  data: any;
  /** Overrides the body's default max height (a CSS length). */
  maxHeight?: string;
  /** Extra class on the root, e.g. to drop the border inside another box. */
  className?: string;
  /**
   * One flag per line of the printed data: true lines are highlighted like a
   * diff's added line (the Run dialog's extracted values).
   */
  marked?: boolean[];
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
        {marked ? (
          <pre className={styles.markedPre}>
            {text.split("\n").map((line, i) => (
              <span key={i} className={marked[i] ? styles.markedLine : undefined}>
                {line}
                {"\n"}
              </span>
            ))}
          </pre>
        ) : (
          <pre>{text}</pre>
        )}
      </div>
    </div>
  );
}
