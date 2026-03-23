export interface TestCard {
  cardNumber: string;
  expiry: string;
  cvv: string;
  brand: string;
  status: "success" | "declined";
  statusLabel: string;
  note?: string;
}

export interface Gateway {
  slug: string;
  name: string;
  country: string;
  countryFlag: string;
  currencies: string[];
  inquiryMinutes: number | null;
  operations: string[];
  type: "redirect" | "wallet";
  operationMode: "purchase" | "purchase_authorize";
  logo: string;
  testCards: TestCard[];
  testCardNotes?: string;
  docsUrl?: string;
}
