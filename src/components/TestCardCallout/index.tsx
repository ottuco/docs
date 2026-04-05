import React from "react";
import Admonition from "@theme/Admonition";

/**
 * Shared test card callout used across interactive demos (Payment Journey, Recurring Demo).
 * Single source of truth — change the card details here and they update everywhere.
 */

export const TEST_CARD = {
  number: "5123 4500 0000 0008",
  expiry: "01/39",
  cvv: "100",
  brand: "Mastercard",
} as const;

interface TestCardCalloutProps {
  /** Override the admonition type (default: "info") */
  type?: "info" | "tip" | "note";
}

export default function TestCardCallout({ type = "info" }: TestCardCalloutProps) {
  return (
    <Admonition type={type} title="Test Card">
      Use card number <strong>{TEST_CARD.number}</strong> with expiry{" "}
      <strong>{TEST_CARD.expiry}</strong> and CVV <strong>{TEST_CARD.cvv}</strong>.
    </Admonition>
  );
}
