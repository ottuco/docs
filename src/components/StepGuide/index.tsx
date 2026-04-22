import React, { useState, useCallback, useEffect, useRef } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

export interface Step {
  title: string;
  description?: React.ReactNode;
  image?: string;
  imageAlt?: string;
}

export interface StepGuideProps {
  steps: Step[];
  startIndex?: number;
  nextSectionId?: string;
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

export default function StepGuide({ steps, startIndex = 1, nextSectionId }: StepGuideProps): React.ReactElement {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = steps.length;
  const step = steps[active];

  const goTo = useCallback((idx: number) => {
    setActive(Math.max(0, Math.min(idx, total - 1)));
  }, [total]);

  const prev = useCallback(() => goTo(active - 1), [active, goTo]);
  const next = useCallback(() => goTo(active + 1), [active, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [prev, next]);

  // Lightbox escape key
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightboxOpen]);

  const imageUrl = useBaseUrl(step.image || "");
  const progressPercent = total > 1 ? ((active + 1) / total) * 100 : 100;
  const isFirst = active === 0;
  const isLast = active === total - 1;

  return (
    <>
      <div className={styles.container} ref={containerRef} tabIndex={0} role="region" aria-label="Step-by-step guide">
        {/* Desktop step indicator */}
        <div className={styles.stepBar}>
          {steps.map((_, i) => (
            <div key={i} className={styles.stepNode}>
              <button
                className={[
                  styles.stepPill,
                  i === active && styles.stepPillActive,
                  i < active && styles.stepPillCompleted,
                ].filter(Boolean).join(" ")}
                onClick={() => goTo(i)}
                aria-label={`Go to step ${i + startIndex}`}
                aria-current={i === active ? "step" : undefined}
              >
                {i < active ? <CheckIcon /> : i + startIndex}
              </button>
              {i < total - 1 && (
                <div className={[
                  styles.stepConnector,
                  i < active && styles.stepConnectorCompleted,
                ].filter(Boolean).join(" ")} />
              )}
            </div>
          ))}
        </div>

        {/* Mobile step indicator */}
        <div className={styles.mobileStepBar}>
          <button className={styles.mobileStepArrow} onClick={prev} disabled={isFirst} aria-label="Previous step">
            &#8249;
          </button>
          <span className={styles.mobileStepText}>
            Step {active + startIndex} of {total + startIndex - 1}
          </span>
          <button className={styles.mobileStepArrow} onClick={next} disabled={isLast} aria-label="Next step">
            &#8250;
          </button>
        </div>

        {/* Progress bar */}
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Image */}
        {step.image && (
          <div className={styles.imageArea}>
            <div className={styles.imageFrame} onClick={() => setLightboxOpen(true)} role="button" tabIndex={0} aria-label="Click to enlarge image" onKeyDown={(e) => { if (e.key === "Enter") setLightboxOpen(true); }}>
              <img
                src={imageUrl}
                alt={step.imageAlt || step.title}
                loading="lazy"
              />
              <div className={styles.zoomHint}>
                <ZoomIcon />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.stepLabel}>Step {active + startIndex} of {total + startIndex - 1}</div>
          <h4 className={styles.stepTitle}>{step.title}</h4>
          {step.description && (
            <div className={styles.stepDescription}>{step.description}</div>
          )}
        </div>

        {/* Navigation */}
        <div className={styles.nav}>
          <button
            className={`${styles.navButton} ${styles.navPrev} ${isFirst ? styles.navHidden : ""}`}
            onClick={prev}
            aria-label="Previous step"
          >
            <span className={styles.navArrow}>&#8249;</span> Previous
          </button>
          <button
            className={`${styles.navButton} ${isLast ? (nextSectionId ? styles.navNext : styles.navDone) : styles.navNext}`}
            onClick={isLast ? (nextSectionId ? () => {
              const el = document.getElementById(nextSectionId);
              if (el) el.scrollIntoView({ behavior: "smooth" });
            } : undefined) : next}
            aria-label={isLast ? (nextSectionId ? "Continue to next section" : "All steps completed") : "Next step"}
          >
            {isLast ? (
              nextSectionId ? (<>Continue <ArrowDownIcon /></>) : (<><CheckIcon size={13} /> Done</>)
            ) : (
              <>Next <span className={styles.navArrow}>&#8250;</span></>
            )}
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && step.image && typeof window !== "undefined" && (
        <div className={styles.lightbox} onClick={() => setLightboxOpen(false)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)} aria-label="Close lightbox">
            <CloseIcon />
          </button>
          <img
            src={imageUrl}
            alt={step.imageAlt || step.title}
            onClick={(e) => e.stopPropagation()}
          />
          <div className={styles.lightboxCounter}>
            Step {active + startIndex} of {total + startIndex - 1}
          </div>
        </div>
      )}
    </>
  );
}
