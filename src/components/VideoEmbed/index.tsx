import React, { useState, useEffect } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

export interface VideoEmbedProps {
  /** Site-root path, e.g. /video/autopay/setup-subscription.mp4 */
  src: string;
  /** Site-root path, e.g. /video/autopay/setup-subscription-poster.png */
  poster: string;
  caption?: React.ReactNode;
  width?: number | string;
  /** CSS aspect-ratio, default "16 / 9" */
  aspectRatio?: string;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

export default function VideoEmbed({
  src,
  poster,
  caption,
  width = 720,
  aspectRatio = "16 / 9",
}: VideoEmbedProps): React.ReactElement {
  const [playing, setPlaying] = useState(false);
  const reduced = usePrefersReducedMotion();
  const srcUrl = useBaseUrl(src);
  const posterUrl = useBaseUrl(poster);

  return (
    <figure className={styles.figure} style={{ maxWidth: width }}>
      <div className={styles.frame} style={{ aspectRatio }}>
        {playing ? (
          <video
            className={styles.video}
            src={srcUrl}
            poster={posterUrl}
            controls
            muted
            playsInline
            autoPlay={!reduced}
            preload="none"
          />
        ) : (
          <button
            type="button"
            className={styles.posterBtn}
            style={{ backgroundImage: `url(${posterUrl})` }}
            onClick={() => setPlaying(true)}
            aria-label="Play video"
          >
            <span className={styles.playIcon} aria-hidden="true">
              ▶
            </span>
          </button>
        )}
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
