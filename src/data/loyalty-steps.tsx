import React from "react";
import Link from "@docusaurus/Link";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";
import type { Step } from "@site/src/components/StepGuide";
import { OTTU_CONNECT_BASE_URL } from "@site/src/constants/api";

/**
 * Developer "Step-by-Step" carousel for the Loyalty page.
 *
 * The create-session request is trimmed to the required Checkout API fields
 * plus the loyalty fields — nothing unrelated to loyalty.
 */
export const developerLoyaltySteps: Step[] = [
  {
    title: "Create the payment transaction",
    description: (
      <>
        <p>
          Send <code>loyalty</code> and <code>customer_phone</code> on the
          standard <Link to="/developers/payments/checkout-api">Checkout API</Link>{" "}
          create call, authenticated with your{" "}
          <Link to="/developers/getting-started/authentication">API key</Link>.
          The request below is the minimum: the required Checkout fields plus
          the two loyalty fields.
        </p>
        <Tabs groupId="language">
          <TabItem value="curl" label="cURL">
            <CodeBlock language="bash" title="Create a rewardable payment transaction">{`curl --location '${OTTU_CONNECT_BASE_URL}/b/checkout/v1/pymt-txn/' \\
  --header 'Authorization: Api-Key <YOUR_API_KEY>' \\
  --header 'Content-Type: application/json' \\
  --data '{
    "type": "e_commerce",
    "amount": "50",
    "currency_code": "SAR",
    "pg_codes": ["<YOUR_QITAF_LINKED_PG_CODE>"],
    "customer_phone": "+966566089459",
    "loyalty": {"enabled": true}
  }'`}</CodeBlock>
          </TabItem>
          <TabItem value="python" label="Python">
            <CodeBlock language="python" title="Create a rewardable payment transaction">{`import requests

response = requests.post(
    "${OTTU_CONNECT_BASE_URL}/b/checkout/v1/pymt-txn/",
    headers={
        "Authorization": "Api-Key <YOUR_API_KEY>",
        "Content-Type": "application/json",
    },
    json={
        "type": "e_commerce",
        "amount": "50",
        "currency_code": "SAR",
        "pg_codes": ["<YOUR_QITAF_LINKED_PG_CODE>"],
        "customer_phone": "+966566089459",
        "loyalty": {"enabled": True},
    },
)

session = response.json()
print(session["session_id"], session["checkout_url"])`}</CodeBlock>
          </TabItem>
          <TabItem value="node" label="Node.js">
            <CodeBlock language="javascript" title="Create a rewardable payment transaction">{`const response = await fetch(
  "${OTTU_CONNECT_BASE_URL}/b/checkout/v1/pymt-txn/",
  {
    method: "POST",
    headers: {
      Authorization: "Api-Key <YOUR_API_KEY>",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "e_commerce",
      amount: "50",
      currency_code: "SAR",
      pg_codes: ["<YOUR_QITAF_LINKED_PG_CODE>"],
      customer_phone: "+966566089459",
      loyalty: { enabled: true },
    }),
  },
);

const session = await response.json();
console.log(session.session_id, session.checkout_url);`}</CodeBlock>
          </TabItem>
          <TabItem value="php" label="PHP">
            <CodeBlock language="php" title="Create a rewardable payment transaction">{`<?php
$ch = curl_init("${OTTU_CONNECT_BASE_URL}/b/checkout/v1/pymt-txn/");

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Api-Key <YOUR_API_KEY>",
        "Content-Type: application/json",
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "type" => "e_commerce",
        "amount" => "50",
        "currency_code" => "SAR",
        "pg_codes" => ["<YOUR_QITAF_LINKED_PG_CODE>"],
        "customer_phone" => "+966566089459",
        "loyalty" => ["enabled" => true],
    ]),
]);

$session = json_decode(curl_exec($ch), true);
echo $session["session_id"];`}</CodeBlock>
          </TabItem>
        </Tabs>
        <p>
          The response is a standard checkout session. The <code>loyalty</code>{" "}
          object is echoed back exactly as you sent it — that confirms Ottu{" "}
          <strong>stored your intent</strong>, not that a reward was issued.
        </p>
        <CodeBlock language="json" title="Response (abridged)">{`{
  "session_id": "8f2c1d5e9a7b4c3f6e0d2a8b1c4f7e9d",
  "checkout_url": "https://sandbox.ottu.net/b/checkout/redirect/start/?session_id=8f2c1d5e9a7b4c3f6e0d2a8b1c4f7e9d",
  "amount": "50.00",
  "currency_code": "SAR",
  "customer_phone": "+966566089459",
  "loyalty": {"enabled": true},
  "state": "created"
}`}</CodeBlock>
      </>
    ),
  },
  {
    title: "Let the customer pay",
    description: (
      <>
        Present the checkout however you normally do — redirect to{" "}
        <code>checkout_url</code>, or mount the{" "}
        <Link to="/developers/payments/checkout-sdk/">Checkout SDK</Link>. Loyalty
        adds no step to the customer&apos;s experience: there is no extra screen
        and nothing for them to confirm.
      </>
    ),
  },
  {
    title: "The reward fires automatically",
    description: (
      <>
        Once the payment is acknowledged and the transaction reaches{" "}
        <Link to="/developers/reference/payment-states">
          <code>paid</code>
        </Link>
        , Ottu issues the reward in a background job. No API call is needed
        from you. If a reward is skipped, the transaction still succeeds and
        no error is returned — see{" "}
        <Link to="#when-no-reward-is-issued">When no reward is issued</Link> for
        every case.
      </>
    ),
  },
  {
    title: "Reversal on refund",
    description: (
      <>
        When you <Link to="/developers/operations">refund</Link> a rewarded
        transaction, Ottu reverses the reward automatically, matched to the
        refunded amount: refund 20 SAR of a 50 SAR order and 20 SAR of reward
        basis is reversed. Repeated partial refunds accumulate, and a reversal
        that would exceed the original reward is rejected rather than
        over-reversing. Only <strong>money</strong> refunds reduce the reward.
      </>
    ),
  },
];
