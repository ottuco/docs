import React from "react";
import clsx from "clsx";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { isActiveSidebarItem } from "@docusaurus/plugin-content-docs/client";
import Link from "@docusaurus/Link";
import isInternalUrl from "@docusaurus/isInternalUrl";
import IconExternalLink from "@theme/Icon/ExternalLink";
import originalStyles from "@docusaurus/theme-classic/lib/theme/DocSidebarItem/Link/styles.module.css";
import styles from "./styles.module.css";

type SidebarLinkItem = {
  href: string;
  label: string;
  className?: string;
  autoAddBaseUrl?: boolean;
  customProps?: {
    method?: string;
  };
};

type Props = {
  item: SidebarLinkItem;
  onItemClick?: (item: SidebarLinkItem) => void;
  activePath?: string;
  level: number;
  index: number;
};

function getMethodClassName(method?: string): string {
  switch (method?.toUpperCase()) {
    case "POST":
      return styles.methodPost;
    case "GET":
      return styles.methodGet;
    case "PATCH":
      return styles.methodPatch;
    case "PUT":
      return styles.methodPut;
    case "DELETE":
      return styles.methodDelete;
    default:
      return styles.methodDefault;
  }
}

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
  const method = item.customProps?.method?.toUpperCase();

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
        {method ? (
          <span
            className={clsx(styles.methodBadge, getMethodClassName(method))}
          >
            {method}
          </span>
        ) : null}
        {label}
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}
