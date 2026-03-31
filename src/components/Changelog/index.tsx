import React, { useMemo } from "react";
import styles from "./styles.module.css";

export interface ChangelogEntry {
  date: string;
  category:
    | "api"
    | "dashboard"
    | "sdk"
    | "payments"
    | "security"
    | "infrastructure";
  title: string;
  description?: string;
  link?: string;
  breaking?: boolean;
}

interface ChangelogProps {
  entries: ChangelogEntry[];
}

const CATEGORY_LABELS: Record<ChangelogEntry["category"], string> = {
  api: "API",
  dashboard: "Dashboard",
  sdk: "SDK",
  payments: "Payments",
  security: "Security",
  infrastructure: "Infrastructure",
};

function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByMonth(
  entries: ChangelogEntry[]
): [string, ChangelogEntry[]][] {
  const groups = new Map<string, ChangelogEntry[]>();
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  for (const entry of sorted) {
    const key = entry.date.slice(0, 7); // "2026-03"
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }
  return Array.from(groups.entries());
}

function EntryRow({ entry }: { entry: ChangelogEntry }) {
  const title = entry.link ? (
    <a href={entry.link} className={styles.entryLink}>
      {entry.title}
    </a>
  ) : (
    <span>{entry.title}</span>
  );

  return (
    <div className={styles.entry}>
      <div className={styles.entryMeta}>
        <span
          className={`${styles.badge} ${styles[`badge_${entry.category}`]}`}
        >
          {CATEGORY_LABELS[entry.category]}
        </span>
        {entry.breaking && (
          <span className={styles.breakingBadge}>Breaking</span>
        )}
      </div>
      <div className={styles.entryContent}>
        <p className={styles.entryTitle}>{title}</p>
        {entry.description && (
          <p className={styles.entryDescription}>{entry.description}</p>
        )}
      </div>
      <time className={styles.entryDate} dateTime={entry.date}>
        {formatDay(entry.date)}
      </time>
    </div>
  );
}

export default function Changelog({ entries }: ChangelogProps) {
  const grouped = useMemo(() => groupByMonth(entries), [entries]);

  return (
    <div className={styles.changelog}>
      {grouped.map(([monthKey, monthEntries]) => (
        <section key={monthKey} className={styles.monthSection}>
          <h2 className={styles.monthHeader}>
            {formatMonthYear(monthEntries[0].date)}
          </h2>
          <div className={styles.entriesList}>
            {monthEntries.map((entry, i) => (
              <EntryRow key={`${entry.date}-${i}`} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
