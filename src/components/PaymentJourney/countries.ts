export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
  region: string;
}

export const COUNTRIES: Country[] = [
  // Middle East
  { code: "KW", name: "Kuwait", flag: "🇰🇼", currency: "KWD", region: "Middle East" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", region: "Middle East" },
  { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED", region: "Middle East" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", currency: "BHD", region: "Middle East" },
  { code: "OM", name: "Oman", flag: "🇴🇲", currency: "OMR", region: "Middle East" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", currency: "QAR", region: "Middle East" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", currency: "IQD", region: "Middle East" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", currency: "JOD", region: "Middle East" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", currency: "LBP", region: "Middle East" },
  { code: "SY", name: "Syria", flag: "🇸🇾", currency: "SYP", region: "Middle East" },
  { code: "YE", name: "Yemen", flag: "🇾🇪", currency: "YER", region: "Middle East" },
  { code: "PS", name: "Palestine", flag: "🇵🇸", currency: "ILS", region: "Middle East" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", currency: "EGP", region: "Middle East" },
  // APAC
  { code: "JP", name: "Japan", flag: "🇯🇵", currency: "JPY", region: "APAC" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", currency: "KRW", region: "APAC" },
  { code: "CN", name: "China", flag: "🇨🇳", currency: "CNY", region: "APAC" },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", region: "APAC" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", currency: "SGD", region: "APAC" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", currency: "MYR", region: "APAC" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", currency: "IDR", region: "APAC" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", currency: "THB", region: "APAC" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", currency: "PHP", region: "APAC" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", currency: "VND", region: "APAC" },
  // South Asia
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR", region: "South Asia" },
];

export const DEFAULT_COUNTRY_INDEX = 0;
