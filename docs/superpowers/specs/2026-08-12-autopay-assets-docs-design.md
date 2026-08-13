# AutoPay Docs — Screenshots & Remotion Video Pipeline — Design

**Epic:** [Redmine #158909](https://orbit.ottu.com/issues/158909) — AutoPay public documentation
**This spec covers two child tickets (owner: Junaid Sarfraz):**
- [#158913](https://orbit.ottu.com/issues/158913) — Screenshot and UI asset pass for AutoPay docs
- [#158914](https://orbit.ottu.com/issues/158914) — Remotion video pipeline and AutoPay business clips

**Initiative:** [#153557](https://orbit.ottu.com/issues/153557) (AutoPay frontend) / [#153643](https://orbit.ottu.com/issues/153643) (AutoPay)
**Branch:** `task/153557-autopay-docs` (fork from `dev`)
**Date:** 2026-08-12
**Reference model:** M-Wallet public docs — [`docs/superpowers/specs/2026-05-11-wallet-public-docs-design.md`](./2026-05-11-wallet-public-docs-design.md) and its plan. Every convention below is inherited from the wallet pass; deviations are called out.

## Overview

AutoPay is a new recurring-payments product. Its public documentation is a six-ticket epic. This spec is scoped to the **two asset-production tickets** owned by Junaid: the screenshot pass and the from-scratch Remotion video pipeline. Both feed the pages authored by others:

- **Developer section** (`/developers/payments/autopay/`) — Ankit, #158910 — code-first, **no dashboard screenshots**.
- **Business section** (`/business/autopay/`) — Ankit, #158912 — single long page, feature-and-benefit, dashboard screenshots + video.

Neither page exists in the repo yet — AutoPay is entirely greenfield in `docs` (no pages, no `static/img/*/autopay`, no video anywhere in the repo).

This spec produces: the screenshot files + a wiring manifest; a self-contained Remotion workspace; a reusable `<VideoEmbed>` component; 3–5 rendered business clips; and a **scaffold of the three asset-bearing business sections** so the assets are wired end-to-end and Ankit inherits a working start.

## Goals

- Land all 22 delivered customer/notification screenshots under `static/img/business/autopay/`, convention-named, none a placeholder stub, all ≤ ~200 KB.
- Deliver a manifest mapping every image → the `<StepGuide>` step / business-page section that consumes it, confirmed by the page author (#158913 AC4).
- Stand up Remotion in the repo with a documented render command that **never runs during `npm run typecheck` or `npm run build`** (#158914 R3).
- Commit small, compressed MP4 clips + poster PNGs to `static/`, with the hosting decision written down (#158914 R1).
- Ship a documented, reusable `<VideoEmbed>` component (poster, dimensions, caption, reduced-motion) — a repo pattern like `<StepGuide>`/`<ApiDocEmbed>` (#158914 R2).
- Produce 3–5 business-audience clips and embed them into `docs/business/autopay/index.md` (#158914 R4/R5).

## Non-Goals

- **Authoring the developer or business page prose.** That is Ankit's #158910 / #158912. This spec scaffolds only the three asset-bearing business sections (§6/§7/§8) with wired components and placeholder prose flagged for Ankit; it does not write the other eight sections.
- **Any Arabic docs-site work.** The site is English-only (`docusaurus.config.ts` → `locales: ["en"]`). The notification screenshots include Arabic *email templates* because the emails ship bilingual and R3 asks for both — this is not docs-site translation.
- **Developer-section screenshots.** #158910 R4 is explicit: create only `static/img/developers/autopay/.gitkeep`. The developer page is code + diagrams.
- **Anything gated on core_backend PR #121** (API-spec-generated content). This spec produces no `<ApiDocEmbed>` output.
- **Audio / voiceover / captions burned into video.** Clips are short, muted, silent walkthroughs. Captions are page-level (`<VideoEmbed caption>`), not baked in.

## Audience and Scope Split

| Asset | Feeds | Audience rule |
|---|---|---|
| 22 customer-portal + email screenshots | `business/autopay` §6/§7/§8 | Business: dashboard/customer screens, no code |
| 2 merchant-dashboard screenshots (not yet available) | `business/autopay` §6/§8 | Business |
| 3–5 Remotion clips | `business/autopay` §6/§8 (+ §7 optional) | Business |
| `static/img/developers/autopay/.gitkeep` | developer page | Developer: code-only, placeholder dir |

## Ticket #158913 — Screenshots

### Target directories (R1)

```
static/img/business/autopay/      NEW  + .gitkeep   ← all 22 delivered PNGs land here
static/img/developers/autopay/    NEW  + .gitkeep   ← .gitkeep ONLY (dev = code-only, per #158910 R4)
```

Images are referenced from docs by absolute site-root path (`/img/business/autopay/portal-01-summary-active.png`), never relative.

### Naming (R2)

Menna's delivered files already follow the wallet convention `<flow>-0N-<slug>.png`. **Keep the delivered names as-is** — they are consistent and descriptive; no gratuitous renames. (`portal-01-summary-active.png` is a valid `<flow>-0N-<slug>` — `summary-active` is the slug.)

### Delivered set (22 files, all 16–154 KB, all ≤ 200 KB, none a stub)

| Flow | Files |
|---|---|
| Portal states | `portal-01-summary-active`, `portal-02-trialing`, `portal-03-canceled-pending-reactivation`, `portal-04-expired`, `portal-05-no-cards` |
| Recovery / pay outstanding | `recovery-01-past-due`, `recovery-02-payment-confirmed`, `recovery-03-payment-terms-alert` |
| Cancellation | `cancellation-01-confirm`, `cancellation-02-reason-options` |
| Reactivation | `reactivation-01-confirm` |
| Cards | `cards-01-delete-confirm` |
| Error / empty states | `states-01-loading`, `states-02-magic-link-expired`, `states-03-magic-link-invalid`, `states-04-network-error` |
| Notifications (EN+AR) | `notifications-01-upcoming-charge-en`, `-02-upcoming-charge-ar`, `-03-payment-failed-en`, `-04-payment-failed-ar`, `-05-final-failure-en`, `-06-final-failure-ar` |

Provenance verified: these are the **customer** self-service portal (`frontend_public@task/153557`, `SubscriptionPage.vue`, route `subscription/:page_token` — the magic-link page, which is why the set includes `magic-link-expired`/`-invalid`), plus the notification email templates.

### R3 coverage and gaps

| R3 item | Covered by | Status |
|---|---|---|
| Customer: Summary | `portal-01-summary-active` | ✅ |
| Customer: Billing history | `portal-01` (Payment History block, full-page capture) | ✅ folded |
| Customer: Saved cards w/ active marked | `portal-01` (Payment Methods block); empty case `portal-05-no-cards` | ✅ folded |
| Customer: Add-card flow | entry-point link visible in `portal-01`; no dedicated modal | ⚠️ partial |
| Customer: Pay-outstanding (past_due) | `recovery-01/02/03` | ✅ |
| Customer: Cancel modal + reasons | `cancellation-01/02` | ✅ |
| Customer: Reactivate | `portal-03` + `reactivation-01` | ✅ |
| Customer: Empty/error states | `states-01..04`, `portal-05` | ✅ |
| Notifications: 3 templates EN+AR | `notifications-01..06` | ✅ |
| **Merchant: subscription as merchant sees it** | — (Connect dashboard, not the customer portal) | ❌ N/A-with-reason |
| **Merchant: subscription list with filters** | — (Connect dashboard) | ❌ N/A-with-reason |

**Merchant-side resolution:** both merchant items live in the Connect merchant dashboard — a different app not in `frontend_public`. They will be listed **N/A-with-reason** in the manifest ("AutoPay merchant-dashboard views require a seeded subscription on staging; sourcing separately"), invoking #158913's AC escape hatch ("or explicitly listed as not applicable with a reason"). Sourcing is a coordination item (see Open Items) — a single ask covering both, since they come from the same place. The customer `portal-01` summary is **not** relabeled as the merchant view.

**Add-card flow:** the dedicated add-card modal is not in the delivered set (only the "Add Another Card" entry point inside `portal-01`). Listed as N/A-with-reason unless a capture is supplied.

### Manifest (R4)

A Markdown table, delivered as a comment on #158913 and confirmed by Ankit before he wires the pages. Maps image → business section → `<StepGuide>` step role. The three consuming sections (from #158912 R1) are §6 Customer self-service page, §7 Notifications, §8 Setting up AutoPay. Draft mapping:

- **§6 Self-service** — a `<StepGuide>` "self-service tour": view status/summary (`portal-01`) → billing history (`portal-01`) → manage cards / set active (`portal-01`, empty `portal-05`) → pay outstanding (`recovery-01`→`recovery-02`) → cancel (`cancellation-01`→`cancellation-02`) → reactivate (`portal-03`→`reactivation-01`). Subscription-state gallery (`portal-02` trialing, `portal-04` expired) and error states (`states-01..04`, `cards-01`) as supporting figures / `:::note` callouts.
- **§7 Notifications** — three email templates side-by-side or a small `<StepGuide>`: upcoming (`notifications-01`/`-02` AR), payment-failed (`-03`/`-04` AR), final-failure (`-05`/`-06` AR).
- **§8 Setting up AutoPay** — merchant-side; primarily the **setup clip** (video), plus the two N/A merchant screenshots once sourced.

### Two anti-patterns from the wallet pass (must not repeat)

- **No placeholder stubs.** The wallet pass committed 20 × 68-byte stub PNGs in `static/img/developers/wallet/`. Every AutoPay file shipped is a real capture (all ≥ 16 KB).
- **No large binaries.** `static/img/developers/wallet/wallet_reservation_03.gif` is 13.8 MB in git. All AutoPay PNGs are ≤ 154 KB; motion goes in the compressed MP4 clips, not GIFs.

### #158913 Definition of Done

- `static/img/business/autopay/` holds the 22 named PNGs + `.gitkeep`; `static/img/developers/autopay/` holds only `.gitkeep`.
- Naming matches the wallet convention; no file is a stub; no file exceeds ~200 KB without justification.
- Manifest posted to #158913 and confirmed by Ankit; merchant + add-card items explicitly marked N/A-with-reason.

## Ticket #158914 — Remotion Pipeline & Clips

### Hosting decision (R1) — DECIDED: commit compressed MP4 to `static/`

Rendered clips are **committed to `static/video/autopay/`** as short, muted, H.264-compressed MP4s (~1–2 MB each) with a poster PNG per clip. Rationale, written into `remotion/README.md`:

- **Self-contained + offline.** `CLAUDE.md` requires the site to work offline with no external API dependencies for core functionality. A CDN embed breaks that guarantee; a committed asset does not.
- **No new infra.** There is no CDN/Spaces wiring in the repo today. Committing avoids a new deploy dependency and upload step.
- **The 14 MB GIF is solved by format, not by leaving git.** The wallet anti-pattern was an *uncompressed 14 MB GIF*. A muted H.264 MP4 of the same walkthrough is ~10× smaller and far higher quality. The discipline is: keep clips short and compressed (target < 2 MB; hard-cap justify > 3 MB), not "put video on a CDN."
- Reconsider CDN only if the total committed video set later exceeds a few MB.

### Rendering isolation (R3) — self-contained `remotion/` workspace

Remotion lives in its own directory with its own `package.json`, `tsconfig.json`, and `node_modules`, entirely separate from the Docusaurus project:

```
remotion/
├── package.json            # remotion + @remotion/cli + react + typescript — ISOLATED (not a root dep, not a workspace)
├── tsconfig.json           # standalone; root tsc never references it
├── remotion.config.ts      # codec h264, muted, overwrite
├── src/
│   ├── index.ts            # registerRoot(Root)
│   ├── Root.tsx            # <Composition> per clip
│   ├── theme.ts            # Ottu palette tokens (shared with docs)
│   ├── components/         # scene primitives: OttuFrame, Cursor, Callout, DeviceChrome
│   └── compositions/
│       ├── SetupSubscription.tsx
│       ├── SelfServiceTour.tsx
│       ├── RetryToRecovery.tsx
│       └── NotificationEmails.tsx      # optional 4th/5th
├── scripts/render-all.mjs  # render each composition → ../static/video/autopay/<clip>.mp4 (+ poster still), then ffmpeg compress/strip-audio
└── README.md               # hosting decision + render prerequisites + commands
```

**Why nothing leaks into the deploy** (verified against `deploy-dev.yml`: `npm ci → npm run typecheck → npm test → npm run gen-api → npm run build`):

- `npm ci` installs **root** deps only. `remotion/` has its own `package.json` (not a workspace), so Remotion is never installed on deploy.
- `npm run build` = `docusaurus build …` — never descends into `remotion/`.
- `npm run typecheck` = `tsc` at root. With `@docusaurus/tsconfig` and no `include`, `tsc` would otherwise walk `remotion/`. **Fix: add `"remotion"` to `exclude` in root `tsconfig.json`** (currently `[".docusaurus", "build"]`).
- `.gitignore`: add `remotion/node_modules` and `remotion/out/` (render scratch). The committed outputs live in `static/video/autopay/` (tracked).

Render command (documented, run manually / locally only):
```bash
cd remotion && npm install && npm run render     # → ../static/video/autopay/*.mp4 + *-poster.png
```

### `<VideoEmbed>` component (R2)

```
src/components/VideoEmbed/
├── index.tsx
└── styles.module.css
```

Props: `{ src: string; poster: string; caption?: React.ReactNode; width?: number | string; aspectRatio?: string /* default "16 / 9" */ }`. `src`/`poster` are site-root paths resolved with `useBaseUrl` (e.g. `/video/autopay/setup.mp4`).

Behavior:
- **Poster-first, click-to-play.** Renders the poster `<img>` with a play-button overlay; the `<video>` (with `controls muted playsInline preload="none"`) mounts/plays only on click. This gives `preload="none"` bandwidth savings and means **nothing moves until the user opts in** — satisfying `prefers-reduced-motion` inherently.
- **Reduced motion.** A small SSR-safe `usePrefersReducedMotion` hook (guarded `typeof window`); when reduced, never autoplay (already the default) and keep the static poster until explicit click.
- `<figure>` / `<figcaption>` for the caption; responsive via `aspect-ratio` + `max-width: 100%`.
- Theme-aware framing consistent with `StepGuide` (same border/radius/shadow tokens).

Documented for reuse beyond AutoPay: usage block in the component dir and a short note wherever `StepGuide`/`ApiDocEmbed` conventions are described.

### The clips (R4) — business audience, short

1. **Setting up an AutoPay subscription** → business §8. (Merchant creates a subscription; scripted by Ankit — the Remotion animation depicts the flow, independent of a live merchant-dashboard capture.)
2. **The customer self-service page** — cancel, update card, pay outstanding → business §6.
3. **The retry → past_due → recovery journey** → business §5/§6.
4. *(Optional)* **The three notification emails** → business §7.

Ankit owns `docs/business/autopay/index.md` and **scripts the clips** (#158914 R5); Junaid builds the pipeline, components, and first-cut renders, and iterates on Ankit's scripts and Menna's visual styling.

### Business-page scaffold (agreed scope)

`docs/business/autopay/index.md` is created with the full 11-section skeleton from #158912 R1 (explicit anchor ids), but **only §6 Self-service, §7 Notifications, §8 Setting-up are filled** — wired with real `<StepGuide>` (screenshots) and `<VideoEmbed>` (clips) blocks and **placeholder prose clearly flagged for Ankit** (e.g. `{/* TODO(#158912, Ankit): business prose */}`). The other eight sections are heading-only stubs so anchors resolve. This closes #158914 AC4 ("embedded in the business page") without authoring Ankit's content, and hands him a wired start. Sidebar registration for the business page is Ankit's (#158912 R2); the scaffold notes the required Pattern-A block but does not claim ownership of `sidebars.ts`.

### #158914 Definition of Done

- `remotion/` set up with a documented render command; `npm run typecheck` and `npm run build` unchanged and green (remotion excluded from root `tsc`; not installed on deploy).
- Hosting decision written in `remotion/README.md` and implemented (clips + posters in `static/video/autopay/`).
- `<VideoEmbed>` exists, is documented, handles poster/dimensions/caption/reduced-motion.
- 3–5 clips rendered, compressed (< ~2 MB each), and embedded via `<VideoEmbed>` in `docs/business/autopay/index.md`.
- `npm run build` time not materially increased (no render in the build path).

## Cross-Ticket Sequencing & Dependencies

- **Unblocked now:** placing screenshots, the manifest draft, the Remotion workspace, `<VideoEmbed>`, the business §6/§7/§8 scaffold, first-cut clip renders. None depend on core_backend PR #121.
- **Soft coordination (not blocking asset production):**
  - Ankit's page prose (#158912) and the eight non-asset sections.
  - Ankit's clip scripts (#158914 R5) — first-cut renders proceed on a draft script mirroring the flows; finals swap in.
  - Menna — screenshot styling review + the two merchant-dashboard captures.
- **Release** (#158915): all work merges to `dev` → auto-deploys to docs.ottu.dev for QA/sign-off → `dev` → `main` → docs.ottu.com. Visual review sign-off: Junaid + Menna. **Check Pattern-A anchors by hand** — `onBrokenLinks: "warn"` means a broken anchor won't fail the build.

## Files Touched (summary)

```
NEW  static/img/business/autopay/*.png            (22) + .gitkeep
NEW  static/img/developers/autopay/.gitkeep
NEW  static/video/autopay/*.mp4 + *-poster.png     (3–5 clips)
NEW  remotion/**                                    (isolated workspace)
NEW  src/components/VideoEmbed/{index.tsx,styles.module.css}
NEW  docs/business/autopay/index.md                 (skeleton; §6/§7/§8 wired, rest stub)
EDIT tsconfig.json                                  (add "remotion" to exclude)
EDIT .gitignore                                     (remotion/node_modules, remotion/out/)
```

Not owned here (Ankit / others): the developer page, the business page prose (8 of 11 sections), `sidebars.ts`, all `static/api-enrichments/*`, glossary terms.

## Open Items to Resolve During Implementation

- **Merchant-dashboard captures** — who seeds/captures "subscription as merchant sees it" + "subscription list with filters" (both from the Connect dashboard). Junaid raises the filtered-list question with the team; the subscription-detail capture is bundled into the same ask. Until sourced, both are N/A-with-reason in the manifest.
- **Add-card modal** — confirm whether a dedicated capture is wanted or the `portal-01` entry point suffices (N/A-with-reason otherwise).
- **Ankit confirmation** of the manifest step-mapping (#158913 AC4) before final wiring.
- **Clip scripts** from Ankit (#158914 R5) to replace first-cut drafts.
- **Menna** — visual styling pass on screenshots and video framing.
- Verify the DO build (`.do/app-spec-dev.yaml`, `source_dir: /`) does no recursive/workspace install that would pull in `remotion/` — expected clean, confirm during the first pipeline commit.
```
