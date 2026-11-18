import React, { useMemo, useState } from "react";
import data from "@site/static/data/message-providers.json";
import type { MessageChannel, MessageProvider } from "@site/src/types/messageProvider";
import styles from "./styles.module.css";

const providers = data as MessageProvider[];

const INTERNATIONAL = "International providers";
const OTHER = "Other providers";

interface Group {
  label: string;
  items: MessageProvider[];
}

// Country groups in A-Z order, then the international providers, then any
// provider whose country is not established.
function groupByCountry(list: MessageProvider[]): Group[] {
  const byCountry = new Map<string, MessageProvider[]>();
  const international: MessageProvider[] = [];
  const other: MessageProvider[] = [];
  for (const p of list) {
    for (const c of p.countries) {
      byCountry.set(c, [...(byCountry.get(c) ?? []), p]);
    }
    if (p.international) international.push(p);
    if (p.countries.length === 0 && !p.international) other.push(p);
  }
  const groups: Group[] = [...byCountry.keys()]
    .sort((a, b) => a.localeCompare(b))
    .map((label) => ({ label, items: byCountry.get(label)! }));
  if (international.length) groups.push({ label: INTERNATIONAL, items: international });
  if (other.length) groups.push({ label: OTHER, items: other });
  return groups;
}

function title(group: string, channel: string): string {
  if (group === INTERNATIONAL) return `International ${channel} providers`;
  if (group === OTHER) return `Other ${channel} providers`;
  return `${channel} providers in ${group}`;
}

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The SMS or WhatsApp providers Ottu integrates, grouped by country. All of
 * it is rendered as ordinary headings and lists, so search and the docs MCP
 * read every name with its country. The search box and the country filter
 * only hide entries.
 */
export default function ProviderCatalog({ channel }: { channel: MessageChannel }): React.ReactElement {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");

  const all = useMemo(() => providers.filter((p) => p.channel === channel), [channel]);
  const countries = useMemo(
    () => [...new Set(all.flatMap((p) => p.countries))].sort((a, b) => a.localeCompare(b)),
    [all],
  );

  const q = query.trim().toLowerCase();
  const matching = all.filter((p) => !q || p.name.toLowerCase().includes(q));
  // A chosen country shows its own providers and the international ones.
  const groups = groupByCountry(matching).filter(
    (g) => !country || g.label === country || g.label === INTERNATIONAL,
  );
  const shown = new Set(groups.flatMap((g) => g.items.map((p) => p.slug))).size;
  const label = channel === "sms" ? "SMS" : "WhatsApp";

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <input
          type="search"
          className={styles.search}
          placeholder={`Search ${label} providers`}
          aria-label={`Search ${label} providers`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={styles.select}
          aria-label="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className={styles.count} aria-live="polite">
          {`${shown} of ${all.length} providers`}
        </span>
      </div>

      {groups.length === 0 && (
        <p className={styles.empty}>
          No provider matches.{" "}
          <button
            type="button"
            className={styles.reset}
            onClick={() => {
              setQuery("");
              setCountry("");
            }}
          >
            Show all providers
          </button>
        </p>
      )}

      {groups.map((group) => (
        <section key={group.label} className={styles.group}>
          <h3 className={styles.groupTitle}>{title(group.label, label)}</h3>
          <ul className={styles.grid}>
            {group.items.map((p) => (
              <li key={p.slug} className={styles.card}>
                <span className={styles.name}>{p.name}</span>
                {/* the hidden separators keep the plain-text version readable */}
                <span className={styles.hidden}>{p.website ? " (" : ". "}</span>
                {p.website && (
                  <a className={styles.site} href={p.website} target="_blank" rel="noopener noreferrer">
                    {host(p.website)}
                  </a>
                )}
                {p.website && <span className={styles.hidden}>{"). "}</span>}
                <span className={styles.need}>{`You need: ${p.credentials.join(", ")}.`}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
