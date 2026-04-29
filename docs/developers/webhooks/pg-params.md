---
title: PG Params
sidebar_label: PG Params
description: Unified payment gateway response fields — search and browse all pg_params fields that Ottu normalizes across 60+ gateways.
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import PGParamsReference from "@site/src/components/PGParamsReference";
import FAQ, { FAQItem } from '@site/src/components/FAQ';

# PG Params

Every payment gateway returns transaction results in its own format — different field names, different nesting structures, even different response shapes for the same gateway depending on the transaction type. Ottu sits in front of [60+ payment gateways](https://enc.ottu.me/business/payments/gateways/) and normalizes all of these varied responses into a consistent set of fields called **`pg_params`**.

When your webhook handler reads `pg_params.card_number`, you get the masked card number regardless of whether the transaction was processed by KNET, MPGS, Cybersource, Tap, or any other gateway. No gateway-specific parsing required.

## Why PG Params Matter

If you parse the raw `gateway_response` directly, your code is tightly coupled to one gateway's format. The moment you add a second gateway or switch providers, your webhook handler breaks and requires new development work.

`pg_params` eliminates this problem. Ottu does the heavy lifting of extracting and normalizing fields from every gateway's unique response format, so your code stays the same regardless of which gateway processed the transaction.

**Without PG Params** — parsing raw gateway responses:

```json title="KNET gateway_response"
{ "auth": "A83921", "tranid": "9201831", "trackid": "TRK001", "ref": "REF001" }
```

```json title="MPGS gateway_response"
{
  "transaction": [{ "transaction": { "authorizationCode": "A83921" } }],
  "order": { "id": "9201831", "reference": "REF001" }
}
```

Two completely different structures. Your code would need separate parsing logic for each.

**With PG Params** — same fields, every gateway:

```json title="pg_params (identical structure regardless of gateway)"
{ "auth_code": "A83921", "transaction_id": "9201831", "ref": "REF001" }
```

:::tip[Switch gateways without code changes]
Always build your webhook handling logic against `pg_params`. When you add a new payment connection or switch from one gateway to another, your code keeps working — Ottu handles the extraction and normalization behind the scenes.
:::

## Where PG Params Appear

`pg_params` is included in:

- [**Payment webhooks**](/developers/webhooks/payment-events/) — the `pg_params` object in every payment notification
- [**Operation webhooks**](/developers/webhooks/operation-events/) — the `pg_params` object in refund, capture, and void notifications
- [**Payment Status Query**](/developers/payments/psq/) — the response includes the same normalized fields

The raw `gateway_response` is also included in webhook payloads for audit purposes, but you should not rely on it for business logic.

## Field Reference

Search or filter all normalized fields below. Click any field name to get a shareable link.

<PGParamsReference />

:::info[Need a parameter that's not listed?]
If you need a gateway response field that isn't currently in `pg_params`, contact us at **csd@ottu.com** and we'll add it. New parameters are added regularly as merchants request them.
:::

## pg_params vs gateway_response

Both fields are included in webhook payloads. Here's when to use each:

|                 | `pg_params`                             | `gateway_response`                               |
| --------------- | --------------------------------------- | ------------------------------------------------ |
| **Format**      | Consistent across all gateways          | Varies by gateway                                |
| **Structure**   | Flat key-value object                   | Nested, gateway-specific                         |
| **Stability**   | Field names are fixed                   | Can change when a gateway updates their API      |
| **Use for**     | Business logic, display, reconciliation | Audit trails, debugging, gateway support tickets |
| **Recommended** | Yes — primary integration field         | Store for audit, don't build logic on it         |

:::warning
The raw `gateway_response` format can change without notice when a payment gateway updates their API. Building business logic on raw gateway responses means your integration can break at any time. Use `pg_params` for all programmatic decisions.
:::

## Code Examples

Here's how to extract `pg_params` from a webhook payload:

<Tabs groupId="language">
<TabItem value="python" label="Python">

```python title="webhook_handler.py"
import json
from flask import Flask, request

app = Flask(__name__)

@app.route("/webhook", methods=["POST"])
def handle_webhook():
    payload = request.get_json()

    # Use pg_params for normalized gateway fields
    pg_params = payload.get("pg_params", {})

    auth_code = pg_params.get("auth_code", "")
    card_number = pg_params.get("card_number", "")
    rrn = pg_params.get("rrn", "")
    transaction_id = pg_params.get("transaction_id", "")

    # Use the top-level 'state' for payment status
    state = payload.get("state")

    print(f"Payment {state}: card={card_number}, auth={auth_code}, rrn={rrn}")

    # Store the raw gateway_response for audit purposes only
    gateway_response = payload.get("gateway_response", {})
    save_audit_log(gateway_response)

    return "OK", 200
```

</TabItem>
<TabItem value="node" label="Node.js">

```javascript title="webhookHandler.js"
const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  const payload = req.body;

  // Use pg_params for normalized gateway fields
  const pgParams = payload.pg_params || {};

  const authCode = pgParams.auth_code || "";
  const cardNumber = pgParams.card_number || "";
  const rrn = pgParams.rrn || "";
  const transactionId = pgParams.transaction_id || "";

  // Use the top-level 'state' for payment status
  const state = payload.state;

  console.log(
    `Payment ${state}: card=${cardNumber}, auth=${authCode}, rrn=${rrn}`
  );

  // Store the raw gateway_response for audit purposes only
  const gatewayResponse = payload.gateway_response || {};
  saveAuditLog(gatewayResponse);

  res.sendStatus(200);
});
```

</TabItem>
<TabItem value="php" label="PHP">

```php title="webhook_handler.php"
<?php

$payload = json_decode(file_get_contents('php://input'), true);

// Use pg_params for normalized gateway fields
$pgParams = $payload['pg_params'] ?? [];

$authCode = $pgParams['auth_code'] ?? '';
$cardNumber = $pgParams['card_number'] ?? '';
$rrn = $pgParams['rrn'] ?? '';
$transactionId = $pgParams['transaction_id'] ?? '';

// Use the top-level 'state' for payment status
$state = $payload['state'];

error_log("Payment {$state}: card={$cardNumber}, auth={$authCode}, rrn={$rrn}");

// Store the raw gateway_response for audit purposes only
$gatewayResponse = $payload['gateway_response'] ?? [];
saveAuditLog($gatewayResponse);

http_response_code(200);
echo 'OK';
```

</TabItem>
</Tabs>

## FAQ

<FAQ>
  <FAQItem question="What if a field I need is not in pg_params?">
    Contact us at **csd@ottu.com** with the field you need and which gateway returns it. We'll add it to the normalized `pg_params` set. New parameters are added regularly.
  </FAQItem>
  <FAQItem question="Are pg_params available for all gateways?">
    Yes. Ottu normalizes responses from all [60+ supported payment gateways](https://enc.ottu.me/business/payments/gateways/). The same `pg_params` fields are available regardless of which gateway processed the transaction.
  </FAQItem>
  <FAQItem question="Can pg_params fields be empty?">
    Yes. Not all gateways return all fields. For example, `dcc_payer_amount` is only present when Dynamic Currency Conversion is active, and `card_holder` depends on whether the gateway includes cardholder details in its response. Only fields available from the gateway's response are populated — empty fields are omitted from the object.
  </FAQItem>
  <FAQItem question="Should I still store the raw gateway_response?">
    Yes — store it for audit and debugging purposes. If you ever need to open a support ticket with a payment gateway, they'll want to see their original response. But don't build your processing logic on it.
  </FAQItem>
  <FAQItem question="Do operation webhooks include pg_params too?">
    Yes. [Operation webhooks](/developers/webhooks/operation-events/) (refunds, captures, voids) include `pg_params` with the same normalized fields.
  </FAQItem>
</FAQ>

## What's Next?

- [**Payment Events**](/developers/webhooks/payment-events/) — Full webhook payload reference for payment notifications
- [**Operation Events**](/developers/webhooks/operation-events/) — Webhook notifications for refunds, captures, and voids
- [**Verify Signatures**](/developers/webhooks/verify-signatures/) — Validate webhook authenticity with HMAC-SHA256
- [**Webhooks Overview**](./) — Setup, delivery guarantees, and configuration
