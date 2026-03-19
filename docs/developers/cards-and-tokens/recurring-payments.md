# Recurring Payments & Auto-Debit

Auto-debit is a financial arrangement where a customer authorizes a merchant to automatically deduct money from their saved card. This covers subscriptions, installments, recurring billing, and event-based charges — all processed without the customer needing to be present after the initial setup.

## Key Concepts

### CIT vs MIT

Auto-debit payments involve two types of transactions:

- **CIT (Cardholder Initiated Transaction)** — The first payment where the customer is present, enters their card details, and authorizes future charges. This establishes the agreement and saves the card token.
- **MIT (Merchant Initiated Transaction)** — Subsequent automatic charges triggered by the merchant using the saved token. The customer is not present during these transactions.

### Agreement

An agreement is a commercial contract between you and your customer that authorizes you to store and use their payment details for subsequent transactions. Each agreement has:

- A unique `id` that you define
- A `type` (recurring, unscheduled, or installment)
- Scheduling parameters (`frequency`, `cycle_interval_days`, `total_cycles`, `expiry_date`)
- Amount rules (`amount_variability`: fixed or variable)

:::warning
Only **one card** can be linked to an agreement at any time. To change the card, a new CIT (customer-present) transaction is required.
:::

### Agreement Types

| Type | Use Case | Required Fields |
|------|----------|-----------------|
| **Recurring** | Subscriptions, regular billing | `id`, `frequency`, `amount_variability`, `expiry_date`, `cycle_interval_days`, `total_cycles` |
| **Unscheduled** | On-demand charges (e.g., account top-ups) | `id`, `frequency` |
| **Installment** | Split payments for a single purchase | `id`, `frequency`, `amount_variability`, `expiry_date`, `cycle_interval_days`, `total_cycles`, `seller` |

## Prerequisites

Before implementing auto-debit, ensure you have:

