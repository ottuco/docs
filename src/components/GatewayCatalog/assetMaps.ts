import type { GatewayCategory } from "@site/src/types/gateway";

/** Bank name → image filename in /img/banks/ */
export const BANK_LOGOS: Record<string, string> = {
  // Kuwait
  NBK: "nbk.png",
  ABK: "abk.png",
  KFH: "kfh.png",
  Burgan: "burgan.png",
  KIB: "kib.png",
  "Gulf Bank": "gulf-bank.png",
  Gulf: "gulf-bank.png",
  Warba: "warba.png",
  Boubyan: "boubyan.png",
  CBK: "cbk.png",
  "Al-Tijari": "al-tijari.png",
  // Bahrain
  NBB: "nbb.png",
  Credimax: "credimax.png",
  EazyPay: "eazypay.png",
  "KFH Bahrain": "kfh.png",
  BBK: "bbk.png",
  "Al Salam": "al-salam.png",
  BisB: "bisb.png",
  Khaleeji: "khaleeji.png",
  Ithmaar: "ithmaar.png",
  BDB: "bdb.png",
  HBTF: "hbtf.png",
  "Ahli United": "ahli-united.png",
  AlBaraka: "albaraka.png",
  "Arab Bank": "arab-bank.png",
  // Qatar
  QNB: "qnb.png",
  CBQ: "cbq.png",
  "Doha Bank": "doha-bank.png",
  QIB: "qib.png",
  Dukhan: "dukhan.png",
  QIIB: "qiib.png",
  "Masraf Al Rayan": "masraf-al-rayan.png",
  Lesha: "lesha.png",
  // Oman
  "Bank Muscat": "bank-muscat.png",
  NBO: "nbo.png",
  "Bank Dhofar": "bank-dhofar.png",
  "Bank Nizwa": "bank-nizwa.png",
  Alizz: "alizz.png",
  Sohar: "sohar.png",
  "Oman Arab Bank": "oman-arab-bank.png",
  Ahli: "ahli.png",
  // UAE & KSA
  "Al Rajhi": "al-rajhi.png",
  ADIB: "adib.png",
  "Abu Dhabi Islamic Bank": "adib.png",
  FAB: "fab.png",
  Mashreq: "mashreq.png",
  // International banks
  ICBC: "icbc.png",
  Citi: "citi.png",
  HSBC: "hsbc.png",
  "Standard Chartered": "standard-chartered.png",
  SBI: "sbi.png",
  ICICI: "icici.png",
  UBL: "ubl.png",
  "BNP Paribas": "bnp-paribas.png",
  "BLOM Bank": "blom-bank.png",
  "Bank Audi": "bank-audi.png",
  "Bank of Beirut": "bank-of-beirut.png",
  "Bank Melli Iran": "bank-melli-iran.png",
  "Bank Saderat Iran": "bank-saderat-iran.png",
  "Habib Bank": "habib-bank.png",
  // Egypt
  Meeza: "meeza.png",
  Tahweel: "tahweel.png",
};

/** Brand name → image filename in /img/brands/ */
export const BRAND_ICONS: Record<string, string> = {
  Visa: "visa.png",
  Mastercard: "mastercard.png",
};

/** Wallet name → image filename in /img/brands/ */
export const WALLET_ICONS: Record<string, string> = {
  "Apple Pay": "apple-pay.png",
  "Google Pay": "google-pay.png",
  "Samsung Pay": "samsung-pay.png",
};

/** Payment network name → logo path (relative to site root) */
export const NETWORK_LOGOS: Record<string, string> = {
  Visa: "/img/brands/visa.png",
  Mastercard: "/img/brands/mastercard.png",
  Amex: "/img/networks/amex.png",
  Diners: "/img/networks/diners.svg",
  Discover: "/img/networks/discover.jpg",
  JCB: "/img/networks/jcb.png",
  Maestro: "/img/networks/maestro.png",
  Meeza: "/img/networks/meeza.png",
  mada: "/img/networks/mada.svg",
  RuPay: "/img/networks/rupay.png",
  UATP: "/img/networks/uatp.svg",
  UnionPay: "/img/networks/unionpay.png",
  KNET: "/img/gateways/knet_icon.svg",
  Benefit: "/img/gateways/benefit_icon.svg",
  OmanNet: "/img/gateways/omannet_icon.svg",
  UPI: "/img/networks/upi.svg",
};

