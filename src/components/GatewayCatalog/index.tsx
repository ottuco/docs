import React, { useState, useMemo } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import gatewaysData from "@site/static/data/gateways.json";
import type { Gateway, GatewayCategory } from "@site/src/types/gateway";
import styles from "./styles.module.css";

const gateways = (gatewaysData as Gateway[]).filter(
  (gw) => gw.slug !== "standard"
);

const CATEGORY_LABELS: Record<GatewayCategory, string> = {
  aggregator: "Aggregator",
  gateway: "Payment Gateway",
  wallet: "Wallet",
  bnpl: "BNPL",
  psp: "PSP",
  processor: "Processor",
  bank: "Bank",
  openbanking: "Open Banking",
  ottu: "Ottu Service",
  specialty: "Specialty",
};

const CATEGORY_ORDER: GatewayCategory[] = [
  "gateway", "aggregator", "psp", "processor", "wallet", "bnpl", "bank", "openbanking", "ottu", "specialty",
];

const REGION_CONFIG = {
  gcc: {
    label: "GCC",
    countries: ["Kuwait", "Bahrain", "Qatar", "Oman", "UAE", "KSA"],
  },
  apac: {
    label: "APAC",
    countries: ["Cambodia", "Indonesia", "India"],
  },
  global: {
    label: "Global",
    countries: ["Egypt", "Iraq", "Canada"],
  },
} as const;

type RegionKey = keyof typeof REGION_CONFIG;
const REGION_ORDER: RegionKey[] = ["global", "gcc", "apac"];

const COUNTRY_FLAGS: Record<string, string> = {
  Kuwait: "\u{1F1F0}\u{1F1FC}", Bahrain: "\u{1F1E7}\u{1F1ED}", Qatar: "\u{1F1F6}\u{1F1E6}", Oman: "\u{1F1F4}\u{1F1F2}",
  UAE: "\u{1F1E6}\u{1F1EA}", KSA: "\u{1F1F8}\u{1F1E6}", Egypt: "\u{1F1EA}\u{1F1EC}", Iraq: "\u{1F1EE}\u{1F1F6}",
  India: "\u{1F1EE}\u{1F1F3}", Indonesia: "\u{1F1EE}\u{1F1E9}", Cambodia: "\u{1F1F0}\u{1F1ED}", Canada: "\u{1F1E8}\u{1F1E6}",
  Global: "\u{1F30E}",
};

const SERVICE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  "apple-pay": {
    label: "Apple Pay",
    icon: <svg className={styles.svcIcon} viewBox="0 0 170 170" fill="currentColor"><path d="M150.4 130.3c-2.4 5.6-5.2 10.7-8.4 15.4-4.4 6.4-7.9 10.8-10.7 13.3-4.3 4.1-8.8 6.2-13.7 6.3-3.5 0-7.7-1-12.6-3-4.9-2-9.4-3-13.6-3-4.4 0-9.1 1-14.2 3-5.1 2-9.1 3-12.2 3.1-4.7.2-9.3-1.9-13.7-6.3-3-2.7-6.7-7.3-11.2-13.8-4.8-7-8.8-15-11.9-24.2-3.3-9.9-5-19.4-5-28.7 0-10.6 2.3-19.7 6.8-27.4 3.6-6.1 8.3-11 14.2-14.6 5.9-3.6 12.3-5.5 19.1-5.6 3.7 0 8.6 1.1 14.7 3.4 6 2.3 9.9 3.4 11.7 3.4 1.3 0 5.6-1.3 12.8-3.9 6.9-2.4 12.6-3.4 17.3-3 12.8 1 22.4 6.1 28.7 15.2-11.4 6.9-17.1 16.6-17 29.1.1 9.7 3.6 17.8 10.6 24.2 3.1 3 6.6 5.3 10.5 6.9-0.8 2.5-1.7 4.8-2.7 7.1zM119.2 7c0 7.6-2.8 14.8-8.3 21.3-6.6 7.8-14.7 12.3-23.4 11.6-.1-1-.2-2-.2-3 0-7.3 3.2-15.2 8.8-21.6 2.8-3.2 6.4-5.9 10.7-8 4.3-2 8.4-3.1 12.2-3.3.1 1 .2 2 .2 3z"/></svg>,
  },
  "google-pay": {
    label: "Google Pay",
    icon: <svg className={styles.svcIcon} viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.993 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0 5.48 0 0 5.373 0 12s5.48 12 12.24 12c7.07 0 11.76-4.972 11.76-11.97 0-.804-.086-1.418-.19-2.03H12.24z" fill="#4285F4"/></svg>,
  },
  "samsung-wallet": {
    label: "Samsung",
    icon: <svg className={styles.svcIcon} viewBox="0 0 24 24" fill="currentColor"><path d="M6.2 2C3.9 2 2 3.9 2 6.2v11.6C2 20.1 3.9 22 6.2 22h11.6c2.3 0 4.2-1.9 4.2-4.2V6.2C22 3.9 20.1 2 17.8 2H6.2zm1.3 5.5h1.2c1 0 1.4.5 1.4 1.1 0 .5-.3.9-.7 1 .5.1.8.6.8 1.1 0 .7-.5 1.2-1.5 1.2H7.5V7.5zm1.2 1.8c.4 0 .6-.2.6-.5s-.2-.5-.6-.5h-.4v1h.4zm.1 1.9c.4 0 .7-.2.7-.6 0-.3-.2-.6-.7-.6h-.5v1.2h.5z"/></svg>,
  },
};

function gatewayMatchesRegion(gw: Gateway, region: RegionKey): boolean {
  const regionCountries = REGION_CONFIG[region].countries;
  if (gw.countries.includes("Global")) return true;
  return gw.countries.some((c) => (regionCountries as readonly string[]).includes(c));
}

