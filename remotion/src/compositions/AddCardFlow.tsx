import React from "react";
import { Reel } from "../components/Reel";

// Rebuilt from REAL betabulk screenshots — the add-card flow.
export const AddCardFlow: React.FC = () => (
  <Reel
    slides={[
      {
        img: "portal-01-summary-active.png",
        title: "Add a card",
        caption: "From Payment Methods, the customer taps Add Another Card.",
      },
      {
        img: "cards-02-add-card.png",
        title: "Secure checkout",
        caption: "They enter the card in a hosted checkout and it's saved to the subscription.",
      },
    ]}
  />
);
