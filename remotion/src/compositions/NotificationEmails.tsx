import React from "react";
import { Sequence } from "remotion";
import { Scene, FadeIn, Card } from "../components/Scene";
import { ottu } from "../theme";

// TODO(#158914): PLACEHOLDER CLIP — do not treat as final. First-cut flow; does NOT yet
// match the real product. Revisit / re-record once Ankit shares the betabulk AutoPay
// scenario URLs, align copy with his clip scripts (#158914 R5), then `npm run render`.
//
// The three AutoPay notification emails, in sequence.
const Email: React.FC<{ tag: string; title: string; body: string }> = ({
  tag,
  title,
  body,
}) => (
  <Card>
    <div style={{ color: ottu.primary, fontWeight: 700, fontSize: 18 }}>{tag}</div>
    <h2 style={{ fontSize: 32, margin: "8px 0 0" }}>{title}</h2>
    <p style={{ fontSize: 20, color: "#6b7280" }}>{body}</p>
  </Card>
);

export const NotificationEmails: React.FC = () => (
  <Scene>
    <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
      <Sequence durationInFrames={70}>
        <FadeIn at={0}>
          <Email
            tag="Notification 1 of 3"
            title="Upcoming charge"
            body="Sent before each scheduled charge so the customer is never surprised."
          />
        </FadeIn>
      </Sequence>
      <Sequence from={70} durationInFrames={70}>
        <FadeIn at={0}>
          <Email
            tag="Notification 2 of 3"
            title="Payment failed"
            body="Sent when an attempt fails, prompting the customer to check their card."
          />
        </FadeIn>
      </Sequence>
      <Sequence from={140} durationInFrames={80}>
        <FadeIn at={0}>
          <Email
            tag="Notification 3 of 3"
            title="Final failure"
            body="Sent when every retry is exhausted, with a recovery link to pay."
          />
        </FadeIn>
      </Sequence>
    </div>
  </Scene>
);
