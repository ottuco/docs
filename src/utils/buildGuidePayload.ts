/**
 * Docs-side builder for the sandbox checkout demo guide payload
 * (ticket #151425).
 *
 * Builds a `DemoPayload` from the actual Payment Methods API response,
 * deriving the SDK element `code` (apple_pay | google_pay | ottu_pg |
 * redirect) from each method's `wallets` and `is_tokenizable` fields.
 * Every pg_code gets its own tour step — no deduplication.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ FUTURE BACKEND MIGRATION (ticket #151425)                      │
 * │                                                                 │
 * │ Currently the docs site builds this payload client-side and     │
 * │ passes it via `guide_payload` query param on the checkout URL.  │
 * │                                                                 │
 * │ Planned backend approaches (either/or):                         │
 * │                                                                 │
 * │ A) Backend injects guide data into the redirect URL query       │
 * │    params during `/b/checkout/redirect/start/` redirect.        │
 * │    The backend already forwards `demo_mode` + `guide_payload`   │
 * │    params; it would replace the docs-built payload with its own │
 * │    signed/authoritative version.                                │
 * │                                                                 │
 * │ B) Backend includes guide data as an extra field in the         │
 * │    checkout-page API response:                                  │
 * │    GET /b/checkout/api/intl/v1/checkout-page/{session_id}       │
 * │    → response.demo_guide: { methods: [...], ... }               │
 * │    The frontend reads it from the API instead of query params.  │
 * │                                                                 │
 * │ When migrated: delete this file from docs, remove query-param   │
 * │ parsing in frontend_public/src/lib/demoGuide/demoPayload.ts,    │
 * │ and read from the backend-provided source instead.              │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Contract with frontend_public:
 *   - `methods[].code` must match the `name` attribute the Checkout SDK
 *     sets on each rendered method row (`apple_pay`, `google_pay`,
 *     `ottu_pg`, `redirect`).
 *   - `methods[].variant` must match the pg_code attribute value the SDK
 *     sets (e.g. `redirect="knet-test"`, `ottu_pg="ottu_sdk"`).
 *   - All strings are plain text — the frontend runs them through
 *     DOMPurify at parse time anyway, but keep them clean on our end.
 *
 * See `frontend_public/src/lib/demoGuide/types.ts` for the canonical shape.
 */

import { TEST_CARD } from "@site/src/components/TestCardCallout";

// ── Payload type mirror (kept in sync with frontend_public) ────────────

type DemoPaymentMethod = {
  code: string;
  variant?: string;
  pg_code?: string;
  title: string;
  available: boolean;
  description?: string;
  test_data?: Record<string, string>;
  copy_values?: Record<string, string>;
  redirects?: boolean;
  redirect_note?: string;
  unavailable_note?: string;
};

export type DemoPayload = {
  methods: DemoPaymentMethod[];
  page_intro?: string;
  page_note?: string;
  post_payment_message?: string;
  /** URL the post-payment "Back to docs" button navigates to. */
  back_url?: string;
};

/**
 * Shape of a single entry from the Payment Methods API response
 * (`response.payment_methods[]`).
 */
export type PaymentMethodFromAPI = {
  code: string;
  name: string;
  wallets?: string[];
  is_sandbox?: boolean;
  is_tokenizable?: boolean;
  auto_debit_enabled?: boolean;
  logo?: string;
};

// ── Fixed helper blocks ────────────────────────────────────────────────

const TEST_CARD_DATA = {
  "Card Number": TEST_CARD.number,
  Expiry: TEST_CARD.expiry,
  CVV: TEST_CARD.cvv,
} as const;

const TEST_CARD_COPY = {
  "Card Number": TEST_CARD.number.replace(/\s+/g, ""),
  Expiry: TEST_CARD.expiry,
  CVV: TEST_CARD.cvv,
} as const;

// ── SDK code derivation ───────────────────────────────────────────────
//
// The Checkout SDK groups payment methods into 4 buckets and sets the
// `name` attribute on each `.ottu__sdk-payment-method` element:
//
//   wallets includes "ApplePay"    → name="apple_pay"
//   wallets includes "GooglePay"   → name="google_pay"
//   is_tokenizable (inline card)   → name="ottu_pg"
//   everything else (bank page)    → name="redirect"
//
// The pg_code is set as a custom attribute whose key equals the `name`:
//   e.g. redirect="knet-test", apple_pay="apple-pay-alrayn"

function deriveSdkCode(method: PaymentMethodFromAPI): string {
  const wallets = method.wallets ?? [];
  if (wallets.some((w) => w.toLowerCase().includes("apple"))) return "apple_pay";
  if (wallets.some((w) => w.toLowerCase().includes("google"))) return "google_pay";
  if (wallets.some((w) => w.toLowerCase().includes("samsung"))) return "samsung_pay";
  if (method.is_tokenizable) return "ottu_pg";
  return "redirect";
}

function isWalletMethod(code: string): boolean {
  return code === "apple_pay" || code === "google_pay" || code === "samsung_pay";
}

// ── Payload construction ───────────────────────────────────────────────

/**
 * Build a demo payload from the Payment Methods API response. Each
 * payment method gets its own tour step — no deduplication.
 *
 * @param paymentMethods  The `payment_methods` array from the API response.
 */
