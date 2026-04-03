import React from "react";
import styles from "./styles.module.css";

export default function ApiPanel({ label, data }: { label: string; data: any }) {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return (
    <div className={styles.apiPanel}>
      <div className={styles.apiPanelHeader}>
        <span>{label}</span>
        <button className={styles.apiPanelCopy} onClick={() => navigator.clipboard?.writeText(text)}>
          Copy
        </button>
      </div>
      <div className={styles.apiPanelBody}>
        <pre>{text}</pre>
      </div>
    </div>
  );
}
