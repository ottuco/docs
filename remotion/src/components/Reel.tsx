import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ottu } from "../theme";

// A "reel" sequences REAL product screenshots (copied into remotion/public/screens/
// by scripts/render-all.mjs) with a title bar, a soft zoom, and crossfades. This is
// how the AutoPay clips show the actual UI instead of synthetic mockups.
export type Slide = { img: string; title: string; caption?: string };

const PER = 105; // frames a slide is on screen
const FADE = 18;

const SlideView: React.FC<{ slide: Slide; local: number; dur: number }> = ({ slide, local, dur }) => {
  const opacity = interpolate(local, [0, FADE, dur - FADE, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(local, [0, dur], [1.03, 1.08]); // slow ken-burns
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "flex-start" }}>
      <div style={{ marginTop: 44, textAlign: "center", padding: "0 60px" }}>
        <div style={{ color: ottu.primary, fontWeight: 700, fontSize: 20, letterSpacing: 0.5 }}>
          AutoPay
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, color: ottu.ink, marginTop: 2 }}>
          {slide.title}
        </div>
        {slide.caption && (
          <div style={{ fontSize: 20, color: "#6b7280", marginTop: 6 }}>{slide.caption}</div>
        )}
      </div>
      <div
        style={{
          marginTop: 24,
          width: 760,
          height: 470,
          borderRadius: 14,
          overflow: "hidden",
          border: `1px solid ${ottu.border}`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.10)",
          background: ottu.surface,
        }}
      >
        <Img
          src={staticFile(`screens/${slide.img}`)}
          style={{
            width: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC<{ slides: Slide[] }> = ({ slides }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: ottu.bg, fontFamily: ottu.fontFamily }}>
      {slides.map((s, i) => {
        const start = i * PER;
        const local = frame - start;
        return (
          <Sequence key={i} from={start} durationInFrames={PER}>
            <SlideView slide={s} local={local} dur={PER} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const reelDuration = (n: number) => n * PER;
