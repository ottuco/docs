// The box at the top of an API Reference, Stripe style: a box of shortcuts
// with two tabs, every endpoint the page shows (each links to its section)
// and the webhook events. On desktop it floats in the right half and the intro
// (and the text after it) runs down the left; narrower, it sits above the
// intro.
//
// Usage in MDX, around the intro:
//   <ApiShortcuts events={autopayEvents} eventsNote={AUTOPAY_EVENTS_NOTE}>
//   Intro paragraphs…
//   </ApiShortcuts>
// `endpoints` is filled in by src/remark/apiReferenceData.ts from the page's
// <ApiReference>s (labels from their <TabItem>s): never write it by hand.
import React, { useState } from "react";
import Link from "@docusaurus/Link";
import Icon from "@mdi/react";
import { mdiChevronRight } from "@mdi/js";
import { endpointOf, type ApiSlug, type GeneratedPage } from "./sources";
import styles from "./styles.module.css";
// The GET / POST badge looks the same as in the reference and the run panel.
import runStyles from "@site/src/components/ApiExecute/styles.module.css";

export type ShortcutEndpoint = {
  api: ApiSlug;
  run?: string;
  /** The label of the tab it sits in. */
  label?: string;
  source: GeneratedPage;
};

export type ShortcutEvent = {
  /** The event name, e.g. `payment.paid`. */
  name: string;
  /** What it means here, in one line. */
  meaning: string;
  /** Where it is documented. */
  href?: string;
};

type Tab = "endpoints" | "events";

export default function ApiShortcuts({
  endpoints = [],
  events = [],
  eventsNote,
  children,
}: {
  endpoints?: ShortcutEndpoint[];
  events?: ShortcutEvent[];
  /** One line under the events, e.g. what sends none. */
  eventsNote?: string;
  children?: React.ReactNode;
}): React.JSX.Element {
  const [tab, setTab] = useState<Tab>("endpoints");
  const tabs: [Tab, string][] = [
    ["endpoints", "Endpoints"],
    ...(events.length > 0 ? [["events", "Events"] as [Tab, string]] : []),
  ];

  return (
    <>
      <nav
        className={`${styles.shortcutsBox} float-beside`}
        aria-label="API shortcuts"
      >
        {/* Toggle buttons, not ARIA tabs: no tabpanel or arrow keys here. */}
        <div className={styles.shortcutsTabs} role="group" aria-label="Show">
          {tabs.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={tab === value}
              className={styles.shortcutsTab}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "endpoints" ? (
          <ul className={styles.shortcutsList}>
            {endpoints.map(({ api, run, label, source }) => {
              const { method, path } = endpointOf(source).operation;
              const verb = method.toUpperCase();
              return (
                <li key={run ?? api}>
                  {/* The anchor ApiReference gives the endpoint: following it
                      opens its tab and scrolls to it. */}
                  <Link to={`#${run ?? api}-api`} className={styles.shortcut}>
                    <span className={styles.shortcutText}>
                      <span className={styles.shortcutTitle}>
                        {label ?? source.title ?? api}
                      </span>
                      <span className={styles.shortcutPath}>
                        <span
                          className={runStyles.method}
                          data-method={verb}
                        >
                          {verb}
                        </span>
                        <code>{path}</code>
                      </span>
                    </span>
                    <Icon path={mdiChevronRight} size={0.7} />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className={styles.shortcutsList}>
            {eventsNote && <li className={styles.eventsNote}>{eventsNote}</li>}
            {events.map(({ name, meaning, href }) => (
              <li key={name} className={styles.event}>
                {href ? (
                  <Link to={href} className={styles.eventName}>
                    <code>{name}</code>
                  </Link>
                ) : (
                  <code className={styles.eventName}>{name}</code>
                )}
                <span className={styles.eventMeaning}>{meaning}</span>
              </li>
            ))}
          </ul>
        )}
      </nav>
      {children}
    </>
  );
}
