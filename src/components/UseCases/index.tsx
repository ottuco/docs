// A grid of use case cards, Stripe style ("Use cases" on Stripe's Recurring
// payments page): each card is a short title and one line, and links to the
// section that explains it (#161111 R17). Registered for every MDX page in
// src/theme/MDXComponents.tsx.
//
//   <UseCases>
//     <UseCase title="Get paid on time" href="#how-it-works">One line.</UseCase>
//   </UseCases>
import React from "react";
import Link from "@docusaurus/Link";
import Icon from "@mdi/react";
import { mdiArrowRight } from "@mdi/js";
import styles from "./styles.module.css";

export function UseCase({
  title,
  href,
  icon,
  cta = "Learn more",
  children,
}: {
  title: string;
  /** The section (or page) that explains it. */
  href: string;
  /** An @mdi/js path, shown in a small tile above the title. */
  icon?: string;
  /** Link label at the bottom of the card. */
  cta?: string;
  /** One line. */
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <li className={styles.item}>
      <Link to={href} className={styles.card}>
        {icon && (
          <span className={styles.tile} aria-hidden="true">
            <Icon path={icon} size={0.9} />
          </span>
        )}
        <span className={styles.title}>{title}</span>
        <span className={styles.text}>{children}</span>
        <span className={styles.more} aria-hidden="true">
          {cta} <Icon path={mdiArrowRight} size={0.6} />
        </span>
      </Link>
    </li>
  );
}

export default function UseCases({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <ul className={styles.grid}>{children}</ul>;
}
