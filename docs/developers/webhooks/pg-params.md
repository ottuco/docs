---
title: PG Params
sidebar_label: PG Params
description: The payment gateway fields Ottu normalizes across 45+ gateways - one set of names in connector.params, whatever gateway processed the payment.
displayed_sidebar: developerSidebar
hide_table_of_contents: true
---

import PGParamsReference from "@site/src/components/PGParamsReference";
import FAQ, { FAQItem } from "@site/src/components/FAQ";
import Beside, { Visual } from "@site/src/components/Beside";

# PG Params

Every payment gateway answers in its own format: other field names, other nesting. Ottu sits in front of [45+ payment gateways](/business/payments/gateways/) and turns each answer into one set of fields, the **PG params**. `auth_code` is the authorization code whether KNET, MPGS or Cybersource processed the payment, so your code never parses a gateway's own format.

## Where they are {#where}

<Beside>

#### In a webhook event {#in-events}

`data.connector.params`. Each param is an object with a `value` and a bilingual `label` (`en` and `ar`). Read `value` in your code, and show `label` to people.

#### In the Payment Status Query v3 {#in-psq}

The same object, as `connector.params` on [each attempt](/developers/payments/psq-v3#attempts).

#### In a direct payment answer {#in-direct-payments}

The answers of auto-debit, [native payments](/developers/payments/native-payments), [wallet](/developers/payments/wallet) and cash payments carry a plain object named `pg_params`, with the value only: `pg_params.auth_code`.

A param is present only when the gateway returned it. `dcc_payer_amount`, for example, exists only when Dynamic Currency Conversion ran.

<Visual>

```json title="connector.params in an event"
{
  "connector": {
    "code": "mpgs",
    "reference_number": "GOLDENATT1",
    "params": {
      "auth_code": {
        "label": {
          "en": "Auth Code",
          "ar": "رمز التفويض"
        },
        "value": "A83921"
      }
    },
    "responses": [
      {
        "step": "pay",
        "at": "2026-10-22T10:00:00Z",
        "body": {
          "result": "SUCCESS"
        }
      }
    ]
  }
}
```

</Visual>

</Beside>

## Params or raw responses? {#params-or-responses}

An event carries both. Build on the params.

#### `connector.params` {#use-params}

The same names for every gateway, and the names never change. Use them for business logic, display and [reconciliation](/developers/webhooks#payment-to-settlement).

#### `connector.responses` {#use-responses}

The gateway's own answers, as JSON, one per call. Their shape differs per gateway and can change when the gateway updates its API. Store them for audit and for support tickets with the gateway. Do not build logic on them.

## Field reference {#field-reference}

Every param, with its own link.

<PGParamsReference />

Need a gateway field that is not listed? Write to **csd@ottu.com** with the field and the gateway that returns it. New params are added regularly.

## FAQ

<FAQ>
  <FAQItem question="Are PG params available for every gateway?">
    Yes. Ottu normalizes the answers of every [supported gateway](/business/payments/gateways/). The names are the same whichever gateway processed the payment.
  </FAQItem>
  <FAQItem question="Can a param be missing?">
    Yes. A gateway does not return every field, so only the params it returned are present. `card_holder`, for example, depends on whether the gateway includes cardholder details.
  </FAQItem>
  <FAQItem question="Should I still store the raw gateway responses?">
    Yes, for audit and debugging. A gateway's support team will ask for its original answer. Keep your processing logic on the params.
  </FAQItem>
  <FAQItem question="Do refunds, captures and voids carry params too?">
    Yes. Their events carry `data.connector.params` for the operation's own attempt.
  </FAQItem>
</FAQ>

## What's Next?

- [**Events**](/developers/webhooks#data-keys): where `connector` sits in the event object.
- [**Reconciliation**](/developers/webhooks#reconciliation): match a payment to a bank settlement line with its params.
- [**Webhooks**](/developers/webhooks): set up and build the receiver.
