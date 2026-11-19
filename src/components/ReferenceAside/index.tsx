// A text-only section with small reference cards on the right, as Stripe's
// API reference does for its text sections, so the right column never sits
// empty (#161111 R10): a summary table, a short code box or a note.
//   Errors:         https://docs.stripe.com/api/errors  (status-code and error-type tables)
//   Authentication: https://docs.stripe.com/api/authentication  (request box + note)
//   Introduction:   https://docs.stripe.com/api  (base URL + client libraries boxes)
// The cards stay in view (sticky) while the reader scrolls the section's
// text; below 1200px they sit under the section title, before the text.
//
// Usage in MDX (the cards are children, so they can hold Markdown tables and
// code blocks; every <ReferenceCard> child goes to the right column, the
// rest is the section's text):
//   <ReferenceAside>
//
//   <ReferenceCard title="Test cards">
//
//   | Card | Result |
//   …
//
//   </ReferenceCard>
//
//   The section's text and sub-headings.
//
//   </ReferenceAside>
import React from "react";
import styles from "./styles.module.css";

/** One reference card: a small title row, then a table, a code box or a note. */
export function ReferenceCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className={styles.card} aria-label={title}>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

export default function ReferenceAside({
  children,
}: {
  /** The section's text, with its <ReferenceCard>s anywhere among it. */
  children: React.ReactNode;
}): React.JSX.Element {
  const all = React.Children.toArray(children);
  const isCard = (child: React.ReactNode) =>
    React.isValidElement(child) && child.type === ReferenceCard;
  const aside = all.filter(isCard);
  const text = all.filter((child) => !isCard(child));
  return (
    <div className={styles.wrap}>
      <div className={styles.text}>{text}</div>
      <aside className={styles.aside}>{aside}</aside>
    </div>
  );
}