/** Currency code → flag image filename in /img/flags/ */
export const CURRENCY_FLAGS: Record<string, string> = {
  USD: "us.png",
  CAD: "ca.png",
  KWD: "kw.png",
  AED: "ae.png",
  BHD: "bh.png",
  OMR: "om.png",
  QAR: "qa.png",
  SAR: "sa.png",
  EGP: "eg.png",
  INR: "in.png",
  IDR: "id.png",
  IQD: "iq.png",
  KHR: "kh.png",
  EUR: "eu.png",
  GBP: "gb.png",
};

/** Operation slug → display label */
export const OPERATION_LABELS: Record<string, string> = {
  refund: "Refund",
  auth: "Authorize",
  capture: "Capture",
  void: "Void",
  purchase: "Purchase",
  tokenization: "Tokenization",
  autodebit: "AutoDebit",
};

/** Operation slug → icon filename in /img/operations/ */
export const OPERATION_ICONS: Record<string, string> = {
  purchase: "purchase.svg",
  refund: "refund.svg",
  capture: "capture.svg",
  void: "void.svg",
  auth: "authorize.svg",
  tokenization: "tokenization.svg",
  autodebit: "autodebit.svg",
};

export const CATEGORY_LABELS: Record<GatewayCategory, string> = {
  gateway: "PG",
  acquirer: "Acquirer",
  aggregator: "Aggregator",
  processor: "Processor",
  local_debit: "Local Debit",
  wallet: "Wallet",
  bnpl: "BNPL",
  openbanking: "Open Banking",
  specialty: "Specialty",
};

export const CATEGORY_ORDER: GatewayCategory[] = [
  "local_debit",
  "gateway",
  "acquirer",
  "processor",
  "wallet",
  "bnpl",
  "aggregator",
  "specialty",
  "openbanking",
];

export const REGION_CONFIG = {
  gcc: {
    label: "GCC",
    countries: ["Kuwait", "Bahrain", "Qatar", "Oman", "UAE", "KSA"],
  },
  mena: {
    label: "MENA",
    countries: ["Egypt", "Iraq"],
  },
  apac: {
    label: "APAC",
    countries: ["Cambodia", "Indonesia", "India"],
  },
  global: {
    label: "Global",
    countries: ["Canada"],
  },
} as const;

export type RegionKey = keyof typeof REGION_CONFIG;

export const REGION_ORDER: RegionKey[] = ["gcc", "mena", "apac", "global"];

/** Country → currency codes (for deriving currencies from country) */
export const COUNTRY_CURRENCIES: Record<string, string[]> = {
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

export const COUNTRY_FLAGS: Record<string, string> = {
  Kuwait: "\u{1F1F0}\u{1F1FC}",
  Bahrain: "\u{1F1E7}\u{1F1ED}",
  Qatar: "\u{1F1F6}\u{1F1E6}",
  Oman: "\u{1F1F4}\u{1F1F2}",
  UAE: "\u{1F1E6}\u{1F1EA}",
  KSA: "\u{1F1F8}\u{1F1E6}",
  Egypt: "\u{1F1EA}\u{1F1EC}",
  Iraq: "\u{1F1EE}\u{1F1F6}",
  India: "\u{1F1EE}\u{1F1F3}",
  Indonesia: "\u{1F1EE}\u{1F1E9}",
  Cambodia: "\u{1F1F0}\u{1F1ED}",
  Canada: "\u{1F1E8}\u{1F1E6}",
  Global: "\u{1F30E}",
};

/** Country name → flag image filename in /img/flags/ */
export const CURRENCY_FLAGS_BY_COUNTRY: Record<string, string> = {
  Kuwait: "kw.png",
  Bahrain: "bh.png",
  Qatar: "qa.png",
  Oman: "om.png",
  UAE: "ae.png",
  KSA: "sa.png",
  Egypt: "eg.png",
  Iraq: "iq.png",
  India: "in.png",
  Indonesia: "id.png",
  Cambodia: "kh.png",
  Canada: "ca.png",
};
