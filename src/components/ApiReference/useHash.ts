import { useCallback, useSyncExternalStore } from "react";
import { useHistory } from "@docusaurus/router";

type History = ReturnType<typeof useHistory>;
type Navigation = { hash: string; visit: number };

const decode = (hash: string) => {
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash; // a malformed %-escape in a shared link must not break the page
  }
};

const hashOf = (location: History["location"]) =>
  decode(location.hash.slice(1));

const ON_SERVER: Navigation = { hash: "", visit: 0 };

// One store for the page, fed by history itself: every component gets the
// same visit, however late it mounted.
let current: Navigation | undefined;
let place = { pathname: "", search: "" };
const listeners = new Set<() => void>();

function onNavigate(location: History["location"], action: string): void {
  const hash = hashOf(location);
  const same =
    hash === current?.hash &&
    location.pathname === place.pathname &&
    location.search === place.search;
  // A link, back/forward or a typed hash (PUSH or POP) is the reader going
  // to the hash. So is a REPLACE to the very same URL: a router link to the
  // page the reader is on replaces instead of pushing. Any other REPLACE is
  // the page itself: tabs rewrite the query, the tab switch keeps the hash.
  const followed = hash !== "" && (action !== "REPLACE" || same);
  place = { pathname: location.pathname, search: location.search };
  if (!followed && hash === current?.hash) return;
  const visit = current?.visit ?? 0;
  current = { hash, visit: followed ? visit + 1 : visit };
  listeners.forEach((listener) => listener());
}

/**
 * The store, started on the first read: the location then (a hash on page
 * load is a visit), and a listener on the page's one history for its whole
 * life. Starting before anything subscribes means no navigation is missed,
 * even one in the commit that mounts the first reader; it happens once.
 */
function read(history: History): Navigation {
  if (!current) {
    const { location } = history;
    place = { pathname: location.pathname, search: location.search };
    const hash = hashOf(location);
    current = { hash, visit: hash ? 1 : 0 };
    history.listen(onNavigate);
  }
  return current;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * The URL's hash, decoded and read from the router (router links to an
 * in-page anchor push history without firing `hashchange`), plus a counter
 * that goes up each time the reader navigates to a hash: a hash on page load
 * (visit 1), a link to a hash, or the same link followed again. A tab click
 * only rewrites the query string and does not count, so a tab the reader
 * picked is not undone.
 */
export function useHashNavigation(): Navigation {
  const history = useHistory();
  const getSnapshot = useCallback(() => read(history), [history]);
  return useSyncExternalStore(subscribe, getSnapshot, () => ON_SERVER);
}
