import {
  KSA_AUTH_KEY,
  KSA_CONNECT_BASE_URL,
  KSA_MERCHANT_ID,
} from "./sandbox";

/**
 * WalletDemo runtime config. Wallet only ships on ksa.ottu.dev today, so this
 * targets it directly. When wallet lands on another merchant, swap the imports
 * (or add a new constant set in sandbox.ts) — no separate config file needed.
 */
export const WALLET_DEMO: {
  merchantId: string;
  connectBaseUrl: string;
  apiKey: string;
  currency: string;
  seedAmount: string;
  sessionAmount: string;
  pgFilter: {
    plugin: string;
    type: string;
    tags: string[];
    payment_services: string[];
  };
} = {
  merchantId: KSA_MERCHANT_ID,
  connectBaseUrl: KSA_CONNECT_BASE_URL,
  apiKey: KSA_AUTH_KEY,
  currency: "KWD",
  seedAmount: "10.000",
  sessionAmount: "8.000",
  pgFilter: {
    plugin: "e_commerce",
    type: "sandbox",
    tags: ["demo"],
    payment_services: ["wallet"],
  },
};
