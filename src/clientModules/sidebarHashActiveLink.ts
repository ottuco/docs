/**
 * Client module that manages `menu__link--active` for sidebar hash links.
 *
 * Docusaurus sidebar items of `type: 'link'` with hash fragments
 * (e.g. `/docs/page#section`) never get the active class because
 * `isActiveSidebarItem` compares against `activePath` (pathname only).
 *
 * This module listens for hash changes and URL navigation, then toggles
 * the active class on sidebar links whose `href` matches the full URL
 * (pathname + hash).
 *
 * Also handles deep-linked schema property anchors (e.g. the IDs emitted
 * by the swizzled Schema/SchemaItem components for OpenAPI schema
 * properties): when the current hash doesn't exactly match any sidebar
 * link, we locate its DOM element and pick the nearest preceding section
 * anchor whose id IS a sidebar link hash. That keeps the correct section
 * highlighted while the user browses deep into a schema.
 */

function normalizePath(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

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

function updateActiveLinks(): void {
  const { pathname, hash } = window.location;
  const currentHashId = hash.startsWith("#") ? hash.slice(1) : "";

  const sidebarLinks = document.querySelectorAll<HTMLAnchorElement>(
    ".menu__link[href*='#']",
  );

  const pageLinks: Array<{ link: HTMLAnchorElement; linkHash: string }> = [];
  sidebarLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !href.includes("#")) return;
    const [linkPath, linkHash] = href.split("#");
    if (normalizePath(linkPath) !== normalizePath(pathname)) {
      link.classList.remove("menu__link--active");
      link.removeAttribute("aria-current");
      return;
    }
    pageLinks.push({ link, linkHash });
  });

  const pageHashes = new Set(pageLinks.map(({ linkHash }) => linkHash));

  let activeHash: string | null = null;
  if (currentHashId) {
    if (pageHashes.has(currentHashId)) {
      activeHash = currentHashId;
    } else {
      activeHash = findSectionForHash(currentHashId, pageHashes);
    }
  }

  pageLinks.forEach(({ link, linkHash }) => {
    if (linkHash === activeHash) {
      link.classList.add("menu__link--active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("menu__link--active");
      link.removeAttribute("aria-current");
    }
  });
}

function scheduleUpdate(): void {
  // Schema-deep-link targets are rendered asynchronously by the swizzled
  // <Schema>/<SchemaItem> components (BrowserOnly + lazy hydration), so
  // the target element isn't in the DOM on the first animation frame.
  // Retry with growing delays until the target appears or we've given
  // ApiDocEmbed enough time to fully hydrate.
  const delays = [0, 50, 200, 500, 1200];
  delays.forEach((delay) => {
    window.setTimeout(() => updateActiveLinks(), delay);
  });
}

export function onRouteDidUpdate(): void {
  scheduleUpdate();
}

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => updateActiveLinks());
}
