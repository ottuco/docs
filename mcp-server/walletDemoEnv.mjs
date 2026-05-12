import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const YAML_PATH = path.resolve(__dirname, "../wallet-demo-environments.yaml");

let cached = null;

export function getActiveEnv() {
  if (cached) return cached;
  const doc = yaml.load(fs.readFileSync(YAML_PATH, "utf8"));
  const name = process.env.WALLET_DEMO_ENV || doc.default;
  const env = doc.environments?.[name];
  if (!env) {
    throw new Error(
      `Unknown WALLET_DEMO_ENV: '${name}'. Known: ${Object.keys(doc.environments || {}).join(", ")}`
    );
  }
  cached = {
    name,
    merchant_id: env.merchant_id,
    connect_base_url: env.connect_base_url,
    wallet_url: env.wallet_url,
    keycloak_url: env.keycloak_url,
    keycloak_realm: env.keycloak_realm,
    keycloak_client_id: env.keycloak_client_id,
    currency: env.currency,
    seed_amount: env.seed_amount,
    session_amount: env.session_amount,
    pg_filter: env.pg_filter,
    secret_var_names: env.secrets,
    keycloak_client_secret: process.env[env.secrets.keycloak_client_secret] || "",
    connect_api_key: process.env[env.secrets.connect_api_key] || "",
  };
  return cached;
}
