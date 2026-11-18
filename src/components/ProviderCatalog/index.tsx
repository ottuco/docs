import React, { useMemo, useState } from "react";
import data from "@site/static/data/message-providers.json";
import type { MessageChannel, MessageProvider } from "@site/src/types/messageProvider";
import styles from "./styles.module.css";

const providers = (data as MessageProvider[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

const CHANNEL_LABEL: Record<MessageChannel, string> = { sms: "SMS", whatsapp: "WhatsApp" };
const CHANNELS: MessageChannel[] = ["sms", "whatsapp"];

const countries = [...new Set(providers.flatMap((p) => p.countries))].sort((a, b) => a.localeCompare(b));

function where(p: MessageProvider): string {
  return [...p.countries, ...(p.international ? ["International"] : [])].join(", ");
}

// What the search box looks in: name, channels and countries.
function haystack(p: MessageProvider): string {
  return [p.name, ...p.channels.map((c) => CHANNEL_LABEL[c]), where(p)].join(" ").toLowerCase();
}

/**
 * The SMS and WhatsApp providers Ottu integrates, as one grid. Every card is
 * ordinary text in the page, so search and the docs MCP read each provider
 * with its channels and country. The controls only hide cards.
 */
export default function ProviderCatalog(): React.ReactElement {
  const [channel, setChannel] = useState<MessageChannel | "">("");
  const [country, setCountry] = useState("");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const shown = useMemo(
    () =>
      providers.filter(
        (p) =>
          (!channel || p.channels.includes(channel)) &&
          // a chosen country shows its own providers and the international ones
          (!country || p.countries.includes(country) || p.international) &&
          (!q || haystack(p).includes(q)),
      ),
    [channel, country, q],
  );

  const tabs: { value: MessageChannel | ""; label: string; count: number }[] = [
    { value: "", label: "All", count: providers.length },
    ...CHANNELS.map((c) => ({
      value: c,
      label: CHANNEL_LABEL[c],
      count: providers.filter((p) => p.channels.includes(c)).length,
    })),
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <div className={styles.tabs} role="group" aria-label="Channel">
          {tabs.map((t) => (
            <button
              key={t.label}
              type="button"
              className={t.value === channel ? styles.tabOn : styles.tab}
              aria-pressed={t.value === channel}
              onClick={() => setChannel(t.value)}
            >
              {t.label} <span className={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>
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
        <input
          type="search"
          className={styles.search}
          placeholder="Search providers"
          aria-label="Search providers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {shown.length === 0 ? (
        <p className={styles.empty}>
          No provider matches.{" "}
          <button
            type="button"
            className={styles.reset}
            onClick={() => {
              setChannel("");
              setCountry("");
              setQuery("");
            }}
          >
            Show all providers
          </button>
        </p>
      ) : (
        <ul className={styles.grid}>
          {shown.map((p) => (
            <li key={p.slug} className={styles.card}>
              <span className={styles.head}>
                {p.website ? (
                  <a className={styles.name} href={p.website} target="_blank" rel="noopener noreferrer">
                    {p.name}
                  </a>
                ) : (
                  <span className={styles.name}>{p.name}</span>
                )}
                {/* Not dead markup: the hidden separators are what make the page's
                    plain text, as the docs MCP and search read it, come out as
                    "Taqnyat. SMS. Saudi Arabia." Do not remove them. */}
                <span className={styles.hidden}>{". "}</span>
                <span className={styles.tags}>
                  {p.channels.map((c, i) => (
                    <React.Fragment key={c}>
                      {i > 0 && <span className={styles.hidden}>{", "}</span>}
                      <span className={styles.tag} data-channel={c}>
                        {CHANNEL_LABEL[c]}
                      </span>
                    </React.Fragment>
                  ))}
                </span>
              </span>
              {where(p) && (
                <>
                  <span className={styles.hidden}>{". "}</span>
                  <span className={styles.where}>{where(p)}</span>
                  <span className={styles.hidden}>.</span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
