# Connect SDK Section Instructions

Rules for the Connect SDK (Checkout v4) pages. They follow the root and `docs/developers/CLAUDE.md`
rules; where `checkout-sdk/CLAUDE.md` differs, this file wins for this folder.

- **Multi-page section** (sidebar Pattern B): `index` (overview), `quick-start`, `reference`, one page per
  payment-method group, `theming-and-localisation`, `errors`, `migration-from-v3`.
- **Frontmatter**: `title`, `description`, `toc_min_heading_level: 2`, `toc_max_heading_level: 3`.
- **Script tag**: never hardcode the bundle URL. Import `CONNECT_SDK_CDN_URL` from
  `@site/src/constants/api` and render the sample with `<CodeBlock>` template literals.
- **Entry point**: `const sdk = new OttuSDK.ConnectSDK(); sdk.init({...})`. `init` returns a promise;
  every sample handles its rejection.
- **Demo values**: `merchant_id: "sandbox.ottu.net"`, `apiKey: "your_public_api_key"` linking to
  `/developers/getting-started/authentication#public-key`.
- **Referencing v3 is allowed here** (unlike `checkout-sdk/`): the migration guide and the overview
  compare against the Checkout SDK v3. Keep other pages about the Connect SDK only.
- **Option anchors**: the reference documents each option as an H4 `` #### `name` `` (anchor = the
  name, lower-cased), callbacks as H3 `` ### `onSuccess` `` (anchor `onsuccess`). Link to these.
- **Source of truth**: `ottuco/connect-sdk` `src/types`. Document only what the code does; don't
  publish SDK bugs or internals (file paths, Sentry, SDK Studio internals beyond precedence).
