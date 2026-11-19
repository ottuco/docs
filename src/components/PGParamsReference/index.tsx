// Every PG param as an entry, grouped by category: the name (a linkable
// heading, id `pg-param-<name>`), then its description, example and notes.
// Data: static/data/pg-params.json. Landing on `#pg-param-<name>` highlights
// that entry.
//
// Usage in MDX:
//   import PGParamsReference from "@site/src/components/PGParamsReference";
//   <PGParamsReference />
import React, { useEffect, useState } from "react";
import Heading from "@theme/Heading";
import paramsData from "@site/static/data/pg-params.json";
import type { PGParam, PGParamCategory } from "@site/src/types/pg-param";
import styles from "./styles.module.css";

const params = paramsData as PGParam[];

const CATEGORY_LABELS: Record<PGParamCategory, string> = {
  card: "Card Information",
  identifier: "Transaction Identifiers",
  status: "Transaction Status",
  dcc: "Currency Conversion",
};

const CATEGORY_ORDER: PGParamCategory[] = ["card", "identifier", "status", "dcc"];

const PREFIX = "pg-param-";
const anchorId = (name: string): string => `${PREFIX}${name}`;

/** The param named by the URL hash, if any. */
function hashedParam(): string | null {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  return hash.startsWith(PREFIX) ? hash.slice(PREFIX.length) : null;
}

export default function PGParamsReference(): React.JSX.Element {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  // Deep link: highlight the entry the URL points at, on load and on every
  // hash change (a click on an entry's link icon included).
  useEffect(() => {
    const update = () => setHighlighted(hashedParam());
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return (
    <div className={styles.reference}>
      {CATEGORY_ORDER.map((cat) => {
        const inCategory = params.filter((p) => p.category === cat);
        if (inCategory.length === 0) return null;
        return (
          <section key={cat}>
            <Heading as="h3" id={`pg-params-${cat}`}>
              {CATEGORY_LABELS[cat]}
            </Heading>
            {inCategory.map((p) => (
              <div
                key={p.name}
                className={`${styles.entry} ${highlighted === p.name ? styles.highlighted : ""}`}
              >
                <Heading as="h4" id={anchorId(p.name)} className={styles.name}>
                  <code>{p.name}</code>
                </Heading>
                <p>{p.description}</p>
                {p.example && (
                  <p className={styles.line}>
                    Example: <code>{p.example}</code>
                  </p>
                )}
                {p.notes && <p className={styles.line}>{p.notes}</p>}
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
