/**
 * Client module that manages `menu__link--active` for sidebar hash links.
 *
 * Docusaurus sidebar items of `type: 'link'` with hash fragments
 * (e.g. `/docs/page#section`) never get the active class because
 * `isActiveSidebarItem` compares against `activePath` (pathname only).
 *
 * Two pathways keep the sidebar in sync:
 *
 *   1. URL-driven (this was the original behavior): hashchange events
 *      and route transitions invoke `updateActiveLinks()`, which reads
 *      `window.location.hash` and toggles the active class on the
 *      matching sidebar link. Handles deep-linked schema property
 *      anchors via `findSectionForHash()` — the nearest preceding
 *      sidebar-mapped section gets highlighted.
 *
 *   2. Scroll-driven (new): as the reader scrolls, `updateFromScroll()`
 *      figures out which sidebar-mapped section is currently being
 *      read, writes that hash to the URL with `history.replaceState`
 *      (no `hashchange` event, no reload), and re-applies the active
 *      class.
 */

type WatchItem = {
  hashId: string;
  link: HTMLAnchorElement;
  section: HTMLElement;
};

let watchList: WatchItem[] = [];
let lastActiveHash: string | null = null;
let scrollRafScheduled = false;

// Scroll-spy stays muted until the user provides a genuine scroll
// input (wheel, touch, or a scroll key). This prevents layout-shift
// scroll events — which fire throughout hydration on content-heavy
// pages — from overwriting the URL hash the user asked for.
//
// Two reasons we can't just rely on a timer:
//   1. Lazy content can continue hydrating well past any sensible
//      default (10+ seconds on slow pages with embedded OpenAPI).
//   2. If the user doesn't scroll, there's nothing for scroll-spy
//      to report — writing the URL based on programmatic scrolls
//      caused by layout shifts is noise, not user intent.
let spyMuted = true;

// ── Helpers ──────────────────────────────────────────────────────────────

function normalizePath(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

function getNavbarHeight(): number {
  return document.querySelector<HTMLElement>(".navbar")?.clientHeight ?? 0;
}

/**
 * Some anchors are zero-height markers in the DOM (collapsed to a point).
 * Their bounding rect's top === bottom makes viewport math useless, so
 * climb to the first ancestor with real height.
 */
function getVisibleRect(element: HTMLElement): DOMRect {
  const rect = element.getBoundingClientRect();
  if (rect.top === rect.bottom && element.parentElement) {
    return getVisibleRect(element.parentElement);
  }
  return rect;
}

/**
 * Deep-link fallback for URL-driven updates. When `location.hash`
 * points at e.g. a schema property that isn't a sidebar entry, find
 * the nearest preceding DOM element whose id IS a sidebar hash — that's
 * the section the user should see highlighted.
 */
function findSectionForHash(
  currentHashId: string,
  sectionHashes: Set<string>,
): string | null {
  const currentEl = document.getElementById(currentHashId);
  if (!currentEl) return null;

  let closestAnchor: HTMLElement | null = null;
  sectionHashes.forEach((hashId) => {
    const anchor = document.getElementById(hashId);
    if (!anchor) return;

    const relation = anchor.compareDocumentPosition(currentEl);
    if (!(relation & Node.DOCUMENT_POSITION_FOLLOWING)) return;

    if (!closestAnchor) {
      closestAnchor = anchor;
      return;
    }
    const cmp = closestAnchor.compareDocumentPosition(anchor);
    if (cmp & Node.DOCUMENT_POSITION_FOLLOWING) {
      closestAnchor = anchor;
    }
  });

  return closestAnchor ? (closestAnchor as HTMLElement).id : null;
}

// ── Watch list ───────────────────────────────────────────────────────────

/**
 * Rebuilds `watchList` from the current DOM: every sidebar link on the
 * current page whose href has a hash AND whose target element exists,
 * sorted by DOM source order.
 */
function buildWatchList(): void {
  const currentPath = normalizePath(window.location.pathname);
  const sidebarLinks = document.querySelectorAll<HTMLAnchorElement>(
    ".menu__link[href*='#']",
  );

  const items: WatchItem[] = [];
  sidebarLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const [linkPath, linkHash] = href.split("#");
    if (!linkHash) return;
    if (normalizePath(linkPath || "/") !== currentPath) return;
    const section = document.getElementById(linkHash);
    if (!section) return;
    items.push({ hashId: linkHash, link, section });
  });

  items.sort((a, b) => {
    if (a.section === b.section) return 0;
    const relation = a.section.compareDocumentPosition(b.section);
    return relation & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });

  watchList = items;
}

