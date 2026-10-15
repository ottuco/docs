import React from "react";
import Diagram from "@site/src/components/Diagram";

// The whole AutoPay journey across three actors (#158912 R11). Each step links
// to the business-page section that explains it.
const SVG = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 640"
     role="img" aria-labelledby="diagram-title-autopay-journey diagram-desc-autopay-journey" preserveAspectRatio="xMidYMid meet" class="ottu-dgm--autopay-journey">
  <title id="diagram-title-autopay-journey">The AutoPay journey</title>
  <desc id="diagram-desc-autopay-journey">Three lanes: your business, AutoPay and your customer. You create the subscription. The customer pays the first charge. The customer gets the self-service link from you and in every AutoPay email. A reminder email arrives before each charge, then AutoPay charges the saved card. If a charge fails, AutoPay retries it and emails the customer. The final-failure email takes the customer to their page, where they pay and the subscription is active again.</desc>

  <defs>
    <marker id="arrow-autopay-journey" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path class="arrow-head" d="M0,1 L9,5 L0,9 z" />
    </marker>
    <style>
      .ottu-dgm--autopay-journey .node { fill: #FFFFFF; stroke: #D4D4D4; stroke-width: 1.4; }
      .ottu-dgm--autopay-journey .accent { fill: #0B82BE; stroke: #0B82BE; stroke-width: 1.4; }
      .ottu-dgm--autopay-journey .danger { fill: #ED2833; stroke: #ED2833; stroke-width: 1.4; }
      .ottu-dgm--autopay-journey .container-bg { fill: #F6FAFD; stroke: #0B82BE; stroke-dasharray: 5 5; stroke-width: 1.2; opacity: 0.85; }
      .ottu-dgm--autopay-journey .platform-label { fill: #0B82BE; font: 700 10px 'Poppins', system-ui, -apple-system, sans-serif; letter-spacing: 1.6px; }
      .ottu-dgm--autopay-journey .label { fill: #302F37; font: 600 13px 'Poppins', system-ui, -apple-system, sans-serif; }
      .ottu-dgm--autopay-journey .label-white { fill: #FFFFFF; font: 600 13px 'Poppins', system-ui, -apple-system, sans-serif; }
      .ottu-dgm--autopay-journey .sub { fill: #6B6B72; font: 400 11px 'Poppins', system-ui, -apple-system, sans-serif; }
      .ottu-dgm--autopay-journey .sub-white { fill: #FFFFFF; font: 400 11px 'Poppins', system-ui, -apple-system, sans-serif; opacity: 0.9; }
      .ottu-dgm--autopay-journey .divider { stroke: #E0E0E3; stroke-width: 1; }
      .ottu-dgm--autopay-journey .arrow { fill: none; stroke: #8B8A90; stroke-width: 1.4; }
      .ottu-dgm--autopay-journey .arrow-head { fill: #8B8A90; }
      .ottu-dgm--autopay-journey .arrow-label { fill: #6B6B72; font: 500 10px 'Poppins', system-ui, -apple-system, sans-serif; letter-spacing: 0.3px; }
      .ottu-dgm--autopay-journey .arrow-label-bg { fill: #F6FAFD; }
    

      /* dark theme — overrides only what changes */
      [data-theme='dark'] .ottu-dgm--autopay-journey .node { fill: #171A21; stroke: #1E2939; }
      [data-theme='dark'] .ottu-dgm--autopay-journey .container-bg { fill: #0F1A22; }
      [data-theme='dark'] .ottu-dgm--autopay-journey .platform-label { fill: #5CB4E1; }
      [data-theme='dark'] .ottu-dgm--autopay-journey .label { fill: #E5E7EB; }
      [data-theme='dark'] .ottu-dgm--autopay-journey .sub { fill: #A0A0A8; }
      [data-theme='dark'] .ottu-dgm--autopay-journey .divider { stroke: #1E2939; }
      [data-theme='dark'] .ottu-dgm--autopay-journey .arrow { stroke: #8A8A92; }
      [data-theme='dark'] .ottu-dgm--autopay-journey .arrow-head { fill: #8A8A92; }
      [data-theme='dark'] .ottu-dgm--autopay-journey .arrow-label { fill: #A0A0A8; }
      [data-theme='dark'] .ottu-dgm--autopay-journey .arrow-label-bg { fill: #0F1A22; }
    </style>
  </defs>

  <!-- Lane headers -->
  <rect class="node" x="70" y="24" width="200" height="62" rx="10" />
  <text class="label" x="170" y="51" text-anchor="middle">Your business</text>
  <text class="sub" x="170" y="69" text-anchor="middle">Your team or your system</text>

  <rect class="accent" x="400" y="24" width="200" height="62" rx="10" />
  <text class="label-white" x="500" y="51" text-anchor="middle">AutoPay</text>
  <text class="sub-white" x="500" y="69" text-anchor="middle">Runs the subscription</text>

  <rect class="node" x="730" y="24" width="200" height="62" rx="10" />
  <circle class="divider" cx="770" cy="47" r="7" fill="none" />
  <path class="divider" d="M 757 68 Q 770 52 783 68" fill="none" />
  <text class="label" x="842" y="51" text-anchor="middle">Your customer</text>
  <text class="sub" x="842" y="69" text-anchor="middle">Email and self-service page</text>

  <!-- Lifelines -->
  <path class="divider" d="M 170 86 L 170 616" stroke-dasharray="3 5" />
  <path class="divider" d="M 500 86 L 500 616" stroke-dasharray="3 5" />
  <path class="divider" d="M 830 86 L 830 616" stroke-dasharray="3 5" />

  <!-- 1. You create the subscription -->
  <a href="#setting-up-autopay">
    <text class="label" x="182" y="124">1 · You create the subscription</text>
  </a>
  <path class="arrow" d="M 170 136 L 492 136" marker-end="url(#arrow-autopay-journey)" />

  <!-- 2. The customer pays the first charge -->
  <a href="#subscription-lifecycle">
    <text class="label" x="512" y="184">2 · The customer pays the first charge</text>
  </a>
  <path class="arrow" d="M 830 196 L 508 196" marker-end="url(#arrow-autopay-journey)" />

  <!-- 3. The self-service link -->
  <a href="#customer-self-service-page">
    <text class="label" x="182" y="244">3 · The customer gets the self-service link</text>
  </a>
  <text class="sub" x="182" y="260">from you, and in every AutoPay email</text>
  <path class="arrow" d="M 170 272 L 822 272" marker-end="url(#arrow-autopay-journey)" />

  <!-- 4. Reminder before each charge -->
  <a href="#notifications">
    <text class="label" x="512" y="320">4 · A reminder email arrives</text>
  </a>
  <text class="sub" x="512" y="336">before each charge</text>
  <path class="arrow" d="M 500 348 L 822 348" marker-end="url(#arrow-autopay-journey)" />

  <!-- 5. AutoPay charges the saved card -->
  <a href="#billing-cycles">
    <text class="label" x="512" y="392">5 · AutoPay charges the saved card</text>
  </a>
  <text class="sub" x="512" y="408">on every billing date</text>
  <path class="arrow" d="M 500 420 L 822 420" marker-end="url(#arrow-autopay-journey)" />

  <!-- 6. Failed charge: retry and email -->
  <a href="#retries-and-dunning">
    <text class="label" x="512" y="464">6 · If a charge fails, AutoPay retries it</text>
  </a>
  <text class="sub" x="512" y="480">and emails the customer</text>
  <path class="arrow" d="M 500 492 L 822 492" stroke-dasharray="4 3" marker-end="url(#arrow-autopay-journey)" />

  <!-- 7. Final-failure email -->
  <a href="#retries-and-dunning">
    <text class="label" x="512" y="536">7 · The final-failure email</text>
  </a>
  <text class="sub" x="512" y="552">takes the customer to their page</text>
  <path class="arrow" d="M 500 564 L 822 564" stroke-dasharray="4 3" marker-end="url(#arrow-autopay-journey)" />

  <!-- 8. Customer pays, active again -->
  <a href="#retries-and-dunning">
    <text class="label" x="512" y="596">8 · The customer pays, and it is active again</text>
  </a>
  <path class="arrow" d="M 830 608 L 508 608" marker-end="url(#arrow-autopay-journey)" />
</svg>`;

export default function AutoPayJourneyDiagram(): React.JSX.Element {
  return (
    <Diagram
      svg={SVG}
      alt="The AutoPay journey across your business, AutoPay and your customer: you create the subscription; the customer pays the first charge; the customer gets the self-service link from you and in every AutoPay email; a reminder email arrives before each charge and AutoPay charges the saved card; if a charge fails AutoPay retries it and emails the customer; the final-failure email takes the customer to their page, where they pay and the subscription is active again."
    />
  );
}
