import React from "react";
import { Reel } from "../components/Reel";

// Rebuilt from REAL betabulk screenshots — the customer self-service page.
export const SelfServiceTour: React.FC = () => (
  <Reel
    slides={[
      {
        img: "portal-01-summary-active.png",
        title: "The self-service page",
        caption: "Status, plan, next charge date, saved cards, and billing history on one page.",
      },
      {
        img: "cards-02-add-card.png",
        title: "Add or switch a card",
        caption: "A new card is saved through a secure checkout, then set as active.",
      },
      {
        img: "recovery-01-past-due.png",
        title: "Pay an outstanding balance",
        caption: "A past-due balance is cleared right from the page, returning to Active.",
      },
    ]}
  />
);
