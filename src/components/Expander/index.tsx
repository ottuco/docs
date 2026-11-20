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
//
// With `id`, a link to #<id> opens the item (a closed <details> hides its text).
import React, { useEffect, useRef } from "react";
import Icon from "@mdi/react";
import { mdiChevronRight } from "@mdi/js";
import styles from "./styles.module.css";

export default function Expander({
  title,
  open = false,
  tone,
  id,
  children,
}: {
  title: React.ReactNode;
  /** Start open. */
  open?: boolean;
  /** A status dot before the title, in the colour the matching diagram state uses. */
  tone?: "neutral" | "info" | "success" | "warn" | "danger";
  /** Anchor: a link to `#id` opens this item and scrolls to it. */
  id?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (!id) return;
    const openIfLinked = () => {
      if (window.location.hash !== `#${id}` || !ref.current) return;
      ref.current.open = true;
      ref.current.scrollIntoView();
    };
    openIfLinked();
    window.addEventListener("hashchange", openIfLinked);
    return () => window.removeEventListener("hashchange", openIfLinked);
  }, [id]);
  return (
    <details
      ref={ref}
      id={id}
      className={tone ? `${styles.expander} ${styles.withDot}` : styles.expander}
      open={open}
    >
      <summary className={styles.summary}>
        <Icon path={mdiChevronRight} size={0.8} className={styles.chevron} />
        {tone && <span className={`${styles.dot} ${styles[tone]}`} aria-hidden="true" />}
        <span>{title}</span>
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
