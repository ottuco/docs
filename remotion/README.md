# AutoPay video pipeline (Remotion)

Short, business-audience walkthrough clips for the AutoPay documentation, built
with [Remotion](https://www.remotion.dev). This is an **isolated workspace** — it
has its own `package.json`, `tsconfig.json`, and `node_modules`, and is **never**
part of the Docusaurus site build.

> **⚠️ TODO(#158914) — clips are first-cut placeholders.** The five compositions in
> `src/compositions/` are storyboards that do **not** yet match the real product.
> They must be revisited and re-recorded once Ankit shares the betabulk AutoPay
> scenario URLs, with copy aligned to his clip scripts (#158914 R5). After editing a
> composition, re-run `npm run render` to refresh the committed MP4s in
> `../static/video/autopay/`.

## Hosting decision — committed, compressed MP4 in `static/`

Rendered clips are committed to **`../static/video/autopay/`** as short, muted,
H.264-compressed MP4s (target < ~2 MB each, hard cap justify > 3 MB) with a poster
PNG per clip. Why committed rather than a CDN:

- **Self-contained + offline.** The root `CLAUDE.md` requires the site to work
  offline with no external API dependencies for core functionality. A CDN embed
  breaks that guarantee; a committed asset does not.
- **No new infrastructure.** There is no CDN/Spaces wiring in this repo today.
  Committing avoids a new deploy dependency and an upload step.
- **The 14 MB wallet GIF was a *format* problem, not a git problem.**
  `static/img/developers/wallet/wallet_reservation_03.gif` is 14 MB because it is
  an uncompressed GIF. A muted H.264 MP4 of the same walkthrough is ~10× smaller
  and far higher quality. The discipline is: keep clips short and compressed, not
  "move video off git."
- Reconsider a CDN only if the committed video set later grows past a few MB.

Size levers if a clip is too large: raise `Config.setCrf(...)` in
`remotion.config.ts` (higher = smaller) or reduce `VIDEO.width/height` in
`src/theme.ts`, then re-render.

## Prerequisites

- Node `20.19.6` (matches the repo `engines`).
- Rendering runs a headless browser (Chromium) that Remotion downloads on first
  use. This needs network access and is **not** available in the DigitalOcean
  site build — by design.

## Render

```bash
cd remotion
npm install          # installs into remotion/node_modules only (gitignored)
npm run render       # → ../static/video/autopay/<clip>.mp4 + <clip>-poster.png
```

Preview interactively while iterating on a composition:

```bash
npm start            # opens Remotion Studio
```

Add or edit clips in `src/compositions/`, register them in `src/Root.tsx`, and add
their id + poster frame to the `clips` array in `scripts/render-all.mjs`.

## Why this never runs during a deploy

The DigitalOcean deploy runs `npm ci → npm run typecheck → npm test → npm run
gen-api → npm run build` at the repo root:

- `npm ci` installs **root** dependencies only. Remotion is not a root dependency
  and `remotion/` is not an npm workspace, so it is never installed on deploy.
- `npm run build` (`docusaurus build`) never descends into `remotion/`.
- `npm run typecheck` (`tsc`) excludes `remotion/` (see `exclude` in the root
  `tsconfig.json`). Verified: a deliberate type error inside `remotion/` does not
  fail the root typecheck.
- `remotion/node_modules/` and `remotion/out/` are gitignored; only the rendered
  MP4 + poster in `static/video/autopay/` are committed.
