import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import useBaseUrl, { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import gatewaysData from "@site/static/data/gateways.json";
import type { Gateway, GatewayCategory } from "@site/src/types/gateway";
import {
  BANK_LOGOS,
  WALLET_ICONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CURRENCY_FLAGS,
  CURRENCY_FLAGS_BY_COUNTRY,
  OPERATION_LABELS,
  OPERATION_ICONS,
  REGION_CONFIG,
  REGION_ORDER,
  COUNTRY_FLAGS,
  NETWORK_LOGOS,
} from "./assetMaps";
import type { RegionKey } from "./assetMaps";
import styles from "./styles.module.css";

const gateways = (gatewaysData as Gateway[]).filter(
  (gw) => gw.slug !== "standard",
);

// ── Filter helpers ───────────────────────────────────

function gatewayMatchesRegion(gw: Gateway, region: RegionKey): boolean {
  const regionCountries = REGION_CONFIG[region].countries;
  if (gw.countries.includes("Global")) return true;
  return gw.countries.some((c) =>
    (regionCountries as readonly string[]).includes(c),
  );
}

function gatewayMatchesCountry(gw: Gateway, country: string): boolean {
  if (gw.countries.includes("Global")) return true;
  return gw.countries.includes(country);
}

// ── Logo fallback ────────────────────────────────────

function LogoFallback({ name }: { name: string }) {
  const hue =
    [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className={styles.logoFallback}
      style={{
        backgroundColor: `hsl(${hue}, 65%, 94%)`,
        color: `hsl(${hue}, 45%, 42%)`,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// Names to exclude from bank row (credit cards are shown in header badges)
const NON_BANK_NAMES = new Set([
  // Card brands / networks
  "Visa", "Mastercard", "Amex", "JCB", "Discover", "UnionPay", "Maestro",
  "mada", "Mada", "Diners", "UATP", "RuPay", "Meeza", "KNET", "Benefit",
  "OmanNet", "NAPS", "QPay", "Knet Supported cards scheme",
  "Linked Bank Accounts / Cards", "Credit Cards.", "Visa/Mastercard.",
  // Digital wallets
  "Apple Pay", "Apple Pay.", "Google Pay", "PayPal", "Samsung Pay",
  "STC Pay", "urpay", "Alipay", "WeChat Pay", "ABA PAY", "Vodafone Cash",
  "Orange", "Fawry",
]);

// Filter out non-bank entries (descriptions, card brands, N/A values)
function filterBanks(banks: string[]): string[] {
  return banks.filter((b) =>
    !NON_BANK_NAMES.has(b) &&
    b.length < 30 &&
    !b.startsWith("N/A") &&
    !b.startsWith("Aggregates") &&
    !b.startsWith("Interfaces") &&
    !b.startsWith("Underwrites") &&
    !b.startsWith("Egyptian") &&
    !b.startsWith("physical") &&
    !b.startsWith("primarily") &&
    !b.startsWith("and "),
  );
}

// ── Sub-components ───────────────────────────────────

const MAX_BANKS = 3;
const MAX_NETWORKS = 3;

function BankRow({ banks }: { banks: string[] }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);
  const baseUrl = useBaseUrl("/img/banks/");

  useEffect(() => {
    if (!popupOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popupOpen]);

  if (banks.length === 0) {
    return <div className={styles.bankSectionPlaceholder} aria-hidden="true" />;
  }

  const shown = banks.slice(0, MAX_BANKS);
  const overflow = banks.length - MAX_BANKS;
  const overflowBanks = banks.slice(MAX_BANKS);

  function renderBank(bank: string) {
    const logoFile = BANK_LOGOS[bank];
    return logoFile ? (
      <div key={bank} className={styles.bankLogo}>
        <img
          src={`${baseUrl}${logoFile}`}
          alt={bank}
          className={styles.bankImg}
          loading="lazy"
        />
      </div>
    ) : (
      <span key={bank} className={styles.bankPill}>
        {bank}
      </span>
    );
  }

  return (
    <div className={styles.partnerBanks}>
      <div className={styles.sectionLabel}>Partner Banks:</div>
      <div className={styles.bankRow}>
        <div className={styles.bankLogoGroup}>
          {shown.map(renderBank)}
        </div>
        {overflow > 0 && (
          <div className={styles.bankOverflowWrap} ref={overflowRef}>
            <button
              type="button"
              className={styles.bankOverflow}
              onClick={() => setPopupOpen(!popupOpen)}
              aria-label={`Show ${overflow} more banks`}
            >
              +{overflow}
            </button>
            {popupOpen && (
              <div className={styles.bankPopup}>
                {overflowBanks.map(renderBank)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NetworkRow({ networks }: { networks: string[] }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);
  const { withBaseUrl } = useBaseUrlUtils();

  useEffect(() => {
    if (!popupOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popupOpen]);

  if (networks.length === 0) {
    return <div className={styles.bankSectionPlaceholder} aria-hidden="true" />;
  }

  const shown = networks.slice(0, MAX_NETWORKS);
  const overflow = networks.length - MAX_NETWORKS;
  const overflowNetworks = networks.slice(MAX_NETWORKS);

  function renderNetwork(network: string) {
    const logoPath = NETWORK_LOGOS[network];
    return logoPath ? (
      <div key={network} className={styles.networkLogo}>
        <img
          src={withBaseUrl(logoPath)}
          alt={network}
          className={styles.networkImg}
          loading="lazy"
        />
      </div>
    ) : (
      <span key={network} className={styles.bankPill}>
        {network}
      </span>
    );
  }

  return (
    <div className={styles.partnerBanks}>
      <div className={styles.sectionLabel}>Networks:</div>
      <div className={styles.bankRow}>
        <div className={styles.bankLogoGroup}>
          {shown.map(renderNetwork)}
        </div>
        {overflow > 0 && (
          <div className={styles.bankOverflowWrap} ref={overflowRef}>
            <button
              type="button"
              className={styles.bankOverflow}
              onClick={() => setPopupOpen(!popupOpen)}
              aria-label={`Show ${overflow} more networks`}
            >
              +{overflow}
            </button>
            {popupOpen && (
              <div className={styles.bankPopup}>
                {overflowNetworks.map(renderNetwork)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CurrencyChips({ currencies }: { currencies: string[] }) {
  if (currencies.length === 0) return null;
  const flagBaseUrl = useBaseUrl("/img/flags/");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll, currencies]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -100 : 100, behavior: "smooth" });
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>Currencies</div>
      <div className={styles.currencyWrap}>
        {canScrollLeft && (
          <>
            <div className={styles.currencyFadeLeft} />
            <button type="button" className={`${styles.currencyArrow} ${styles.currencyArrowLeft}`} onClick={() => scroll("left")} aria-label="Scroll left">&#8249;</button>
          </>
        )}
        <div className={styles.currencyRow} ref={scrollRef}>
          {currencies.map((code) => (
            <span key={code} className={styles.currencyChip}>
              {CURRENCY_FLAGS[code] && (
                <span className={styles.currencyFlag}>
                  <img
                    src={`${flagBaseUrl}${CURRENCY_FLAGS[code]}`}
                    alt=""
                    className={styles.flagImg}
                  />
                </span>
              )}
              {code}
            </span>
          ))}
        </div>
        {canScrollRight && (
          <>
            <div className={styles.currencyFadeRight} />
            <button type="button" className={`${styles.currencyArrow} ${styles.currencyArrowRight}`} onClick={() => scroll("right")} aria-label="Scroll right">&#8250;</button>
          </>
        )}
      </div>
    </div>
  );
}

function OperationBadges({ operations }: { operations: string[] }) {
  if (operations.length === 0) return null;
  const baseUrl = useBaseUrl("/img/operations/");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll, operations]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -100 : 100, behavior: "smooth" });
  };

  return (
    <>
      <div className={styles.divider} />
      <div className={styles.currencyWrap}>
        {canScrollLeft && (
          <>
            <div className={styles.currencyFadeLeft} />
            <button type="button" className={`${styles.currencyArrow} ${styles.currencyArrowLeft}`} onClick={() => scroll("left")} aria-label="Scroll left">&#8249;</button>
          </>
        )}
        <div className={styles.operationRow} ref={scrollRef}>
          {operations.map((op) => {
            const iconFile = OPERATION_ICONS[op];
            return (
              <span key={op} className={styles.opBadge}>
                {iconFile && (
                  <img
                    src={`${baseUrl}${iconFile}`}
                    alt=""
                    className={styles.opIcon}
                  />
                )}
                {OPERATION_LABELS[op] || op}
              </span>
            );
          })}
        </div>
        {canScrollRight && (
          <>
            <div className={styles.currencyFadeRight} />
            <button type="button" className={`${styles.currencyArrow} ${styles.currencyArrowRight}`} onClick={() => scroll("right")} aria-label="Scroll right">&#8250;</button>
          </>
        )}
      </div>
    </>
  );
}

function HeaderBadges({
  wallets,
}: {
  wallets: string[];
}) {
  const baseUrl = useBaseUrl("/img/brands/");

  const walletItems = wallets
    .filter((w) => WALLET_ICONS[w])
    .slice(0, 4);

  if (walletItems.length === 0) return null;

  return (
    <div className={styles.headerBadges}>
      {walletItems.map((w) => (
        <img
          key={w}
          src={`${baseUrl}${WALLET_ICONS[w]}`}
          alt={w}
          className={styles.badgeIcon}
          loading="lazy"
        />
      ))}
    </div>
  );
}

// ── Gateway Card ─────────────────────────────────────

function GatewayCard({ gateway }: { gateway: Gateway }) {
  const logoSrc = useBaseUrl(`/img/gateways/${gateway.logo}`);
  const banks = filterBanks(gateway.acceptedAt);

  return (
    <div className={styles.card}>
      {/* Top section: left column (logo+banks) + right badges */}
      <div className={styles.topSection}>
        <div className={styles.leftColumn}>
          <div className={styles.logoNameRow}>
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
            <div className={styles.nameCol}>
              <div className={styles.name}>{gateway.name}</div>
              <div className={styles.subtitle}>
                {CATEGORY_LABELS[gateway.category]}
              </div>
            </div>
          </div>
          {banks.length > 0 ? (
            <BankRow banks={banks} />
          ) : (
            <NetworkRow networks={gateway.cardBrands} />
          )}
        </div>
        <HeaderBadges
          wallets={gateway.digitalWallets}
        />
      </div>

      {/* Currencies */}
      <CurrencyChips currencies={gateway.currencies} />

      {/* Divider + Operations */}
      <OperationBadges operations={gateway.operations} />
    </div>
  );
}

// ── SVG Icons (exact Figma vuesax/linear paths) ─────

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.58366 17.5C13.9559 17.5 17.5003 13.9556 17.5003 9.58332C17.5003 5.21107 13.9559 1.66666 9.58366 1.66666C5.2114 1.66666 1.66699 5.21107 1.66699 9.58332C1.66699 13.9556 5.2114 17.5 9.58366 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.3337 18.3333L16.667 16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.0003 18.3333C14.6027 18.3333 18.3337 14.6024 18.3337 9.99999C18.3337 5.39762 14.6027 1.66666 10.0003 1.66666C5.39795 1.66666 1.66699 5.39762 1.66699 9.99999C1.66699 14.6024 5.39795 18.3333 10.0003 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.66667 2.5H7.5C5.875 7.36667 5.875 12.6333 7.5 17.5H6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.5 2.5C14.125 7.36667 14.125 12.6333 12.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 13.3333V12.5C7.36667 14.125 12.6333 14.125 17.5 12.5V13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.5 7.5C7.36667 5.875 12.6333 5.875 17.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.2797 5.96667L8.93306 10.3133C8.41973 10.8267 7.57973 10.8267 7.06639 10.3133L2.71973 5.96667" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconHierarchy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.16602 6.66666C5.54673 6.66666 6.66602 5.54737 6.66602 4.16666C6.66602 2.78594 5.54673 1.66666 4.16602 1.66666C2.7853 1.66666 1.66602 2.78594 1.66602 4.16666C1.66602 5.54737 2.7853 6.66666 4.16602 6.66666Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.834 12.5C17.2147 12.5 18.334 11.3807 18.334 10C18.334 8.61929 17.2147 7.5 15.834 7.5C14.4533 7.5 13.334 8.61929 13.334 10C13.334 11.3807 14.4533 12.5 15.834 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.16602 18.3333C5.54673 18.3333 6.66602 17.2141 6.66602 15.8333C6.66602 14.4526 5.54673 13.3333 4.16602 13.3333C2.7853 13.3333 1.66602 14.4526 1.66602 15.8333C1.66602 17.2141 2.7853 18.3333 4.16602 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.3327 9.99999H7.49935C5.66602 9.99999 4.16602 9.16666 4.16602 6.66666V13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCards({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.66602 10.5083H15.8327" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.8327 8.56668V14.525C15.8077 16.9 15.1577 17.5 12.6827 17.5H4.81604C2.29937 17.5 1.66602 16.875 1.66602 14.3917V8.56668C1.66602 6.31668 2.19102 5.59168 4.16602 5.47501C4.36602 5.46668 4.58271 5.45834 4.81604 5.45834H12.6827C15.1993 5.45834 15.8327 6.08334 15.8327 8.56668Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.3327 5.60833V11.4333C18.3327 13.6833 17.8077 14.4083 15.8327 14.525V8.56667C15.8327 6.08333 15.1993 5.45833 12.6827 5.45833H4.81604C4.58271 5.45833 4.36602 5.46667 4.16602 5.475C4.19102 3.1 4.84104 2.5 7.31604 2.5H15.1827C17.6993 2.5 18.3327 3.125 18.3327 5.60833Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.375 14.8417H5.80831" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.5918 14.8417H10.4585" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCloseCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.99967 14.6667C11.6663 14.6667 14.6663 11.6667 14.6663 8.00001C14.6663 4.33334 11.6663 1.33334 7.99967 1.33334C4.33301 1.33334 1.33301 4.33334 1.33301 8.00001C1.33301 11.6667 4.33301 14.6667 7.99967 14.6667Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.11328 9.88668L9.88661 6.11334" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.88661 9.88668L6.11328 6.11334" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFilter({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 5.833h15M5 10h10M7.5 14.167h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Filter Dropdown ─────────────────────────────────

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

function FilterDropdown({
  icon,
  label,
  options,
  selected,
  onChange,
  multi = false,
  searchable = false,
  minWidth,
}: {
  icon: React.ReactNode;
  label: string;
  options: DropdownOption[];
  selected: string | string[] | null;
  onChange: (value: string) => void;
  multi?: boolean;
  searchable?: boolean;
  minWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
      setOpen(false);
      setQuery("");
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [open]);

  const isSelected = (value: string) => {
    if (Array.isArray(selected)) return selected.includes(value);
    return selected === value;
  };

  const hasSelection = Array.isArray(selected) ? selected.length > 0 : selected !== null;

  const filteredOptions = searchable && query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const displayLabel = (() => {
    if (!hasSelection) return label;
    // Single-select: show selected value
    if (!Array.isArray(selected)) {
      const opt = options.find((o) => o.value === selected);
      return opt ? opt.label : label;
    }
    // Multi-select: keep original label, add count
    if (selected.length === 0) return label;
    return `${label} (${selected.length})`;
  })();

  return (
    <div className={styles.dropdownWrap} ref={wrapRef}>
      <button
        type="button"
        className={`${styles.dropdown} ${open ? styles.dropdownOpen : ""}`}
        onClick={() => { setOpen(!open); setQuery(""); }}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={minWidth ? { width: minWidth } : undefined}
      >
        <span className={styles.dropdownIcon}>{icon}</span>
        {displayLabel}
        <IconChevronDown className={styles.dropdownArrow} />
      </button>
      {open && (
        <div className={styles.dropdownPopup} role="listbox">
          {searchable && (
            <input
              type="text"
              className={styles.dropdownSearch}
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          )}
          {filteredOptions.map((opt) => {
            const active = isSelected(opt.value);
            return (
              <div
                key={opt.value}
                className={`${styles.dropdownOption} ${active ? styles.dropdownOptionActive : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  if (!multi) { setOpen(false); setQuery(""); }
                }}
                role="option"
                aria-selected={active}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange(opt.value);
                    if (!multi) { setOpen(false); setQuery(""); }
                  }
                }}
              >
                {opt.icon && <span className={styles.dropdownOptionIcon}>{opt.icon}</span>}
                {opt.label}
                <IconCheck className={`${styles.dropdownOptionCheck} ${!active ? styles.dropdownOptionCheckFaint : ""}`} />
              </div>
            );
          })}
          {filteredOptions.length === 0 && (
            <div className={styles.dropdownOption} style={{ opacity: 0.5, cursor: "default" }}>
              No results
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Catalog (parent) ─────────────────────────────────

// Derive unique payment networks (card brands/schemes only, NOT digital wallets)
const allNetworks = (() => {
  const set = new Set<string>();
  for (const gw of gateways) {
    gw.cardBrands.forEach((b) => set.add(b));
  }
  return [...set].sort();
})();

export default function GatewayCatalog(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedGatewayTypes, setSelectedGatewayTypes] = useState<GatewayCategory[]>([]);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Cascading: region change resets countries
  const handleRegionChange = (value: string) => {
    const region = value as RegionKey;
    if (selectedRegion === region) {
      setSelectedRegion(null);
      setSelectedCountries([]);
    } else {
      setSelectedRegion(region);
      setSelectedCountries([]);
    }
  };

  const handleCountryToggle = (value: string) => {
    setSelectedCountries((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
    );
  };

  const handleGatewayTypeToggle = (value: string) => {
    const cat = value as GatewayCategory;
    setSelectedGatewayTypes((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleNetworkToggle = (value: string) => {
    setSelectedNetworks((prev) =>
      prev.includes(value) ? prev.filter((n) => n !== value) : [...prev, value],
    );
  };

  const flagBaseUrl = useBaseUrl("/img/flags/");

  // Country options depend on selected region, with flag icons
  const countryOptions = useMemo(() => {
    const countries = selectedRegion
      ? [...REGION_CONFIG[selectedRegion].countries]
      : Object.values(REGION_CONFIG).flatMap((r) => [...r.countries]);
    return countries.map((c) => ({
      value: c,
      label: c,
      icon: CURRENCY_FLAGS_BY_COUNTRY[c] ? (
        <img src={`${flagBaseUrl}${CURRENCY_FLAGS_BY_COUNTRY[c]}`} alt="" className={styles.dropdownFlagIcon} />
      ) : undefined,
    }));
  }, [selectedRegion, flagBaseUrl]);

  // Gateway type options
  const gatewayTypeOptions = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => ({
      value: cat,
      label: CATEGORY_LABELS[cat],
    }));
  }, []);

  const brandsBaseUrl = useBaseUrl("/");

  // Network options with logos
  const networkOptions = useMemo(() => {
    return allNetworks.map((n) => ({
      value: n,
      label: n,
      icon: NETWORK_LOGOS[n] ? (
        <img src={`${brandsBaseUrl}${NETWORK_LOGOS[n].replace(/^\//, "")}`} alt="" className={styles.dropdownNetworkIcon} />
      ) : undefined,
    }));
  }, [brandsBaseUrl]);

  // Region options
  const regionOptions = useMemo(() => {
    return REGION_ORDER.map((r) => ({
      value: r,
      label: REGION_CONFIG[r].label,
    }));
  }, []);

  // Filtering and sorting by category order
  const filtered = useMemo(() => {
    const result = gateways.filter((gw) => {
      if (selectedRegion && !gatewayMatchesRegion(gw, selectedRegion))
        return false;
      if (
        selectedCountries.length > 0 &&
        !selectedCountries.some((c) => gatewayMatchesCountry(gw, c))
      )
        return false;
      if (
        selectedGatewayTypes.length > 0 &&
        !selectedGatewayTypes.includes(gw.category)
      )
        return false;
      if (selectedNetworks.length > 0) {
        if (!selectedNetworks.some((n) => gw.cardBrands.includes(n))) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const fields = [
          gw.name,
          ...gw.countries,
          ...gw.acceptedAt,
          ...gw.cardBrands,
          ...gw.digitalWallets,
        ];
        if (!fields.some((f) => f.toLowerCase().includes(q))) return false;
      }
      return true;
    });
    result.sort((a, b) => {
      return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    });
    return result;
  }, [search, selectedRegion, selectedCountries, selectedGatewayTypes, selectedNetworks]);

  const activeFilterCount =
    (selectedRegion ? 1 : 0) +
    selectedCountries.length +
    selectedGatewayTypes.length +
    selectedNetworks.length;

  // Build tags from all active filters
  const tags = useMemo(() => {
    const t: { key: string; category?: string; value: string; onRemove: () => void }[] = [];
    if (selectedRegion) {
      t.push({
        key: `region-${selectedRegion}`,
        category: "Region:",
        value: REGION_CONFIG[selectedRegion].label,
        onRemove: () => { setSelectedRegion(null); setSelectedCountries([]); },
      });
    }
    for (const c of selectedCountries) {
      t.push({
        key: `country-${c}`,
        category: "Country:",
        value: c,
        onRemove: () => setSelectedCountries((prev) => prev.filter((x) => x !== c)),
      });
    }
    for (const gt of selectedGatewayTypes) {
      t.push({
        key: `type-${gt}`,
        category: "Gateway Type:",
        value: CATEGORY_LABELS[gt],
        onRemove: () => setSelectedGatewayTypes((prev) => prev.filter((x) => x !== gt)),
      });
    }
    for (const n of selectedNetworks) {
      t.push({
        key: `network-${n}`,
        value: n,
        onRemove: () => setSelectedNetworks((prev) => prev.filter((x) => x !== n)),
      });
    }
    return t;
  }, [selectedRegion, selectedCountries, selectedGatewayTypes, selectedNetworks]);

  return (
    <div className={styles.catalog}>
      {/* Filter bar */}
      <div className={styles.filters}>
        {/* Search */}
        <div className={styles.searchBar}>
          <IconSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Mobile-only filter toggle button */}
        <button
          type="button"
          className={styles.filtersToggle}
          onClick={() => setFiltersOpen(!filtersOpen)}
          aria-expanded={filtersOpen}
          aria-controls="gateway-catalog-filters"
        >
          <IconFilter className={styles.filtersToggleIcon} />
          <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
          <IconChevronDown
            className={`${styles.filtersToggleArrow} ${filtersOpen ? styles.filtersToggleArrowOpen : ""}`}
          />
        </button>

        {/* Dropdown filters */}
        <div
          id="gateway-catalog-filters"
          className={`${styles.dropdownRow} ${filtersOpen ? styles.dropdownRowOpen : ""}`}
        >
          <FilterDropdown
            icon={<IconGlobe className={styles.dropdownIcon} />}
            label="Region"
            options={regionOptions}
            selected={selectedRegion}
            onChange={handleRegionChange}
            minWidth={130}
          />
          <FilterDropdown
            icon={
              selectedCountries.length === 1 && CURRENCY_FLAGS_BY_COUNTRY[selectedCountries[0]] ? (
                <img
                  src={`${flagBaseUrl}${CURRENCY_FLAGS_BY_COUNTRY[selectedCountries[0]]}`}
                  alt=""
                  className={styles.countryFlagDropdown}
                />
              ) : (
                <IconGlobe className={styles.dropdownIcon} />
              )
            }
            label="Country"
            options={countryOptions}
            selected={selectedCountries}
            onChange={handleCountryToggle}
            multi
            searchable
            minWidth={150}
          />
          <FilterDropdown
            icon={<IconHierarchy className={styles.dropdownIcon} />}
            label="Gateway Type"
            options={gatewayTypeOptions}
            selected={selectedGatewayTypes}
            onChange={handleGatewayTypeToggle}
            multi
            minWidth={190}
          />
          <FilterDropdown
            icon={<IconCards className={styles.dropdownIcon} />}
            label="Payment Network"
            options={networkOptions}
            selected={selectedNetworks}
            onChange={handleNetworkToggle}
            multi
            searchable
            minWidth={210}
          />
        </div>

        {/* Selected filter tags — always rendered to reserve layout space and prevent shift */}
        <div className={styles.tagsRow} aria-live="polite">
          {tags.map((tag) => (
            <span key={tag.key} className={styles.tag}>
              <span className={styles.tagContent}>
                {tag.category && (
                  <span className={styles.tagLabel}>{tag.category}</span>
                )}
                <span className={styles.tagValue}>{tag.value}</span>
              </span>
              <button
                type="button"
                className={styles.tagClose}
                onClick={tag.onRemove}
                aria-label={`Remove ${tag.value}`}
              >
                <IconCloseCircle />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.resultCount}>
        {filtered.length} gateway{filtered.length !== 1 ? "s" : ""}
      </div>

      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((gw) => (
            <GatewayCard key={gw.slug} gateway={gw} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          No gateways match your filters. Try adjusting your search or
          filters.
        </div>
      )}
    </div>
  );
}
