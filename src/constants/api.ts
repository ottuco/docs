// Base URL for all API code samples and interactive demos.
// Points at Ottu's KSA dev environment (`ksa.ottu.dev`), which currently
// hosts the full public API surface including wallet endpoints.
export const OTTU_CONNECT_BASE_URL = "https://ksa.ottu.dev";

// Backwards-compatible alias. Historically `OTTU_DEV_BASE_URL` pointed at
// `ksa.ottu.dev` for APIs not yet on the public sandbox; both constants now
// resolve to the same base. Prefer `OTTU_CONNECT_BASE_URL` in new code.
export const OTTU_DEV_BASE_URL = OTTU_CONNECT_BASE_URL;
