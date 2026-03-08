import React from "react";
import clsx from "clsx";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { isActiveSidebarItem } from "@docusaurus/plugin-content-docs/client";
import Link from "@docusaurus/Link";
import isInternalUrl from "@docusaurus/isInternalUrl";
import IconExternalLink from "@theme/Icon/ExternalLink";
import originalStyles from "@docusaurus/theme-classic/lib/theme/DocSidebarItem/Link/styles.module.css";

type SidebarLinkItem = {
  href: string;
  label: string;
  className?: string;
  autoAddBaseUrl?: boolean;
};

type Props = {
  item: SidebarLinkItem;
  onItemClick?: (item: SidebarLinkItem) => void;
  activePath?: string;
  level: number;
  index: number;
};

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  ...props
}: Props): React.ReactElement {
  const { href, label, className, autoAddBaseUrl } = item;
  const isActive = isActiveSidebarItem(item as never, activePath);
  const isInternalLink = isInternalUrl(href);

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        "menu__list-item",
        className,
      )}
      key={label}
    >
      <Link
        className={clsx(
          "menu__link",
          !isInternalLink && originalStyles.menuExternalLink,
          {
            "menu__link--active": isActive,
          },
        )}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? "page" : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}
      >
        {label}
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}
