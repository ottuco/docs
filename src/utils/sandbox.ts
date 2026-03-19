/**
 * Reusable sandbox session utility for interactive demos.
 *
 * Used by: CheckoutDemo, and future Native Payments / mobile SDK demos.
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
