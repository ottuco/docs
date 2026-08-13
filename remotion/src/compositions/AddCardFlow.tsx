import React from "react";
import { Sequence } from "remotion";
import { Scene, FadeIn, Card, Pill } from "../components/Scene";
import { ottu } from "../theme";

// TODO(#158914): PLACEHOLDER CLIP — do not treat as final. First-cut flow; does NOT yet
// match the real product. Revisit / re-record once Ankit shares the betabulk AutoPay
// scenario URLs, align copy with his clip scripts (#158914 R5), then `npm run render`.
// (The real add-card checkout is captured as static/img/business/autopay/cards-02-add-card.png.)
//
// Business storyboard for the "add a card" customer capability that portal-01
// only shows the entry point for. Synthetic data only — cardholder is "John Doe"
// and the card is a masked test PAN, so there is no real PII (per Dacian's rule).
const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ marginTop: 14 }}>
    <div style={{ fontSize: 15, color: "#6b7280", marginBottom: 4 }}>{label}</div>
    <div
      style={{
        border: `1px solid ${ottu.border}`,
        borderRadius: 10,
        padding: "12px 16px",
        fontSize: 20,
        background: ottu.bg,
      }}
    >
      {value}
    </div>
  </div>
);

export const AddCardFlow: React.FC = () => (
  <Scene>
    <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
      <Sequence durationInFrames={80}>
        <FadeIn at={0}>
          <Card>
            <div style={{ color: ottu.primary, fontWeight: 700, fontSize: 20 }}>
              Payment Methods
            </div>
            <h1 style={{ fontSize: 40, margin: "8px 0 0" }}>Add a card</h1>
            <p style={{ fontSize: 22, color: "#6b7280" }}>
              From the subscription page, the customer taps{" "}
              <strong style={{ color: ottu.primary }}>+ Add Another Card</strong>.
            </p>
          </Card>
        </FadeIn>
      </Sequence>

      <Sequence from={80} durationInFrames={150}>
        <FadeIn at={0}>
          <Card>
            <h2 style={{ fontSize: 28, marginTop: 0 }}>Enter card details</h2>
            <Field label="Card number" value="•••• •••• •••• 4242" />
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}><Field label="Expiry" value="02 / 28" /></div>
              <div style={{ flex: 1 }}><Field label="CVC" value="•••" /></div>
            </div>
            <Field label="Name on card" value="John Doe" />
          </Card>
        </FadeIn>
      </Sequence>

      <Sequence from={230} durationInFrames={100}>
        <FadeIn at={0}>
          <Card>
            <Pill color={ottu.ok} bg="#DCFCE7">● Card added</Pill>
            <h2 style={{ fontSize: 30, marginTop: 16 }}>Visa •••• 4242</h2>
            <p style={{ fontSize: 20, color: "#6b7280" }}>
              The new card appears in the list and can be set as the active payment method.
            </p>
          </Card>
        </FadeIn>
      </Sequence>
    </div>
  </Scene>
);
