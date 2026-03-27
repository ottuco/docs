import React, { useState, useMemo, useEffect } from "react";
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

const CATEGORY_ORDER: PGParamCategory[] = [
  "card",
  "identifier",
  "status",
  "dcc",
];

function getAnchorId(name: string): string {
  return `pg-param-${name}`;
}

export default function PGParamsReference(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    PGParamCategory | "all"
  >("all");
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  // Deep linking: on mount, check URL hash and scroll to field
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash.startsWith("pg-param-")) {
      const fieldName = hash.replace("pg-param-", "");
      const field = params.find((p) => p.name === fieldName);
      if (field) {
        setSelectedCategory("all");
        setSearch("");
        setHighlightedField(fieldName);
        // Scroll after render
        requestAnimationFrame(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
      }
    }
  }, []);

  const filtered = useMemo(() => {
    return params.filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory)
        return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q) &&
          !(p.notes || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [search, selectedCategory]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: params.length };
    for (const p of params) {
      c[p.category] = (c[p.category] || 0) + 1;
    }
    return c;
  }, []);

  function handleFieldClick(name: string) {
    const id = getAnchorId(name);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
    setHighlightedField(name);
  }

  return (
    <div className={styles.catalog}>
      {/* Filter bar */}
      <div className={styles.filters}>
        <div className={styles.categoryPills}>
          <button
            className={`${styles.pill} ${selectedCategory === "all" ? styles.pillActive : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            All <span className={styles.pillCount}>{counts.all}</span>
          </button>
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              className={`${styles.pill} ${selectedCategory === cat ? styles.pillActive : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}{" "}
              <span className={styles.pillCount}>{counts[cat] || 0}</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search fields — try &quot;card&quot;, &quot;transaction&quot;, &quot;rrn&quot;..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Results count */}
      <div className={styles.resultCount}>
        {filtered.length} field{filtered.length !== 1 ? "s" : ""}
      </div>

      {/* Table view (desktop) */}
      {filtered.length > 0 ? (
        <>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Field</th>
                <th>Category</th>
                <th>Description</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.name}
                  id={getAnchorId(p.name)}
                  className={`${styles.tableRow} ${highlightedField === p.name ? styles.highlighted : ""}`}
                >
                  <td className={styles.fieldNameCell}>
                    <a
                      href={`#${getAnchorId(p.name)}`}
                      className={styles.fieldName}
                      onClick={(e) => {
                        e.preventDefault();
                        handleFieldClick(p.name);
                      }}
                    >
                      {p.name}
                      <span className={styles.linkIcon}>#</span>
                    </a>
                  </td>
                  <td>
                    <span
                      className={`${styles.categoryBadge} ${styles[`cat_${p.category}`]}`}
                    >
                      {CATEGORY_LABELS[p.category]}
                    </span>
                  </td>
                  <td className={styles.description}>
                    {p.description}
                    {p.notes && (
                      <span className={styles.notes}>{p.notes}</span>
                    )}
                  </td>
                  <td>
                    {p.example && (
                      <span className={styles.exampleValue}>{p.example}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile card view */}
          <div className={styles.mobileCards}>
            {filtered.map((p) => (
              <div
                key={p.name}
                id={`mobile-${getAnchorId(p.name)}`}
                className={`${styles.mobileCard} ${highlightedField === p.name ? styles.highlighted : ""}`}
              >
                <div className={styles.mobileCardHeader}>
                  <a
                    href={`#${getAnchorId(p.name)}`}
                    className={styles.mobileCardName}
                    onClick={(e) => {
                      e.preventDefault();
                      handleFieldClick(p.name);
                    }}
                  >
                    {p.name}
                  </a>
                  <span
                    className={`${styles.categoryBadge} ${styles[`cat_${p.category}`]}`}
                  >
                    {CATEGORY_LABELS[p.category]}
                  </span>
                </div>
                <div className={styles.mobileCardDescription}>
                  {p.description}
                  {p.notes && (
                    <span className={styles.notes}>{p.notes}</span>
                  )}
                </div>
                {p.example && (
                  <div className={styles.mobileCardMeta}>
                    <span className={styles.mobileExample}>
                      Example: {p.example}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          No fields match your search. Try adjusting your search or category
          filter.
        </div>
      )}
    </div>
  );
}
