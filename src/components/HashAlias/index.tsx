// Old anchors of a page, kept working: before the page scrolls to the hash,
// a renamed anchor is swapped for its new one (history.replaceState, no new
// history entry). Also the fallback for MovedTo: when the hash it kept has no
// element on this page, the moved route's default anchor is used.
//
// Usage at the top of an MDX page:
//   <HashAlias aliases={{ "old-anchor": "new-anchor", "gone": "" }} />
// An empty target means "the top of the page".
import React, { useLayoutEffect } from "react";
import useBrokenLinks from "@docusaurus/useBrokenLinks";
import { MOVED_FALLBACK_KEY } from "@site/src/components/MovedTo/routes";

function takeFallback(): string | null {
  try {
    const value = sessionStorage.getItem(MOVED_FALLBACK_KEY);
    sessionStorage.removeItem(MOVED_FALLBACK_KEY);
    return value;
  } catch {
    return null;
  }
}

export default function HashAlias({ aliases }: { aliases: Record<string, string> }): React.JSX.Element | null {
  // Links to an old anchor pass the build's broken-anchor check: this
  // component takes them to the right place.
  const brokenLinks = useBrokenLinks();
  for (const anchor of Object.keys(aliases)) brokenLinks.collectAnchor(anchor);
  // A layout effect runs before Docusaurus' own route hooks, which do the
  // scrolling (src/clientModules/sidebarHashActiveLink.ts), so they already
  // see the new hash.
  useLayoutEffect(() => {
    const fallback = takeFallback();
    const old = decodeURIComponent(window.location.hash.slice(1));
    if (!old) return;
    let next: string | undefined;
    if (old in aliases) next = aliases[old];
    else if (!document.getElementById(old) && fallback) next = fallback;
    if (next === undefined) return;
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", pathname + search + (next ? `#${next}` : ""));
    if (!next) window.scrollTo(0, 0);
  }, [aliases]);
  return null;
}
