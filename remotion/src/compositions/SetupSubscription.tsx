import React from "react";
import { Reel } from "../components/Reel";

// Rebuilt from REAL betabulk screenshots (John Doe subs). AutoPay setup is API-only
// (no dashboard), so this clip shows the OUTCOME: the live subscription + the
// customer's self-service page created by the one checkout call.
export const SetupSubscription: React.FC = () => (
  <Reel
    slides={[
      {
        img: "portal-01-summary-active.png",
        title: "One checkout call, and it's live",
        caption: "AutoPay creates the subscription and hosts the customer's self-service page.",
      },
      {
        img: "notifications-01-upcoming-charge-en.png",
        title: "AutoPay takes it from here",
        caption: "It bills each cycle, retries failures, and emails the customer automatically.",
      },
    ]}
  />
);
