import React from "react";
import { Sequence } from "remotion";
import { Scene, FadeIn, Card, Pill } from "../components/Scene";
import { ottu } from "../theme";

// TODO(#158914): PLACEHOLDER CLIP — do not treat as final. First-cut flow; does NOT yet
// match the real product. Revisit / re-record once Ankit shares the betabulk AutoPay
// scenario URLs, align copy with his clip scripts (#158914 R5), then `npm run render`.
//
// Business storyboard: what the customer can do on the self-service page.
export const SelfServiceTour: React.FC = () => (
  <Scene>
    <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
      <Sequence durationInFrames={80}>
        <FadeIn at={0}>
          <Card>
            <div style={{ color: ottu.primary, fontWeight: 700, fontSize: 20 }}>
              Manage Subscription
            </div>
            <h1 style={{ fontSize: 40, margin: "8px 0 0" }}>Your self-service page</h1>
            <p style={{ fontSize: 22, color: "#6b7280" }}>
              One link to view status, update a card, or pay an outstanding balance.
            </p>
          </Card>
        </FadeIn>
      </Sequence>

      <Sequence from={80} durationInFrames={90}>
        <FadeIn at={0}>
          <Card>
            <Pill color={ottu.ok} bg="#DCFCE7">● Active</Pill>
            <h2 style={{ fontSize: 28, marginTop: 16 }}>Professional Plan — 490 KWD</h2>
            <p style={{ fontSize: 20, color: "#6b7280" }}>Next payment · May 1, 2028</p>
          </Card>
        </FadeIn>
      </Sequence>

      <Sequence from={170} durationInFrames={90}>
        <FadeIn at={0}>
          <Card>
            <h2 style={{ fontSize: 28, marginTop: 0 }}>Update payment method</h2>
            <p style={{ fontSize: 20, color: "#6b7280" }}>
              Add a card and choose which one is charged next.
            </p>
          </Card>
        </FadeIn>
      </Sequence>

      <Sequence from={260} durationInFrames={100}>
        <FadeIn at={0}>
          <Card>
            <h2 style={{ fontSize: 28, marginTop: 0 }}>Pay an outstanding balance</h2>
            <p style={{ fontSize: 20, color: "#6b7280" }}>
              A past-due balance can be settled in one click — no support ticket.
            </p>
          </Card>
        </FadeIn>
      </Sequence>
    </div>
  </Scene>
);
