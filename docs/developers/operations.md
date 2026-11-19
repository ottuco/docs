---
title: Operations
sidebar_label: Operations
hide_table_of_contents: true
displayed_sidebar: developerSidebar
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiDocEmbed from "@site/src/components/ApiDocEmbed";
import FAQ, { FAQItem } from '@site/src/components/FAQ';
import OperationsWorkflow from "@site/src/diagrams/flow/OperationsWorkflow";

# Operations

:::warning This version is obsolete
This page describes Operations v2. Use [Operations v3](/developers/operations-v3): one endpoint per operation, a required `Idempotency-Key` on capture, refund and void, and one error format. In v3, `refund_queued` is named `refund_pending` and `invalided` is `invalidated`. To move, follow [Migrate to v3](#migrate-to-v3).
:::

The Operations API lets you perform subsequent actions on existing payment transactions — refund a completed payment, cancel an unpaid link, capture an authorized amount, or void an authorization. Ottu provides a **unified API**: you send the same payload structure regardless of the payment gateway, and Ottu handles the gateway-specific communication.

Ottu supports six operations. Three are **internal** (handled within Ottu's system): [cancel](#cancel), [expire](#expire), and [delete](#delete). Three are **external** (synchronized with the payment gateway): [refund](#refund), [capture](#capture), and [void](#void). When an external operation succeeds, Ottu creates a [child transaction](/developers/reference/payment-states) linked to the original, recording the new state, amount, and [gateway response](/developers/webhooks/pg-params).

:::warning
Operations via the Operations API do not work with **foreign currencies**. If the customer paid using [currency exchange](/developers/getting-started/api-fundamentals) (e.g., MID is KWD but customer paid in USD), external operations will fail. The payment currency must match the MID currency.
:::

## When to Use

- **Refunding a completed payment** — return funds to the customer after a paid or captured transaction.
- **Capturing an authorized payment** — settle funds for transactions in the `authorized` state (full or partial).
- **Voiding an authorization** — cancel an `authorized` transaction before capture, so the customer is not charged.
- **Cancelling an unpaid payment link** — stop a payment that's `created`, `pending`, `cod`, or `attempted`.
- **Expiring stale sessions** — automatically invalidate incomplete payment transactions.
- **Deleting transactions** — remove obsolete or test transactions (soft delete for paid, hard delete for others).

## Setup

Before performing any operation, you need an existing payment transaction with a `session_id` or `order_no`:

1. **Via the [Checkout API](/developers/payments/checkout-api)** — create a payment transaction programmatically.
2. **Via the [Ottu Dashboard](/business/payment-management)** — create a transaction manually.

Store the `session_id` securely — it's required for all operation requests. Prefer `session_id` over `order_no` as it's always present in the response.

## Guide

### Workflow

<OperationsWorkflow />

1. **Merchant sends an operation request** with `session_id`, `operation` type, and optional `amount`.
2. **For internal operations** (cancel, expire, delete) — Ottu updates the transaction state directly.
3. **For external operations** (refund, capture, void) — Ottu communicates with the payment gateway.
4. **On success** — a child transaction is created, linked to the original, recording the result.

### Step-by-Step

All operations use the same endpoint: `POST /b/pbl/v2/operation/`

1. **Send the operation request** with the `operation` type, `session_id`, and optional `amount`:

    ```json
    {
      "operation": "refund",
      "session_id": "2a956e4c9294c2c0e9253c21b1a592ceb4018c68",
      "amount": "20.00"
    }
    ```

2. **Use the `Tracking-Key` header** (recommended for external operations) to prevent duplicate operations and retrieve status:

    ```
    Tracking-Key: "unique-tracking-id"
    ```

    If you send a subsequent request with the same `Tracking-Key` and `session_id`, Ottu returns the latest status of the original operation instead of creating a new one. The key is stored in the child transaction data on success.

    :::note `Tracking-Key` is for operations, not charges
    Direct-charge endpoints ([Native Payments](/developers/payments/native-payments#idempotency) — Apple Pay, Google Pay, auto-debit, wallet, cash) use a separate **`Idempotency-Key`** header instead. A replayed `Tracking-Key` *returns the original operation's status*, whereas a replayed `Idempotency-Key` on a charge is *rejected with `409 Conflict`* before charging.
    :::

3. **Handle the response** — on success, the response includes the child transaction details (amount, state, gateway response). On failure, an error message indicates why the operation was rejected.

:::tip
Use the `extra` object field for additional gateway-specific parameters. For example, the Instant Fund Gratification (IFG) feature for instant refunds is configured via `extra`.
:::

### Use Cases

#### Internal Operations

##### Cancel {#cancel}

Halts a payment in progress. Applicable to transactions in `created`, `pending`, `cod`, or `attempted` state. The merchant stops a payment that hasn't reached completion.

##### Expire {#expire}

Invalidates an incomplete payment transaction. Targets `created`, `pending`, or `attempted` states. Transitions the transaction to `expired`, from which it cannot be resumed.

##### Delete {#delete}

Removes transactions no longer needed:
- `paid`, `authorized`, or `cod`/`cash` → **soft delete** (removed from reports, recoverable from Deleted Transactions)
- All other states → **hard delete** (permanent removal)

#### External Operations

##### Capture {#capture}

Settles authorized funds. Only applicable to `authorized` transactions. Supports full or partial capture (cannot exceed the authorized amount). Creates a [child transaction](/developers/reference/payment-states) on success.

##### Refund {#refund}

Returns funds to the customer. Applicable to `paid` or captured transactions. For authorized transactions, a capture must be completed first. Supports full or partial refund. Ottu offers an [approval feature](/business/operations/refund-void-access-control) for refunds, enabling a checker role to approve or reject requests.

##### Refund to M-Wallet {#refund-to-wallet}

Instead of returning funds through the original payment gateway, you can refund a payment directly to the customer's **wallet** balance. The customer can then spend that credit at any future Ottu checkout in the same currency. See [M-Wallet](/developers/payments/wallet/) for the full feature overview.

**When to use:**

- The customer's original card has expired or been reissued.
- You want to issue store credit, loyalty, or goodwill credit without payment-gateway fees.
- The original gateway doesn't support refunds for that transaction type.

Set `destination: "wallet"` on the refund operation request. The `destination` field defaults to `"pg"` when omitted, preserving the original refund behavior. See the [API Reference](#api-reference) below for the full request schema and interactive try-it-out.

:::tip Use `Tracking-Key` for idempotency
Wallet credits are immutable — a duplicate refund-to-wallet call creates a second uneditable credit entry (the gateway path fails on duplicates; the wallet path does not). Always include the `Tracking-Key` header so retries deduplicate. See [the Guide above](#guide) for the full idempotency contract.
:::

**Behavior:**

- A wallet account is created automatically if one doesn't exist for the (merchant, customer, currency) combination.
- The credit is recorded as an immutable ledger entry — corrections require an opposing reversal entry.
- The original payment session is linked to the credit entry for audit.
- No PII is stored on the wallet service.
- Disputes against the original payment after a refund-to-wallet can be resolved manually — contact [csd@ottu.com](mailto:csd@ottu.com) to raise a reversal.

**Errors:**

| HTTP | Code | When |
|------|------|------|
| 400 | `account_inactive` | Wallet account is suspended |
| 400 | `policy_violation` | Refund amount violates a wallet policy rule |
| 409 | `idempotency_conflict` | Same Idempotency-Key reused with different payload |
| 422 | `validation_error` | Schema validation failed on the refund payload |

For the full wallet integration, including the read APIs and SDK behavior, see [M-Wallet](/developers/payments/wallet/). For the merchant dashboard workflow, see [Refund to M-Wallet (business docs)](/business/wallet#refund-to-wallet).

##### Void {#void}

Cancels an authorization before capture. Only applicable to `authorized` transactions. The customer is not charged.

:::info
Not all payment gateways support all external operations. If a gateway doesn't support an operation, Ottu rejects the API call with an error message. See [supported operations by gateway](/developers/payments/payment-methods#activating-payment-gateway-codes).
:::

## API Reference

Select the operation to see its example payload and the full interactive API schema:

<Tabs groupId="operation-type" queryString>
<TabItem value="refund" label="Refund">

```json title="Example Request"
{
  "operation": "refund",
  "session_id": "your_session_id",
  "amount": "20.00"
}
```

<ApiDocEmbed path="public-operations.api.mdx" />

</TabItem>
<TabItem value="refund-to-wallet" label="Refund to M-Wallet">

```json title="Example Request"
{
  "operation": "refund",
  "session_id": "your_session_id",
  "destination": "wallet"
}
```

<ApiDocEmbed path="public-operations.api.mdx" />

</TabItem>
<TabItem value="capture" label="Capture">

```json title="Example Request"
{
  "operation": "capture",
  "session_id": "your_session_id",
  "amount": "100.00"
}
```

<ApiDocEmbed path="public-operations.api.mdx" />

</TabItem>
<TabItem value="void" label="Void">

```json title="Example Request"
{
  "operation": "void",
  "session_id": "your_session_id"
}
```

<ApiDocEmbed path="public-operations.api.mdx" />

</TabItem>
<TabItem value="cancel" label="Cancel">

```json title="Example Request"
{
  "operation": "cancel",
  "session_id": "your_session_id"
}
```

<ApiDocEmbed path="public-operations.api.mdx" />

</TabItem>
<TabItem value="expire" label="Expire">

```json title="Example Request"
{
  "operation": "expire",
  "session_id": "your_session_id"
}
```

<ApiDocEmbed path="public-operations.api.mdx" />

</TabItem>
<TabItem value="delete" label="Delete">

```json title="Example Request"
{
  "operation": "delete",
  "session_id": "your_session_id"
}
```

<ApiDocEmbed path="public-operations.api.mdx" />

</TabItem>
</Tabs>

## Migrate to v3 {#migrate-to-v3}

[Operations v3](/developers/operations-v3) does the same six operations. This is what changes in your code.

#### One endpoint per operation {#migrate-endpoint}

**v2:** `POST /b/pbl/v2/operation/` with an `operation` field. **v3:** `/b/pbl/v3/operation/<operation>/`, for example [`/b/pbl/v3/operation/refund/`](/developers/operations-v3#refund), with no `operation` field.

#### `Idempotency-Key` instead of `Tracking-Key` {#migrate-idempotency}

**v2:** an optional `Tracking-Key` header that returns the status of the earlier operation. **v3:** a required [`Idempotency-Key`](/developers/operations-v3#idempotency) on capture, refund and void. The stored answer is replayed.

#### The answer is the payment event {#migrate-answer}

**v2:** the child transaction of the operation. **v3:** the [payment event](/developers/webhooks#data-keys), the same object the webhook carries.

#### `refund_queued` is `refund_pending` {#migrate-refund-pending}

A refund the gateway has not confirmed yet answers `refund_pending` in v3. `invalided` is `invalidated`.

#### A declined refund is a `200` {#migrate-declined-refund}

**v2:** an error. **v3:** `200` with `status` `refund_rejected`, and a `payment.refund_rejected` event. See [Refund results](/developers/operations-v3#refund-results).

#### A gateway that does not answer {#migrate-gateway-timeout}

**v2:** a generic error. **v3:** `504 gateway_timeout` or `502 gateway_error`, which mean the result is unknown. See [After a 502 or 504](/developers/operations-v3#after-504).

#### One error format {#migrate-errors}

**v2:** `detail`, `result`, `operation`. **v3:** `type`, `status`, `request_id`, and `errors` with `code`, `detail`, `attr` and `doc_url`. See the [error reference](/errors).

#### One operation per payment at a time {#migrate-one-at-a-time}

**v2:** not enforced. **v3:** a second capture, refund or void on the same payment answers `409 operation_in_progress` while the first is running.

Your webhooks move separately: see [Migrate to Webhooks v3](/developers/webhooks/migrate-to-v3).

## FAQ

<FAQ>
  <FAQItem question="What happens if I try to perform an unsupported operation?">
    The operation is rejected by Ottu with an error message. See [supported operations by gateway](/developers/payments/payment-methods#activating-payment-gateway-codes).
  </FAQItem>
  <FAQItem question="Can I perform operations on completed transactions?">
    For [refund](#refund), yes — you can refund paid or captured transactions. For [cancel](#cancel) or [expire](#expire), only incomplete transactions are eligible.
  </FAQItem>
  <FAQItem question="Can I partially refund or capture?">
    Yes. Specify the `amount` in the request. If omitted, Ottu attempts the operation on the full transaction amount.
  </FAQItem>
  <FAQItem question="What's the difference between soft delete and hard delete?">
    **Soft delete** applies to `paid`, `authorized`, or `cod`/`cash` transactions — removed from reports but recoverable from Deleted Transactions. **Hard delete** applies to all other states — permanent removal.
  </FAQItem>
  <FAQItem question="What is a child transaction?">
    A sub-transaction created when external operations (refund, capture, void) succeed. It holds the operation details: new state, amount, and gateway response. Linked to the parent transaction.
  </FAQItem>
  <FAQItem question="How do I know which operations a gateway supports?">
    See the [operations supported by each gateway](/developers/payments/payment-methods#activating-payment-gateway-codes).
  </FAQItem>
  <FAQItem question="What's the difference between API-Key and Basic Authentication?">
    [API-Key](/developers/getting-started/authentication#api-key-auth) grants superadmin privileges. [Basic Authentication](/developers/getting-started/authentication#basic-auth) allows granular permission control per operation. Use Basic Auth for production access control.
  </FAQItem>
  <FAQItem question="What permissions are required?">
    Depends on the operation: `payment.capture` for capture, `payment.expire` for expire, etc. Each endpoint in the [API Reference](#api-reference) lists its own under **Permissions**.
  </FAQItem>
  <FAQItem question="What happens when a refund is requested via the API?">
    The request goes directly to the payment gateway — the maker-checker approval flow is not activated for API refunds. The maker-checker flow only applies to refunds initiated via the Ottu dashboard.
  </FAQItem>
</FAQ>

## What's Next?

- [**Webhooks**](./webhooks/operation-events.md) — Receive notifications when operations complete
- [**Checkout API**](./payments/checkout-api.mdx) — Create payment sessions to operate on
- [**Payment States**](./reference/payment-states.mdx) — Understand how operations change transaction states
