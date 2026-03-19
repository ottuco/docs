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
 */

function normalizePath(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

function updateActiveLinks(): void {
  const { pathname, hash } = window.location;
  const fullPath = `${pathname}${hash}`;

  // Find all sidebar menu links
  const sidebarLinks = document.querySelectorAll<HTMLAnchorElement>(
    ".menu__link[href*='#']",
  );

  sidebarLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !href.includes("#")) return;

    const [linkPath, linkHash] = href.split("#");

    // Check if pathname matches and hash matches
    const pathMatches =
      normalizePath(linkPath) === normalizePath(pathname);
    const hashMatches = hash === `#${linkHash}`;

    if (pathMatches && hashMatches) {
      link.classList.add("menu__link--active");
      link.setAttribute("aria-current", "page");
    } else if (pathMatches && !hashMatches) {
      // Same page but different hash — remove active
      link.classList.remove("menu__link--active");
      link.removeAttribute("aria-current");
    }
    // Links to different pages are left untouched (Docusaurus handles those)
  });
}

export function onRouteDidUpdate(): void {
  // Small delay to let Docusaurus finish rendering the sidebar
  requestAnimationFrame(() => updateActiveLinks());
}

// Listen for hash changes (clicking anchor links on the same page)
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => updateActiveLinks());
}
