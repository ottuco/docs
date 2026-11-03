import React from "react";
import Link from "@docusaurus/Link";
import type { FlowEdge, FlowNode } from "@site/src/components/FlowDiagram";

// The AutoPay workflow on docs/developers/payments/autopay/index.mdx. Each
// description is the matching item of the text list on that page, word for
// word: change both together.
export const autopayWorkflowNodes: FlowNode[] = [
  {
    id: "create",
    badge: 1,
    kicker: "You",
    label: "You create the subscription",
    description: (
      <p>
        <strong>You create the subscription</strong> with one{" "}
        <Link to="/developers/payments/checkout-api">Checkout API</Link> call that describes the plan
        and its schedule.
      </p>
    ),
    href: "/developers/payments/autopay/?autopay-api=create#api-reference",
    linkLabel: "Create a subscription",
  },
  {
    id: "first-charge",
    badge: 2,
    kicker: "Your customer",
    label: "Your customer pays the first charge",
    description: (
      <p>
        <strong>Your customer pays the first charge</strong> on the checkout page, and Ottu saves
        their card.
      </p>
    ),
    href: "#what-your-customer-sees",
    linkLabel: "What your customer sees",
  },
  {
    id: "result",
    badge: 3,
    kicker: "You",
    label: "You get the result",
    description: (
      <p>
        <strong>You get the result.</strong> When your customer completes checkout, Ottu sends the
        result to your webhook URL, if you set one, as for any checkout. That is the only webhook you
        get: renewals don't send one, so you read their outcome from the subscription, which you can
        look up at any time.
      </p>
    ),
    href: "#first-payment-and-activation",
    linkLabel: "First payment and activation",
  },
  {
    id: "billing",
    badge: 4,
    kicker: "Ottu",
    label: "Ottu bills each cycle",
    variant: "accent",
    description: (
      <p>
        <strong>Ottu bills each cycle</strong>, retries failed charges and emails your customer.
      </p>
    ),
    href: "#billing-cycles",
    linkLabel: "Billing cycles",
  },
  {
    id: "self-service",
    badge: 5,
    kicker: "Your customer",
    label: "Your customer manages the subscription",
    description: (
      <p>
        <strong>Your customer manages the subscription</strong> from their own page. You send them
        the link.
      </p>
    ),
    href: "/developers/payments/autopay/?autopay-api=page-link#api-reference",
    linkLabel: "Get the customer's page link",
  },
];

export const autopayWorkflowEdges: FlowEdge[] = [
  { source: "create", target: "first-charge" },
  { source: "first-charge", target: "result" },
  { source: "result", target: "billing" },
  { source: "billing", target: "self-service" },
];
