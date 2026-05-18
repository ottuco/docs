import React from "react";
import type { Step } from "@site/src/components/StepGuide";

export const businessWalletScenariosSteps: Step[] = [
  {
    title: "Wallet appears as a method",
    description: (
      <>
        If the customer has balance in the order currency,{" "}
        <strong>Wallet (100.00 USD)</strong> shows up alongside other payment
        methods.
      </>
    ),
    image: "/img/developers/wallet/wallet_available.png",
    imageAlt: "Checkout showing Wallet as a payment method",
  },
  {
    title: "Full coverage",
    description: (
      <>
        If the wallet balance is enough to cover the order, only the order
        amount is deducted. Any surplus stays in the wallet for the next order.
      </>
    ),
    image: "/img/developers/wallet/full_coverage.png",
    imageAlt: "Wallet fully covering the order amount",
  },
  {
    title: "Partial coverage",
    description: (
      <>
        If the balance is smaller than the order, the customer is prompted to
        choose a second method for the remainder. Both payments confirm
        together at submit.
      </>
    ),
    image: "/img/developers/wallet/partial_coverage_03.png",
    imageAlt: "Wallet plus another method for partial coverage",
  },
  {
    title: "Reservation while paying",
    description: (
      <>
        Wallet funds are reserved the moment the customer turns the Wallet
        toggle <strong>ON</strong> — they cannot be spent twice in parallel sessions.
      </>
    ),
     image: "/img/developers/wallet/wallet_reservation_03.gif",
     imageAlt: "Wallet in Dashboard",     
  },
  {
    title: "Automatic release", 
    description: (
      <>
        If the customer abandons checkout or the payment fails, the reservation
        is released automatically after about four hours. No action is needed
        from your team.
      </>
    ),
    image: "/img/developers/wallet/refund_operation.png",
    imageAlt: "Wallet in Dashboard",
  },
];

export const developerWalletScenariosSteps: Step[] = [
  {
    title: "Wallet appears as a method",
    description: (
      <>
        When the customer has positive balance in the session currency,{" "}
        <strong>Wallet (100.00 USD)</strong> renders alongside cards and other
        gateways. No SDK config is needed beyond passing{" "}
        <code>customer_id</code> on the Checkout API session.
      </>
    ),
    image: "/img/developers/wallet/wallet_available.png",
    imageAlt: "Checkout SDK showing Wallet as a payment method with balance",
  },
  {
    title: "Full coverage: balance ≥ amount",
    description: (
      <>
        Customer selects Wallet → SDK shows "100.00 USD will be applied" →
        submits → only the session amount is deducted. Surplus stays in the
        wallet.
      </>
    ),
    image: "/img/developers/wallet/full_coverage.png",
    imageAlt: "Wallet selected with full coverage of the session amount",
  },
  {
    title: "Partial coverage: balance < amount",
    description: (
      <>
        Customer selects Wallet → SDK shows "100.00 USD will be applied; pick
        a method for the remaining 100.00 USD" → adds a card → both
        reservations confirm together at submit.
      </>
    ),
    image: "/img/developers/wallet/partial_coverage_03.png",
    imageAlt: "Wallet plus card combined for partial coverage",
  },
  {
    title: "Authorize-only: wallet hidden",
    description: (
      <>
        When the session is configured for authorization-only, wallet is not
        offered. Wallet supports immediate-capture flows only.
      </>
    ),
    image: "/img/developers/wallet/no_wallet_01.png",
    imageAlt: "Authorize-only checkout without wallet method",
  },
  {
    title: "Try it",
    description: (
      <>
        The live demo seeds a fresh wallet for a generated customer_id and
        launches the SDK with wallet enabled. Use the demo on the{" "}
        <a href="/developers/payments/wallet/#live-demo">Wallet overview page</a>.
      </>
    ),
  },
];
