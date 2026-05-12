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
