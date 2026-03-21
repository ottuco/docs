---
title: Payment Events
sidebar_label: Payment Events
---

import SchemaEmbed from "@site/src/components/SchemaEmbed";

# Payment Notification

Payment webhooks are specific to payment events and are triggered on multiple occasions:

1.  #### Post-Payment Completion

    Once a payer has completed the payment process and awaits redirection. To get notified for this event, the [webhook_url](/docs/developers/payments/checkout-api#request-webhook_url) must either be sent via the [Checkout API ](/docs/developers/payments/checkout-api)when the payment transaction is created or set as the default [webhook_url](/docs/developers/webhooks) in the Ottu dashboard to apply for all transactions.

2.  #### Automatic Inquiry by Ottu

    If a payment transaction has an associated [webhook_url](/docs/developers/payments/checkout-api#request-webhook_url), it can be notified during the automatic inquiry process. This can happen immediately after the payer completes the payment process or later if the payment encounters an error. More details about the timings for automatic inquiry can be found [here](/docs/developers/payments/psq).

3.  #### Manual Inquiry by Staff

    When a staff member initiates a manual inquiry from the Ottu dashboard.

4.  #### Manual Notification by Staff

    When a staff manually triggers a notification to the [webhook_url](/docs/developers/payments/checkout-api#request-webhook_url) from the Ottu dashboard.

5.  #### Merchant-Initiated Inquiry

    When an [inquiry API](/docs/developers/payments/psq) call is initiated by the merchant. Optionally, a notification can be sent to the [webhook_url](/docs/developers/payments/checkout-api#request-webhook_url) associated with the payment transaction or to a new one specified during the inquiry API call.

## **Setup**

1. **Configuring URLs**:

- **Via Checkout API:** Provide the [webhook_url](/docs/developers/payments/checkout-api#request-webhook_url) and an optional [redirect_url](/docs/developers/payments/checkout-api#request-redirect_url) when calling the [Checkout API](/docs/developers/payments/checkout-api).
- **Using Plugin Config:** Set the `webhook_url` and `redirect_url` globally via the plugin config, applicable to either [E-Commerce](/docs/developers/payments/payment-methods) or [Payment reques](/docs/developers/payments/payment-methods)t plugins. Even if these values are set globally, they can be overridden for specific transactions when using the `Checkout API`. For more details on this configuration, click [here](/docs/developers/webhooks).

2. **Endpoint Requirements:** \
   Ensure your endpoint adheres to all the stipulations outlined in the Webhook Overview. To review the requirements, click [here](./#endpoint-requirements).
3. **Redirecting the Payer:**

- **Successful Redirect:** If you aim for the payer to be redirected back to your website post-payment, your endpoint should return an HTTP status of 200. Any other status will keep the payer on the Ottu payment details page.
- **Retaining on Ottu Page:** If you intentionally want the payer to remain on the Ottu page post-payment, return a status code of 201. Ottu will interpret this as a successful notification, and the payer won’t be redirected. Any other status will be deemed as a failed notification by Ottu.
- **Specific Redirects:** If you have a particular URL to which you wish to redirect the payer after the payment process, ensure you specify the [redirect_url](/docs/developers/payments/checkout-api#request-redirect_url) during the payment setup. Ottu will use this URL to navigate the payer back to your platform or any designated page post-payment.

## Params

<SchemaEmbed path="SchemaWebhook.json" parentSchemaName="payment-webhook" />

## **Event Types**

Ottu notifies the [webhook_url](/docs/developers/payments/checkout-api#request-webhook_url) for all payment event types, not just success. This includes statuses like `error`, `failed`, `pending`, `rejected`, etc. The payload provides enough context to identify the status of the event.&#x20;

:::info
&#x20;Events like **Refund**, **Void**, or **Capture** are considered operation events and not payment events. If you’re looking for information on these, please refer to the [Operation Webhook page](/docs/developers/webhooks/operation-events).
:::

## Redirectional Diagram

To ensure a smooth redirection of the payer back to the designated [redirect_url](/docs/developers/payments/checkout-api#request-redirect_url), it is essential that the `redirect_url` is accurately provided during the payment setup. Additionally, the [webhook_url](/docs/developers/payments/checkout-api#request-webhook_url) must respond with a status code of 200. This specific status code serves as a confirmation of successful interaction between the involved systems, ultimately guaranteeing the seamless progression of the redirection process as originally intended.

**Redirect behavior based on webhook_url response:**\
-[ status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 200, the customer will be redirected to [redirect_url](/docs/developers/payments/checkout-api#request-redirect_url).\
-[ status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 201, the customer will be redirected to Ottu payment summary page.\
-[ status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) any other code, the customer will be redirected to Ottu payment summary page. For this particular case, Ottu can notify on the email, when Enable webhook notifications? Activated

<figure><img src="/img/webhooks/payment-redirect-diagram.png" alt="" /><figcaption></figcaption></figure>

## Payload example (paid)

```json
{
   "amount":"10.000",
   "amount_details":{
      "amount":"10.000",
      "currency_code":"KWD",
      "fee":"20.000",
      "total":"30.000"
   },
   "currency_code":"KWD",
   "customer_email":"example@example.com",
   "customer_first_name":"first_name_example",
   "customer_id":"Example",
   "customer_last_name":"last_name_example",
   "customer_phone":"1234567",
   "fee":"20.000 KWD",
   "gateway_account":"Credit-Card",
   "gateway_name":"Gateway_Example",
   "gateway_response":{
      "It will contain the raw pg response sent by the pg to Ottu"
   },
   "initiator":{
      "email":"initaitor@example.com",
      "first_name":"example",
      "id":35,
      "last_name":"",
      "phone":"",
      "username":"username_example"
   },
   "is_sandbox":true,
   "order_no":"Y3ODg",
   "paid_amount":"30.000",
   "payment_type":"one_off",
   "reference_number":"staging48G8SS",
   "result":"success",
   "session_id":"bb7fc280827c2f177a9690299cfefa4128dbbd60",
   "settled_amount":"10.000",
   "signature":"60bf40cf******",
   "state":"paid",
   "timestamp_utc":"2023-11-02 09:00:07"
}
```

## Acknowledging a Payment

When you receive a payment notification, it’s crucial to understand and acknowledge the payment’s status and details. Here’s how you can interpret the information:

#### **1. Payment Events Types**

There are several types of payment events you might encounter:

- **Payment:** This indicates a direct payment transaction.
- **Authorization:** This signifies a payment authorization, which might be captured later.
- **Cash (Offline):** This represents an offline payment, often referred to as Cash on Delivery (**COD**).

#### 2. Interpreting the `result` fi**eld**

The [result](#result-string-mandatory) field is your primary indicator of the payment’s outcome:

- If the `result` is `success`, it means the payment was successful.
- If the `result` is `failed`, it indicates an unsuccessful payment attempt.
- For cash payments, the `result` field will be `cod`, indicating Cash on Delivery.

#### **3. Understanding the operation Field**

The operation field provides insight into the type of transaction:

- If the operation is `payment`, it indicates a direct payment.
- If the operation is `authorization`, it signifies a payment that’s been authorized but not yet captured.

#### **4. Verifying the Amount**

- The [amount](#amount-string-mandatory) field provides the value the customer has paid in the currency set during the payment setup.
- However, the actual amount captured by the [Payment Gateway](/docs/developers/payments/payment-methods) (PG) might differ. This can be due to additional fees, currency conversion, or other factors. To get the exact amount captured by the PG, refer to [amount_details.amount](#amount_details-object-mandatory). The currency in which this amount is denominated can be found in [amount_details.currency_code](#currency_code-string-mandatory).
- In most scenarios, cross-referencing with the amount field should suffice. But if there are discrepancies or if you’ve set up fees or currency conversions, it’s advisable to verify with `amount_details`.

#### **5. Cash Payments**

For Cash on Delivery transactions, the [result](#result-string-mandatory) field will specifically be `cod`. This helps differentiate offline payments from online ones.

By understanding and interpreting these fields correctly, you can ensure accurate and timely acknowledgment of all your payments, be they online or offline.

#### **6. Verifying the Signature**

Every webhook payload includes a `signature` field — an HMAC-SHA256 hash that proves the payload came from Ottu and hasn’t been tampered with. **Always verify this signature before processing the payment.**

For implementation details and code examples in Python, PHP, Node.js, Java, C#, Ruby, and Go, see [Verify Signatures](./verify-signatures).

:::danger
Never process a payment webhook without verifying the signature. An unverified payload could be forged by an attacker.
:::

#### **7. Using PG Params**

The `pg_params` object contains normalized payment gateway response fields. Instead of parsing the raw `gateway_response` (which varies by gateway), use `pg_params` for consistent field access:

- **`pg_params.card_number`** — masked card number used for the transaction
- **`pg_params.auth_code`** — authorization code from the gateway
- **`pg_params.transaction_id`** — gateway’s transaction identifier
- **`pg_params.result`** — gateway’s normalized transaction result
- **`pg_params.rrn`** — retrieval reference number for disputes and reconciliation
- **`pg_params.decision`** — gateway’s final decision (ACCEPT, REJECT, REVIEW)

:::tip Why pg_params matters
Ottu normalizes responses from all payment gateways into these fixed fields. This means you can switch gateways — from KNET to MPGS to Cybersource — without changing a single line of your webhook handling code. Instead of parsing each gateway’s unique response format, just read from `pg_params`.
:::

For the complete list of `pg_params` fields, see the [Params](#params) section above.

For general webhook setup and configuration, see the [Webhooks Overview](./).

## What's Next?

- [**Operation Events**](./operation-events) — Webhook notifications for refunds, captures, and voids
- [**Verify Signatures**](./verify-signatures) — Validate webhook authenticity with HMAC-SHA256
- [**Webhooks Overview**](./) — Setup, delivery guarantees, and configuration
