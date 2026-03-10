---
title: Native Payments
sidebar_label: Native Payments
hide_table_of_contents: true
---

import ApiDocEmbed from "@site/src/components/ApiDocEmbed";

# Native Payment API

Use the Native Payment API when you want full control of the client experience (web or mobile) and prefer not to use the [Checkout SDK](./checkout-sdk/index.md). Your client or backend collects a payment payload and sends it to Ottu to process the payment for a given [session_id](checkout-api#response-CheckoutPOSTResponse-session_id).

A payment payload can be:

- Wallet payment data (e.g., Apple Pay paymentData, Google Pay paymentMethodData) — typically encrypted by the wallet.
- Gateway token / network token (card-on-file or one-click use cases) — not necessarily encrypted.

Ottu processes the payload with the configured gateway and returns a normalized callback result.

#### [**When to Use**](#when-to-use)

- Apple Pay or Google Pay buttons are rendered and managed by you.
- Existing tokenization has already been implemented and needs to be used to charge with a gateway token.
- Granular, SDK-less control of the UX is required, while Ottu’s orchestration and gateway integrations are still leveraged.

## [Quick Start](#quick-start)

Send a POST request to the payment service endpoint with the payment [session_id](checkout-api#response-CheckoutPOSTResponse-session_id), then the payment service uses the collected `token` to process the payment.

#### Quick Apple Pay Example (cURL)

```json
curl -X POST "https://sandbox.ottu.net/b/pbl/v2/payment/apple-pay/" \
  -H "Authorization: Api-Key GYj5Na8H.29g9hqNjm11nORQMa2WiZwIBQQ49MdAL" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "pg_code": "apple-pay",
      "session_id": "str",
      "payload": {
        "paymentData": {
          ...
        }
      } // the apple payment token without modifications
    }
  }'
```

Ottu securely processes the Apple Pay request and returns a unified success response once the payment is completed.

```json
{
  "result": "success",
  "message": "successful payment",
  "pg_response": {}
}
```

Use the response values to reconcile the payment in your backend and update your order state.

Continue with the sections below to learn more about response fields, error handling, and webhook integration.

## [Authentication](#authentication)

**Supported Methods**

- [Private API Key](../getting-started/authentication.md#private-key-api-key) (Server-Only)
- [Public API Key](../getting-started/authentication.md#public-key) (Client-Safe)
- [Basic Authentication](../getting-started/authentication.md#basic-authentication) (Server-Only)

For detailed information on authentication procedures, please refer to the [Authentication ](#authentication)section.

:::danger

&#x20;The Private API Key must **never** be exposed in any client-side application.

:::

## [Integration Flows](#integration-flows)

1. **Client → Ottu (**[Public API Key](../getting-started/authentication.md#public-key) **)**
   1. The client collects the wallet or tokenized payment payload and calls the Native Payment API directly using the [Public API Key](../getting-started/authentication.md#public-key).
   2. The client receives the API callback response.

If the call is made from the client side, the backend must be synchronized with the payment result by ensuring that one of the following actions is performed:

- The API response is forwarded to the backend, **or**
- The [Payment Status (Inquiry) API](../apis/inquiry) is called by the backend after the client confirms that the payment has been completed.

<figure>
  <img src="/img/payments/native-payments-apple-pay-flow.png" alt="" width="563" />
  <figcaption></figcaption>
</figure>

2. **Client → Backend → Ottu (**[Private API Key](../getting-started/authentication.md#private-key-api-key)**– Recommended)**
   1. The client sends the payment payload to the backend.
   2. The backend calls the Ottu Native Payment API.
   3. The backend receives the payment response callback.
   4. The backend processes the callback response and notifies the client side with the payment status.

<figure>
  <img src="/img/payments/native-payments-google-pay-flow.png" alt="" width="563" />
  <figcaption></figcaption>
</figure>

## [Setup](#setup)

- A valid [session_id](./checkout-api) obtained from the [Checkout API](./checkout-api).
- A Merchant Gateway ID (MID) with the payment service activated and properly configured in Ottu.&#x20;

To complete the setup, the **Service Setup** section for the specific payment service being implemented must be followed, such as:

- [Apple Pay](#apple-pay)&#x20;
- [Google Pay](#google-pay)
- [Auto-Debit (Tokenized Payments)](#auto-debit-tokenized-payments)

If multiple gateways are configured, always include the [pg_code](./checkout-api) corresponding to the MID that has the target payment service enabled.\
**Example:**\
If a transaction has `knet` and `mpgs` `pg_code` but only `knet` supports Apple Pay, you must send \
`pg_code`: `knet` when calling the Apple Pay API.

#### [Checklist](#checklist)

- [x] &#x20;Created a valid [session_id](./checkout-api).
- [x] Completed Apple Pay / Google Pay setup (if applicable).
- [x] Selected the correct invocation model (client or backend).
- [x] Used the appropriate API key type ([Public API Key](../getting-started/authentication.md#public-key) vs. [Private API Key](../getting-started/authentication.md#private-key-api-key)).
- [x] Sent wallet payment payload or gateway token (no raw card data).
- [x] Implemented backend sync logic.

## [Apple Pay](#apple-pay)

:::info

The prerequisites and [checklist](#checklist) mentioned in the general [Setup](#setup) section should be applied. They can be accessed [here](#setup).

:::

#### [Setup](#setup-1)

1. Apple Pay is configured on the client side (iOS / web).
2. The encrypted `paymentData` object is collected from Apple Pay.
3. The payload, along with the [session_id](./checkout-api), is sent to the Ottu Payment API.
4. Ottu processes via the configured Apple Pay gateway and returns a unified result (`succeeded`, `failed`).

:::danger

- Do not modify the Apple Pay payload. Any change invalidates token decryption.
- Include [pg_code](./checkout-api) if multiple gateways are configured.

:::

<ApiDocEmbed path="apple-direct-payment.api.mdx" />

## [Google Pay](#google-pay)

:::info

The prerequisites and [checklist](#checklist) mentioned in the general [Setup](#setup) section should be applied. They can be accessed [here](#setup).

:::

#### [Setup](#setup-2)

1. Google Pay is configured on the client side (Android / web).
2. The wallet payment payload (`paymentMethodData`, `email`, `addresses`, etc.) is collected.
3. The payload, along with the [session_id](./checkout-api) is sent to the Ottu Native Payment API.
4. Ottu processes through the configured gateway and returns a normalized response.

:::warning

- Do not modify the Google Pay payload. Any change invalidates token decryption.
- Include [pg_code](./checkout-api) if multiple gateways are configured.
- If the response contains type: "iframe", render it for 3D Secure authentication.Important:

:::

<ApiDocEmbed path="google-direct-payment.api.mdx" />

## [Auto-Debit (Tokenized Payments)](#auto-debit-tokenized-payments)

:::info

The prerequisites and [checklist](#checklist) mentioned in the general [Setup](#setup) section should be applied. They can be accessed [here](#setup).

:::

#### [Setup](#setup-3)

1. Ensure the token is active and usable for the merchant.
2. Use an existing [session_id](./checkout-api) created via the [Checkout API](./checkout-api).
3. Send the token in the `token` field to Ottu.
4. Ottu processes the payment with the configured gateway and returns the callback result.

Supports CIT ([Cardholder Initiated](../cards-and-tokens/recurring-payments)) and MIT ([Merchant Initiated](../cards-and-tokens/recurring-payments)) transactions.

<ApiDocEmbed path="auto-debit.api.mdx" />

## [FAQ](#faq)

#### 1 Can I call the Native Payment API directly from the client?

Yes, but only with the [Public Key,](../getting-started/authentication.md#public-key) and your backend must remain synchronized.

#### 2 Which model should I use in production?

Always prefer Client → Backend → Ottu using the [Private Key.](../getting-started/authentication.md#private-key-api-key)

#### 3 How do I verify the payment result?

Use the [Payment Status (Inquiry) API](../apis/inquiry).

#### 4 What if my transaction has multiple gateway codes?

Include the `pg_code` for the MID that has the corresponding payment service enabled (e.g., Apple Pay, Google Pay).

#### 5 What happens if I modify wallet data?

The payment will fail — wallet tokens must be sent unmodified.

#### 6 Can I charge saved tokens automatically?

Yes, use the **Native Payment API** for tokenized or recurring payments.
