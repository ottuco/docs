// "Is this element at least `threshold` px wide?", with hysteresis: it turns on
// at `threshold` + `margin` and off below `threshold`. A layout switch that
// changes the page height (and so a scrollbar, and so the width) can then never
// flip itself back and forth. The decision depends only on the element's width,
// never on its content, and is made one frame after a resize so the observer
// callback never changes layout itself ("ResizeObserver loop" errors).
import { useLayoutEffect, useRef, useState, type RefObject } from "react";

export function useWidthFlag(
  ref: RefObject<HTMLElement | null>,
  threshold: number,
  enabled = true,
  margin = 32,
): boolean {
  const [on, setOn] = useState(false);
  const first = useRef(true);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const decide = () =>
      setOn((prev) => {
        const w = el.clientWidth;
        return prev ? w >= threshold : w >= threshold + margin;
      });
    if (first.current) {
      first.current = false;
      setOn(el.clientWidth >= threshold); // before first paint: no flash
    } else decide();
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(decide);
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [ref, threshold, enabled, margin]);
  return on;
}
