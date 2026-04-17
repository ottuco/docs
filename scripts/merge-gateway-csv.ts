/**
 * Merge a gateways CSV into static/data/gateways.json.
 *
 * Usage: npx tsx scripts/merge-gateway-csv.ts <path-to-csv>
 * Example: npx tsx scripts/merge-gateway-csv.ts ./data/pgs.csv
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// ── CSV name → existing JSON slug ────────────────────
const CSV_NAME_TO_SLUG: Record<string, string> = {
  "ABA PayWay": "abapayway",
  "Amazon Payment Services": "amazon_pay",
  "Worldline": "bambora",
  "Benefit": "benefit",
  "BenefitPay": "benefit_pay",
  "Beyon Money": "beyon_money",
  "Bede": "bede",
  "CBK": "cbk", // new entry
  "CCAvenue": "ccavenues",
  "Checkout.com": "checkoutcom",
  "Cybersource": "cybersource",
  "Dapi": "dapi",
  "deema": "deema",
  "DOKU": "doku",
  "eNet": "enet",
  "Fawry": "fawry",
  "Fiserv": "fiserv",
  "FSS": "fss",
  "Geidea": "geidea",
  "Hesabe": "hesabe",
  "HyperPay": "hyperpay",
  "IATA Financial Gateway (IFG)": "ifg",
  "KNET": "kpay",
  "Moyasar": "moyasar",
  "MPGS": "mpgs",
  "MyFatoorah": "myfatoorah",
  "NBO Gateway": "nbo",
  "Network International (NI)": "ni",
  "OmanNet": "omannet",
  "Paymob": "paymob",
  "Payon": "payon",
  "PayPal": "paypal",
  "PayU": "payu_india",
  "QPay (NAPS)": "qpay",
  "Al Rajhi Bank": "rajhi",
  "SkipCash": "skipcash",
  "Smartpay": "smart_pay",
  "Sohar International": "sohar",
  "STC Bank": "stc_pay",
  "Tabby": "tabby",
  "Taly": "taly",
  "Tamara": "tamara",
  "Tap Payments": "tap",
  "TESS Payments": "tess",
  "UPayments": "upayments",
  "UPG (EBC)": "upg",
  "urpay": "urpay",
};

// ── Region shorthand expansion ───────────────────────
const GCC_COUNTRIES = ["Kuwait", "Bahrain", "Qatar", "Oman", "UAE", "KSA"];
const MENA_COUNTRIES = ["Egypt", "Iraq"]; // non-GCC MENA countries we operate in

const REGION_EXPANSION: Record<string, string[]> = {
  GCC: GCC_COUNTRIES,
  MENA: MENA_COUNTRIES,
};

// ── Country → Currency mapping ───────────────────────
const COUNTRY_CURRENCIES: Record<string, string[]> = {
  Kuwait: ["KWD"],
  Bahrain: ["BHD"],
  Qatar: ["QAR"],
  Oman: ["OMR"],
  UAE: ["AED"],
  KSA: ["SAR"],
  Egypt: ["EGP"],
  Iraq: ["IQD"],
  Cambodia: ["KHR", "USD"],
  Indonesia: ["IDR"],
  India: ["INR"],
  Canada: ["CAD"],
};

// ── Slugs to exclude from output ─────────────────────
const EXCLUDE_SLUGS = new Set(["ottu_pg", "tpay"]);

// ── Category mapping ─────────────────────────────────
const CATEGORY_MAP: Record<string, string> = {
  "PG": "gateway",
  "Processor": "processor",
  "Local Debit": "local_debit",
  "Wallet": "wallet",
  "BNPL": "bnpl",
  "Aggregator": "psp_ptsp",
  "Acquirer": "acquirer",
  "OpenBanking": "openbanking",
  "Specialist": "specialty",
};

// ── Hardcoded acceptedAt overrides for messy CSV rows ─
const ACCEPTED_AT_OVERRIDES: Record<string, string[]> = {
  abapayway: ["ABA Bank"],
  bede: ["KNET", "Apple Pay"],
  cbk: ["STC Kuwait", "Zain", "Ooredoo", "CBK"],
  benefit_pay: [],
  beyon_money: [],
  stc_pay: [],
  urpay: [],
  paypal: [],
  deema: [],
  tabby: [],
  taly: [],
  tamara: [],
};

// ── CSV parser (simple, handles our specific format) ──
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ── Parse bank names from messy acceptedAt text ──────
function parseAcceptedAt(text: string, slug: string): string[] {
  if (ACCEPTED_AT_OVERRIDES[slug] !== undefined) {
    return ACCEPTED_AT_OVERRIDES[slug];
  }

  if (!text || text.startsWith("N/A") || text.startsWith("All participating") ||
      text.startsWith("Wallet balance") || text.startsWith("Interfaces with") ||
      text.startsWith("Linked to")) {
    return [];
  }

  // Take text before first semicolon if present
  let cleaned = text.split(";")[0];

  // Remove trailing footnote numbers like ". 23" or " 4"
  cleaned = cleaned.replace(/\.\s*\d+\s*$/, "").replace(/\s+\d+\s*$/, "");

  // Remove parenthetical text
  cleaned = cleaned.replace(/\([^)]*\)/g, "");

  // Split on comma
  const banks = cleaned
    .split(",")
    .map((b) => b.trim())
    .filter((b) => b.length > 0 && b.length < 40);

  return banks;
}

// ── Parse comma-separated list, filtering N/A ────────
function parseList(text: string): string[] {
  if (!text || text === "N/A" || text.startsWith("N/A")) return [];
  if (text === "Agnostic") return [];

  return text
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== "N/A" && s !== "Agnostic")
    .map((s) => {
      // Normalize known variations
      if (s === "Knet Supported cards scheme") return "KNET";
      if (s === "KNET (For repayment)") return "KNET";
      if (s === "Linked Bank Accounts / Cards") return "";
      if (s === "Bank Transfer") return "";
      return s;
    })
    .filter((s) => s.length > 0);
}

// ── Main ─────────────────────────────────────────────
// Usage: npx tsx scripts/merge-gateway-csv.ts <path-to-csv>
const csvArg = process.argv[2];
if (!csvArg) {
  console.error("Usage: npx tsx scripts/merge-gateway-csv.ts <path-to-csv>");
  console.error("Example: npx tsx scripts/merge-gateway-csv.ts ./data/pgs.csv");
  process.exit(1);
}
const csvPath = resolve(csvArg);
const jsonPath = resolve(__dirname, "../static/data/gateways.json");

const csvText = readFileSync(csvPath, "utf-8");
const csvRows = parseCSV(csvText);

const existingData = JSON.parse(readFileSync(jsonPath, "utf-8")) as any[];
const jsonBySlug = new Map(existingData.map((gw) => [gw.slug, gw]));

const result: any[] = [];

// Process CSV rows
for (const row of csvRows) {
  const csvName = row["Official Brand Name (2025)"];
  const slug = CSV_NAME_TO_SLUG[csvName];

  if (!slug) {
    console.warn(`No slug mapping for CSV entry: "${csvName}"`);
    continue;
  }

  const category = CATEGORY_MAP[row["Category"]];
  if (!category) {
    console.warn(`No category mapping for: "${row["Category"]}" (${csvName})`);
    continue;
  }

  const acceptedAt = parseAcceptedAt(row["Accepted At (Banks / Scope)"], slug);
  const cardBrands = parseList(row["Accepted Card Brands"]);
  const digitalWallets = parseList(row["Accepted Digital Wallets"]);

  const existing = jsonBySlug.get(slug);

  const countries = parseCountries(row["Countries Supported"]);
  const currencies = deriveCurrencies(countries);

  if (existing) {
    // Merge: update from CSV, preserve operations/testCards/logo from JSON
    const merged = {
      slug: existing.slug,
      name: csvName,
      countries,
      currencies,
      inquiryMinutes: existing.inquiryMinutes,
      operations: existing.operations,
      integrationType: existing.integrationType,
      category,
      operationMode: existing.operationMode,
      logo: existing.logo,
      acceptedAt,
      cardBrands,
      digitalWallets,
      testCards: existing.testCards,
      ...(existing.testCardNotes ? { testCardNotes: existing.testCardNotes } : {}),
      ...(existing.docsUrl ? { docsUrl: existing.docsUrl } : {}),
    };
    result.push(merged);
    jsonBySlug.delete(slug);
  } else {
    // New entry
    const newEntry = {
      slug,
      name: csvName,
      countries,
      currencies,
      inquiryMinutes: null,
      operations: [],
      integrationType: row["Integration Type"] || "redirect",
      category,
      operationMode: "purchase" as const,
      logo: "",
      acceptedAt,
      cardBrands,
      digitalWallets,
      testCards: [],
    };
    result.push(newEntry);
  }
}

// Add JSON-only entries that aren't excluded (keep "standard" for test cards)
for (const [slug, gw] of jsonBySlug) {
  if (EXCLUDE_SLUGS.has(slug)) {
    console.log(`Excluding: ${slug} (${gw.name})`);
    continue;
  }

  let category = gw.category;
  if (category === "ottu") category = "specialty";
  if (category === "bank") category = "local_debit";
  if (category === "psp") category = "specialty";

  result.push({
    slug: gw.slug,
    name: gw.name,
    countries: gw.countries,
    currencies: gw.currencies,
    inquiryMinutes: gw.inquiryMinutes,
    operations: gw.operations,
    integrationType: gw.integrationType,
    category,
    operationMode: gw.operationMode,
    logo: gw.logo,
    acceptedAt: [],
    cardBrands: [],
    digitalWallets: [],
    testCards: gw.testCards,
    ...(gw.testCardNotes ? { testCardNotes: gw.testCardNotes } : {}),
    ...(gw.docsUrl ? { docsUrl: gw.docsUrl } : {}),
  });
}

// Sort alphabetically by slug, but keep "standard" first
result.sort((a, b) => {
  if (a.slug === "standard") return -1;
  if (b.slug === "standard") return 1;
  return a.slug.localeCompare(b.slug);
});

writeFileSync(jsonPath, JSON.stringify(result, null, 2) + "\n");
console.log(`Wrote ${result.length} gateways to ${jsonPath}`);

// Spot checks
const knet = result.find((g) => g.slug === "kpay");
console.log(`KNET banks: ${knet?.acceptedAt.length} (expected 19)`);
console.log(`KNET brands: ${JSON.stringify(knet?.cardBrands)}`);
console.log(`KNET wallets: ${JSON.stringify(knet?.digitalWallets)}`);

const mpgs = result.find((g) => g.slug === "mpgs");
console.log(`MPGS brands: ${JSON.stringify(mpgs?.cardBrands)}`);
console.log(`MPGS wallets: ${JSON.stringify(mpgs?.digitalWallets)}`);

// ── Helper: parse countries from CSV ─────────────────
function parseCountries(text: string): string[] {
  if (!text) return [];
  const raw = text.split(",").map((c) => c.trim()).filter(Boolean);
  const countries = new Set<string>();

  for (const token of raw) {
    if (REGION_EXPANSION[token]) {
      for (const c of REGION_EXPANSION[token]) countries.add(c);
    } else {
      countries.add(token);
    }
  }

  return [...countries];
}

// ── Helper: derive currencies from countries ─────────
function deriveCurrencies(countries: string[]): string[] {
  const currencies = new Set<string>();
  for (const c of countries) {
    const cc = COUNTRY_CURRENCIES[c];
    if (cc) {
      for (const cur of cc) currencies.add(cur);
    }
  }
  // Global providers get USD as default
  if (countries.includes("Global") && currencies.size === 0) {
    currencies.add("USD");
  }
  return [...currencies];
}
