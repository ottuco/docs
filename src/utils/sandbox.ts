/**
 * Reusable sandbox session utility for interactive demos.
 *
 * Used by: CheckoutDemo, RecurringDemo, and future Native Payments / mobile SDK demos.
 * Credentials are intentionally public — sandbox-only, already exposed in CodePen.
 */

export const SANDBOX_MERCHANT_ID = "sandbox.ottu.net";
export const SANDBOX_API_KEY = "13df331cb989d68313b9141e2094d3f042c6d157";
const SANDBOX_AUTH_KEY = "Fxi63E9x.AiYMnCCXcBVr657gs4N3ex3MZdeAeWDy";

export interface CreateSessionOptions {
  pg_codes: string[];
  amount?: string;
  currency_code?: string;
  customer_id?: string;
  type?: string;
  /** Arbitrary extra fields merged into the request body (e.g., payment_type, agreement, payment_instrument, webhook_url) */
  extra?: Record<string, unknown>;
}

export interface SessionResult {
  session_id: string;
  [key: string]: unknown;
}

export async function createSandboxSession(
  options: CreateSessionOptions
): Promise<SessionResult> {
  const body = {
    type: options.type ?? "payment_request",
    pg_codes: options.pg_codes,
    amount: options.amount ?? "20",
    currency_code: options.currency_code ?? "KWD",
    customer_id: options.customer_id ?? "sandbox",
    ...options.extra,
  };

  const response = await fetch(
    `https://${SANDBOX_MERCHANT_ID}/b/checkout/v1/pymt-txn/`,
    {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${SANDBOX_AUTH_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Session creation failed (${response.status}): ${text || response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.session_id) {
    throw new Error("API response missing session_id");
  }

  return data as SessionResult;
}

/**
 * Call the auto-debit endpoint to charge a saved card token.
 */
export async function callAutoDebit(
  sessionId: string,
  token: string
): Promise<any> {
  const response = await fetch(
    `https://${SANDBOX_MERCHANT_ID}/b/pbl/v2/payment/auto-debit/`,
    {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${SANDBOX_AUTH_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId, token }),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Auto-debit failed (${response.status}): ${text || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Call the Payment Methods API to discover available gateways.
 */
export async function callPaymentMethods(options: {
  currencies: string[];
  plugin?: string;
  operation?: string;
  is_sandbox?: boolean;
  tags?: string[];
}): Promise<any> {
  const body: Record<string, unknown> = {
    plugin: options.plugin ?? "payment_request",
    operation: options.operation ?? "purchase",
    currencies: options.currencies,
  };
  if (options.is_sandbox != null) body.is_sandbox = options.is_sandbox;
  if (options.tags) body.tags = options.tags;

  const response = await fetch(
    `https://${SANDBOX_MERCHANT_ID}/b/pbl/v2/payment-methods/`,
    {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${SANDBOX_AUTH_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Payment Methods failed (${response.status}): ${text || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Call the Payment Status Query (PSQ) API.
 */
export async function callPaymentStatusQuery(
  sessionId: string
): Promise<any> {
  const response = await fetch(
    `https://${SANDBOX_MERCHANT_ID}/b/pbl/v2/inquiry/`,
    {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${SANDBOX_AUTH_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId }),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `PSQ failed (${response.status}): ${text || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get the base URL for webhook_url sent to Ottu (must be reachable from the internet).
 * In local dev, uses the ifr.ottu.me tunnel.
 * In production, uses the current origin.
 */
export function getWebhookBaseUrl(): string {
  if (typeof window === "undefined") return "";
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "https://ifr.ottu.me";
  }
  return window.location.origin;
}

/**
 * Get the base URL for the browser's SSE connection to the webhook relay.
 * In local dev, connects directly to localhost:8090 (the webhook server).
 * In production, uses the current origin (same server handles both).
 */
export function getWebhookSSEUrl(): string {
  if (typeof window === "undefined") return "";
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:8090";
  }
  return window.location.origin;
}
