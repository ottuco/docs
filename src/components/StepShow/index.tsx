import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

export interface StepProps {
  /**
   * Screenshot shown beside the steps while this step is active. Save it at
   * twice its on-page size (a 2x capture): it is drawn at half its pixels
   * (see `density`). Left out, the step shows the nearest earlier screenshot;
   * `false` shows none (a quiet "no screenshot" note in the stage).
   */
  image?: string | false;
  alt?: string;
  /**
   * How many image pixels make one on-page pixel: 2 (default) for a 2x
   * capture, 1 for a capture taken at its on-page size.
   */
  density?: number;
  /**
   * Show a tall screenshot (an email) whole, shrunk to fit the stage like any
   * other, instead of its top at full width with a fade.
   */
  fitWhole?: boolean;
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

// Screenshots are saved at twice their on-page size so they stay sharp on
// high-density screens. The cap keeps a screenshot inside the stage.
const MAX_H = "min(60vh, 440px)";
// Narrower than this (width / height), a screenshot is "tall" (an email, a
// long page): it keeps its width and the stage shows its top, cut off with a
// fade, instead of shrinking it until it is unreadable. The whole image opens
// on click.
const TALL = 0.8;

/** "left,top,width,height" in percent, or nothing when the value is not that. */
function parseSpot(spot?: string): string[] | null {
  const box = spot ? spot.split(",").map((n) => Number(n)) : [];
  return box.length === 4 && box.every((n) => Number.isFinite(n)) ? box.map((n) => `${n}%`) : null;
}

function Shot({
  src,
  alt,
  spot,
  density = 2,
  fitWhole = false,
}: {
  src: string;
  alt: string;
  spot?: string;
  density?: number;
  fitWhole?: boolean;
}) {
  const img = useRef<HTMLImageElement>(null);
  const [size, setSize] = useState<{ w: number; ratio: number }>();
  const measure = () => {
    const el = img.current;
    if (el && el.naturalWidth)
      setSize({ w: el.naturalWidth / density, ratio: el.naturalWidth / el.naturalHeight });
  };
  useEffect(measure, []);
  const ring = parseSpot(spot);
  if (spot && !ring && process.env.NODE_ENV !== "production") {
    console.warn(`StepShow: spot "${spot}" on ${src} is not "left,top,width,height"; no ring drawn.`);
  }
  const tall = !fitWhole && size !== undefined && size.ratio < TALL;
  // A tall shot keeps its width and is cut to the stage height; any other
  // shrinks to fit the stage whole.
  const style = size && {
    width: size.w,
    maxWidth: tall ? "100%" : `min(100%, calc(${MAX_H} * ${size.ratio.toFixed(4)}))`,
    maxHeight: tall ? MAX_H : undefined,
  };
  return (
    <span className={tall ? `${styles.shot} ${styles.tall}` : styles.shot} style={style}>
      {/* The ring is placed in percent of the whole image, so it sits in the
          full-size inner box, not in the (possibly cut) outer one. */}
      <span className={styles.shotInner}>
        <img ref={img} src={useBaseUrl(src)} alt={alt} loading="lazy" onLoad={measure} />
        {ring && <span className={styles.spot} style={{ left: ring[0], top: ring[1], width: ring[2], height: ring[3] }} />}
      </span>
    </span>
  );
}

/**
 * The screenshot shown large over the page (like StepGuide's). Rendered into
 * <body>: the stage is sticky and its figures are transformed, which would
 * pin a fixed overlay to the stage instead of the window. Closes on Escape,
 * the close button or a click outside the screenshot; the page behind it
 * does not scroll while it is open, and focus returns to the screenshot.
 */
function Lightbox({
  src,
  alt,
  spot,
  label,
  onClose,
}: {
  src: string;
  alt: string;
  spot?: string;
  label: string;
  onClose: () => void;
}) {
  const close = useRef<HTMLButtonElement>(null);
  const url = useBaseUrl(src);
  const ring = parseSpot(spot);
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Focus stays in the dialog: its close button is the only control.
      if (e.key === "Tab") {
        e.preventDefault();
        close.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      back?.focus({ preventScroll: true });
    };
  }, [onClose]);
  return createPortal(
    <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
      <button ref={close} type="button" className={styles.lightboxClose} onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <span className={styles.lightboxShot} onClick={(e) => e.stopPropagation()}>
        <img src={url} alt={alt} />
        {ring && <span className={styles.spot} style={{ left: ring[0], top: ring[1], width: ring[2], height: ring[3] }} />}
      </span>
      <div className={styles.lightboxLabel}>{label}</div>
    </div>,
    document.body,
  );
}

function ZoomHint() {
  return (
    <span className={styles.zoomHint} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    </span>
  );
}

/**
 * Steps on the left, one screenshot on the right. The steps are an ordinary
 * ordered list, so every step is in the page text (search, the docs MCP and
 * screen readers all get it). Scrolling, hovering, focusing or clicking a
 * step switches the screenshot. On narrow screens each screenshot sits
 * under its own step. Clicking a screenshot opens it large over the page.
 */
export default function StepShow({ children }: { children: React.ReactNode }): React.ReactElement {
  const steps = React.Children.toArray(children).filter(
    (c): c is React.ReactElement<StepProps> => React.isValidElement(c),
  );
  const [active, setActive] = useState(0);
  // The step whose screenshot is open large over the page, if any.
  const [zoomed, setZoomed] = useState<number | null>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  // The screenshot a step shows: its own, or the nearest earlier one; none
  // for a step with `image={false}`.
  const shotFor = (i: number): number => {
    if (steps[i].props.image === false) return -1;
    for (let j = i; j >= 0; j--) if (steps[j].props.image) return j;
    return steps.findIndex((s) => s.props.image);
  };
  const shown = shotFor(active);
  const closeZoom = useCallback(() => setZoomed(null), []);

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
            tabIndex={0}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
          >
            <div className={styles.body}>{s.props.children}</div>
            {s.props.image && (
              <div className={styles.inlineShot}>
                <button
                  type="button"
                  className={styles.zoomable}
                  aria-label={`Enlarge screenshot: ${s.props.alt ?? ""}`}
                  onClick={() => setZoomed(i)}
                >
                  <Shot src={s.props.image} alt={s.props.alt ?? ""} spot={s.props.spot} density={s.props.density} fitWhole={s.props.fitWhole} />
                  <ZoomHint />
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
      {steps.some((s) => s.props.image) && (
        <div className={styles.stage}>
          {steps.map((s, i) =>
            s.props.image ? (
              <figure key={i} className={i === shown ? styles.shown : undefined}>
                <button
                  type="button"
                  className={styles.zoomable}
                  aria-label={`Enlarge screenshot: ${s.props.alt ?? ""}`}
                  onClick={() => setZoomed(active)}
                >
                  <Shot src={s.props.image} alt="" spot={s.props.spot} density={s.props.density} fitWhole={s.props.fitWhole} />
                  <ZoomHint />
                </button>
              </figure>
            ) : null,
          )}
          <p className={shown < 0 ? `${styles.noShot} ${styles.shown}` : styles.noShot}>
            No screenshot for this step.
          </p>
        </div>
      )}
      {zoomed !== null && shotFor(zoomed) >= 0 && (
        <Lightbox
          src={steps[shotFor(zoomed)].props.image as string}
          alt={steps[shotFor(zoomed)].props.alt ?? ""}
          spot={steps[shotFor(zoomed)].props.spot}
          label={`Step ${zoomed + 1} of ${steps.length}`}
          onClose={closeZoom}
        />
      )}
    </div>
  );
}
