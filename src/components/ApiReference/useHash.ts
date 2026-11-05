import { useRef } from "react";
import { useHistory, useLocation } from "@docusaurus/router";

const decode = (hash: string) => {
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash; // a malformed %-escape in a shared link must not break the page
  }
};

/**
 * The URL's hash, decoded and read from the router (router links to an
 * in-page anchor push history without firing `hashchange`), plus a counter
 * that goes up each time the reader navigates to a hash: a new hash, or the
 * same link followed again. A tab click only rewrites the query string (the
 * hash stays) and does not count, so a tab the reader picked is not undone.
 */
export function useHashNavigation(): { hash: string; visit: number } {
  const location = useLocation();
  const { action } = useHistory();
  const hash = decode(location.hash.slice(1));
  const last = useRef({ key: location.key, hash, search: location.search });
  const visit = useRef(0);
  const prev = last.current;
  const moved =
    hash !== prev.hash ||
    location.key !== prev.key ||
    location.search !== prev.search;
  if (moved) {
    // Tabs (and ApiReference's tab switch) rewrite the query with
    // history.replace: that is not the reader following a link. A push or a
    // pop (a link, back/forward, a typed hash) is, even to the same hash.
    if (hash && (hash !== prev.hash || action !== "REPLACE"))
      visit.current += 1;
    last.current = { key: location.key, hash, search: location.search };
  }
  return { hash, visit: visit.current };
}
