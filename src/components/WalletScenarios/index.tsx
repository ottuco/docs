import React from "react";
import StepGuide from "@site/src/components/StepGuide";

export default function WalletScenarios(): React.ReactElement {
  return (
    <StepGuide
      steps={[
        {
          title: "Wallet appears as a method",
          description: (
            <>
              When the customer has positive balance in the session currency,{" "}
              <strong>Wallet (150.000 KWD)</strong> renders alongside cards and
              other gateways. No SDK config is needed beyond passing{" "}
              <code>customer_id</code> on the Checkout API session.
            </>
          ),
          image: "/img/developers/wallet/deactivate_wallet.png",
          imageAlt: "Checkout SDK showing Wallet as a payment method with balance",
        },
        {
          title: "Full coverage: balance ≥ amount",
          description: (
            <>
              Customer selects Wallet → SDK shows "50.000 KWD will be applied" →
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
              Customer selects Wallet → SDK shows "150.000 KWD will be applied;
              pick a method for the remaining 100.000 KWD" → adds a card → both
              reservations confirm together at submit.
            </>
          ),
          image: "/img/developers/wallet/partial_coverage.png",
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
          image: "/img/developers/wallet/no_wallet.png",
          imageAlt: "Authorize-only checkout without wallet method",
        },
        {
          title: "Try it",
          description: (
            <>
              The live demo seeds a fresh wallet for a generated customer_id and
              launches the SDK with wallet enabled. Use the demo on the{" "}
              <a href="/developers/payments/wallet/#guide">Wallet overview page</a>.
            </>
          ),
          // image: "/img/developers/wallet/sdk-05-live-demo.png",
          // imageAlt: "Wallet live demo entry point",
        },
      ]}
    />
  );
}
