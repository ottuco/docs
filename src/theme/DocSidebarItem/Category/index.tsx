import Link from "@docusaurus/Link";
import { useHistory } from "@docusaurus/router";
import {
  findFirstSidebarItemLink,
  isActiveSidebarItem,
  useDocSidebarItemsExpandedState,
} from "@docusaurus/plugin-content-docs/client";
import {
  Collapsible,
  ThemeClassNames,
  useCollapsible,
  usePrevious,
  useThemeConfig,
} from "@docusaurus/theme-common";
import { isSamePath } from "@docusaurus/theme-common/internal";
import { translate } from "@docusaurus/Translate";
import useIsBrowser from "@docusaurus/useIsBrowser";
import DocSidebarItems from "@theme/DocSidebarItems";
import clsx from "clsx";
import React, { useEffect, useMemo } from "react";

type SidebarCategoryItem = {
  items: SidebarCategoryItem[];
  label: string;
  collapsible?: boolean;
  collapsed?: boolean;
  className?: string;
  href?: string;
  customProps?: {
    targetHref?: string;
  };
  linkUnlisted?: boolean;
};

/**
 * Back to the top of the current page. With a "#section" in the URL, the
 * hash is dropped through the router (a replace: no new history entry), and
 * Docusaurus's own scrollAfterNavigation scrolls a hash-less route to the
 * top; the route update also clears the sidebar's section highlight and
 * re-mutes its scroll-spy (src/clientModules/sidebarHashActiveLink.ts).
 * Without a hash, it scrolls itself. A long page first jumps to one screen
 * from the top, so the smooth scroll that follows is short.
 */
function goToPageTop(history: ReturnType<typeof useHistory>): void {
  if (window.scrollY > window.innerHeight) {
    window.scrollTo({ top: window.innerHeight, behavior: "instant" });
  }
  if (window.location.hash) {
    history.replace({ pathname: window.location.pathname, search: window.location.search });
  } else {
    window.scrollTo({ top: 0 });
  }
}

type Props = {
  item: SidebarCategoryItem;
  onItemClick?: (item: SidebarCategoryItem) => void;
  activePath?: string;
  level: number;
  index: number;
};

function useAutoExpandActiveCategory({
  isActive,
  collapsed,
  updateCollapsed,
}: {
  isActive: boolean;
  collapsed: boolean;
  updateCollapsed: (collapsed?: boolean) => void;
}) {
  const wasActive = usePrevious(isActive);

  useEffect(() => {
    const justBecameActive = isActive && !wasActive;
    if (justBecameActive && collapsed) {
      updateCollapsed(false);
    }
  }, [isActive, wasActive, collapsed, updateCollapsed]);
}

function useCategoryHrefWithSSRFallback(item: SidebarCategoryItem) {
  const isBrowser = useIsBrowser();

  return useMemo(() => {
    if (item.customProps?.targetHref) {
      return item.customProps.targetHref;
    }
    if (item.href && !item.linkUnlisted) {
      return item.href;
    }
    if (isBrowser || !item.collapsible) {
      return undefined;
    }
    return findFirstSidebarItemLink(item as never);
  }, [item, isBrowser]);
}

function CollapseButton({
  collapsed,
  categoryLabel,
  onClick,
}: {
  collapsed: boolean;
  categoryLabel: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      aria-label={
        collapsed
          ? translate(
              {
                id: "theme.DocSidebarItem.expandCategoryAriaLabel",
                message: "Expand sidebar category '{label}'",
                description: "The ARIA label to expand the sidebar category",
              },
              { label: categoryLabel },
            )
          : translate(
              {
                id: "theme.DocSidebarItem.collapseCategoryAriaLabel",
                message: "Collapse sidebar category '{label}'",
                description: "The ARIA label to collapse the sidebar category",
              },
              { label: categoryLabel },
            )
      }
      aria-expanded={!collapsed}
      type="button"
      className="clean-btn menu__caret"
      onClick={onClick}
    />
  );
}

export default function DocSidebarItemCategory({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}: Props) {
  const { items, label, collapsible, className } = item;
  const history = useHistory();
  const {
    docs: {
      sidebar: { autoCollapseCategories },
    },
  } = useThemeConfig();

  const hrefWithSSRFallback = useCategoryHrefWithSSRFallback(item);
  const isActive = isActiveSidebarItem(item as never, activePath ?? "");
  const isCurrentPage = isSamePath(hrefWithSSRFallback, activePath);

  const { collapsed, setCollapsed } = useCollapsible({
    initialState: () => {
      if (!collapsible) {
        return false;
      }
      return isActive ? false : (item.collapsed ?? false);
    },
  });

  const { expandedItem, setExpandedItem } = useDocSidebarItemsExpandedState();

  const updateCollapsed = (toCollapsed = !collapsed) => {
    setExpandedItem(toCollapsed ? null : index);
    setCollapsed(toCollapsed);
  };

  useAutoExpandActiveCategory({ isActive, collapsed, updateCollapsed });

  useEffect(() => {
    if (
      collapsible &&
      expandedItem != null &&
      expandedItem !== index &&
      autoCollapseCategories
    ) {
      setCollapsed(true);
    }
  }, [collapsible, expandedItem, index, setCollapsed, autoCollapseCategories]);

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemCategory,
        ThemeClassNames.docs.docSidebarItemCategoryLevel(level),
        "menu__list-item",
        {
          "menu__list-item--collapsed": collapsed,
        },
        className,
      )}
    >
      <div
        className={clsx("menu__list-item-collapsible", {
          "menu__list-item-collapsible--active": isCurrentPage,
        })}
      >
        <Link
          className={clsx("menu__link", {
            "menu__link--sublist": collapsible,
            "menu__link--sublist-caret": !hrefWithSSRFallback && collapsible,
            "menu__link--active": isActive,
          })}
          onClick={
            collapsible
              ? (e) => {
                  onItemClick?.(item);
                  if (hrefWithSSRFallback) {
                    if (isCurrentPage) {
                      // Already on this category's page (a one-page doc whose
                      // children are its sections): go back to the top
                      // instead of only folding the list, so the reader can
                      // always return to the start (#161111 R9). The caret
                      // button next to the label still folds the list.
                      e.preventDefault();
                      updateCollapsed(false);
                      goToPageTop(history);
                    } else {
                      updateCollapsed(false);
                    }
                  } else {
                    e.preventDefault();
                    updateCollapsed();
                  }
                }
              : () => {
                  onItemClick?.(item);
                }
          }
          aria-current={isCurrentPage ? "page" : undefined}
          role={collapsible && !hrefWithSSRFallback ? "button" : undefined}
          aria-expanded={
            collapsible && !hrefWithSSRFallback ? !collapsed : undefined
          }
          href={
            collapsible ? (hrefWithSSRFallback ?? "#") : hrefWithSSRFallback
          }
          {...props}
        >
          {label}
        </Link>
        {hrefWithSSRFallback && collapsible && (
          <CollapseButton
            collapsed={collapsed}
            categoryLabel={label}
            onClick={(e) => {
              e.preventDefault();
              updateCollapsed();
            }}
          />
        )}
      </div>

      <Collapsible lazy as="ul" className="menu__list" collapsed={collapsed}>
        <DocSidebarItems
          items={items as never}
          tabIndex={collapsed ? -1 : 0}
          onItemClick={onItemClick as never}
          activePath={activePath ?? ""}
          level={level + 1}
        />
      </Collapsible>
    </li>
  );
}
