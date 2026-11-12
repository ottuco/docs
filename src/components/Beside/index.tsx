// A screenshot floated to the right of the text it illustrates, so the reader
// sees the screen while reading about it. The screenshot takes the right half
// and the rest of the section keeps flowing down the left: no gap under the
// first paragraph. Meant for a page whose prose is half width on desktop (the
// AutoPay page: docs/developers/payments/autopay/autopay.css); elsewhere the
// prose wraps around it. Headings and wide blocks (code, tables, diagrams) start below it.
// On narrow screens it sits above the text. The image links to itself at full
// size.
//
// Usage in MDX, at the top of the section it belongs to:
//   <Beside image="/img/developers/autopay/self-service-page.png" alt="…">
//   The first paragraph the screenshot illustrates.
//   </Beside>
// The children render as the page's own paragraphs (same width and spacing).
import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

export default function Beside({
  image,
  alt,
  children,
}: {
  image: string;
  alt: string;
  children: React.ReactNode;
}): React.JSX.Element {
  const src = useBaseUrl(image);
  return (
    <>
      <a
        className={`${styles.shot} float-beside`}
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        title="Open full size"
      >
        <img src={src} alt={alt} loading="lazy" />
      </a>
      {children}
    </>
  );
}
