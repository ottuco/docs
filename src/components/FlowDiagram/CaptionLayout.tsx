// A diagram with a caption panel: beside it when diagram + panel fit the
// container (measured, not guessed from the viewport), otherwise below it.
// Below, a new selection scrolls the panel into view, but never so far that
// the selected card leaves the screen. Used with the Flow kind; the Story kind
// has the same rules built in (Story.tsx).
import React, { useEffect, useId, useRef, useState } from "react";
import { PANEL_W, STORY_PANEL_GAP } from "./layout";
import { useWidthFlag } from "./useWidthFlag";
import styles from "./styles.module.css";

type Props = {
  /** Smallest width the diagram needs (px), without the panel. */
  diagramMinWidth: number;
  /** The panel text; null shows `empty`. */
  panel: React.ReactNode;
  /** Id of the selected card (scroll target and key), if any. */
  selected: string | null;
  /** Scroll the panel into view on a new selection (false for a link or hash). */
  scrollToPanel: boolean;
  children: React.ReactNode;
};

export default function CaptionLayout(p: Props): React.JSX.Element {
  const wrap = useRef<HTMLDivElement>(null);
  const panelId = `fp-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const needed = p.diagramMinWidth + PANEL_W + STORY_PANEL_GAP;
  const side = useWidthFlag(wrap, needed);

  useEffect(() => {
    if (!p.selected || side || !p.scrollToPanel) return;
    const panel = document.getElementById(panelId);
    if (!panel) return;
    let delta =
      panel.getBoundingClientRect().bottom - (window.innerHeight - 12);
    if (delta <= 0) return;
    const node = wrap.current?.querySelector(`[data-id="${p.selected}"]`);
    if (node) {
      const NAVBAR = 72; // navbar plus a little air
      delta = Math.min(
        delta,
        Math.max(0, node.getBoundingClientRect().top - NAVBAR),
      );
    }
    if (delta > 0)
      window.scrollBy({
        top: delta,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
  }, [p.selected, side, p.scrollToPanel, panelId]);

  return (
    <div
      ref={wrap}
      className={`${styles.storyWrap} ${side ? styles.storyWrapSide : ""}`}
      style={{ gap: STORY_PANEL_GAP }}
    >
      {p.children}
      <aside id={panelId} className={styles.panel} aria-live="polite">
        {p.panel}
      </aside>
    </div>
  );
}