export function buildGuidePayload(paymentMethods: PaymentMethodFromAPI[]): DemoPayload {
  const methods: DemoPaymentMethod[] = [];

  for (const pm of paymentMethods) {
    if (!pm.code || !pm.name) continue;

    const sdkCode = deriveSdkCode(pm);
    const isWallet = isWalletMethod(sdkCode);
    const isRedirect = sdkCode === "redirect";

    // ── Per-method description + unavailability reason ──────────
    let description: string;
    let unavailableNote: string | undefined;

    if (sdkCode === "apple_pay") {
      description =
        `Selecting ${pm.name} lets you pay instantly using a card stored in your Apple Wallet. The payment is processed via Apple's secure tokenization — no card details are entered manually.`;
      unavailableNote =
        `${pm.name} requires an Apple device (iPhone, iPad, or Mac with Touch ID/Face ID) with a card added to Apple Wallet. It cannot be used in a standard desktop browser or the sandbox.`;
    } else if (sdkCode === "google_pay") {
      description =
        `Selecting ${pm.name} lets you pay using a payment method saved in your Google account. The transaction is completed with a single tap — no card details needed.`;
      unavailableNote =
        `${pm.name} requires a Google account with a saved payment method and a supported browser or device. It may not be available in the sandbox environment.`;
    } else if (sdkCode === "samsung_pay") {
      description =
        `Selecting ${pm.name} lets you pay using a card registered in your Samsung Wallet. The payment is authorized via Samsung's secure tokenization.`;
      unavailableNote =
        `${pm.name} requires a Samsung device with the Samsung Pay app installed and your Samsung account logged in. It is not available on non-Samsung devices or in the sandbox.`;
    } else if (isRedirect) {
      description =
        `Selecting ${pm.name} redirects you to the ${pm.name} payment gateway page. Complete the payment there using the test card details below, and you'll be returned here automatically.`;
    } else {
      // ottu_pg — inline card form
      description =
        `Selecting ${pm.name} opens an inline card form right here on this page. Enter the test card details below, then click pay — no redirect needed.`;
    }

    const entry: DemoPaymentMethod = {
      code: sdkCode,
      variant: pm.code,
      pg_code: pm.code,
      title: pm.name,
      available: !isWallet,
      description,
    };

    if (isWallet && unavailableNote) {
      entry.unavailable_note = unavailableNote;
    }

    // Attach test card data to card-accepting methods (ottu_pg + redirect)
    if (!isWallet) {
      entry.test_data = { ...TEST_CARD_DATA };
      entry.copy_values = { ...TEST_CARD_COPY };
    }

    if (isRedirect) {
      entry.redirects = true;
      entry.redirect_note =
        `You'll be redirected off this page to the ${pm.name} gateway. After completing payment, you'll return here to see the result.`;
    }

    methods.push(entry);
  }

  return {
    methods,
    page_intro: "Sandbox demo — guided checkout",
    page_note:
      "Only the methods marked available can be exercised in this sandbox. Use the test card values and follow the guide step by step.",
    post_payment_message:
      "Payment complete. Switch back to the Ottu docs tab — the webhook will appear in the Payment Journey panel there.",
    back_url: typeof window !== "undefined" ? window.location.href : undefined,
  };
}

// ── Base64 encoding (UTF-8 safe) ───────────────────────────────────────

/**
 * Encode a demo payload as base64 so it can ride on the URL. UTF-8 safe via
 * TextEncoder — the naive `btoa(JSON.stringify(...))` path throws on any
 * non-Latin-1 codepoint.
 */
export function encodeGuidePayload(payload: DemoPayload): string {
  const json = JSON.stringify(payload);
  if (typeof TextEncoder !== "undefined" && typeof btoa === "function") {
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  // SSR / node fallback (Docusaurus build can eval this file statically).
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf8").toString("base64");
  }
  return "";
}

/**
 * Append the demo-guide query params to a checkout URL. Returns a new
 * URL string — never mutates the input.
 *
 * @param checkoutUrl      The `checkout_url` returned from the Checkout API.
 * @param paymentMethods   The `payment_methods` array from the Payment Methods API.
 * @returns A URL with `demo_mode=1&guide_payload=<base64>` appended.
 */
export function appendGuideParams(
  checkoutUrl: string,
  paymentMethods: PaymentMethodFromAPI[],
): string {
  if (!checkoutUrl) return checkoutUrl;
  try {
    const payload = buildGuidePayload(paymentMethods);
    if (payload.methods.length === 0) return checkoutUrl;
    const encoded = encodeGuidePayload(payload);
    if (!encoded) return checkoutUrl;

    const url = new URL(checkoutUrl);
    url.searchParams.set("demo_mode", "1");
    url.searchParams.set("guide_payload", encoded);
    if (payload.post_payment_message) {
      // Also expose the post-payment message as its own param so the
      // post-payment page can read it directly without decoding the
      // full guide payload.
      url.searchParams.set(
        "post_payment_message",
        typeof btoa === "function"
          ? btoa(unescape(encodeURIComponent(payload.post_payment_message)))
          : Buffer.from(payload.post_payment_message, "utf8").toString("base64"),
      );
    }
    return url.toString();
  } catch {
    // If anything goes wrong (invalid URL, quota, etc.), return the
    // unmodified URL — the demo tour just won't fire on the checkout page.
    return checkoutUrl;
  }
}
