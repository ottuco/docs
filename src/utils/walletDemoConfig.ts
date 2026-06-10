/**
 * WalletDemo runtime knobs that are NOT about the merchant host —
 * which currency to seed, how much to seed, how much to charge at checkout,
 * and the Payment Methods filter that picks a wallet-capable gateway.
 *
 * The merchant host / Api-Key / SDK key all come from `ACTIVE_CONNECT`
 * in `./sandbox` — flip that one global to retarget every demo on the site.
 */
export const WALLET_DEMO = {
  // Wallet on sandbox.ottu.net is enabled for USD only (PG `ottu-sandbox-usd`).
  currency: "USD",
  seedAmount: "10.00",
  sessionAmount: "8.00",
  pgFilter: {
    plugin: "e_commerce",
    type: "sandbox",
    tags: ["demo"],
    payment_services: ["wallet"],
  },
};
