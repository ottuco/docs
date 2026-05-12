// Public-sandbox default. Use for any code sample whose API surface is
// already shipped on the public sandbox (`sandbox.ottu.net`).
export const OTTU_CONNECT_BASE_URL = "https://sandbox.ottu.net";

// Dev-only override. Use for APIs not yet promoted to the public sandbox
// — e.g. wallet endpoints, currently only available on `ksa.ottu.dev`.
// Remove call sites and standardize on OTTU_CONNECT_BASE_URL once the API
// ships to public sandbox.
export const OTTU_DEV_BASE_URL = "https://ksa.ottu.dev";
