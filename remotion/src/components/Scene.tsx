import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ottu } from "../theme";

export const Scene: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{ background: ottu.bg, fontFamily: ottu.fontFamily, color: ottu.ink }}
  >
    {children}
  </AbsoluteFill>
);

export const FadeIn: React.FC<{ at: number; children: React.ReactNode }> = ({
  at,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [at, at + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [at, at + 12], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <div style={{ opacity, transform: `translateY(${y}px)` }}>{children}</div>;
};

export const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      background: ottu.surface,
      border: `1px solid ${ottu.border}`,
      borderRadius: 16,
      padding: 40,
      width: 820,
      boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
    }}
  >
    {children}
  </div>
);

export const Pill: React.FC<{ color: string; bg: string; children: React.ReactNode }> = ({
  color,
  bg,
  children,
}) => (
  <div
    style={{
      display: "inline-block",
      background: bg,
      color,
      padding: "6px 14px",
      borderRadius: 999,
      fontWeight: 700,
      fontSize: 18,
    }}
  >
    {children}
  </div>
);
