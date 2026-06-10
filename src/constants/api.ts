// Base URL shown in all API code samples — the host developers copy.
// docs.ottu.com advertises the public sandbox `sandbox.ottu.net` only.
export const OTTU_CONNECT_BASE_URL = "https://sandbox.ottu.net";

// Backwards-compatible alias. Historically `OTTU_DEV_BASE_URL` pointed at
// `ksa.ottu.dev` for APIs not yet on the public sandbox; both constants now
// resolve to the same base. Prefer `OTTU_CONNECT_BASE_URL` in new code.
export const OTTU_DEV_BASE_URL = OTTU_CONNECT_BASE_URL;