// ── Active-item detection (two-zone viewport algorithm) ──────────────────

/**
 * Returns the hashId of the section the reader is currently viewing.
 *
 * Two-zone algorithm:
 *   - Find the first section whose top is at or below the "scroll line"
 *     (just under the navbar). That's the "next visible" section.
 *   - If it's in the top half of the viewport, it's what the user is
 *     reading — return it.
 *   - Otherwise the user is still reading the previous section, so
 *     return that one.
 *   - If no section is below the scroll line, we're past the last
 *     section — return the last item.
 */
function getActiveHashFromScroll(): string | null {
  if (watchList.length === 0) return null;

  const anchorTopOffset = getNavbarHeight() + 16;

  const nextIdx = watchList.findIndex((item) => {
    const rect = getVisibleRect(item.section);
    return rect.top >= anchorTopOffset;
  });

  if (nextIdx === -1) {
    return watchList[watchList.length - 1]?.hashId ?? null;
  }

  const next = watchList[nextIdx];
  if (!next) return null;

  const rect = getVisibleRect(next.section);
  const isInTopHalf = rect.top > 0 && rect.bottom < window.innerHeight / 2;
  if (isInTopHalf) {
    return next.hashId;
  }
  return nextIdx > 0 ? (watchList[nextIdx - 1]?.hashId ?? null) : null;
}

// ── DOM mutations ────────────────────────────────────────────────────────

/**
 * The sidebar's scroll container is the outer `<nav class="menu
 * thin-scrollbar">` in Docusaurus — NOT the inner `<ul
 * class="theme-doc-sidebar-menu">`. Its exact selector uses a CSS-
 * module hash that's unstable across Docusaurus updates, so we find
 * it at runtime by walking up from the active link to the nearest
 * ancestor that actually scrolls.
 */
