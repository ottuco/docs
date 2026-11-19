// Text on the left, its visual on the right. Two modes.
//
// 1. A screenshot beside the text (`image`). The screenshot is floated in the
//    right half and the rest of the section keeps flowing down the left: no
//    gap under the first paragraph. Meant for a page whose prose is half width
//    on desktop (the AutoPay page: docs/developers/payments/autopay/autopay.css);
//    elsewhere the prose wraps around it. Headings and wide blocks (code,
//    tables, diagrams) start below it. On narrow screens it sits above the
//    text. The image links to itself at full size.
//
//      <Beside image="/img/developers/autopay/self-service-page.png" alt="…">
//      The first paragraph the screenshot illustrates.
//      </Beside>
//
//    The children render as the page's own paragraphs (same width and spacing).
//
// 2. Any visual beside the text (no `image`). Every `<Visual>` child goes to
//    the right column, everything else to the left, in source order:
//
//      import Beside, { Visual } from "@site/src/components/Beside";
//      <Beside>
//
//      Text, lists, admonitions, h4/h5 headings…
//
//      <Visual>
//      A code fence, <Tabs> of code, a JSON block, an image or a diagram.
//      </Visual>
//
//      </Beside>
//
//    Desktop (>= 997px): two equal columns. The right column is sticky under
//    the navbar while its text scrolls past, Stripe style, and is released at
//    the end of the `<Beside>`. A visual taller than the window is not sticky
//    (it would hide its own end): it scrolls with the page. The column never
//    gets its own scrollbar; code blocks keep their horizontal scroll for long
//    lines. Several `<Visual>`s stack in the right column. Without any
//    `<Visual>` the children render as usual. Narrow screens: one column, the
//    visual after the text.
//
//    `wideVisual`: for a visual that needs about 600px (our story diagrams,
//    storyParts.tsx). From 1400px wide it sits in the right column as above;
//    between 997px and 1400px, where the column would be too narrow to read
//    it, it drops under the text at the full content width.
import React, { useEffect, useRef, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

type Props = {
  image?: string;
  alt?: string;
  /** Mode 2 only: put the visual under the text between 997px and 1400px. */
  wideVisual?: boolean;
  children: React.ReactNode;
};

type VisualElement = React.ReactElement<{ children: React.ReactNode }>;

/** A visual for the right column of `<Beside>`. On its own it renders its children. */
export function Visual({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <>{children}</>;
}
// Marker that survives hot reload (the function itself is replaced then).
(Visual as { besideVisual?: boolean }).besideVisual = true;

const isVisual = (node: React.ReactNode): node is VisualElement =>
  React.isValidElement(node) &&
  Boolean((node.type as { besideVisual?: boolean }).besideVisual);

function Shot({ image, alt, children }: { image: string; alt: string; children: React.ReactNode }) {
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

// Room the sticky column keeps under the navbar and above the window's bottom.
const MARGIN = 16;

function Columns({
  text,
  visuals,
  wideVisual,
}: {
  text: React.ReactNode[];
  visuals: VisualElement[];
  wideVisual: boolean;
}) {
  const column = useRef<HTMLDivElement>(null);
  const [sticky, setSticky] = useState(true);

  // Sticky only while the column fits the window below the navbar.
  useEffect(() => {
    const el = column.current;
    if (!el) return;
    const measure = () => {
      const navbar = document.querySelector<HTMLElement>(".navbar")?.offsetHeight ?? 60;
      setSticky(el.offsetHeight <= window.innerHeight - navbar - 2 * MARGIN);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className={`${styles.columns} ${wideVisual ? styles.wideVisual : ""}`}>
      <div className={styles.text}>{text}</div>
      <div ref={column} className={`${styles.visual} ${sticky ? styles.sticky : ""}`}>
        {visuals.map((v, i) => (
          <div key={v.key ?? i} className={styles.visualItem}>
            {v.props.children}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Beside({ image, alt = "", wideVisual = false, children }: Props): React.JSX.Element {
  if (image) {
    return (
      <Shot image={image} alt={alt}>
        {children}
      </Shot>
    );
  }
  const nodes = React.Children.toArray(children);
  const visuals = nodes.filter(isVisual);
  if (visuals.length === 0) return <>{children}</>;
  return <Columns text={nodes.filter((n) => !isVisual(n))} visuals={visuals} wideVisual={wideVisual} />;
}
