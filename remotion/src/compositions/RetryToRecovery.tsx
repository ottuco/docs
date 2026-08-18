import React from "react";
import { Reel } from "../components/Reel";

// Rebuilt from REAL betabulk screenshots. recovery-01 (past-due) is a real capture;
// recovery-02 (payment confirmed) is Menna's mockup — that state needs a completed
// payment to capture, so it is kept as-is per the review decision.
export const RetryToRecovery: React.FC = () => (
  <Reel
    slides={[
      {
        img: "recovery-01-past-due.png",
        title: "A charge failed — now Past Due",
        caption: "AutoPay retried four times, one hour apart, then emailed a recovery link.",
      },
      {
        img: "recovery-02-payment-confirmed.png",
        title: "Balance paid — back to Active",
        caption: "The customer clears the outstanding balance and billing resumes.",
      },
    ]}
  />
);
