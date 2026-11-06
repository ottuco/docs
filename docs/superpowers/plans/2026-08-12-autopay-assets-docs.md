# AutoPay Docs — Screenshots & Remotion Video Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the 22 AutoPay screenshots with a wiring manifest, and stand up a from-scratch Remotion pipeline that renders small committed MP4 clips embedded via a reusable `<VideoEmbed>` component into the AutoPay business page — without touching the site build.

**Architecture:** Screenshots are committed static assets referenced by site-root paths and consumed by the existing `<StepGuide>` carousel. Remotion lives in a fully isolated `remotion/` workspace (own `package.json`/`tsconfig`/`node_modules`) so `npm ci`, `npm run typecheck`, and `npm run build` never touch it; renders run manually and output committed MP4 + poster PNG to `static/video/autopay/`. A new `<VideoEmbed>` component renders poster-first, click-to-play, reduced-motion-safe.

**Tech Stack:** Docusaurus 3.10 + React 19 + TypeScript (docs root); Remotion + `@remotion/cli` (isolated workspace); Node 20.19.6; npm.

**Spec:** [`docs/superpowers/specs/2026-08-12-autopay-assets-docs-design.md`](../specs/2026-08-12-autopay-assets-docs-design.md)
**Tickets:** [#158913 screenshots](https://orbit.ottu.com/issues/158913), [#158914 remotion](https://orbit.ottu.com/issues/158914) (epic [#158909](https://orbit.ottu.com/issues/158909))
**Delivered assets:** `~/Downloads/autopay/` (22 PNGs from Menna).

## Global Constraints

- **Branch:** `task/153557-autopay-docs`, forked from `dev`. **Creating the branch requires Junaid's confirmation** (standing rule) — Task 1 is gated.
- **No push, no PR** without explicit confirmation. Commits are local only. **Redmine comments and any outward action are gated** (Task 3, Task 11).
- **Node:** `20.19.6` (repo `engines`). Use `npm`, never yarn.
- **Screenshot size:** PNGs ≤ ~200 KB; none may be a placeholder stub (every file ≥ ~1 KB / a real capture). Reference from docs by **absolute site-root path** (`/img/business/autopay/…`), never relative.
- **Video size:** committed MP4 target < ~2 MB, hard-cap justify > 3 MB; muted/silent; each clip has a poster PNG.
- **Naming:** `<flow>-0N-<slug>.png` (wallet convention). Keep Menna's delivered filenames as-is.
- **Business pages carry zero code samples** (root `CLAUDE.md` audience split). Business pages keep the right-hand TOC — do **not** set `hide_table_of_contents`.
- **Developer image dir is code-only:** `static/img/developers/autopay/` gets **only** `.gitkeep` (#158910 R4).
- **Rendering must never run in `npm run typecheck` or `npm run build`** (#158914 R3). Verify both stay green and unchanged.
- **`onBrokenLinks: "warn"`** — a green build does not prove anchors work. Check Pattern-A anchors by hand.
- Do not author the developer page, the 8 non-asset business sections, `sidebars.ts`, or `static/api-enrichments/*` — those are Ankit's / others' tickets.

---

### Task 1: Branch + screenshot placement + image dirs

**Files:**
- Create: `static/img/business/autopay/.gitkeep`
- Create: `static/img/developers/autopay/.gitkeep`
- Create: `static/img/business/autopay/*.png` (22 files copied from `~/Downloads/autopay/`)

**Interfaces:**
- Produces: 22 site-root image paths `/img/business/autopay/<name>.png` consumed by Task 8's `<StepGuide>` steps and the Task 3 manifest.

- [ ] **Step 1: Confirm + create the branch (GATED)**

Ask Junaid to confirm before running. From the repo root (`/home/dev/projects/docs`, currently on `dev`):
```bash
git checkout dev && git pull --ff-only
git checkout -b task/153557-autopay-docs
```

- [ ] **Step 2: Create the two image directories with `.gitkeep`**

```bash
mkdir -p static/img/business/autopay static/img/developers/autopay
touch static/img/business/autopay/.gitkeep static/img/developers/autopay/.gitkeep
```

- [ ] **Step 3: Copy the 22 delivered PNGs into the business dir**

```bash
cp ~/Downloads/autopay/*.png static/img/business/autopay/
```

- [ ] **Step 4: Verify the invariants (count, no-stub, size, naming) — this is the test**

```bash
cd static/img/business/autopay
echo "count: $(ls -1 *.png | wc -l)  (expect 22)"
# Fail loudly if any file is a stub (<1KB) or oversize (>205KB):
for f in *.png; do
  b=$(stat -c%s "$f")
  if [ "$b" -lt 1024 ]; then echo "STUB: $f ($b B)"; fi
  if [ "$b" -gt 209920 ]; then echo "OVERSIZE: $f ($b B)"; fi
done
# Naming sanity: every file matches <flow>-0N-<slug>.png
ls -1 *.png | grep -vE '^[a-z]+(-[a-z0-9]+)*-[0-9]{2}-[a-z0-9-]+\.png$' || echo "naming: all OK"
cd -
```
Expected: `count: 22`, no `STUB` / `OVERSIZE` lines, `naming: all OK`.

- [ ] **Step 5: Commit**

```bash
git add static/img/business/autopay static/img/developers/autopay
git commit -m "docs(autopay): add business screenshots + image dir gitkeeps (#158913)"
```

---

### Task 2: Add the design spec + this plan to the branch

**Files:**
- Add: `docs/superpowers/specs/2026-08-12-autopay-assets-docs-design.md` (already written)
- Add: `docs/superpowers/plans/2026-08-12-autopay-assets-docs.md` (this file)

**Interfaces:** none (documentation of record).

- [ ] **Step 1: Confirm both files are present**

```bash
ls -1 docs/superpowers/specs/2026-08-12-autopay-assets-docs-design.md \
      docs/superpowers/plans/2026-08-12-autopay-assets-docs.md
```
Expected: both paths listed.

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-08-12-autopay-assets-docs-design.md \
        docs/superpowers/plans/2026-08-12-autopay-assets-docs.md
git commit -m "docs(autopay): add asset+video design spec and implementation plan"
```

---

### Task 3: Screenshot wiring manifest (#158913 R4)

**Files:**
- Create: `static/img/business/autopay/MANIFEST.md` (kept in-repo as the source of truth; the same table is posted to #158913)

**Interfaces:**
- Consumes: the 22 image paths from Task 1.
- Produces: the image→section→StepGuide-step mapping Ankit uses to wire §6/§7/§8 (also drives Task 8's `<StepGuide>` steps).

- [ ] **Step 1: Write the manifest file**

Create `static/img/business/autopay/MANIFEST.md` with this content:

```markdown
# AutoPay screenshot manifest (#158913)

Business page: `docs/business/autopay/index.md`. Sections per #158912 R1.
All paths are site-root (`/img/business/autopay/…`). Source: customer self-service
portal (frontend_public@task/153557, SubscriptionPage.vue) + notification emails.

## §6 — The customer self-service page  (StepGuide: "self-service tour")
| # | Image | Step role |
|---|-------|-----------|
| 1 | portal-01-summary-active.png | View subscription status, plan, amount, next charge |
| 2 | portal-01-summary-active.png | View billing / payment history (same full-page capture) |
| 3 | portal-01-summary-active.png | Manage saved cards, set the active card |
| 3b| portal-05-no-cards.png | Empty state: no saved cards |
| 4 | recovery-01-past-due.png | Pay an outstanding balance (past_due) |
| 5 | recovery-02-payment-confirmed.png | Outstanding balance paid — confirmed |
| 6 | cancellation-01-confirm.png | Cancel the subscription — confirm |
| 7 | cancellation-02-reason-options.png | Cancellation reason options |
| 8 | portal-03-canceled-pending-reactivation.png | Pending cancellation state |
| 9 | reactivation-01-confirm.png | Reactivate — undo pending cancellation |

Supporting figures / :::note callouts (not carousel steps):
- portal-02-trialing.png — trialing state
- portal-04-expired.png — expired (terminal) state
- recovery-03-payment-terms-alert.png — payment-terms alert
- cards-01-delete-confirm.png — delete a saved card
- states-01-loading.png, states-02-magic-link-expired.png,
  states-03-magic-link-invalid.png, states-04-network-error.png — access/error states

## §7 — Notifications  (three email templates, EN with AR variant)
| Template | EN | AR |
|----------|----|----|
| Upcoming charge | notifications-01-upcoming-charge-en.png | notifications-02-upcoming-charge-ar.png |
| Payment failed  | notifications-03-payment-failed-en.png  | notifications-04-payment-failed-ar.png  |
| Final failure   | notifications-05-final-failure-en.png   | notifications-06-final-failure-ar.png   |

## §8 — Setting up AutoPay  (merchant side)
Primary asset is the setup video clip (see #158914). Screenshots below are N/A pending capture.

## Not applicable (with reason)
| R3 item | Reason |
|---------|--------|
| Merchant: a subscription as the merchant sees it | Lives in the Connect merchant dashboard (a different app, not in frontend_public). Needs a seeded AutoPay subscription on staging — sourcing separately. |
| Merchant: the subscription list with filters applied | Same — Connect merchant dashboard; needs a seeded subscription. |
| Add-card flow (dedicated modal) | Only the "Add Another Card" entry point is captured (within portal-01). Dedicated modal not in the delivered set. |
```

- [ ] **Step 2: Verify it renders as a table (no broken Markdown)**

```bash
npx markdownlint-cli2 static/img/business/autopay/MANIFEST.md 2>/dev/null || \
  grep -c '|' static/img/business/autopay/MANIFEST.md
```
Expected: a positive pipe count (tables present); markdownlint is best-effort.

- [ ] **Step 3: Commit**

```bash
git add static/img/business/autopay/MANIFEST.md
git commit -m "docs(autopay): add screenshot wiring manifest (#158913)"
```

- [ ] **Step 4: Post the manifest to #158913 and request Ankit's confirmation (GATED — outward action)**

Do not post without Junaid's go-ahead. Use the `ticket` skill (Action 4) to add the manifest table as a comment on #158913, `@`-mentioning Ankit to confirm the mapping is enough to wire §6/§7/§8, and noting the two merchant screens + add-card are N/A pending capture. (#158913 AC4 needs the author's confirmation.)

---

### Task 4: Isolated Remotion workspace scaffold (#158914 R3)

**Files:**
- Create: `remotion/package.json`, `remotion/tsconfig.json`, `remotion/remotion.config.ts`
- Create: `remotion/src/index.ts`, `remotion/src/Root.tsx`, `remotion/src/theme.ts`
- Modify: `tsconfig.json` (root — add `"remotion"` to `exclude`)
- Modify: `.gitignore` (add `remotion/node_modules`, `remotion/out/`)

**Interfaces:**
- Produces: a `<RemotionRoot>` registering compositions by id (`setup-subscription`, `self-service-tour`, `retry-to-recovery`, `notification-emails`), consumed by Task 5/7 render script.

- [ ] **Step 1: Write `remotion/package.json` (isolated — NOT a root workspace)**

```json
{
  "name": "autopay-remotion",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "start": "remotion studio",
    "render": "node scripts/render-all.mjs"
  },
  "dependencies": {
    "@remotion/cli": "4.0.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "remotion": "4.0.0"
  },
  "devDependencies": {
    "@types/react": "19.2.0",
    "typescript": "5.9.0"
  }
}
```

- [ ] **Step 2: Write `remotion/tsconfig.json` (standalone; root `tsc` never references it)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "scripts", "remotion.config.ts"]
}
```

- [ ] **Step 3: Write `remotion/remotion.config.ts`**

```ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(28); // size lever: higher = smaller file
Config.setOverwriteOutput(true);
```

- [ ] **Step 4: Write `remotion/src/theme.ts` (Ottu tokens, mirrored from docs)**

```ts
export const ottu = {
  primary: "#0B82BE",
  ink: "#302F37",
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  ok: "#22C55E",
  danger: "#ED2833",
  warn: "#F59E0B",
  fontFamily:
    'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};
export const VIDEO = { width: 1280, height: 720, fps: 30 };
```

- [ ] **Step 5: Write `remotion/src/Root.tsx` (composition registry; placeholder compositions filled in Task 5/7)**

```tsx
import React from "react";
import { Composition } from "remotion";
import { VIDEO } from "./theme";
import { SetupSubscription } from "./compositions/SetupSubscription";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="setup-subscription"
      component={SetupSubscription}
      durationInFrames={VIDEO.fps * 14}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    {/* self-service-tour, retry-to-recovery, notification-emails added in Task 7 */}
  </>
);
```

- [ ] **Step 6: Write `remotion/src/index.ts`**

```ts
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";
registerRoot(RemotionRoot);
```

- [ ] **Step 7: Exclude `remotion/` from the root typecheck**

Edit root `tsconfig.json` — change the `exclude` line to include `remotion`:
```json
"exclude": [".docusaurus", "build", "remotion"]
```

- [ ] **Step 8: Ignore Remotion install + render scratch**

Append to `.gitignore`:
```
# Remotion (isolated workspace)
remotion/node_modules/
remotion/out/
```

- [ ] **Step 9: Verify the site build/typecheck are unaffected — this is the test**

```bash
npm run typecheck   # tsc at root; must still pass, must NOT walk remotion/
npm run build       # docusaurus build; must be unchanged and green
```
Expected: both pass. (Confirm `remotion/` is not type-checked: temporarily introduce a deliberate type error in `remotion/src/theme.ts`, re-run `npm run typecheck`, confirm it still passes, then revert.)

- [ ] **Step 10: Commit**

```bash
git add remotion/package.json remotion/tsconfig.json remotion/remotion.config.ts \
        remotion/src/index.ts remotion/src/Root.tsx remotion/src/theme.ts \
        tsconfig.json .gitignore
git commit -m "build(autopay): scaffold isolated remotion workspace, exclude from site build (#158914)"
```

---

### Task 5: First clip (SetupSubscription) + render script → committed MP4 + poster

**Files:**
- Create: `remotion/src/components/Scene.tsx` (shared scene primitives)
- Create: `remotion/src/compositions/SetupSubscription.tsx`
- Create: `remotion/scripts/render-all.mjs`
- Create (output, committed): `static/video/autopay/setup-subscription.mp4`, `static/video/autopay/setup-subscription-poster.png`

**Interfaces:**
- Consumes: `RemotionRoot`, `ottu`/`VIDEO` from Task 4.
- Produces: clip file at `/video/autopay/setup-subscription.mp4` + poster, consumed by Task 8's `<VideoEmbed>`.

- [ ] **Step 1: Write shared scene primitives `remotion/src/components/Scene.tsx`**

```tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ottu } from "../theme";

export const Scene: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: ottu.bg, fontFamily: ottu.fontFamily, color: ottu.ink }}>
    {children}
  </AbsoluteFill>
);

export const FadeIn: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [at, at + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [at, at + 12], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ opacity, transform: `translateY(${y}px)` }}>{children}</div>;
};
```

- [ ] **Step 2: Write `remotion/src/compositions/SetupSubscription.tsx`**

This is a first-cut, business-audience storyboard (merchant sets up an AutoPay subscription). Ankit's final script replaces the copy in Task 7 follow-up; the structure and pipeline are what this task proves.

```tsx
import React from "react";
import { Sequence } from "remotion";
import { Scene, FadeIn } from "../components/Scene";
import { ottu } from "../theme";

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: ottu.surface, border: `1px solid ${ottu.border}`, borderRadius: 16,
    padding: 40, width: 820, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>{children}</div>
);

export const SetupSubscription: React.FC = () => (
  <Scene>
    <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
      <Sequence durationInFrames={90}>
        <FadeIn at={0}><Card>
          <div style={{ color: ottu.primary, fontWeight: 700, fontSize: 20 }}>AutoPay</div>
          <h1 style={{ fontSize: 44, margin: "8px 0 0" }}>Set up a subscription</h1>
          <p style={{ fontSize: 22, color: "#6b7280" }}>Create a recurring plan in the dashboard — AutoPay owns the schedule, retries and dunning.</p>
        </Card></FadeIn>
      </Sequence>
      <Sequence from={90} durationInFrames={120}>
        <FadeIn at={0}><Card>
          <h2 style={{ fontSize: 30 }}>Plan details</h2>
          <ul style={{ fontSize: 22, lineHeight: 1.8 }}>
            <li>Frequency: <strong>monthly</strong></li>
            <li>Recurring amount: <strong>490 KWD</strong></li>
            <li>Start date, optional trial (first charge 0)</li>
          </ul>
        </Card></FadeIn>
      </Sequence>
      <Sequence from={210} durationInFrames={210}>
        <FadeIn at={0}><Card>
          <div style={{ display: "inline-block", background: "#DCFCE7", color: ottu.ok,
            padding: "6px 14px", borderRadius: 999, fontWeight: 700 }}>● Active</div>
          <h2 style={{ fontSize: 30, marginTop: 16 }}>Subscription created</h2>
          <p style={{ fontSize: 22, color: "#6b7280" }}>The customer gets a self-service link and their first notification.</p>
        </Card></FadeIn>
      </Sequence>
    </div>
  </Scene>
);
```

- [ ] **Step 3: Write the render script `remotion/scripts/render-all.mjs`**

```js
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const OUT = "../static/video/autopay";
mkdirSync(new URL(`${OUT}/`, import.meta.url), { recursive: true });

// [compositionId, posterFrame]
const clips = [
  ["setup-subscription", 150],
  // added in Task 7: ["self-service-tour", 120], ["retry-to-recovery", 120], ["notification-emails", 60]
];

for (const [id, poster] of clips) {
  console.log(`▶ rendering ${id}`);
  execSync(`npx remotion render src/index.ts ${id} ${OUT}/${id}.mp4 --codec=h264 --crf=28`, { stdio: "inherit" });
  execSync(`npx remotion still src/index.ts ${id} ${OUT}/${id}-poster.png --frame=${poster}`, { stdio: "inherit" });
}
console.log("✓ done → static/video/autopay/");
```

- [ ] **Step 4: Install Remotion (isolated) and render the first clip — this is the test**

```bash
cd remotion && npm install && npm run render && cd -
ls -la static/video/autopay/
for f in static/video/autopay/*.mp4; do
  mb=$(( $(stat -c%s "$f") / 1048576 ))
  echo "$f : ${mb}MB"; [ "$mb" -gt 3 ] && echo "  ⚠ over 3MB cap — lower dims or raise --crf";
done
```
Expected: `setup-subscription.mp4` (< ~2 MB) and `setup-subscription-poster.png` exist. If oversize, raise `--crf` or reduce `VIDEO` dimensions in `theme.ts` and re-render.

- [ ] **Step 5: Confirm the render did NOT change the site build path**

```bash
npm run build   # still green; build time unchanged (no remotion in this path)
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add remotion/src/components/Scene.tsx remotion/src/compositions/SetupSubscription.tsx \
        remotion/scripts/render-all.mjs static/video/autopay/setup-subscription.mp4 \
        static/video/autopay/setup-subscription-poster.png
git commit -m "feat(autopay): first remotion clip (setup) + render script, committed to static (#158914)"
```

---

### Task 6: `<VideoEmbed>` component (#158914 R2)

**Files:**
- Create: `src/components/VideoEmbed/index.tsx`
- Create: `src/components/VideoEmbed/styles.module.css`

**Interfaces:**
- Consumes: clip + poster site-root paths from Task 5/7.
- Produces: `export default function VideoEmbed(props: { src: string; poster: string; caption?: React.ReactNode; width?: number | string; aspectRatio?: string }): React.ReactElement` — consumed by Task 8.

- [ ] **Step 1: Write `src/components/VideoEmbed/index.tsx`**

```tsx
import React, { useState, useEffect } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

export interface VideoEmbedProps {
  src: string;          // site-root path, e.g. /video/autopay/setup-subscription.mp4
  poster: string;       // site-root path, e.g. /video/autopay/setup-subscription-poster.png
  caption?: React.ReactNode;
  width?: number | string;
  aspectRatio?: string; // default "16 / 9"
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

export default function VideoEmbed({
  src, poster, caption, width = 720, aspectRatio = "16 / 9",
}: VideoEmbedProps): React.ReactElement {
  const [playing, setPlaying] = useState(false);
  const reduced = usePrefersReducedMotion();
  const srcUrl = useBaseUrl(src);
  const posterUrl = useBaseUrl(poster);

  return (
    <figure className={styles.figure} style={{ maxWidth: width }}>
      <div className={styles.frame} style={{ aspectRatio }}>
        {playing ? (
          <video
            className={styles.video}
            src={srcUrl}
            poster={posterUrl}
            controls
            muted
            playsInline
            autoPlay={!reduced}
            preload="none"
          />
        ) : (
          <button
            type="button"
            className={styles.posterBtn}
            style={{ backgroundImage: `url(${posterUrl})` }}
            onClick={() => setPlaying(true)}
            aria-label="Play video"
          >
            <span className={styles.playIcon} aria-hidden="true">▶</span>
          </button>
        )}
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
```

- [ ] **Step 2: Write `src/components/VideoEmbed/styles.module.css`**

```css
.figure { margin: 28px auto; }
.frame {
  position: relative; width: 100%; border-radius: 14px; overflow: hidden;
  border: 1px solid var(--ifm-color-emphasis-200);
  background: var(--ifm-background-surface-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
}
.video { display: block; width: 100%; height: 100%; object-fit: cover; }
.posterBtn {
  position: absolute; inset: 0; width: 100%; height: 100%; border: 0; cursor: pointer;
  background-size: cover; background-position: center; display: grid; place-items: center;
}
.playIcon {
  width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center;
  background: rgba(0,0,0,0.55); color: #fff; font-size: 24px; padding-left: 4px;
  transition: background 0.15s ease;
}
.posterBtn:hover .playIcon { background: var(--ifm-color-primary); }
.caption { font-size: 14px; color: var(--ifm-color-emphasis-600); text-align: center; margin-top: 10px; }
[data-theme="dark"] .frame { border-color: var(--ifm-color-emphasis-300); }
```

- [ ] **Step 3: Verify typecheck + SSR build — this is the test**

```bash
npm run typecheck   # component types compile
npm run build       # SSR renders VideoEmbed without touching window at import time
```
Expected: both PASS.

- [ ] **Step 4: Visual check (manual)**

```bash
npm start   # open a scratch MDX using <VideoEmbed src="/video/autopay/setup-subscription.mp4" poster="/video/autopay/setup-subscription-poster.png" caption="Setting up AutoPay" />
```
Confirm: poster shows first; click plays; with OS "reduce motion" on, it does not autoplay. Remove the scratch file after.

- [ ] **Step 5: Commit**

```bash
git add src/components/VideoEmbed/index.tsx src/components/VideoEmbed/styles.module.css
git commit -m "feat(autopay): reusable VideoEmbed component (poster-first, reduced-motion) (#158914)"
```

---

### Task 7: Remaining clips (self-service, retry→recovery, optional notifications)

**Files:**
- Create: `remotion/src/compositions/SelfServiceTour.tsx`, `RetryToRecovery.tsx`, `NotificationEmails.tsx` (optional)
- Modify: `remotion/src/Root.tsx` (register the new compositions)
- Modify: `remotion/scripts/render-all.mjs` (add clip ids)
- Create (output, committed): the corresponding `static/video/autopay/*.mp4` + `*-poster.png`

**Interfaces:**
- Consumes: `Scene`/`FadeIn`, `ottu`/`VIDEO`.
- Produces: `/video/autopay/self-service-tour.mp4`, `/video/autopay/retry-to-recovery.mp4` (+ posters), consumed by Task 8.

- [ ] **Step 1: Add the three compositions**

Mirror `SetupSubscription.tsx`'s structure. Storyboards (business-audience, first-cut — Ankit's scripts refine the copy):
- `SelfServiceTour` — customer opens the self-service link → views status/plan → updates card → pays outstanding → done.
- `RetryToRecovery` — charge fails → retries one hour apart (attempt count) → cycle exhausted → past_due + final-failure email → customer pays via recovery link → back to active. (Reinforce #158912 R5: AutoPay never auto-cancels a past_due subscription.)
- `NotificationEmails` (optional) — the three email templates fanning in: upcoming charge, payment failed, final failure.

Each is a `React.FC` exported by name, built from `Scene`/`FadeIn`/`Sequence`, using `ottu` tokens. Keep total duration short (10–20 s).

- [ ] **Step 2: Register them in `remotion/src/Root.tsx`**

Add a `<Composition>` for each (`id`s `self-service-tour`, `retry-to-recovery`, `notification-emails`), same `fps`/`width`/`height` as `setup-subscription`, `durationInFrames` per storyboard.

- [ ] **Step 3: Add clip ids to `remotion/scripts/render-all.mjs`**

Uncomment / extend the `clips` array:
```js
const clips = [
  ["setup-subscription", 150],
  ["self-service-tour", 120],
  ["retry-to-recovery", 120],
  ["notification-emails", 60], // optional; drop if not producing the 4th clip
];
```

- [ ] **Step 4: Render + verify sizes — this is the test**

```bash
cd remotion && npm run render && cd -
for f in static/video/autopay/*.mp4; do
  mb=$(( $(stat -c%s "$f") / 1048576 )); echo "$f : ${mb}MB";
  [ "$mb" -gt 3 ] && echo "  ⚠ over 3MB cap";
done
```
Expected: 3–4 MP4s + posters, each < ~2 MB.

- [ ] **Step 5: Confirm the build path is still untouched**

```bash
npm run build
```
Expected: PASS, unchanged build time.

- [ ] **Step 6: Commit**

```bash
git add remotion/src/compositions/SelfServiceTour.tsx remotion/src/compositions/RetryToRecovery.tsx \
        remotion/src/compositions/NotificationEmails.tsx remotion/src/Root.tsx \
        remotion/scripts/render-all.mjs static/video/autopay/*.mp4 static/video/autopay/*-poster.png
git commit -m "feat(autopay): self-service, retry-to-recovery (+notifications) clips (#158914)"
```

---

### Task 8: Business page scaffold — §6/§7/§8 wired (#158913 wiring + #158914 R5)

**Files:**
- Create: `docs/business/autopay/index.md`

**Interfaces:**
- Consumes: `StepGuide` (`@site/src/components/StepGuide`), `VideoEmbed` (Task 6), the 22 images (Task 1), the clips (Task 5/7).
- Produces: the anchors §6/§7/§8 that the sidebar (Ankit, #158912 R2) and QA (#158915) rely on.

- [ ] **Step 1: Create the page skeleton with all 11 anchors; fill §6/§7/§8**

Full section list from #158912 R1, each with an explicit id. Non-asset sections are heading-only stubs with a flagged TODO for Ankit; §6/§7/§8 carry real wired components. Frontmatter keeps the TOC (no `hide_table_of_contents`). Example shape:

```mdx
---
title: AutoPay
sidebar_label: AutoPay
toc_min_heading_level: 2
toc_max_heading_level: 3
---

import StepGuide from "@site/src/components/StepGuide";
import VideoEmbed from "@site/src/components/VideoEmbed";

# AutoPay

{/* TODO(#158912, Ankit): intro prose. Junaid scaffolds §6/§7/§8 assets only. */}

## Why use AutoPay {#why-use-autopay}
{/* TODO(#158912, Ankit) */}

## How it works {#how-it-works}
{/* TODO(#158912, Ankit) */}

## Subscription lifecycle {#subscription-lifecycle}
{/* TODO(#158912, Ankit) */}

## Billing cycles {#billing-cycles}
{/* TODO(#158912, Ankit) */}

## Retries and dunning {#retries-and-dunning}
{/* TODO(#158912, Ankit) */}

## The customer self-service page {#self-service-page}

{/* Junaid: wired assets. Ankit expands prose. */}
<VideoEmbed
  src="/video/autopay/self-service-tour.mp4"
  poster="/video/autopay/self-service-tour-poster.png"
  caption="The customer self-service page: view status, update a card, pay an outstanding balance."
/>

<StepGuide steps={[
  { title: "View subscription status", description: <>Status, plan, amount and next charge date.</>,
    image: "/img/business/autopay/portal-01-summary-active.png", imageAlt: "Active AutoPay subscription summary" },
  { title: "Pay an outstanding balance", description: <>A past_due subscription can be paid from the same page.</>,
    image: "/img/business/autopay/recovery-01-past-due.png", imageAlt: "Past due subscription with Pay Now" },
  { title: "Balance paid", description: <>The outstanding cycle is settled and the subscription returns to active.</>,
    image: "/img/business/autopay/recovery-02-payment-confirmed.png", imageAlt: "Payment confirmed" },
  { title: "Cancel the subscription", description: <>Cancellation asks for a reason.</>,
    image: "/img/business/autopay/cancellation-02-reason-options.png", imageAlt: "Cancellation reason options" },
  { title: "Reactivate", description: <>A pending cancellation can be undone before it takes effect.</>,
    image: "/img/business/autopay/reactivation-01-confirm.png", imageAlt: "Reactivate confirmation" },
]} />

## Notifications {#notifications}

{/* Junaid: wired assets. Ankit expands prose. */}
<StepGuide steps={[
  { title: "Upcoming charge", description: <>Sent before each scheduled charge. Shown in English; an Arabic variant ships too.</>,
    image: "/img/business/autopay/notifications-01-upcoming-charge-en.png", imageAlt: "Upcoming charge email" },
  { title: "Payment failed", description: <>Sent when a charge attempt fails.</>,
    image: "/img/business/autopay/notifications-03-payment-failed-en.png", imageAlt: "Payment failed email" },
  { title: "Final failure", description: <>Sent when all retries on a cycle are exhausted, with a recovery link.</>,
    image: "/img/business/autopay/notifications-05-final-failure-en.png", imageAlt: "Final failure email" },
]} />

## Setting up AutoPay {#setting-up-autopay}

{/* Junaid: wired asset. Ankit expands prose. Merchant screenshots pending capture (see MANIFEST). */}
<VideoEmbed
  src="/video/autopay/setup-subscription.mp4"
  poster="/video/autopay/setup-subscription-poster.png"
  caption="Setting up an AutoPay subscription."
/>

## Things to know {#things-to-know}
{/* TODO(#158912, Ankit) */}

## FAQ {#faq}
{/* TODO(#158912, Ankit) */}

## What's Next? {#whats-next}
{/* TODO(#158912, Ankit) */}
```

- [ ] **Step 2: Build + verify no new broken-link/asset warnings — this is the test**

```bash
npm run build 2>&1 | grep -iE "broken|autopay|not found" || echo "no autopay warnings"
```
Expected: build PASS; no missing-image or broken-link warnings mentioning autopay.

- [ ] **Step 3: Hand-check the anchors (onBrokenLinks is only "warn")**

```bash
npm start   # visit /business/autopay ; click each TOC entry; confirm §6/§7/§8 scroll to real headings and every image + video poster loads
```
Expected: all 11 anchors resolve; all §6/§7 images render; both `<VideoEmbed>` posters load and play on click.

- [ ] **Step 4: Commit**

```bash
git add docs/business/autopay/index.md
git commit -m "docs(autopay): scaffold business page, wire self-service/notifications/setup assets (#158913, #158914)"
```

---

### Task 9: Documentation of record — Remotion README + VideoEmbed convention (#158914 R1/R2)

**Files:**
- Create: `remotion/README.md`
- Create: `src/components/VideoEmbed/README.md`

**Interfaces:** none (docs).

- [ ] **Step 1: Write `remotion/README.md`**

Cover: the **hosting decision** and its rationale (commit compressed MP4 + poster to `static/video/autopay/`; offline/self-contained; no new infra; the 14 MB GIF was a *format* problem; reconsider CDN only if the set grows past a few MB); prerequisites (Node 20.19.6, `cd remotion && npm install`); render command (`npm run render`); size levers (`--crf`, `VIDEO` dims); and the guarantee that rendering is never part of `npm run typecheck`/`npm run build` (isolated workspace, excluded from root `tsc`, not installed by `npm ci`).

- [ ] **Step 2: Write `src/components/VideoEmbed/README.md`**

Document the reusable convention: props (`src`, `poster`, `caption`, `width`, `aspectRatio`), site-root path requirement, poster-first/click-to-play behavior, `prefers-reduced-motion` handling, and a copy-paste usage example. Note it is general-purpose (not AutoPay-specific).

- [ ] **Step 3: Verify links/build**

```bash
npm run build
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add remotion/README.md src/components/VideoEmbed/README.md
git commit -m "docs(autopay): document video hosting decision + VideoEmbed convention (#158914)"
```

---

### Task 10: Full local QA sweep against #158915 checklist (asset scope)

**Files:** none (verification only).

- [ ] **Step 1: Run the build/typecheck gates**

```bash
npm run typecheck
npm run build
```
Expected: both PASS.

- [ ] **Step 2: Asset invariants (no stub, sizes)**

```bash
for f in static/img/business/autopay/*.png; do b=$(stat -c%s "$f");
  [ "$b" -lt 1024 ] && echo "STUB $f"; [ "$b" -gt 209920 ] && echo "OVERSIZE $f"; done
for f in static/video/autopay/*.mp4; do mb=$(( $(stat -c%s "$f")/1048576 ));
  [ "$mb" -gt 3 ] && echo "VIDEO OVER 3MB $f (${mb}MB)"; done
echo "asset invariants checked"
```
Expected: no STUB/OVERSIZE/OVER-3MB lines.

- [ ] **Step 3: Anchors + media by hand**

`npm start` → `/business/autopay`: every TOC anchor scrolls to a real heading; every image loads; every video poster loads and plays on click. (These map to #158915 QA items 1–3.)

- [ ] **Step 4: Confirm rendering is out of the build path**

Confirm `package.json` `build`/`typecheck` scripts contain no remotion/render step and build time is unchanged from `dev`. (#158914 AC5.)

- [ ] **Step 5: (No commit)** Record results in the #158915 sign-off thread when the epic reaches QA — gated, do not post without Junaid's go-ahead.

---

## Self-Review

**Spec coverage:**
- #158913 R1 target dirs → Task 1. R2 naming → Task 1 (keep names) + Task 10. R3 screens + gaps → Task 1 (place) + Task 3 (manifest incl. N/A). R4 manifest → Task 3. Anti-patterns (stubs/large binaries) → Task 1 Step 4 + Task 10 Step 2. #158913 DoD → Tasks 1/3/10.
- #158914 R1 hosting decision (decided: commit MP4) → Task 5/7 outputs + Task 9 README. R2 embed component + docs → Task 6 + Task 9. R3 render out of build → Task 4 (isolation, tsconfig exclude, gitignore) + verified in Tasks 4/5/7/10. R4 3–5 clips → Task 5 + Task 7. R5 embed into business page + Ankit coordination → Task 8 + Task 3 Step 4. #158914 DoD → Tasks 4–9 + Task 10.
- Cross-cutting: branch gated (Task 1), no push/outward actions without confirmation (Global Constraints, Task 3/10 gates), spec+plan of record (Task 2).

**Placeholder scan:** No "TBD/implement later". The `{/* TODO(#158912, Ankit) */}` markers are *intentional page content* (scaffold hand-off flags), not plan gaps — every task step carries real commands/code.

**Type consistency:** `VideoEmbed` prop signature (`src, poster, caption, width, aspectRatio`) defined in Task 6 is used verbatim in Task 8. Composition ids (`setup-subscription`, `self-service-tour`, `retry-to-recovery`, `notification-emails`) are consistent across Task 4 Root, Task 5/7 render script, and Task 8 `VideoEmbed src`. Output paths `static/video/autopay/<id>.mp4` + `<id>-poster.png` are consistent across Tasks 5/7/8/9/10.

**Known coordination (not plan gaps):** Ankit's page prose (8 sections) and final clip scripts; Menna's styling pass + the two merchant-dashboard captures. All tracked in the spec's Open Items and surfaced in Task 3.