function gatewayMatchesCountry(gw: Gateway, country: string): boolean {
  if (gw.countries.includes("Global")) return true;
  return gw.countries.includes(country);
}

function getCountriesForRegion(region: RegionKey | "all"): string[] {
  if (region === "all") {
    return Object.values(REGION_CONFIG).flatMap((r) => [...r.countries]);
  }
  return [...REGION_CONFIG[region].countries];
}

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
  const [selectedCategory, setSelectedCategory] = useState<GatewayCategory | "all">("all");
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | "all">("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");

  // Reset country when region changes
  const handleRegionChange = (region: RegionKey | "all") => {
    setSelectedRegion(region);
    setSelectedCountry("all");
  };

  // If selected country isn't in the current region's countries, reset to "all"
  const effectiveCountry = useMemo(() => {
    if (selectedCountry === "all") return "all";
    const countries = getCountriesForRegion(selectedRegion);
    return countries.includes(selectedCountry) ? selectedCountry : "all";
  }, [selectedCountry, selectedRegion]);

  const filtered = useMemo(() => {
    return gateways.filter((gw) => {
      if (selectedCategory !== "all" && gw.category !== selectedCategory) return false;
      if (selectedRegion !== "all" && !gatewayMatchesRegion(gw, selectedRegion)) return false;
      if (effectiveCountry !== "all" && !gatewayMatchesCountry(gw, effectiveCountry)) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = gw.name.toLowerCase().includes(q);
        const countryMatch = gw.countries.some((c) => c.toLowerCase().includes(q));
        const providerMatch = gw.providerType.toLowerCase().includes(q);
        if (!nameMatch && !countryMatch && !providerMatch) return false;
      }
      return true;
    });
  }, [search, selectedCategory, selectedRegion, effectiveCountry]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: gateways.length };
    for (const gw of gateways) {
      c[gw.category] = (c[gw.category] || 0) + 1;
    }
    return c;
  }, []);

  const availableCountries = useMemo(() => {
    return getCountriesForRegion(selectedRegion);
  }, [selectedRegion]);

  return (
    <div className={styles.catalog}>
      {/* Filter bar */}
      <div className={styles.filters}>
        {/* Row 1: Category pills */}
        <div className={styles.categoryPills}>
          <button
            className={`${styles.pill} ${selectedCategory === "all" ? styles.pillActive : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            All <span className={styles.pillCount}>{counts.all}</span>
          </button>
          {CATEGORY_ORDER.filter((cat) => (counts[cat] || 0) > 0).map((cat) => (
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

        {/* Row 2: Region pills */}
        <div className={styles.regionPills}>
          <button
            className={`${styles.pill} ${selectedRegion === "all" ? styles.pillActive : ""}`}
            onClick={() => handleRegionChange("all")}
          >
            All Regions
          </button>
          {REGION_ORDER.map((region) => (
            <button
              key={region}
              className={`${styles.pill} ${selectedRegion === region ? styles.pillActive : ""}`}
              onClick={() => handleRegionChange(region)}
            >
              {REGION_CONFIG[region].label}
            </button>
          ))}
        </div>

        {/* Row 3: Search + Country dropdown */}
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
            value={effectiveCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="all">All Countries</option>
            {availableCountries.map((c) => (
              <option key={c} value={c}>
                {COUNTRY_FLAGS[c] || ""} {c}
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

function CountryDisplay({ countries }: { countries: string[] }) {
  const MAX_SHOW = 3;
  const shown = countries.slice(0, MAX_SHOW);
  const remaining = countries.length - MAX_SHOW;

  return (
    <span className={styles.country}>
      {shown.map((c, i) => (
        <span key={c}>
          {i > 0 && ", "}
          {COUNTRY_FLAGS[c] || ""} {c}
        </span>
      ))}
      {remaining > 0 && <span> +{remaining}</span>}
    </span>
  );
}

function GatewayCard({ gateway }: { gateway: Gateway }) {
  const logoSrc = useBaseUrl(`/img/gateways/${gateway.logo}`);
  const categoryLabel = CATEGORY_LABELS[gateway.category];
  const showProviderType = gateway.providerType && gateway.providerType !== categoryLabel;

  return (
    <div className={styles.card}>
      {/* Zone 1: Top row — logo left, badges right */}
      <div className={styles.topRow}>
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
        <div className={styles.badgesCol}>
          <span className={`${styles.categoryBadge} ${styles[`cat_${gateway.category}`]}`}>
            {categoryLabel}
          </span>
          {gateway.services?.map((svc) => {
            const cfg = SERVICE_CONFIG[svc];
            return (
              <span key={svc} className={`${styles.serviceBadge} ${styles[`svc_${svc.replace(/-/g, "_")}`] || ""}`}>
                {cfg?.icon}
                {cfg?.label || svc}
              </span>
            );
          })}
        </div>
      </div>

      {/* Zone 2: Name + provider type + countries — full width */}
      <div className={styles.cardBody}>
        <h4 className={styles.cardName}>{gateway.name}</h4>
        {showProviderType && (
          <span className={styles.providerType}>{gateway.providerType}</span>
        )}
        <CountryDisplay countries={gateway.countries} />
      </div>

      {/* Zone 3: Footer — currencies left, operations right */}
      {(gateway.currencies.length > 0 || gateway.operations.length > 0) && (
        <div className={styles.cardFooter}>
          <div className={styles.currencies}>
            {gateway.currencies.map((c) => (
              <span key={c} className={styles.currencyBadge}>{c}</span>
            ))}
          </div>
          <div className={styles.operations}>
            {gateway.operations.map((op) => (
              <span key={op} className={styles.opBadge}>{op}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
