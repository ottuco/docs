import React from "react";
import Diagram from "@site/src/components/Diagram";

/**
 * AutoPay end-to-end journey for the business page: three lanes (your business,
 * AutoPay, your customer) and eight numbered steps, from creating the
 * subscription to recovering a past-due one.
 *
 * Single inline, theme-aware SVG made with the `svg-diagram` skill
 * (scripts/inline-svg.py, slug "autopay-sequence"). To change it, edit the light
 * source SVG and re-run inline-svg.py.
 *
 * PUBLIC SURFACE: the SVG, its <title>/<desc> and the alt text ship to merchants.
 * AutoPay is shown as one platform; no internal service topology appears here.
 */
const SVG = String.raw`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 520"
     role="img" aria-labelledby="diagram-title-autopay-sequence diagram-desc-autopay-sequence" preserveAspectRatio="xMidYMid meet" class="ottu-dgm--autopay-sequence">
  <title id="diagram-title-autopay-sequence">AutoPay journey from first subscription to recovery</title>
  <desc id="diagram-desc-autopay-sequence">Three lanes: your business, AutoPay, and your customer. You create the subscription and the customer pays the first charge. AutoPay emails the customer the self-service link, and you can send it too. A reminder email arrives before each charge. AutoPay charges the saved card. If a charge fails, AutoPay retries and emails the customer. The final-failure email links the customer straight to paying the balance, and paying it makes the subscription active again.</desc>
  <defs>
    <marker id="arrow-autopay-sequence" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path class="arrow-head" d="M0,1 L9,5 L0,9 z" />
    </marker>
    <style>
      .ottu-dgm--autopay-sequence .node { fill: #FFFFFF; stroke: #D4D4D4; stroke-width: 1.4; }
      .ottu-dgm--autopay-sequence .accent { fill: #0B82BE; stroke: #0B82BE; stroke-width: 1.4; }
      .ottu-dgm--autopay-sequence .label { fill: #302F37; font: 600 13px 'Poppins', system-ui, -apple-system, sans-serif; }
      .ottu-dgm--autopay-sequence .label-white { fill: #FFFFFF; font: 600 13px 'Poppins', system-ui, -apple-system, sans-serif; }
      .ottu-dgm--autopay-sequence .sub { fill: #6B6B72; font: 400 11px 'Poppins', system-ui, -apple-system, sans-serif; }
      .ottu-dgm--autopay-sequence .divider { stroke: #E0E0E3; stroke-width: 1; }
      .ottu-dgm--autopay-sequence .arrow { fill: none; stroke: #8B8A90; stroke-width: 1.4; }
      .ottu-dgm--autopay-sequence .arrow-head { fill: #8B8A90; }
      .ottu-dgm--autopay-sequence .arrow-label { fill: #6B6B72; font: 500 10px 'Poppins', system-ui, -apple-system, sans-serif; letter-spacing: 0.3px; }
      .ottu-dgm--autopay-sequence .arrow-label-bg { fill: #F6FAFD; }
    

      /* dark theme — overrides only what changes */
      [data-theme='dark'] .ottu-dgm--autopay-sequence .node { fill: #171A21; stroke: #1E2939; }
      [data-theme='dark'] .ottu-dgm--autopay-sequence .label { fill: #E5E7EB; }
      [data-theme='dark'] .ottu-dgm--autopay-sequence .sub { fill: #A0A0A8; }
      [data-theme='dark'] .ottu-dgm--autopay-sequence .divider { stroke: #1E2939; }
      [data-theme='dark'] .ottu-dgm--autopay-sequence .arrow { stroke: #8A8A92; }
      [data-theme='dark'] .ottu-dgm--autopay-sequence .arrow-head { fill: #8A8A92; }
      [data-theme='dark'] .ottu-dgm--autopay-sequence .arrow-label { fill: #A0A0A8; }
      [data-theme='dark'] .ottu-dgm--autopay-sequence .arrow-label-bg { fill: #0F1A22; }
    </style>
  </defs>

  <line class="arrow" style="stroke-width:1;opacity:0.4" x1="150" y1="68" x2="150" y2="506" stroke-dasharray="3 5" />
  <line class="arrow" style="stroke-width:1;opacity:0.4" x1="480" y1="68" x2="480" y2="506" stroke-dasharray="3 5" />
  <line class="arrow" style="stroke-width:1;opacity:0.4" x1="810" y1="68" x2="810" y2="506" stroke-dasharray="3 5" />
  <rect class="node" x="60" y="20" width="180" height="48" rx="24" />
  <text class="label" x="150" y="49" text-anchor="middle">Your business</text>
  <rect class="accent" x="390" y="20" width="180" height="48" rx="24" />
  <text class="label-white" x="480" y="49" text-anchor="middle">AutoPay</text>
  <rect class="node" x="720" y="20" width="180" height="48" rx="24" />
  <circle class="arrow" cx="754" cy="38" r="5" />
  <path class="arrow" d="M 744 56 Q 744 46 754 46 Q 764 46 764 56" />
  <text class="label" x="826" y="49" text-anchor="middle">Your customer</text>
  <path class="arrow" d="M 150 110 L 480 110" marker-end="url(#arrow-autopay-sequence)" />
  <rect class="arrow-label-bg" x="231" y="102" width="168" height="16" rx="3" />
  <text class="arrow-label" x="315" y="113.5" text-anchor="middle">Creates the subscription</text>
  <circle class="node" cx="176" cy="110" r="11" />
  <text class="label" x="176" y="114.5" text-anchor="middle">1</text>
  <path class="arrow" d="M 810 162 L 480 162" marker-end="url(#arrow-autopay-sequence)" />
  <rect class="arrow-label-bg" x="571" y="154" width="148" height="16" rx="3" />
  <text class="arrow-label" x="645" y="165.5" text-anchor="middle">Pays the first charge</text>
  <circle class="node" cx="784" cy="162" r="11" />
  <text class="label" x="784" y="166.5" text-anchor="middle">2</text>
  <path class="arrow" d="M 480 214 L 810 214" marker-end="url(#arrow-autopay-sequence)" />
  <rect class="arrow-label-bg" x="577" y="206" width="136" height="16" rx="3" />
  <text class="arrow-label" x="645" y="217.5" text-anchor="middle">Link in every email</text>
  <circle class="node" cx="506" cy="214" r="11" />
  <text class="label" x="506" y="218.5" text-anchor="middle">3</text>
  <path class="arrow" d="M 480 266 L 810 266" marker-end="url(#arrow-autopay-sequence)" />
  <rect class="arrow-label-bg" x="593" y="258" width="104" height="16" rx="3" />
  <text class="arrow-label" x="645" y="269.5" text-anchor="middle">Reminder email</text>
  <circle class="node" cx="506" cy="266" r="11" />
  <text class="label" x="506" y="270.5" text-anchor="middle">4</text>
  <path class="arrow" d="M 480 308 L 524 308 L 524 328 L 484 328" marker-end="url(#arrow-autopay-sequence)" />
  <circle class="node" cx="524" cy="318" r="11" />
  <text class="label" x="524" y="322.5" text-anchor="middle">5</text>
  <text class="arrow-label" x="544" y="321.5">Charges the saved card</text>
  <path class="arrow" d="M 480 370 L 810 370" marker-end="url(#arrow-autopay-sequence)" />
  <rect class="arrow-label-bg" x="574" y="362" width="142" height="16" rx="3" />
  <text class="arrow-label" x="645" y="373.5" text-anchor="middle">Retries, then emails</text>
  <circle class="node" cx="506" cy="370" r="11" />
  <text class="label" x="506" y="374.5" text-anchor="middle">6</text>
  <path class="arrow" d="M 480 422 L 810 422" marker-end="url(#arrow-autopay-sequence)" />
  <rect class="arrow-label-bg" x="561" y="414" width="168" height="16" rx="3" />
  <text class="arrow-label" x="645" y="425.5" text-anchor="middle">Final email: pay balance</text>
  <circle class="node" cx="506" cy="422" r="11" />
  <text class="label" x="506" y="426.5" text-anchor="middle">7</text>
  <path class="arrow" d="M 810 474 L 480 474" marker-end="url(#arrow-autopay-sequence)" />
  <rect class="arrow-label-bg" x="587" y="466" width="116" height="16" rx="3" />
  <text class="arrow-label" x="645" y="477.5" text-anchor="middle">Pays the balance</text>
  <circle class="node" cx="784" cy="474" r="11" />
  <text class="label" x="784" y="478.5" text-anchor="middle">8</text>
  <text class="sub" x="494" y="498">Subscription is active again</text>
</svg>`;

export default function AutoPaySequenceDiagram(): React.JSX.Element {
  return (
    <Diagram
      svg={SVG}
      alt="A three-lane sequence of the AutoPay journey: you create the subscription, the customer pays the first charge, every AutoPay email carries the self-service link, a reminder email arrives before each charge, AutoPay charges the saved card, retries and emails when a charge fails, and the final email links the customer to paying the balance, which makes the subscription active again."
    />
  );
}
