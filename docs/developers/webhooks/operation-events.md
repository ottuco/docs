---
title: Operation Events
sidebar_label: Operation Events
---

import SchemaEmbed from "@site/src/components/SchemaEmbed";

# Operation Notification

Ottu’s operation webhooks provide real-time insights into post-transaction activities, specifically focusing on `refund`, `capture`, and `void`. Operating asynchronously, they ensure merchants are promptly informed about these crucial subsequent payment gateway operations without disrupting the main transaction flow. By utilizing these webhooks, merchants gain a clearer view of their transactional landscape, enhancing decision-making and customer interactions.

## Setup

To ensure you receive notifications for subsequent payment gateway operations, it’s essential to configure the operation webhooks correctly. Here’s a brief guide on setting it up:

1. **Webhook URL Configuration:** \
   There are two ways to configure `webhook_url` for operations&#x20;

* Configuring the operation `webhook_url` within webhook general configuration. For more details, click [here](/developers/webhooks).
* Configuring the operation `webhook_url` through payment webhook plugin configuration. For further information, click [here](/developers/webhooks).

2. **Enable API-initiated Transaction Notifications:**\
   If you want to receive webhook notifications for transactions initiated via the API, ensure you check the box labeled “Enable webhook notifications if transaction initiated from API.” For instructions on how to do this, please consult the following [reference](/developers/webhooks).
3. **Webhook Configuration Details**: \
   For a more in-depth understanding and additional configuration options, refer to the dedicated [webhook config section](/developers/webhooks) in the documentation.
4. **Webhook Setup Requirements:** \
   It’s worth noting that the requirements for setting up operation webhooks align with those detailed in the “webhooks overview” page. Ensure you’re familiar with these requirements to guarantee a smooth setup process. For details on these requirements, click [here](/developers/webhooks/#endpoint-requirements).

By following these steps and ensuring your webhook is correctly configured, you’ll be well-equipped to receive timely updates on all your payment gateway operations.

## Params

<SchemaEmbed path="PaymentOperationResponses.json" parentSchemaName="operation-webhook" />

## Event Types

Operation webhooks are activated under the following scenarios:

1. **Ottu Dashboard Trigger:** When a payment operation (`refund`, `void`, or `capture`) is initiated directly from the Ottu dashboard, the system will automatically send a webhook notification to the subscriber’s registered endpoint.
2. **REST API Trigger:** If a payment operation is executed via Ottu’s REST API, [external operations API](/developers/operations#external-operations), the webhook system will again ensure that a notification is dispatched to the subscriber’s endpoint. This ensures that even automated or system-driven operations are communicated in real-time.
3. **Payment Gateway Dashboard Trigger:** Some [Payment Gateways](/developers/payments/payment-methods) (PG) have their own webhook systems in place. If a payment operation is performed on the Payment Gateway’s dashboard and that PG has enabled webhooks, it will notify Ottu. Ottu, in turn, will relay this information to the subscriber by triggering the operation webhook. This cascading notification ensures that even if operations are performed outside of Ottu’s immediate ecosystem, subscribers remain in the loop. To access further details regarding the available operations for each payment gateway, please click [here](/developers/operations).

## Payload example (refund)

```json
{
   "amount":"9.000",
   "initiator":{
      "email":"initaitor@example.com",
      "first_name":"example",
      "id":35,
      "last_name":"",
      "phone":"",
      "username":"username_example"
   },
   "is_sandbox":true,
   "operation":null,
   "order_no":"Y3ODg",
   "pg_code":"credit-card",
   "pg_response":{
      "It will contain the raw pg response sent by the pg to Ottu"
   },
   "reference_number":"staging4AQ64A",
   "result":"success",
   "session_id":"bb7fc280827c2f177a9690299cfefa4128dbbd60",
   "signature":"65f655d2161*************",
   "source":"input",
   "success":true,
   "timestamp_utc":"2023-11-02 09:02:06",
   "txn":{
      "amount":"9.000",
      "currency_code":"KWD",
      "order_no":"",
      "session_id":"43ae8773f2c61f2ef41e3024e3b8f8bf45667d44",
      "state":"refunded"
   }
}
```

## Acknowledging an Operation

Upon receiving an operation notification, it’s essential to discern and acknowledge the operation’s status and specifics. Here’s a guide on how to interpret the provided details:\
\
**Identifying the Transaction:**\
Every operation is a subsequent action performed on a specific payment transaction, identifiable by its [session\_id](/developers/payments/checkout-api/) or [order\_no](/developers/payments/checkout-api/). These operations spawn [child payment transactions](/developers/reference/payment-states), each with its distinct payment [attempt](/developers/reference/payment-states) and [state](/developers/reference/payment-states), without altering the primary transaction. The child transaction details are housed in the `txn` field of the [webhook payload](#payload-example-refund). You can retrieve all child transactions from the Payment webhook under the transactions parameter or by invoking the [Payment Status API](/developers/payments/psq).

1. **Types of Operations:**

* **Real-time Operations:** Immediate actions where, for instance, a refund request results in an instant refund. [Child transactions](/developers/reference/payment-states) are created for successful real-time operations, while failures aren’t stored.
* **Queued Operations:** The Payment Gateway (PG) might not approve the request instantly, placing it in a queue for later processing. Such operations initially bear a `<operation>_queued` state. Once processed, the state either transitions to the specific operation state (like `refunded`, `captured`, `voided`) or `<operation>_rejected`.

2. **Understanding Real-time and Queued Payment Gateways:**&#x54;o determine which Payment Gateways operate in real-time and which ones use the queued system, you can consult the list provided [here](/developers/operations).
3. **Additional Information:** Upon receiving a `<operation>_queued` status, such as `refund_queued`, it’s imperative to archive this response. Ottu will subsequently notify the operation webhook URL with the conclusive result.
4. **Understanding the result Field:** `result` this field elucidates the operation’s outcome:

* `success`: The operation was executed successfully.
* `rejected`: The operation was declined. This status invariably succeeds a queued status.
* `queued`: The operation awaits processing and will be updated in due course.

5. **Verifying the Amount:** As operations exclusively function in the original payment transaction currency, inspecting the amount field ensures the accurate amount is either deducted or appended.
6. **Interpreting the Transaction State (Optional):** The transaction’s state can be discerned using the `txn.state` field:

* `txn.state = paid`: The transaction was captured.
* `txn.refunded`: The transaction was refunded.
* `txn.refund_queued`: The refund operation is pending.
* `txn.refund_rejected`: The refund operation was declined.
* `txn.voided`: The transaction was voided.

By accurately interpreting these fields and states, you can ensure precise acknowledgment of all your subsequent payment operations.

7. **Verifying the Signature**

Every operation webhook payload includes a `signature` field — an HMAC-SHA256 hash that proves the payload came from Ottu. **Always verify this signature before processing the operation result.**

For implementation details and code examples, see [Verify Signatures](/developers/webhooks/verify-signatures/).

:::danger
Never process an operation webhook without verifying the signature. An unverified payload could be forged by an attacker.
:::

For general webhook setup and configuration, see the [Webhooks Overview](./).

## What's Next?

- [**PG Params**](/developers/webhooks/pg-params/) — Normalized gateway response fields reference
- [**Payment Events**](/developers/webhooks/payment-events/) — Webhook notifications for payment transactions
- [**Verify Signatures**](/developers/webhooks/verify-signatures/) — Validate webhook authenticity with HMAC-SHA256
- [**Webhooks Overview**](./) — Setup, delivery guarantees, and configuration
