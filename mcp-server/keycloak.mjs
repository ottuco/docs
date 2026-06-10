// Generic Keycloak `client_credentials` token client. Not tied to wallet.
// Reusable for any future backend service that needs to call a Keycloak-protected
// Ottu API on behalf of the docs site.
//
// Usage:
//   import { getKeycloakToken } from "./keycloak.mjs";
//   const token = await getKeycloakToken({
//     url: "https://auth.ottu.dev",
//     realm: "ksa.ottu.dev",
//     clientId: "backend",
//     clientSecret: process.env.KSA_KEYCLOAK_CLIENT_SECRET,
//   });

const CLOCK_SKEW_MS = 30_000;
const tokenCache = new Map(); // cacheKey → { accessToken, expiresAtMs }

export async function getKeycloakToken({ url, realm, clientId, clientSecret }) {
  if (!clientSecret) {
    throw new Error(`Missing Keycloak client secret for ${clientId}@${realm}`);
  }
  const cacheKey = `${url}|${realm}|${clientId}`;
  const cached = tokenCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAtMs - CLOCK_SKEW_MS > now) {
    return cached.accessToken;
  }

  const tokenUrl = `${url}/auth/realms/${encodeURIComponent(realm)}/protocol/openid-connect/token`;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
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
  const entry = {
    accessToken: data.access_token,
    expiresAtMs: now + (data.expires_in ?? 300) * 1000,
  };
  tokenCache.set(cacheKey, entry);
  return entry.accessToken;
}
