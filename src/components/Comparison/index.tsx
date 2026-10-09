import React from "react";
import styles from "./styles.module.css";

export interface ComparisonRow {
  /** Plain-text benefit, 2-5 words. */
  label: string;
  /** Does the product (first column) do it? */
  withOk: boolean;
  /** Does the build-it-yourself route do it? */
  withoutOk: boolean;
}

export interface ComparisonProps {
  rows: ComparisonRow[];
  withTitle?: string;
  withoutTitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

function Mark({ok}: {ok: boolean}) {
  return (
    <svg
      className={ok ? styles.yes : styles.no}
      viewBox="0 0 24 24"
      width="22"
      height="22"
      role="img"
      aria-label={ok ? "Yes" : "No"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ok ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M6 6l12 12M18 6L6 18" />}
    </svg>
  );
}

/** Small centered uppercase label above a section heading. */
export function ComparisonEyebrow({children}: {children: React.ReactNode}): React.JSX.Element {
  return <p className={styles.eyebrow}>{children}</p>;
}

/** Centered grey line under the section heading. */
export function ComparisonSubtitle({children}: {children: React.ReactNode}): React.JSX.Element {
  return <p className={styles.subtitle}>{children}</p>;
}

/** Icon-only comparison: the product column first, a highlighted column, one row per benefit. */
export default function Comparison({
  rows,
  withTitle = "With AutoPay",
  withoutTitle = "Build it yourself",
  ctaLabel = "Set up AutoPay",
  ctaHref = "#setting-up-autopay",
}: ComparisonProps): React.JSX.Element {
  return (
    <div className={styles.table} role="table">
      <div className={styles.row} role="row">
        <div className={styles.label} role="columnheader" />
        <div className={`${styles.head} ${styles.tint}`} role="columnheader">
          <span className={styles.headName}>{withTitle}</span>
          <a className={styles.cta} href={ctaHref}>{ctaLabel}</a>
        </div>
        <div className={styles.head} role="columnheader">
          <span className={styles.headName}>{withoutTitle}</span>
        </div>
      </div>
      {rows.map((r) => (
        <div className={styles.row} role="row" key={r.label}>
          <div className={styles.label} role="rowheader">{r.label}</div>
          <div className={`${styles.cell} ${styles.tint}`} role="cell"><Mark ok={r.withOk} /></div>
          <div className={styles.cell} role="cell"><Mark ok={r.withoutOk} /></div>
        </div>
      ))}
    </div>
  );
}
