/**
 * Docs-side builder for the sandbox checkout demo guide payload
 * (ticket #151425).
 *
 * TODO(backend): This is client-side dummy data. In the long run the
 * backend should generate this payload from the actual pg_codes + merchant
 * country it selected for the session, and sign/compress it before handing
 * it back to the docs. For now we construct it here so the docs team can
 * demo the feature end-to-end without waiting on Core.
 *
 * Contract with frontend_public:
 *   - `methods[].code` must match the `name` attribute the Checkout SDK
 *     sets on each rendered method row (`apple_pay`, `google_pay`,
 *     `ottu_pg`, `redirect`).
 *   - `methods[].variant` (optional) discriminates multiple methods with
 *     the same `name` by matching the custom attribute whose key equals
 *     `name` (e.g. for `redirect`: `redirect="gbk-credit"`).
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

// ── Per-pg_code metadata table ─────────────────────────────────────────
//
// Each entry is keyed by the SDK `name` attribute and optional `variant`.
// The docs-side `pgCodes` list (from the Payment Methods API) identifies
// which of these to include in the emitted payload.

type MethodMeta = Omit<DemoPaymentMethod, "code" | "variant">;

const METHOD_TABLE: Array<{
  code: DemoPaymentMethod["code"];
  variant?: string;
  matchPgCode?: (pgCode: string) => boolean;
  meta: MethodMeta;
}> = [
  // ── Wallet-type methods (typically `name="apple_pay"` or "google_pay") ──
  {
    code: "apple_pay",
    matchPgCode: (pg) => pg.toLowerCase().includes("apple"),
    meta: {
      title: "Apple Pay",
      available: false, // sandbox can't trigger real ApplePaySession without a paired device
      description:
        "Apple Pay is visible but cannot be tested in the sandbox without an Apple-signed device.",
      unavailable_note:
        "Try Apple Pay from a real iOS device or Mac with Safari and a test card provisioned in Wallet. For this sandbox walkthrough, use the `redirect` card option below.",
    },
  },
  {
    code: "google_pay",
    matchPgCode: (pg) => pg.toLowerCase().includes("gpay") || pg.toLowerCase().includes("google"),
    meta: {
      title: "Google Pay",
      available: false,
      description:
        "Google Pay requires a Google-signed test profile. We skip it in this sandbox tour.",
      unavailable_note:
        "Available in real integrations only. Stick with the redirect flow below to complete the demo.",
    },
  },
  // ── Ottu PG (saved-card / auto-debit / token) ─────────────────────────
  {
    code: "ottu_pg",
    matchPgCode: (pg) => pg.toLowerCase().includes("auto_deb") || pg.toLowerCase().includes("auto-deb"),
    variant: "auto-debit",
    meta: {
      title: "Saved card — Auto-Debit",
      available: true,
      description:
        "Charges a previously tokenized card without the customer retyping details. In this demo the card is already saved.",
      test_data: { ...TEST_CARD_DATA },
      copy_values: { ...TEST_CARD_COPY },
    },
  },
  {
    code: "ottu_pg",
    matchPgCode: (pg) => pg.toLowerCase().includes("token") || pg.toLowerCase().includes("pg_token"),
    variant: "token",
    meta: {
      title: "Saved card — Token",
      available: true,
      description:
        "Pay with a card token returned from a previous checkout. No CVV retyping required when the merchant has CVV-less mode enabled.",
      test_data: { ...TEST_CARD_DATA },
      copy_values: { ...TEST_CARD_COPY },
    },
  },
  {
    code: "ottu_pg",
    matchPgCode: (pg) => pg.toLowerCase().includes("samsung"),
    variant: "samsung",
    meta: {
      title: "Samsung Wallet",
      available: false,
      description: "Samsung Wallet requires a Samsung-signed device.",
      unavailable_note: "Skip this one — try the redirect card flow instead.",
    },
  },
  // ── Redirect-type methods (hosted bank pages, KNET, MPGS, etc.) ──────
  {
    code: "redirect",
    matchPgCode: () => true, // default for any redirect we don't specifically recognize
    meta: {
      title: "Hosted bank checkout",
      available: true,
      description:
        "Opens the gateway's own payment page in a new tab. After completing payment you'll come back here.",
      test_data: { ...TEST_CARD_DATA },
      copy_values: { ...TEST_CARD_COPY },
      redirects: true,
      redirect_note:
        "You'll be redirected off this page. Complete the payment on the gateway's page, then return here to see the post-payment banner and your webhook arrive in the docs tab.",
    },
  },
];

// ── Payload construction ───────────────────────────────────────────────

/**
 * Build a demo payload from the `pgCodes` list that the Payment Methods API
 * returned for a sandbox session. Unknown pg_codes are simply skipped —
 * no guesses, no crashes.
 */
export function buildGuidePayload(pgCodes: string[]): DemoPayload {
  const methods: DemoPaymentMethod[] = [];
  const seen = new Set<string>();

  for (const pg of pgCodes) {
    for (const entry of METHOD_TABLE) {
      if (!entry.matchPgCode || !entry.matchPgCode(pg)) continue;
      // Dedupe strictly on code+variant: many pg_codes often map to the
      // same UX (e.g. 11 different `redirect` gateways all look identical
      // to the end-user). Showing 11 identical tour steps is noise, so we
      // collapse them into a single "Hosted bank checkout" card.
      const key = `${entry.code}::${entry.variant ?? ""}`;
      if (seen.has(key)) {
        break;
      }
      seen.add(key);
      methods.push({
        code: entry.code,
        ...(entry.variant ? { variant: entry.variant } : {}),
        ...entry.meta,
      });
      break;
    }
  }

  return {
    methods,
    page_intro: "Sandbox demo — guided checkout",
    page_note:
      "Only the methods marked available can be exercised in this sandbox. Use the test card values and follow the guide step by step.",
    post_payment_message:
      "Payment complete. Switch back to the Ottu docs tab — the webhook will appear in the Payment Journey panel there.",
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
 * @param checkoutUrl  The `checkout_url` returned from the Checkout API.
 * @param pgCodes      The `pg_codes` array from the Payment Methods API.
 * @returns A URL with `demo_mode=1&guide_payload=<base64>` appended.
 */
export function appendGuideParams(checkoutUrl: string, pgCodes: string[]): string {
  if (!checkoutUrl) return checkoutUrl;
  try {
    const payload = buildGuidePayload(pgCodes);
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
