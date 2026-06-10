export interface SeedWalletOptions {
  customer_id: string;
  currency: string;
  amount: string;
  pg_code: string;
}

export interface SeedWalletResult {
  customer_id: string;
  balance: string;
  currency: string;
  account_uuid: string;
  raw: unknown;
}

/**
 * Where the /seed-wallet endpoint lives.
 * - Local dev (localhost): the mcp-server runs at :8090 via `npm run webhook`.
 * - Production: DO App Platform ingress routes /seed-wallet on the same origin to the mcp service.
 */
function seedWalletUrl(): string {
  if (typeof window === "undefined") return "/seed-wallet";
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:8090/";
  }
  return "/seed-wallet";
}

/**
 * Seed a wallet credit for the docs Live Demo by calling the mcp service's
 * /seed-wallet route. The mcp service holds the Keycloak client secret and
 * mints a Bearer token for the wallet API on behalf of the browser.
 */
export async function seedWalletViaBackend(
  opts: SeedWalletOptions
): Promise<SeedWalletResult> {
  const response = await fetch(seedWalletUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ottu-demo": "seed-wallet",
    },
    body: JSON.stringify(opts),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Wallet seed failed (${response.status}): ${text || response.statusText}`);
  }
  const data = JSON.parse(text);
  return {
    customer_id: opts.customer_id,
    balance: data.balance,
    currency: data.currency ?? opts.currency,
    account_uuid: data.account_uuid,
    raw: data,
  };
}