function findSidebarScrollContainer(
  from: HTMLElement,
): HTMLElement | null {
  let el: HTMLElement | null = from.parentElement;
  while (el && el !== document.body) {
    const cs = window.getComputedStyle(el);
    if (
      (cs.overflowY === "auto" || cs.overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight
    ) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

// How far from the top of the sidebar's scroll area the active link
// should sit. 0.0 pins it to the top edge; 0.1 leaves a small gap so
// the parent category label above the active leaf stays visible.
const ACTIVE_ITEM_OFFSET_RATIO = 0.1;

/**
 * Scroll the sidebar so the active link is ~10% down from the top of
 * the sidebar's scroll area. Called on every hash change (URL-driven
 * route updates AND scroll-spy driven updates), so the active item
 * always lands in the same predictable spot.
 */
function scrollSidebarToActive(link: HTMLAnchorElement): void {
  const container = findSidebarScrollContainer(link);
  if (!container) return;

  const linkRect = link.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const relativeTop =
    linkRect.top - containerRect.top + container.scrollTop;
  const target = Math.max(
    0,
    relativeTop - container.clientHeight * ACTIVE_ITEM_OFFSET_RATIO,
  );

  // Already at the desired position — avoid firing redundant smooth
  // scrolls on retry ticks where the active link hasn't changed.
  if (Math.abs(target - container.scrollTop) < 2) return;
  container.scrollTo({ top: target, behavior: "smooth" });
}

/**
 * Toggles `.menu__link--active` on every hash-bearing sidebar link that
 * points at the current page, making `hashId`'s link the active one
 * (or none active if `hashId` is null). Also scrolls the sidebar to
 * keep the newly active link visible. Does NOT write the URL —
 * writing URLs from the URL-driven path (updateActiveLinks) is how
 * the original bug started: on an early retry the target sidebar
 * link hasn't rendered yet, the deep-link fallback returns the
 * nearest preceding section, and we'd end up overwriting the user's
 * requested hash with it.
 */
function setSidebarActive(hashId: string | null): void {
  const sidebarLinks = document.querySelectorAll<HTMLAnchorElement>(
    ".menu__link[href*='#']",
  );
  let activeLink: HTMLAnchorElement | null = null;
  sidebarLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const [linkPath, linkHash] = href.split("#");
    if (!linkHash) return;
    // Only manage links belonging to the current page — leaves on other
    // pages (same category expanded elsewhere) stay untouched.
    if (
      normalizePath(linkPath || "/") !==
      normalizePath(window.location.pathname)
    ) {
      link.classList.remove("menu__link--active");
      link.removeAttribute("aria-current");
      return;
    }
    if (linkHash === hashId) {
      link.classList.add("menu__link--active");
      link.setAttribute("aria-current", "page");
      activeLink = link;
    } else {
      link.classList.remove("menu__link--active");
      link.removeAttribute("aria-current");
    }
  });
  if (activeLink) scrollSidebarToActive(activeLink);
}

/**
 * Writes the hash to the URL via `history.replaceState`. No-op when
 * the URL already matches. Called only from the scroll-spy pathway —
 * scrolling is the ONLY thing that should change the URL hash
 * automatically.
 */
function writeUrlHash(hashId: string): void {
  const desired = `#${hashId}`;
  if (window.location.hash === desired) return;
  const base = window.location.pathname + window.location.search;
  window.history.replaceState(null, "", `${base}${desired}`);
}

// ── Update flows ─────────────────────────────────────────────────────────

/**
 * URL-driven update (hashchange / route load). Reads the hash, uses the
 * deep-link fallback if needed, then applies active state.
 */
function updateActiveLinks(): void {
  buildWatchList();

  const { hash } = window.location;
  const currentHashId = hash.startsWith("#") ? hash.slice(1) : "";
  const pageHashes = new Set(watchList.map((item) => item.hashId));

  let activeHash: string | null = null;
  if (currentHashId) {
    if (pageHashes.has(currentHashId)) {
      activeHash = currentHashId;
    } else {
      activeHash = findSectionForHash(currentHashId, pageHashes);
    }
  }

  lastActiveHash = activeHash;
  setSidebarActive(activeHash);
}

/**
 * Scroll-driven update. Rebuilds the watch list lazily (it's empty
 * until after the first route update / first scroll after a route
 * change) and syncs URL + sidebar only when the active section
 * actually changes.
 */
function updateFromScroll(): void {
  // Scroll-spy only runs once the user has produced a real scroll
  // input. Before that, every scroll event is suspected layout-shift
  // noise and we leave the URL hash / active link alone.
  if (spyMuted) return;

  if (watchList.length === 0) {
    buildWatchList();
    if (watchList.length === 0) return;
  }

  const active = getActiveHashFromScroll();
  if (active === lastActiveHash) return;
  lastActiveHash = active;
  setSidebarActive(active);
  if (active) writeUrlHash(active);
}

function onScroll(): void {
  if (scrollRafScheduled) return;
  scrollRafScheduled = true;
  requestAnimationFrame(() => {
    scrollRafScheduled = false;
    updateFromScroll();
  });
}

// ── Initial-hash hydration gate ──────────────────────────────────────────
//
// The problem this solves: on a direct load of a URL like
//   /developers/payments/checkout-api/#api-create-a-new-payment-transaction
// the browser performs its native scroll-to-anchor immediately after
// HTML parse, BEFORE React hydrates <ApiDocEmbed>. The embed's
// RequestSchema / ResponseSchema are `<BrowserOnly>`-wrapped and
// SSR-render as tiny <SkeletonLoader>s, so the page height at browser
// scroll time is much smaller than its hydrated height. After
// hydration the schemas balloon and the target heading drifts far
// below the viewport — the user lands on the wrong section.
//
// Fix: on initial load, overlay a full-screen loader the instant this
// module runs, wait for page height to stabilise across several
// consecutive animation frames (= all lazy schemas have hydrated and
// painted), then force-scroll to the target and fade the loader out.
// The user never sees the intermediate wrong position.
//
// Scope: only the very first page-load (one-shot). SPA navigations
// don't need this — BrowserOnly renders children synchronously when
// `window` is available, so there's no SSR/CSR size delta.

const STABILITY_FRAMES = 6; // ~100ms @ 60fps
const STABILITY_TIMEOUT_MS = 6000;

let initialLoadHandled = false;

function getHashTargetId(): string | null {
  const { hash } = window.location;
  if (!hash || hash === "#") return null;
  return decodeURIComponent(hash.slice(1));
}

function showLoader(): HTMLElement {
  const existing = document.getElementById("ottu-initial-hash-loader");
  if (existing) return existing;

  const overlay = document.createElement("div");
  overlay.id = "ottu-initial-hash-loader";
  overlay.setAttribute("aria-hidden", "true");
  // Inline styles + style tag: zero CSS coupling, guaranteed to apply
  // even if the global stylesheet hasn't been injected by webpack yet.
  overlay.innerHTML = `
    <style>
      /* Hide the main page scrollbar while the loader is up so the
         user doesn't see the scrollbar thumb jump around as lazy
         content hydrates and snapToTop() fires. scrollbar-gutter
         reserves the gutter so content doesn't shift 15px sideways
         when the scrollbar reappears after the loader fades. */
      html[data-initial-hash-loading="true"] {
        scrollbar-gutter: stable;
        scrollbar-width: none;          /* Firefox */
        -ms-overflow-style: none;       /* legacy Edge */
      }
      html[data-initial-hash-loading="true"]::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;                  /* Chrome/Safari */
      }
      #ottu-initial-hash-loader {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ifm-background-color, #ffffff);
        transition: opacity 180ms ease-out;
        opacity: 1;
      }
      #ottu-initial-hash-loader[data-hiding="true"] { opacity: 0; }
      #ottu-initial-hash-loader .ottu-spinner {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 3px solid rgba(242, 126, 32, 0.15);
        border-top-color: var(--ifm-color-primary, #f27e20);
        animation: ottu-spin 0.9s linear infinite;
      }
      @keyframes ottu-spin {
        to { transform: rotate(360deg); }
      }
    </style>
    <div class="ottu-spinner"></div>
  `;

  // Prefer appending to <body>; if body isn't parsed yet, fall back to
  // documentElement. Either way, the overlay is detached from React's
  // render tree so hydration won't clobber it.
  const parent = document.body ?? document.documentElement;
  parent.appendChild(overlay);
  document.documentElement.setAttribute("data-initial-hash-loading", "true");
  return overlay;
}

function hideLoader(): void {
  const overlay = document.getElementById("ottu-initial-hash-loader");
  document.documentElement.removeAttribute("data-initial-hash-loading");
  if (!overlay) return;
  overlay.setAttribute("data-hiding", "true");
  window.setTimeout(() => overlay.remove(), 220);
}

/**
 * Snap the page to the absolute top instantly. Called while the
 * loader still masks the page — the user never sees this jump. After
 * the loader fades we animate smoothly down to the target so the user
 * gets a visible cue about where on the page they're landing.
 */
function snapToTop(): void {
  const htmlEl = document.documentElement;
  const prev = htmlEl.style.scrollBehavior;
  htmlEl.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  htmlEl.style.scrollBehavior = prev;
}

/**
 * Smooth-scroll the page so the target heading sits just below the
 * navbar. Respects the CSS `scroll-behavior: smooth` already set on
 * `html`. Called AFTER the loader has faded, so the user can watch
 * the animation.
 */
function smoothScrollToHash(hashId: string): void {
  const target = document.getElementById(hashId);
  if (!target) return;
  const topOffset = getNavbarHeight() + 16;
  const rect = target.getBoundingClientRect();
  const y = rect.top + window.scrollY - topOffset;
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

/**
 * Watch `scrollHeight` across animation frames. When it's been
 * unchanged for STABILITY_FRAMES in a row AND the hash target is in
 * the DOM, we consider lazy content fully hydrated and painted.
 * Hard-stops at STABILITY_TIMEOUT_MS so a never-stable page
 * doesn't leave the user staring at a spinner forever.
 */
function waitForLayoutStability(
  hashId: string,
  onStable: () => void,
): void {
  const startedAt = performance.now();
  let lastHeight = -1;
  let stableCount = 0;

  const tick = () => {
    if (performance.now() - startedAt > STABILITY_TIMEOUT_MS) {
      onStable();
      return;
    }

    const target = document.getElementById(hashId);
    const height = document.documentElement.scrollHeight;

    if (target && height === lastHeight) {
      stableCount += 1;
      if (stableCount >= STABILITY_FRAMES) {
        onStable();
        return;
      }
    } else {
      stableCount = 0;
      lastHeight = height;
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

/**
 * One-shot gate that runs on the very first page-load. If the URL has
 * a hash, show a loader, wait for lazy content to hydrate, force-scroll
 * to the target, then fade the loader out. Idempotent — subsequent
 * invocations are no-ops.
 */
function runInitialHashGate(): void {
  if (initialLoadHandled) return;
  initialLoadHandled = true;

  const hashId = getHashTargetId();
  if (!hashId) return;

  showLoader();

  // Normal initial updateActiveLinks retries run in parallel via
  // scheduleUpdate() — those keep sidebar highlight / URL-hash in
  // sync while the loader is up.

  waitForLayoutStability(hashId, () => {
    // Sequence: snap to top under the loader → fade loader → smooth-scroll
    // to the target. The user never sees the hydration mess or the reset
    // to top; they just see the loader fade out revealing the top of the
    // page, then a smooth scroll carrying them to the anchor.
    snapToTop();
    window.setTimeout(() => {
      requestAnimationFrame(() => {
        hideLoader();
        // Wait for the fade-out transition to finish (see #ottu-initial-hash-loader
        // style: 180ms) plus a small buffer so the loader is fully out of
        // the way before the scroll animation begins.
        window.setTimeout(() => smoothScrollToHash(hashId), 220);
      });
    }, 200)
  });
}

// ── Retry / route change ─────────────────────────────────────────────────

function scheduleUpdate(): void {
  // Schema-deep-link targets are rendered asynchronously by the swizzled
  // <Schema>/<SchemaItem> components (BrowserOnly + lazy hydration), so
  // the target element isn't in the DOM on the first animation frame.
  // Retry with growing delays until the target appears or we've given
  // <ApiDocEmbed> enough time to fully hydrate.
  const delays = [0, 50, 200, 500, 1200];
  delays.forEach((delay) => {
    window.setTimeout(() => updateActiveLinks(), delay);
  });
}

export function onRouteDidUpdate(): void {
  // New route: drop stale state so the scroll listener doesn't act on
  // a previous page's cached sections. Re-mute scroll-spy on every
  // route change — the new page's hydration will cause the same kind
  // of layout-shift scrolls as the initial load, and the user hasn't
  // provided any scroll input on the NEW page yet.
  watchList = [];
  lastActiveHash = null;
  spyMuted = true;
  scheduleUpdate();
  // One-shot hydration gate. No-op on SPA navigations (initialLoadHandled
  // is set true on the first call), no-op when URL has no hash.
  runInitialHashGate();
}

// ── Listeners ────────────────────────────────────────────────────────────

if (typeof window !== "undefined") {
  // `spyMuted` is initialized to `true` at the top of the file, so
  // scroll events are ignored from module load until the user's first
  // real scroll input — regardless of how long hydration takes.

  window.addEventListener("hashchange", () => updateActiveLinks());
  document.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // Real user-scroll intent lifts the mute. Touch/wheel/keyboard only
  // — layout-shift scroll events don't originate from any of these.
  const unmute = () => {
    spyMuted = false;
  };
  window.addEventListener("wheel", unmute, { passive: true });
  window.addEventListener("touchmove", unmute, { passive: true });
  window.addEventListener(
    "keydown",
    (e) => {
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "PageUp" ||
        e.key === "PageDown" ||
        e.key === "Home" ||
        e.key === "End" ||
        e.key === " "
      ) {
        unmute();
      }
    },
    { passive: true },
  );

  // Paint the loader as early as possible on the very first load —
  // ideally before React hydrates, so the user never sees the
  // browser's pre-hydration scroll-to-anchor land on the wrong
  // position. `onRouteDidUpdate` will also call this, but it can fire
  // a few frames later than we'd like. Both calls are idempotent via
  // the `initialLoadHandled` flag.
  if (window.location.hash) {
    // If <body> is already parsed, show immediately; otherwise wait
    // for the earliest possible DOM insertion point.
    if (document.body) {
      runInitialHashGate();
    } else {
      document.addEventListener("DOMContentLoaded", runInitialHashGate, {
        once: true,
      });
    }
  }
}
