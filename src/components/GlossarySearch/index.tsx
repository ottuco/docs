import React, { useState, useMemo, useEffect } from "react";
import glossaryTerms from "@site/src/data/glossary-terms";
import type { GlossaryTerm } from "@site/src/data/glossary-terms";
import styles from "./styles.module.css";

function getAnchorId(id: string): string {
  return `term-${id}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function matchesSearch(term: GlossaryTerm, query: string): boolean {
  const q = query.toLowerCase();
  if (term.term.toLowerCase().includes(q)) return true;
  if (stripHtml(term.definition).toLowerCase().includes(q)) return true;
  if (term.aliases?.some((a) => a.toLowerCase().includes(q))) return true;
  return false;
}

export default function GlossarySearch(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [highlightedTerm, setHighlightedTerm] = useState<string | null>(null);

  // Deep linking: on mount, check URL hash and scroll to term
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash.startsWith("term-")) {
      const termId = hash.replace("term-", "");
      const found = glossaryTerms.find((t) => t.id === termId);
      if (found) {
        setSearch("");
        setHighlightedTerm(termId);
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
    if (!search) return glossaryTerms;
    return glossaryTerms.filter((t) => matchesSearch(t, search));
  }, [search]);

  function handleTermClick(id: string) {
    const anchorId = getAnchorId(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${anchorId}`);
    }
    setHighlightedTerm(id);
  }

  return (
    <div className={styles.glossary}>
      {/* Search bar */}
      <div className={styles.searchBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={'Search terms \u2014 try "tokenization", "webhook", "PCI"...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className={styles.resultCount}>
          {filtered.length} term{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Terms list */}
      {filtered.length > 0 ? (
        <dl className={styles.termList}>
          {filtered.map((t) => (
            <div
              key={t.id}
              id={getAnchorId(t.id)}
              className={`${styles.termEntry} ${highlightedTerm === t.id ? styles.highlighted : ""}`}
            >
              <dt className={styles.termName}>
                <a
                  href={`#${getAnchorId(t.id)}`}
                  className={styles.termLink}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTermClick(t.id);
                  }}
                >
                  {t.term}
                  <span className={styles.linkIcon}>#</span>
                </a>
              </dt>
              <dd
                className={styles.termDefinition}
                dangerouslySetInnerHTML={{ __html: t.definition }}
              />
            </div>
          ))}
        </dl>
      ) : (
        <div className={styles.empty}>
          No terms match &ldquo;{search}&rdquo;. Try a different search.
        </div>
      )}
    </div>
  );
}
