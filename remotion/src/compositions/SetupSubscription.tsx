import React from "react";
import { Sequence } from "remotion";
import { Scene, FadeIn, Card, Pill } from "../components/Scene";
import { ottu } from "../theme";

// TODO(#158914): PLACEHOLDER CLIP — do not treat as final. The on-screen flow is a
// first-cut and does NOT yet match the real product. Revisit and re-record once Ankit
// shares the betabulk AutoPay scenario URLs, then align the copy with his clip scripts
// (#158914 R5) and re-run `npm run render`.
//
// First-cut, business-audience storyboard: a merchant sets up an AutoPay
// subscription.
export const SetupSubscription: React.FC = () => (
  <Scene>
    <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
      <Sequence durationInFrames={90}>
        <FadeIn at={0}>
          <Card>
            <div style={{ color: ottu.primary, fontWeight: 700, fontSize: 20 }}>AutoPay</div>
            <h1 style={{ fontSize: 44, margin: "8px 0 0" }}>Set up a subscription</h1>
            <p style={{ fontSize: 22, color: "#6b7280" }}>
              Create a subscription with a single checkout call — AutoPay then
              owns the schedule, retries and dunning.
            </p>
          </Card>
        </FadeIn>
      </Sequence>

      <Sequence from={90} durationInFrames={120}>
        <FadeIn at={0}>
          <Card>
            <h2 style={{ fontSize: 30, marginTop: 0 }}>Plan details</h2>
            <ul style={{ fontSize: 22, lineHeight: 1.8 }}>
              <li>Frequency: <strong>monthly</strong></li>
              <li>Recurring amount: <strong>490 KWD</strong></li>
              <li>Start date, optional trial (first charge 0)</li>
            </ul>
          </Card>
        </FadeIn>
      </Sequence>

      <Sequence from={210} durationInFrames={210}>
        <FadeIn at={0}>
          <Card>
            <Pill color={ottu.ok} bg="#DCFCE7">● Active</Pill>
            <h2 style={{ fontSize: 30, marginTop: 16 }}>Subscription created</h2>
            <p style={{ fontSize: 22, color: "#6b7280" }}>
              The customer gets a self-service link and their first notification.
            </p>
          </Card>
        </FadeIn>
      </Sequence>
    </div>
  </Scene>
);
