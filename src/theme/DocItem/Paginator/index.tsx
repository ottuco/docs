/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ReactNode} from 'react';
import {useDoc, useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import DocPaginator from '@theme/DocPaginator';
import type {PropSidebar} from '@docusaurus/plugin-content-docs';

type NavLink = {title: string; permalink: string};

/** Flatten sidebar tree into ordered list of doc links. */
function flattenSidebar(items: PropSidebar): NavLink[] {
  const result: NavLink[] = [];
  for (const item of items) {
    if (item.type === 'category') {
      if (item.href) {
        result.push({title: item.label, permalink: item.href});
      }
      result.push(...flattenSidebar(item.items));
    } else if (item.type === 'link') {
      result.push({title: item.label, permalink: item.href});
    }
  }
  return result;
}

/** Remove consecutive entries with the same permalink. */
function deduplicateConsecutive(links: NavLink[]): NavLink[] {
  return links.filter(
    (link, i) => i === 0 || link.permalink !== links[i - 1]!.permalink,
  );
}

/**
 * This extra component is needed, because <DocPaginator> should remain generic.
 * DocPaginator is used in non-docs contexts too: generated-index pages...
 *
 * Customized: when a sidebar category's link doc is also the first item in its
 * children, Docusaurus generates prev/next buttons that point to the current
 * page. This component detects that case and resolves the real neighbor instead.
 */
export default function DocItemPaginator(): ReactNode {
  const {metadata} = useDoc();
  const sidebar = useDocsSidebar();

  let previous = metadata.previous;
  let next = metadata.next;

  if (
    sidebar &&
    (next?.permalink === metadata.permalink ||
      previous?.permalink === metadata.permalink)
  ) {
    const allPages = deduplicateConsecutive(flattenSidebar(sidebar.items));
    const currentIndex = allPages.findIndex(
      (p) => p.permalink === metadata.permalink,
    );

    if (currentIndex !== -1) {
      next =
        currentIndex < allPages.length - 1
          ? allPages[currentIndex + 1]
          : undefined;
      previous = currentIndex > 0 ? allPages[currentIndex - 1] : undefined;
    }
  }

  return (
    <DocPaginator
      className="docusaurus-mt-lg"
      previous={previous}
      next={next}
    />
  );
}
