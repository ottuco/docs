import React, { useState, useMemo } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import gatewaysData from "@site/static/data/gateways.json";
import type { Gateway } from "@site/src/types/gateway";
import styles from "./styles.module.css";

const gateways = (gatewaysData as Gateway[]).filter(
  (gw) => gw.slug !== "standard"
);

type Category = Gateway["category"];

const CATEGORY_LABELS: Record<Category, string> = {
  bank: "Banks",
  fintech: "Fintechs",
  bnpl: "Buy Now, Pay Later",
  wallet: "Digital Wallets",
};

const CATEGORY_ORDER: Category[] = ["bank", "fintech", "bnpl", "wallet"];

function getRegion(country: string): string {
  const gcc = new Set([
    "Kuwait",
    "Bahrain",
    "Qatar",
    "Oman",
    "UAE",
    "KSA",
    "KSA / UAE",
    "GCC",
  ]);
  if (gcc.has(country)) return "GCC";
  if (country === "Egypt" || country === "MENA") return "MENA";
  if (country === "Global") return "Global";
  return "Other";
}

const REGIONS = ["All Regions", "GCC", "MENA", "Global", "Other"] as const;

function LogoFallback({ name }: { name: string }) {
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className={styles.logoFallback}
      style={{ backgroundColor: `hsl(${hue}, 45%, 55%)` }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function GatewayCatalog(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    "all"
  );
  const [selectedRegion, setSelectedRegion] = useState<string>("All Regions");

  const filtered = useMemo(() => {
    return gateways.filter((gw) => {
      if (
        selectedCategory !== "all" &&
        gw.category !== selectedCategory
      )
        return false;
      if (
        selectedRegion !== "All Regions" &&
        getRegion(gw.country) !== selectedRegion
      )
        return false;
      if (
        search &&
        !gw.name.toLowerCase().includes(search.toLowerCase()) &&
        !gw.country.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [search, selectedCategory, selectedRegion]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: gateways.length };
    for (const gw of gateways) {
      c[gw.category] = (c[gw.category] || 0) + 1;
    }
    return c;
  }, []);

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
        <div className={styles.filterRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search gateways..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={styles.regionSelect}
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className={styles.resultCount}>
        {filtered.length} gateway{filtered.length !== 1 ? "s" : ""}
      </div>

      {/* Gateway grid */}
      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((gw) => (
            <GatewayCard key={gw.slug} gateway={gw} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          No gateways match your filters. Try adjusting your search or filters.
        </div>
      )}
    </div>
  );
}

function GatewayCard({ gateway }: { gateway: Gateway }) {
  const logoSrc = useBaseUrl(`/img/gateways/${gateway.logo}`);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.logoWrap}>
          {gateway.logo ? (
            <img
              src={logoSrc}
              alt={gateway.name}
              className={styles.logo}
              loading="lazy"
            />
          ) : (
            <LogoFallback name={gateway.name} />
          )}
        </div>
        <span className={`${styles.categoryBadge} ${styles[`cat_${gateway.category}`]}`}>
          {gateway.category === "bnpl" ? "BNPL" : gateway.category}
        </span>
      </div>

      <h4 className={styles.cardName}>{gateway.name}</h4>

      <div className={styles.cardMeta}>
        <span className={styles.country}>
          {gateway.countryFlag} {gateway.country}
        </span>
      </div>

      {gateway.currencies.length > 0 && (
        <div className={styles.currencies}>
          {gateway.currencies.map((c) => (
            <span key={c} className={styles.currencyBadge}>
              {c}
            </span>
          ))}
        </div>
      )}

      {gateway.operations.length > 0 && (
        <div className={styles.operations}>
          {gateway.operations.map((op) => (
            <span key={op} className={styles.opBadge}>
              {op}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
