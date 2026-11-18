import React, { useEffect, useRef, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

export interface StepProps {
  /** Screenshot shown beside the steps while this step is active. */
  image?: string;
  alt?: string;
  /**
   * The control this step is about, as "left,top,width,height" in percent
   * of the screenshot. Drawn as a ring over the image, so one screenshot
   * can serve several steps.
   */
  spot?: string;
  children: React.ReactNode;
}

/** One step. Rendered by StepShow; on its own it renders nothing special. */
export function Step({ children }: StepProps): React.ReactElement {
  return <>{children}</>;
}

function Shot({ src, alt, spot }: { src: string; alt: string; spot?: string }) {
  const [left, top, width, height] = (spot ?? "").split(",").map((n) => `${n.trim()}%`);
  return (
    <span className={styles.shot}>
      <img src={useBaseUrl(src)} alt={alt} loading="lazy" />
      {spot && <span className={styles.spot} style={{ left, top, width, height }} />}
    </span>
  );
}

/**
 * Steps on the left, one screenshot on the right. The steps are an ordinary
 * ordered list, so every step is in the page text (search, the docs MCP and
 * screen readers all get it). Scrolling, hovering, focusing or clicking a
 * step switches the screenshot. On narrow screens each screenshot sits
 * under its own step.
 */
export default function StepShow({ children }: { children: React.ReactNode }): React.ReactElement {
  const steps = React.Children.toArray(children).filter(
    (c): c is React.ReactElement<StepProps> => React.isValidElement(c),
  );
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  // The screenshot a step shows: its own, or the nearest earlier one.
  const shotFor = (i: number): number => {
    for (let j = i; j >= 0; j--) if (steps[j].props.image) return j;
    return steps.findIndex((s) => s.props.image);
  };
  const shown = shotFor(active);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).pop();
        if (hit) setActive(Number((hit.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [steps.length]);

  return (
    <div className={styles.wrap}>
      <ol className={styles.steps}>
        {steps.map((s, i) => (
          <li
            key={i}
            data-i={i}
            ref={(el) => {
              items.current[i] = el;
            }}
            className={i === active ? styles.on : undefined}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
          >
            <div className={styles.body}>{s.props.children}</div>
            {s.props.image && (
              <div className={styles.inlineShot}>
                <Shot src={s.props.image} alt={s.props.alt ?? ""} spot={s.props.spot} />
              </div>
            )}
          </li>
        ))}
      </ol>
      {shown >= 0 && (
        <div className={styles.stage} aria-hidden="true">
          {steps.map((s, i) =>
            s.props.image ? (
              <figure key={i} className={i === shown ? styles.shown : undefined}>
                <Shot src={s.props.image} alt="" spot={s.props.spot} />
              </figure>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
