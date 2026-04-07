export interface TestCard {
  cardNumber: string;
  expiry: string;
  cvv: string;
  brand: string;
  status: "success" | "declined";
  statusLabel: string;
  note?: string;
}

export type GatewayCategory =
  | "aggregator"
  | "gateway"
  | "wallet"
  | "bnpl"
  | "psp"
  | "processor"
  | "bank"
  | "openbanking"
  | "ottu"
  | "specialty";

export interface Gateway {
  slug: string;
  name: string;
  countries: string[];
  providerType: string;
  currencies: string[];
  inquiryMinutes: number | null;
  operations: string[];
  integrationType: string;
  category: GatewayCategory;
  operationMode: "purchase" | "purchase_authorize";
  logo: string;
  services?: string[];
  testCards: TestCard[];
  testCardNotes?: string;
  docsUrl?: string;
}
