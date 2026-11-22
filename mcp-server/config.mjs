// Per-merchant backend config used by handlers in server.mjs.
// Mirrors the SANDBOX_AUTH_KEY pattern in src/utils/sandbox.ts: hardcode the
// non-secret bits, read secrets from env vars at use sites.
//
// Adding a new merchant: append a new export object here, import in server.mjs
// where needed. No new config files.

export const KSA_OTTU_DEV = {
  merchantId: "ksa.ottu.dev",
  walletUrl: "https://wallet.ottu.dev",
  keycloak: {
    url: "https://auth.ottu.dev",
    realm: "ksa.ottu.dev",
    clientId: "backend",
    // Client secret resolved from process.env.KSA_KEYCLOAK_CLIENT_SECRET at
    // the call site (mcp-server/server.mjs handleSeedWallet).
    clientSecretEnvVar: "KSA_KEYCLOAK_CLIENT_SECRET",
  },
};

// Active docs merchant — the WalletDemo seeds wallet credit here. Shares the
// wallet service + Keycloak host with KSA; only the realm, merchant id, and
// secret differ. Confirmed in Keycloak (auth.ottu.dev): realm
// `sandbox.ottu.net`, client `backend` (Client Id and Secret authenticator).
export const SANDBOX_OTTU_NET = {
  merchantId: "sandbox.ottu.net",
  walletUrl: "https://wallet.ottu.dev",
  keycloak: {
    url: "https://auth.ottu.dev",
    realm: "sandbox.ottu.net",
    clientId: "backend",
    // Client secret resolved from process.env.SANDBOX_KEYCLOAK_CLIENT_SECRET
    // at the call site (mcp-server/server.mjs handleSeedWallet).
    clientSecretEnvVar: "SANDBOX_KEYCLOAK_CLIENT_SECRET",
  },
};

// Limits for the public /seed-wallet demo route (#161374, decision docs-D2,
// default A). The WalletDemo seeds 10.00 USD for a `demo_<random>` customer,
// so these leave the demo as it is and refuse anything else. Each value can be
// changed with an env var on the mcp service, without a code change.
function envList(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export const WALLET_SEED_LIMITS = {
  maxAmount: Number(process.env.SEED_WALLET_MAX_AMOUNT) || 100,
  currencies: envList("SEED_WALLET_CURRENCIES", ["KWD", "USD", "SAR"]),
  customerIdPrefix: "demo_",
  // Empty: any pg_code of letters, digits, "-" and "_" (the demo picks the
  // code from the merchant's wallet-capable gateways at run time).
  pgCodes: envList("SEED_WALLET_PG_CODES", []),
};
