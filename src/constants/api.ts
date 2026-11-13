// Base URL shown in all API code samples — the host developers copy.
// docs.ottu.com advertises the public sandbox `sandbox.ottu.net` only.
export const OTTU_CONNECT_BASE_URL = "https://sandbox.ottu.net";

// Backwards-compatible alias. Historically `OTTU_DEV_BASE_URL` pointed at
// `ksa.ottu.dev` for APIs not yet on the public sandbox; both constants now
// resolve to the same base. Prefer `OTTU_CONNECT_BASE_URL` in new code.
export const OTTU_DEV_BASE_URL = OTTU_CONNECT_BASE_URL;

// Connect SDK (Checkout v4) bundle the docs tell merchants to load. It exposes
// the `OttuSDK` global (`OttuSDK.ConnectSDK`, `OttuSDK.CheckoutTheme`).
export const CONNECT_SDK_CDN_URL = "https://js.ottu.dev/connect/ottu-sdk.iife.js";
