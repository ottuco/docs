import { getActiveEnv } from "./walletDemoEnv.mjs";

const CLOCK_SKEW_MS = 30_000;

let cachedToken = null; // { accessToken, expiresAtMs }

export async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAtMs - CLOCK_SKEW_MS > now) {
    return cachedToken.accessToken;
  }

  const env = getActiveEnv();
  if (!env.keycloak_client_secret) {
    throw new Error(
      `Missing Keycloak client secret. Set env var '${env.secret_var_names.keycloak_client_secret}'.`
    );
  }

  const tokenUrl = `${env.keycloak_url}/auth/realms/${encodeURIComponent(env.keycloak_realm)}/protocol/openid-connect/token`;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.keycloak_client_id,
    client_secret: env.keycloak_client_secret,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Keycloak token request failed (${response.status}): ${text || response.statusText}`);
  }

  const data = await response.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAtMs: now + (data.expires_in ?? 300) * 1000,
  };
  return cachedToken.accessToken;
}
