// A diagram with a caption panel: beside it when diagram + panel fit the
// container (measured, not guessed from the viewport), otherwise below it.
// Below, a new selection scrolls the panel into view, but never so far that
// the selected card leaves the screen. Used with the Flow kind; the Story kind
// has the same rules built in (Story.tsx).
import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { PANEL_W, STORY_PANEL_GAP } from "./layout";
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
  const [side, setSide] = useState(false);
  const needed = p.diagramMinWidth + PANEL_W + STORY_PANEL_GAP;

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    setSide(el.clientWidth >= needed); // before first paint: no flash
    // Measure in the next frame: changing layout inside the observer callback
    // triggers "ResizeObserver loop" errors.
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSide(el.clientWidth >= needed));
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [needed]);

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
