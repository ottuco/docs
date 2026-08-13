import React from "react";
import { Sequence } from "remotion";
import { Scene, FadeIn, Card, Pill } from "../components/Scene";
import { ottu } from "../theme";

// TODO(#158914): PLACEHOLDER CLIP — do not treat as final. First-cut flow; does NOT yet
// match the real product. Revisit / re-record once Ankit shares the betabulk AutoPay
// scenario URLs, align copy with his clip scripts (#158914 R5), then `npm run render`.
//
// Business storyboard: charge fails -> flat hourly retries -> exhausted ->
// past_due + final-failure email with a recovery link -> customer pays -> active.
// Reinforces #158912 R5: AutoPay never auto-cancels a past_due subscription.
export const RetryToRecovery: React.FC = () => (
  <Scene>
    <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
      <Sequence durationInFrames={80}>
        <FadeIn at={0}>
          <Card>
            <Pill color={ottu.warn} bg="#FEF3C7">● Retry</Pill>
            <h1 style={{ fontSize: 38, margin: "12px 0 0" }}>A charge failed</h1>
            <p style={{ fontSize: 22, color: "#6b7280" }}>
              AutoPay retries automatically — spaced one hour apart, four attempts in all.
            </p>
          </Card>
        </FadeIn>
      </Sequence>

      <Sequence from={80} durationInFrames={90}>
        <FadeIn at={0}>
          <Card>
            <Pill color={ottu.danger} bg="#FEE2E2">● Past Due</Pill>
            <h2 style={{ fontSize: 30, marginTop: 16 }}>Retries exhausted</h2>
            <p style={{ fontSize: 20, color: "#6b7280" }}>
              The subscription becomes <strong>past due</strong> and the customer gets a
              final-failure email with a recovery link.
            </p>
          </Card>
        </FadeIn>
      </Sequence>

      <Sequence from={170} durationInFrames={90}>
        <FadeIn at={0}>
          <Card>
            <h2 style={{ fontSize: 28, marginTop: 0 }}>It stays past due — never auto-cancelled</h2>
            <p style={{ fontSize: 20, color: "#6b7280" }}>
              AutoPay waits for the customer to pay or the merchant to cancel. Nothing
              is cancelled automatically.
            </p>
          </Card>
        </FadeIn>
      </Sequence>

      <Sequence from={260} durationInFrames={100}>
        <FadeIn at={0}>
          <Card>
            <Pill color={ottu.ok} bg="#DCFCE7">● Active</Pill>
            <h2 style={{ fontSize: 30, marginTop: 16 }}>Recovered</h2>
            <p style={{ fontSize: 20, color: "#6b7280" }}>
              The customer pays the outstanding balance from the recovery link and the
              subscription returns to active.
            </p>
          </Card>
        </FadeIn>
      </Sequence>
    </div>
  </Scene>
);
