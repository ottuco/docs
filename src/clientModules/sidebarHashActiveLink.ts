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
 * Toggles `.menu__link--active` on every hash-bearing sidebar link that
 * points at the current page, making `hashId`'s link the active one
 * (or none active if `hashId` is null). Does NOT write the URL —
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
    } else {
      link.classList.remove("menu__link--active");
      link.removeAttribute("aria-current");
    }
  });
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
}
