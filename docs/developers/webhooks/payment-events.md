---
title: Payment Events
sidebar_label: Payment Events
---

# Payment Notification

Payment webhooks are specific to payment events and are triggered on multiple occasions:

1.  #### Post-Payment Completion

    Once a payer has completed the payment process and awaits redirection. To get notified for this event, the [webhook_url](/docs/developers/payments/checkout-api#request-webhook_url) must either be sent via the [Checkout API ](/docs/developers/payments/checkout-api)when the payment transaction is created or set as the default [webhook_url](/docs/developers/webhooks) in the Ottu dashboard to apply for all transactions.

2.  #### Automatic Inquiry by Ottu

    If a payment transaction has an associated [webhook_url](/docs/developers/payments/checkout-api#request-webhook_url), it can be notified during the automatic inquiry process. This can happen immediately after the payer completes the payment process or later if the payment encounters an error. More details about the timings for automatic inquiry can be found [here](/docs/developers/apis/inquiry).

3.  #### Manual Inquiry by Staff

    When a staff member initiates a manual inquiry from the Ottu dashboard.

4.  #### Manual Notification by Staff

    When a staff manually triggers a notification to the [webhook_url](/docs/developers/payments/checkout-api#request-webhook_url) from the Ottu dashboard.

5.  #### Merchant-Initiated Inquiry

    When an [inquiry API](/docs/developers/apis/inquiry) call is initiated by the merchant. Optionally, a notification can be sent to the [webhook_url](/docs/developers/payments/checkout-api#request-webhook_url) associated with the payment transaction or to a new one specified during the inquiry API call.

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

#### agreement <span style={{color: "blue"}}>`object`</span> <span style={{color: "blue"}}>`conditional`</span>

A pre-established contractual agreement with the customer making the payment, allowing the merchant to securely retain and later use their payment details for particular purposes. This might include agreements like regular payments for services such as mobile subscriptions, payments in installments for purchases, arrangements for one-time charges like account reloads, or adhering to common industry practices such as penalty fees for missed appointments

**Presence Condition:**

- The merchant should include it when creating the payment transaction, typically provided during the [first payment](/docs/developers/cards-and-tokens/recurring-payments) setup within the [auto-debit](/docs/developers/cards-and-tokens/recurring-payments) initiation process.\
  It becomes a mandatory requirement when the [payment_type](#payment_type-string-mandatory) is specified as "`auto_debit`".

<details>

<summary>agreement child parameters</summary>

#### id <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

A unique identifier for the agreement

#### amount_variability <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

Presents if the payment amount can vary with each transaction.

#### start_date <span style={{color: "blue"}}>`date`</span> <span style={{color: "blue"}}>`conditional`</span>

&#x20;Agreement starting date.

#### expiry_date <span style={{color: "blue"}}>`date`</span> <span style={{color: "blue"}}>`conditional`</span>

The final date until which the agreement remains valid.

#### max_amount_per_cycle <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

The maximum debit amount for one billing cycle.

#### cycle_interval_days <span style={{color: "blue"}}>`integer`</span> <span style={{color: "blue"}}>`conditional`</span>

The number of days between each recurring payment.

#### total_cycles <span style={{color: "blue"}}>`integer`</span> <span style={{color: "blue"}}>`conditional`</span>

The total number of payment cycles within the agreement duration.

#### frequency <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

Represents how often the payment is to be processed.

#### type <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

This is event-driven, with "`recurring`" as an example.

#### seller <span style={{color: "blue"}}>`object`</span> <span style={{color: "blue"}}>`conditional`</span>

Seller information data including:&#x20;

- `"name": "string",`&#x20;
- `"short_name": "string",`
- `"category_code": "string"`

#### extra_params <span style={{color: "blue"}}>`object`</span> <span style={{color: "blue"}}>`conditional`</span>

&#x20;Provides additional information for payment processing. \
It includes the parameter "`payment_processing_day`" which provide information about the day of the month or a specific date when payment processing should occur, offering more control over the timing of payments.

</details>

:::info
In certain agreement types, the condition state becomes a required element. For further details on which parameters are mandatory for recurring agreements, please refer [here](/docs/developers/cards-and-tokens/recurring-payments).
:::

#### amount <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

Denotes the total sum of the payment transaction, which encompasses the cost of the procured items or services, excluding any supplementary fees or charges. See [amount](/docs/developers/payments/checkout-api#request-amount)

:::info
The merchant should always check if the received amount from Ottu side is the amount of the order, to avoid user changing the cart amount in between.
:::

#### amount_details <span style={{color: "blue"}}>`object`</span> <span style={{color: "red"}}>`mandatory`</span>

Payment transaction due amount details&#x20;

<details>

<summary>amount_details child parameters</summary>

#### currency_code <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

The specified currency represents the denomination of the transaction. Nevertheless, it doesn't necessarily mandate payment in this exact currency. Due to potential currency conversions or exchanges, the final charge may be in a different currency. See [currencies](/docs/developers/getting-started/api-fundamentals).\
3 letters

#### amount <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

Represents the total amount of the payment transaction, which includes the cost of the purchased items or services but excludes any additional fees or charges.

#### total <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

Denotes the comprehensive total of the payment transaction, incorporating both the principal amount and any associated fees. ([amount](#amount-string-mandatory)+[fee](#fee-string-mandatory))

#### fee <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

It indicates the sum disbursed by the customer in their chosen currency for the payment. Note, this currency could vary from the currency used for the transaction.

</details>

#### capture_delivery_address <span style={{color: "blue"}}>`bool`</span> <span style={{color: "blue"}}>`conditional`</span>

By enabling this, you will ask for user's address. If enabled, capture delivery coordinates should also be active.

**Presence Condition:**

- The merchant should add it when setting up the payment transaction.

#### capture_delivery_location <span style={{color: "blue"}}>`bool`</span> <span style={{color: "blue"}}>`conditional`</span>

By enabling this, you will ask for user's delivery location on a map.

**Presence Condition:**

- The merchant should provide it during the creation of the transaction.

#### card_acceptance_criteria <span style={{color: "blue"}}>`object`</span> <span style={{color: "blue"}}>`conditional`</span>

It outlines the rules for a card's payment eligibility\
See the request parameter [card_acceptance_criteria](#card_acceptance_criteria-object-conditional) for more information.

**Presence condition:**

- Any child parameter provided with the [card_acceptance_criteria](#card_acceptance_criteria-object-conditional) object in the request payload will be populated in the response as [card_acceptance_criteria](#card_acceptance_criteria-object-conditional) child parameter.

<details>

<summary>card_acceptance_criteria  child parameters</summary>

#### min_expiry_time <span style={{color: "blue"}}>**`string`**</span> <span style={{color: "blue"}}>`optional`</span>

Specifies the minimum required validity period, in days, for a card to be eligible for payment. If set to 30 days, for example, cards set to expire within the next month would be declined. This ensures short-lived cards nearing their expiration date are filtered out, reducing chances of payment failures. When implementing, balance merchant's operational needs with customer convenience. Setting it too stringent might increase payment declines, while a lenient approach could risk future payment failures.

Additionally, it defaults to 30 days when the `payment_type` is `auto_debit`. If any other payment type is selected, no default value is set.

</details>

#### currency_code <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

The currency code of the payment transaction \
For more details, [https://en.wikipedia.org/wiki/ISO_4217](https://en.wikipedia.org/wiki/ISO_4217)\
3 letters code

### Billing address information

Customer billing address data

**Presence Condition:**

- The presence of each parameter is contingent on the provision of any selection of "customer billing address data" parameters during payment transaction creation.

#### customer_address_city <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

The city where the customer is living and registered\
Max length: 40

#### customer_address_country <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

The country where the customer is living and registered\
Based on ISO 3166-1 Alpha-2 code\
Validation will be performed against existing countries\
Max length: 2

#### customer_address_line1 <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

Customer's street & house data\
Max length: 255

#### customer_address_line2 <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

Additional data for accuracy purpose for `line1`\
Max length: 255

#### customer_address_postal_code <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

Postal code.\
Max length 12 (it may have different length for different countries)

#### customer_address_state <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

State of the customer's `city` (sometimes the same as the `city`)\
Max length 40

#### customer_email <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

Where to pass the customer’s email address\
Have to be a valid email address\
Max length 128

**Presence Condition:**

- It needs to be included when generating the payment transaction.

#### customer_first_name <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

For the customer's first name\
Max length 64

**Presence Condition:**

- The merchant should include it while making the payment of the transaction.

#### customer_id <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>&#x20;

Customer ID is created by a merchant, and stored in the merchant database\
Max length 64

**Presence Condition:**

- The merchant should include it during initiating the payment transaction.

#### customer_last_name <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

For the customer's last name\
Max length 64

**Presence Condition:**

- The merchant should include it while making the payment of the transaction.

#### customer_phone <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

Where to pass the customer’s phone number\
Max length 32

**Presence Condition:**

- The merchant should include it when processing the payment for the transaction.

#### extra <span style={{color: "blue"}}>`object`</span> <span style={{color: "blue"}}>`conditional`</span>

The extra information for the payment details, which the merchant has sent it in key value form.

**Presence Condition:**

- The presence of the element will depend on whether the merchant includes it during transaction creation by adding each element from the plugin field configuration.

For example:

```json
   "extra":{
      "flight-number":"43667",
      "full_name":"abc"
   },
```

#### fee <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

It represents a markup amount on the original amount.\
Max length: 24\
Min value: 0.01

**Presence Condition:**

- The merchant should add it in the [currency configuration](/docs/developers/getting-started/api-fundamentals) and include it during the transaction creation.

#### gateway_account <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

The [code](/docs/developers/payments/checkout-api#request-pg_codes) of the payment gateway used to proceed the payment\
Max length 16

#### gateway_name <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

The name of the [payment gateway](/docs/developers/payments/payment-methods) used to proceed the payment\
Max length 64

#### gateway_response <span style={{color: "blue"}}>`object`</span> <span style={{color: "blue"}}>`conditional`</span>

It will contain the raw payment gateway response sent by the payment gateway to Ottu.

**Presence Condition:**

- It will only be present in response to the PG's callback request for the transaction.

#### initiator <span style={{color: "blue"}}>`object`</span> <span style={{color: "blue"}}>`conditional`</span>

This object contains information about the user who created the transaction from Ottu side, specifically, the user who generated the payment URL

**Presence Condition:**

- It is present only when [Basic Authentication](/docs/developers/getting-started/authentication#basic-authentication) is used, because [API Key Authentication](/docs/developers/getting-started/authentication#private-key-api-key) is not associated with any user.
- Merchant includes the initiator ID in the payload when creating the transaction.

<details>

<summary>initiator  child parameters</summary>

#### id <span style={{color: "blue"}}>`integer`</span> <span style={{color: "red"}}>`mandatory`</span>

It represents the unique identifier of the user who performs the operation.

#### first_name <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`optional`</span>

It represents the first name of the user who performs the operation.\
&lt;= 32 characters

#### last_name <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`optional`</span>

It represents the last name of the user who performs the operation.\
&lt;= 32 characters

#### username <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

It represents the username of the user who performs the operation.\
Required. 150 characters or fewer. Letters, digits and @/./+/-/\_ only.

#### email <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

The email address of the user who performs the operation.\
&lt;= 254 characters

#### phone <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`optional`</span>

It represents the phone number of the user who performs the operation.\
&lt;= 128 characters

</details>

#### is_sandbox <span style={{color: "blue"}}>`bool`</span> <span style={{color: "blue"}}>`conditional`</span>

Whether the transaction was carried out in a sandbox environment.

**Presence Conditions:**

- It will only be present when PG's setting configured as sandbox

#### message <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

A message indicating the cause of a [payment attempt](/docs/developers/reference/payment-states) failure., which is directly related to the payment attempt itself\
Max length 255.

**Presence Condition:**

- It will only be present if a payment attempt records an error.

#### order_no <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

It is a specific code that is assigned to a transaction by the merchant.\
By assigning a unique identifier to each transaction, the merchant can easily retrieve and review transaction details in the future, as well as identify any issues or discrepancies that may arise.\
such like : ABC123_1, ABC123_2\
Max length 128<br/>

**Presence Condition:**

- It will be present only if `order_no` has been provided in the request payload.

#### paid_amount <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

It is the amount that is credited to the merchant's bank account\
Max length: 24\
Min value: 0.01

**Presence Condition:**

- It will only be present if a capture action is being processed on the transaction and the paid amount is recorded.

#### payment_type <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

**Enum:** "`one_off`" , "`auto_debit`"\
Type of payment. Choose `one_off` for payments that occur only once without future commitments. Choose `auto_debit` for payments that are automatically deducted, such as recurring subscriptions, installments, or unscheduled auto-debits. for more information about auto-debit API, please refer to [Auto-Debit API documentation](/docs/developers/cards-and-tokens/recurring-payments).<br/>

If `auto_debit` is selected:

1. [agreement](#agreement-object-conditional) and `customer_id` parameters will also be mandatory.
2. Only `PG codes` supporting [tokenization](/docs/developers/cards-and-tokens) can be selected. As a side effect, the card used for the payment will be associated with the supplied `agreement.id`. This card will be locked, preventing the customer from deleting it from the system until an alternate card is chosen for `auto-debit` payments

#### pg_params <span style={{color: "blue"}}>`object`</span> <span style={{color: "red"}}>`mandatory`</span>

Ottu simplifies payment integration by standardizing inconsistent callback payloads from various payment gateways. Since transaction details like IDs, status codes, amounts, and timestamps vary in structure and labeling, merchants face challenges in processing this data reliably. OTTU extracts the essential details from any gateway’s payload and converts them into a unified `pg_params`object, ensuring a consistent format that simplifies transaction management and integration.

Each parameter in `pg_params` represents a specific transaction-related attribute, stored as an object containing:

- **value**: The actual data returned by the payment gateway.
- **verbose_name_ar**: The Arabic label for the parameter.
- **verbose_name_en**: The English label for the parameter.

These labels (verbose_name_ar/en) can be used to dynamically display user-friendly field names in multilingual interfaces, ensuring clarity and accessibility for users in different languages.

<details>

<summary>pg_params  child parameters</summary>

#### auth_code

Authorization code assigned to the transaction.

#### card_number

Masked credit/debit card number used for the payment.

#### card_type

Type of card used (e.g., Visa, MasterCard).

#### payment_id

Unique identifier assigned to the payment by the gateway.

#### pg_message

Message from the payment gateway regarding the transaction status.

#### post_date

The date when the transaction was processed or recorded.

#### ref

Reference ID used for transaction identification.

#### result

The final transaction status (e.g., Approved, Declined).

#### track_id

A tracking number for monitoring the transaction.

#### transaction_id

Unique identifier assigned to the transaction for reconciliation.

#### card_holder

The name of the person to whom the card is issued.

#### [cardholder_email](https://app.gitbook.com/o/zPYVxVRFHGcXaJwu5Lii/s/Tq4lCgHh9X4VXINxI3L9/~/changes/246/developer/webhooks/payment-notification#cardholder_email)

The email address associated with the cardholder.

#### card_expiry_month

The month in which the payment card expires.

#### card_expiry_year

The year in which the payment card expires.

#### full_card_expiry

A combined field representing the card’s expiry month and year, typically formatted as MM/YY.

#### card_issuer

The financial institution or bank that issued the payment card.

#### receipt_no

A receipt number issued for the transaction, typically for reference purposes.

#### transaction_no

Another form of transaction identifier, possibly used for internal reference.

#### decision

The final decision on the transaction, such as approved or rejected.

#### dcc_payer_amount

The amount in the payer’s currency under Dynamic Currency Conversion (DCC).

#### dcc_payer_currency

The currency used by the payer under Dynamic Currency Conversion (DCC).

#### dcc_payer_exchange_rate

The exchange rate applied when converting the transaction amount to the payer’s currency under DCC.

#### rrn

A unique reference number used to identify the transaction for retrieval or inquiries.

**Example:**

```json
"pg_params:{
    "auth_code":{
        "value":"A1B2C3",
        "verbose_name_ar":"رمز التفويض",
        "verbose_name_en":"Auth Code"
    },
    "card_type":{
        "value":"MasterCard",
        "verbose_name_ar":"نوع البطاقة",
        "verbose_name_en":"Card Type"
    },
    "card_holder":{
        "value":"John Doe",
        "verbose_name_ar":"اسم حامل البطاقة",
        "verbose_name_en":"Card Holder"
    },
    "cardholder_email":{
        "value":"john.doe@example.com",
        "verbose_name_ar":"البريد الإلكتروني لحامل البطاقة",
        "verbose_name_en":"Cardholder Email"
    },
    "card_expiry_month":{
        "value":"02",
        "verbose_name_ar":"شهر انتهاء البطاقة",
        "verbose_name_en":"Card Expiry Month"
    },
    "card_expiry_year":{
        "value":"2026",
        "verbose_name_ar":"سنة انتهاء البطاقة",
        "verbose_name_en":"Card Expiry Year"
    },
    "full_card_expiry":{
        "value":"02/26",
        "verbose_name_ar":"تاريخ انتهاء البطاقة بالكامل",
        "verbose_name_en":"Full Card Expiry"
    },
    "card_number":{
        "value":"4111 **** **** 1234",
        "verbose_name_ar":"رقم البطاقة",
        "verbose_name_en":"Card Number"
    },
    "card_issuer":{
        "value":"ABC Bank",
        "verbose_name_ar":"جهة إصدار البطاقة",
        "verbose_name_en":"Card Issuer"
    },
    "ref":{
        "value":"REF-123456",
        "verbose_name_ar":"معرف المرجع",
        "verbose_name_en":"Reference ID"
    },
    "result":{
        "value":"Success",
        "verbose_name_ar":"النتيجة",
        "verbose_name_en":"Result"
    },
    "track_id":{
        "value":"TRK-98765",
        "verbose_name_ar":"رقم التتبع",
        "verbose_name_en":"Track ID"
    },
    "post_date":{
        "value":"2025-02-10",
        "verbose_name_ar":"تاريخ المعاملة",
        "verbose_name_en":"Post Date"
    },
    "transaction_id":{
        "value":"TXN-456789",
        "verbose_name_ar":"رقم العملية",
        "verbose_name_en":"Transaction ID"
    },
    "payment_id":{
        "value":"PAY-987654321",
        "verbose_name_ar":"رقم الدفع",
        "verbose_name_en":"Payment ID"
    },
    "pg_message":{
        "value":"Transaction Approved",
        "verbose_name_ar":"رسالة بوابة الدفع",
        "verbose_name_en":"PG Message"
    },
    "receipt_no":{
        "value":"RCPT-20250210-001",
        "verbose_name_ar":"رقم الإيصال",
        "verbose_name_en":"Receipt No"
    },
    "transaction_no":{
        "value":"TXNNO-987654",
        "verbose_name_ar":"رقم المعاملة",
        "verbose_name_en":"Transaction NO"
    },
    "decision":{
        "value":"Approved",
        "verbose_name_ar":"القرار",
        "verbose_name_en":"Decision"
    },
    "dcc_payer_amount":{
        "value":"100.00",
        "verbose_name_ar":"المبلغ بعملة الدافع (DCC)",
        "verbose_name_en":"DCC Payer Amount"
    },
    "dcc_payer_currency":{
        "value":"USD",
        "verbose_name_ar":"عملة الدافع (DCC)",
        "verbose_name_en":"DCC Payer Currency"
    },
    "dcc_payer_exchange_rate":{
        "value":"1.15",
        "verbose_name_ar":"سعر صرف الدافع (DCC)",
        "verbose_name_en":"DCC Payer Exchange Rate"
    },
    "rrn":{
        "value":"RRN-987654321",
        "verbose_name_ar":"رقم استرجاع المرجع",
        "verbose_name_en":"RRN - Retrieval Reference Number"
    }
}
```

</details>

#### reference_number <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

It is a unique identifier for the payment attempt, which can be used as a tracking identifier\
Max length 128

#### refunded_amount <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>&#x20;

The payment amount paid back from the merchant to the customer.\
Max length: 24\
Min value: 0.01

**Presence Condition:**

- It will only be present if a refund action is being processed on the transaction and the refunded amount is recorded.

#### remaining_amount <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>&#x20;

The amount remaining to be paid in the transaction. ([amount](#amount-string-mandatory) – [settled amount](#settled_amount-string-conditional))\
Max length: 24\
Min value: 0.01

**Presence Condition:**

- It will only be sent if the editable amount option is turned on.

#### result <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

The result of the [payment transaction attempt](/docs/developers/reference/payment-states). Possible values: `pending`, `success`, `failed`, `canceled`, `error`, `cod`. Check the [Attempt States](/docs/developers/reference/payment-states) section for more details.

#### session_id <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

Ottu unique identifier which gets generated when the transaction is created.\
It can be used to perform subsequent operations, like [retrieve, acknowledge, refund, capture, and cancelation](/docs/developers/operations).\
Max length 128

#### settled_amount <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

**Is the amount with the same currency of the initiating amount,**

- **For editable amount:** It is the amount that the customer enters at the checkout page
- **For on-editable amount:** The settled amount is the same value as the original payment amount

**Presence Condition:**

- It will be present only if the transaction is `paid`, `authorized` or `cod`.

#### signature <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

A cryptographic hash used to guarantee data integrity and authenticity during client-server exchanges. This hash ensures that the API payload has not been tampered with, and can only be verified by authorized parties.

#### &#x20;timestamp_utc <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`datetime`</span> <span style={{color: "red"}}>`mandatory`</span>

It represents the timestamp at which Ottu processed the transaction. While this often corresponds to the payment time, it's important to note that it might not always be the case. Payments can be acknowledged at a later time, so this timestamp might not align precisely with the actual payment time..

#### state <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

It is one of the [Payment transaction state](/docs/developers/reference/payment-states). And could one of the below: \
**created, pending, attempted, authorized, paid, failed, canceled, expired, invalided, or cod.**\
Max length 50

#### transaction_log_id <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

The ID of the transaction log associated with the transaction.\
Max length 32-bit String (2^31 - 1)

**Presence Condition:**

- It will be sent only if the transaction type is BULK as it's a bulk identifier.

#### token <span style={{color: "blue"}}>`object`</span> <span style={{color: "blue"}}>`conditional`</span>

Represents token details.

- **Presence Conditions:**

When user pays with a tokenized card, Ottu will include the token details in the response

<details>

<summary>token child parameters</summary>

#### brand <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

The card brand (e.g., Visa, Mastercard) associated with the card. Display this information for customer reference.

#### auto_debit_enabled <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

Define if provided card token can be used to initiate auto debit requests.

#### customer_id <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

The unique identifier for the customer who owns the card\
Max length: 36

#### cvv_required <span style={{color: "blue"}}>`bool`</span> <span style={{color: "red"}}>`mandatory`</span>

Specifies if the card requires the submission of a CVV for transactions. A card without CVV requirement can be used for auto-debit or recurring payments

#### expiry_month <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

The card's expiration month. Provide this information for transaction processing and validation.\
Max length: 2

#### expiry_year <span style={{color: "blue"}}>`string`</span> <span style={{color: "red"}}>`mandatory`</span>

The card's expiration year. Provide this information for transaction processing and validation.\
Max length: 2

#### is_expired <span style={{color: "blue"}}>`bool`</span> <span style={{color: "red"}}>`mandatory`</span>

A boolean field indicating whether the card has expired. Use this information to determine if the card is valid for transactions and to notify the customer if necessary.

</details>

#### transaction <span style={{color: "blue"}}>`array`</span> <span style={{color: "blue"}}>`conditional`</span>

Transactions resulted to the PG operations performed on the parent transaction\
See [child transaction sate](/docs/developers/reference/payment-states)

**Presence Conditions:**

- It will be sent only if operations processed on transaction and resulted child transaction records.

<details>

<summary>transaction  child parameters</summary>

#### amount <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

The amount of child transaction object represented in transactions Array\
Must be positive\
Max length: 24\
Min value: 0.01

#### currency_code <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

The code represents the used currency.\
3 letters

#### order_no <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

The order_no of child transaction object represented in transactions Array

#### session_id <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

The unique session identifier of child transaction object represented in transactions Array

#### state <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

The state of a child transaction object represented in transactions Array

</details>

#### voided_amount <span style={{color: "blue"}}>`string`</span> <span style={{color: "blue"}}>`conditional`</span>

The payment amount resulted by performing [void](/docs/developers/operations) operation\
Max length: 24\
Min value: 0.01

**Presence Condition:**

- It will only appear if a void action is being performed on the transaction, and the voided amount is documented.

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

**In Conclusion**, As you navigate the intricacies of Ottu’s payment webhooks, it’s paramount to ensure you’re well-acquainted with all the general guidelines. We strongly recommend reviewing our comprehensive [Webhooks page](./) for a holistic understanding. Additionally, if you find yourself with questions or uncertainties, our [FAQ](./#faq) section might already have the answers you seek. We’re committed to ensuring a seamless experience, and your thorough understanding of our systems is a crucial part of that journey.
