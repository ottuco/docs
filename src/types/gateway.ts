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
  | "psp_ptsp"
  | "gateway"
  | "wallet"
  | "bnpl"
  | "processor"
  | "local_debit"
  | "acquirer"
  | "openbanking"
  | "specialty";

export interface Gateway {
  slug: string;
  name: string;
  countries: string[];
  currencies: string[];
  inquiryMinutes: number | null;
  operations: string[];
  integrationType: string;
  category: GatewayCategory;
  operationMode: "purchase" | "purchase_authorize";
  logo: string;
  acceptedAt: string[];
  cardBrands: string[];
  digitalWallets: string[];
  testCards: TestCard[];
  testCardNotes?: string;
  docsUrl?: string;
}