- A [Payment Gateway](/docs/developers/payments/payment-methods#activating-payment-gateway-codes) with auto-debit capability enabled
- The [Checkout API](/docs/developers/payments/checkout-api) for creating payment sessions
- [Tokenization](tokenization.md) set up — cards must be tokenized before they can be auto-debited
- A [webhook endpoint](/docs/developers/webhooks/index.md) configured to receive payment notifications
- Familiarity with the [User Cards API](user-cards.mdx) for card management

:::tip Boost Your Integration
Ottu offers SDKs and tools to speed up your integration. See [Getting Started](../../getting-started/#boost-your-integration) for all available options.
:::

## Implementation: First Payment (CIT)

The first payment establishes the agreement and saves the customer's card.

### Step 1: Retrieve Payment Gateway Codes (Optional)

Use the [Payment Methods API](/docs/developers/payments/payment-methods) to find `pg_codes` that support tokenization:

```json
POST /b/pbl/v2/payment-methods/

{
  "plugin": "e_commerce",
  "currencies": ["KWD"],
  "operation": "purchase",
  "customer_id": "cust_123",
  "tokenizable": true
}
```

### Step 2: Create Payment Session via Checkout API

Create a payment transaction with `payment_type: auto_debit` and the `agreement` object:

```json
POST /b/checkout/v1/pymt-txn/

{
  "type": "e_commerce",
  "amount": "200.00",
  "payment_type": "auto_debit",
  "currency_code": "KWD",
  "pg_codes": ["credit-card"],
  "customer_id": "cust_123",
  "return_url": "https://yourwebsite.com/return",
  "webhook_url": "https://yourwebsite.com/webhook",
  "card_acceptance_criteria": {
    "min_expiry_time": 30
  },
  "agreement": {
    "id": "A123456789",
    "type": "recurring",
    "amount_variability": "fixed",
    "start_date": "13/12/2023",
    "expiry_date": "01/10/2024",
    "cycle_interval_days": 30,
    "total_cycles": 12,
    "frequency": "monthly",
    "seller": {
      "name": "Your-Business-Name",
      "short_name": "YBN",
      "category_code": "1234"
    }
  }
}
```

**Key parameters:**
- `payment_type` — must be `"auto_debit"`
- `agreement` — defines the billing contract (all fields mandatory for CIT)
- `customer_id` — required for token association
- `card_acceptance_criteria.min_expiry_time` — defaults to 30 days for auto-debit

**Response:**

```json
{
  "session_id": "4a462681df6aab64e27cedc9bbf733cd6442578b",
  "checkout_url": "https://sandbox.ottu.net/b/checkout/redirect/start/?session_id=...",
  "amount": "200.000",
  "currency_code": "KWD",
  "state": "created",
  "payment_type": "auto_debit"
}
```

### Step 3: Present Payment to Customer

Use one of these options to collect the customer's card:

- **Checkout SDK** (recommended) — initialize with the `session_id`. See [Checkout SDK](/docs/developers/payments/checkout-sdk)
- **Redirect to `checkout_url`** — customer sees Ottu's hosted checkout page
- **Redirect to `payment_methods.redirect_url`** — direct card entry for a specific gateway

### Step 4: Receive Webhook with Token

After the customer completes the payment, Ottu sends a [webhook notification](/docs/developers/webhooks/payment-events) with the token:

```json
{
  "session_id": "4a462681df6aab64e27cedc9bbf733cd6442578b",
  "result": "success",
  "state": "paid",
  "payment_type": "auto_debit",
  "customer_id": "cust_123",
  "agreement": {
    "id": "A123456789",
    "type": "recurring"
  },
  "token": {
    "token": "9923965822244314",
    "customer_id": "cust_123",
    "brand": "VISA",
    "number": "**** 1019",
    "pg_code": "credit-card",
    "agreements": ["A123456789"]
  }
}
```

**Save the `token.token` and `token.pg_code`** — you'll need them for subsequent charges.

## Implementation: Subsequent Payments (MIT)

Once you have the token from the first payment, you can charge the customer automatically.

### Step 1: Create a New Checkout Session

Generate a new `session_id` via the [Checkout API](/docs/developers/payments/checkout-api):

```json
POST /b/checkout/v1/pymt-txn/

{
  "type": "e_commerce",
  "pg_codes": ["credit-card"],
  "customer_id": "cust_123",
  "amount": "19.000",
  "payment_type": "auto_debit",
  "currency_code": "KWD",
  "agreement": {
    "id": "A123456789",
    "type": "recurring",
    "amount_variability": "fixed",
    "start_date": "13/12/2023",
    "expiry_date": "01/10/2024",
    "cycle_interval_days": 30,
    "total_cycles": 12,
    "frequency": "monthly",
    "seller": {
      "name": "Your-Business-Name",
      "short_name": "YBN",
      "category_code": "1234"
    }
  }
}
```

:::info
Use the **same** `pg_code`, `agreement.id`, and `customer_id` as the first payment. The amount may vary if the agreement's `amount_variability` is set to `"variable"`.
:::

### Step 2: Call the Auto-Debit API

```json
POST /b/pbl/v2/auto-debit/

{
  "session_id": "19aa7cd3cfc43d9d7641f6c433767b25cbcd6c18",
  "token": "9923965822244314"
}
```

**Success response:**

```json
{
  "result": "success",
  "state": "paid",
  "amount": "19.000",
  "currency_code": "KWD",
  "reference_number": "sandboxAQ5UT",
  "settled_amount": "19.000",
  "paid_amount": "19.000",
  "timestamp_utc": "2023-12-13 13:42:35",
  "token": {
    "token": "992*********",
    "brand": "VISA",
    "number": "**** 1019"
  }
}
```

## Alternative Integration Paths

### One-Step Checkout

The [One-Step Checkout](/docs/developers/payments/checkout-api#one-step-checkout) in the Checkout API combines session creation and payment execution in a single API call. This is useful when you want to charge a saved token without creating a separate session first.

Instead of: Checkout API (get session_id) → Auto-Debit API (charge), you do: One-Step Checkout (create + charge in one call).

See [Checkout API — One-Step Checkout](/docs/developers/payments/checkout-api#one-step-checkout) for details.

### Native Payments

The [Native Payments](/docs/developers/payments/native-payments#auto-debit-tokenized-payments) provides direct token-based payments for scenarios where you need full client-side control. Supports both CIT and MIT transactions.

See [Native Payments — Auto-Debit](/docs/developers/payments/native-payments#auto-debit-tokenized-payments) for details.

## Updating Card Information

Card changes for auto-debit **always require a CIT** (the customer must be present):

### Customer-Initiated Update

1. Customer visits your card management section
2. Your backend creates a new Checkout session with the same `agreement.id`
3. Present the [Checkout SDK](/docs/developers/payments/checkout-sdk) or redirect to `checkout_url`
4. Customer selects or enters a new card
5. After successful payment, the new card is associated with the agreement
6. You receive the updated token via webhook

### Merchant-Requested Update

When a card is about to expire or a payment fails:

1. Notify the customer via email/SMS with a link to update their card
2. Include a direct link to the checkout page
3. Customer completes the card update process (same as above)

:::tip
Set up notifications for upcoming card expirations to avoid disruptions. Prompt customers to update their card details before expiry.
:::

## Error Handling

### Failed Auto-Debit Payments

When an MIT payment fails:

1. **Notify the customer** — send an email/SMS explaining the failure reason
2. **Provide a payment link** — include a `checkout_url` so the customer can pay manually
3. **Retry after 24 hours** — create a new session with appropriate grace period parameters
4. **Allow card update** — the customer may need to update their saved card

Common failure reasons:
- **Insufficient funds** — retry after a delay
- **Expired card** — request card update from customer
- **Gateway decline** — check with payment gateway for details
- **Token invalidated** — requires new CIT to re-establish

### Pre-Charge Notifications (Best Practice)

For recurring billing, notify customers before each charge:
- **1 week before** — upcoming charge notification
- **1 day before** — final reminder with option to modify
- Include a link to update card or cancel subscription

## Best Practices

- **Track schedules** — maintain a scheduling system for recurring payment dates
- **Keep records** — store detailed transaction records for reconciliation and dispute handling
- **Communicate** — send clear pre-charge and post-charge notifications to customers
- **Include links** — always provide direct checkout links in notifications for easy card updates
- **Handle failures gracefully** — implement retry logic with increasing intervals
- **Monitor token health** — track card expirations and proactively request updates

## FAQ

#### 1. Do I need PCI DSS compliance for auto-debit?

No. Ottu handles all sensitive card data securely and never exposes it to merchants. You only store tokens, which are safe to keep in your database.

#### 2. Can I store card tokens in my database?

Yes. Tokens are not actual card numbers — they are secure identifiers generated through [tokenization](tokenization.md). They cannot be used outside of Ottu's payment environment.

#### 3. What if I don't have an agreement ID?

Create a unique identifier for your use case. You can use an existing identifier from your system (e.g., subscription ID, order ID) or generate one specifically for the agreement.

#### 4. When should I save the card token?

Immediately after the first successful payment. While you can always retrieve tokens via the [User Cards API](user-cards.mdx), storing them locally reduces API calls and simplifies your implementation.

#### 5. Can I recover a missed token?

Yes. Use the [User Cards API](user-cards.mdx) with the `agreement.id` to retrieve saved cards associated with the agreement.

#### 6. Can I update an existing agreement?

This functionality is not currently available via API. Contact [support@ottu.com](mailto:support@ottu.com) for assistance.

#### 7. What happens if the customer's card expires?

Transactions using an expired token will fail. Set up card expiration monitoring and proactively notify customers to update their card details. See [Updating Card Information](#updating-card-information).

#### 8. Must I use the Checkout SDK?

No, but it's recommended. You can control the payment flow using [Checkout API](/docs/developers/payments/checkout-api) responses directly. However, the SDK simplifies UI implementation and is required for certain payment methods like Apple Pay and Google Pay.

## What's Next?

- [**Operations**](/docs/developers/operations) — Refund, capture, or void auto-debit transactions
- [**Webhooks**](/docs/developers/webhooks/payment-events) — Handle payment notifications for recurring charges
- [**User Cards**](user-cards.mdx) — Manage saved cards and retrieve tokens
- [**One-Step Checkout**](/docs/developers/payments/checkout-api#one-step-checkout) — Combine session creation and payment in a single call
