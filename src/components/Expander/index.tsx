// An expandable item, Stripe style ("Set up the customer portal" on Stripe's
// Recurring payments page): a title row with a chevron; the details open
// under it (#161111 R17). Built on <details>, so it works without
// JavaScript, the page's search finds the text, and a reader can open it
// with the keyboard. Registered for every MDX page in
// src/theme/MDXComponents.tsx.
//
//   <Expander title="A payment gateway with auto-debit">
//   The details, as ordinary Markdown.
//   </Expander>
import React from "react";
import Icon from "@mdi/react";
import { mdiChevronDown } from "@mdi/js";
import styles from "./styles.module.css";

export default function Expander({
  title,
  open = false,
  children,
}: {
  title: React.ReactNode;
  /** Start open. */
  open?: boolean;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <details className={styles.expander} open={open}>
      <summary className={styles.summary}>
        <span>{title}</span>
        <Icon path={mdiChevronDown} size={0.8} className={styles.chevron} />
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
