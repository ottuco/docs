import React from "react";
import styles from "./styles.module.css";

export interface DiagramProps {
  /**
   * Inline SVG markup produced by the `svg-diagram` skill: self-contained and
   * scoped, carrying its own light rules plus `[data-theme='dark']` overrides in
   * a single `<style>` block. Rendering it inline (rather than via an `<img>`)
   * is what lets it inherit the site's Poppins font and switch theme instantly
   * with the rest of the page — no second file, no drift.
   */
  svg: string;
  /** One-sentence accessible summary. Mirrors the SVG's own `<title>`/`<desc>`. */
  alt: string;
  /** Optional visible caption rendered under the diagram. */
  caption?: string;
}

/**
 * Renders a hand-built Ottu diagram inline in the page DOM.
 *
 * The `svg` string is build-time, author-controlled output of the svg-diagram
 * skill (never user input), so injecting it with dangerouslySetInnerHTML is safe
 * here and preserves the `<style>` block verbatim (Docusaurus's default SVGR +
 * SVGO pipeline would otherwise strip/inline it and break theme switching).
 */
export default function Diagram({svg, alt, caption}: DiagramProps): React.JSX.Element {
  return (
    <figure className={styles.diagram} role="group" aria-label={alt}>
      <div
        className={styles.canvas}
        dangerouslySetInnerHTML={{__html: svg}}
      />
      {caption ? (
        <figcaption className={styles.caption}>{caption}</figcaption>
      ) : null}
    </figure>
  );
}
