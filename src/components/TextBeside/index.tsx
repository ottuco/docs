// Text on the left, a visual on the right (a live demo, a diagram, a code
// sample), Stripe style: the text stays in view while the visual scrolls by,
// so neither column shows a large empty block (#161111 R10, R13). Below
// 1200px the text comes first and the visual follows, full width.
//
// Usage in MDX:
//   <TextBeside visual={<AutoPayDemo />}>
//
//   The text about the visual, as ordinary paragraphs.
//
//   </TextBeside>
import React from "react";
import styles from "./styles.module.css";

export default function TextBeside({
  visual,
  children,
}: {
  /** What goes on the right. */
  visual: React.ReactNode;
  /** The text on the left. */
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className={styles.wrap}>
      <div className={styles.text}>{children}</div>
      <div className={styles.visual}>{visual}</div>
    </div>
  );
}
