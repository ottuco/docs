// A removed page's URL, kept alive: one unlisted doc per old route renders
// `<MovedTo from="<old route>" />`, which sends the reader to the new place
// (src/components/MovedTo/routes.ts), hash included. The visible line and
// its normal link serve readers without JavaScript and crawlers.
//
// The redirect replaces the history entry (Docusaurus router, no reload), so
// Back does not bounce to the old URL. The hash: a renamed anchor gets its
// new name; no hash gets the route's default; any other hash is kept, and
// the route's default is left in sessionStorage so HashAlias on the new
// page can use it if the page has no such anchor.
//
// Usage in an unlisted doc:  <MovedTo from="/developers/webhooks/event-catalogue/" />
import React, { useEffect } from "react";
import Link from "@docusaurus/Link";
import { useHistory } from "@docusaurus/router";
import useBrokenLinks from "@docusaurus/useBrokenLinks";
import { MOVED, MOVED_FALLBACK_KEY } from "./routes";

export default function MovedTo({ from }: { from: string }): React.JSX.Element {
  const moved = MOVED[from];
  const history = useHistory();
  if (!moved) throw new Error(`MovedTo: "${from}" is not in src/components/MovedTo/routes.ts`);
  const fallback = moved.defaultHash ? `#${moved.defaultHash}` : "";
  // Links to this old URL with one of its old anchors pass the build's
  // broken-anchor check: the redirect takes them to the right place.
  const brokenLinks = useBrokenLinks();
  for (const anchor of [...Object.keys(moved.renames ?? {}), ...(moved.keep ?? [])]) {
    brokenLinks.collectAnchor(anchor);
  }

  useEffect(() => {
    const old = decodeURIComponent(window.location.hash.slice(1));
    let hash = fallback;
    if (old) {
      hash = `#${moved.renames?.[old] ?? old}`;
      try {
        if (moved.defaultHash) sessionStorage.setItem(MOVED_FALLBACK_KEY, moved.defaultHash);
      } catch {
        // Storage blocked: an unknown hash then lands at the top of the page.
      }
    }
    history.replace(moved.to + hash);
  }, [moved, fallback, history]);

  return (
    <p>
      This page has moved: <Link to={moved.to + fallback}>{moved.label}</Link>.
    </p>
  );
}
