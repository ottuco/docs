import React, { useState } from "react";
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

export default function VideoEmbed({
  src,
  poster,
  caption,
  width = 720,
  aspectRatio = "16 / 9",
}: VideoEmbedProps): React.ReactElement {
  const [playing, setPlaying] = useState(false);
  const srcUrl = useBaseUrl(src);
  const posterUrl = useBaseUrl(poster);

  return (
    <figure className={styles.figure} style={{ maxWidth: width }}>
      <div className={styles.frame} style={{ aspectRatio }}>
        {/* `playing` only becomes true from the poster click below, so autoplay
            here is user-initiated. `prefers-reduced-motion` governs UNSOLICITED
            motion; gating on it made the reader click twice — once on the
            poster, again on the native control — to start a video they had
            already asked for. */}
        {playing ? (
          <video
            className={styles.video}
            src={srcUrl}
            poster={posterUrl}
            controls
            muted
            playsInline
            autoPlay
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
