import React, { useEffect, useRef, useState } from "react";
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
  /**
   * A silent demo that plays on its own, over and over, with no controls,
   * like the customer portal clip on https://docs.stripe.com/recurring-payments#set-up-customer-portal.
   * It plays only while it is on screen. A reader who asked for reduced
   * motion gets the poster and starts it with a click, as without `loop`.
   */
  loop?: boolean;
  /** What the video shows, for screen readers (the `<video>` has no text of its own). */
  label?: string;
}

/** True once the browser says the reader asked for reduced motion. */
function usePrefersReducedMotion(): boolean | undefined {
  const [reduce, setReduce] = useState<boolean>();
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(query.matches);
    const onChange = () => setReduce(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

/**
 * The looping demo: plays while at least a quarter of it is on screen, with
 * a pause / play button (moving content longer than 5 s must be stoppable,
 * WCAG 2.2.2). A reader's pause holds: scrolling back does not restart it.
 */
function LoopingVideo({ src, poster, label }: { src: string; poster: string; label?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const pausedByReader = useRef(false);
  // Paused until the video really plays: if the browser blocks autoplay
  // (iOS low-power mode, data saver), the button must still say "Play".
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !pausedByReader.current) el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const toggle = () => {
    const el = video.current;
    if (!el) return;
    pausedByReader.current = !el.paused;
    if (el.paused) el.play().catch(() => undefined);
    else el.pause();
  };
  return (
    <>
      <video
        ref={video}
        className={styles.video}
        src={src}
        poster={poster}
        role="img"
        aria-label={label}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        // A mouse shortcut only: the pause / play button below does the same
        // and is the keyboard and screen reader way to stop the video.
        onClick={toggle}
      />
      <button
        type="button"
        className={styles.loopToggle}
        onClick={toggle}
        aria-label={paused ? "Play video" : "Pause video"}
      >
        <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
      </button>
    </>
  );
}

export default function VideoEmbed({
  src,
  poster,
  caption,
  width = 720,
  aspectRatio = "16 / 9",
  loop = false,
  label,
}: VideoEmbedProps): React.ReactElement {
  const [playing, setPlaying] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const srcUrl = useBaseUrl(src);
  const posterUrl = useBaseUrl(poster);
  // Undefined until the browser answers (and on the server): the poster shows
  // meanwhile, so nothing starts before we know the reader's preference. A
  // looping video shows it plain, not as a play button that may vanish.
  const looping = loop && reduceMotion === false;
  const deciding = loop && reduceMotion === undefined;

  return (
    <figure className={styles.figure} style={{ maxWidth: width }}>
      <div className={styles.frame} style={{ aspectRatio }}>
        {looping ? (
          <LoopingVideo src={srcUrl} poster={posterUrl} label={label} />
        ) : deciding ? (
          <div className={styles.posterStill} style={{ backgroundImage: `url(${posterUrl})` }} />
        ) : playing ? (
          /* `playing` only becomes true from the poster click below, so autoplay
             here is user-initiated. `prefers-reduced-motion` governs UNSOLICITED
             motion; gating on it made the reader click twice — once on the
             poster, again on the native control — to start a video they had
             already asked for. */
          <video
            className={styles.video}
            src={srcUrl}
            poster={posterUrl}
            aria-label={label}
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
            aria-label={label ? `Play video: ${label}` : "Play video"}
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
