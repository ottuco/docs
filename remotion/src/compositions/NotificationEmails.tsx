import React from "react";
import { Reel } from "../components/Reel";

// The three AutoPay notification emails. These are Menna's email templates (emails
// aren't reachable from a subscription URL, so they're kept per the review decision).
export const NotificationEmails: React.FC = () => (
  <Reel
    slides={[
      {
        img: "notifications-01-upcoming-charge-en.png",
        title: "Upcoming charge",
        caption: "Sent before each scheduled charge.",
      },
      {
        img: "notifications-03-payment-failed-en.png",
        title: "Payment failed",
        caption: "Sent when an attempt fails and retries remain.",
      },
      {
        img: "notifications-05-final-failure-en.png",
        title: "Final failure",
        caption: "Sent when every retry is exhausted, with a recovery link.",
      },
    ]}
  />
);
