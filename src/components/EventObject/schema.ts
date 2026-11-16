// The format 3 webhook event, as a JSON schema for the Stripe-style field list
// (src/components/ApiReference/Fields.tsx). The texts are the event catalogue's
// tables (docs/developers/webhooks/event-catalogue.mdx); keep the two in step.
import type { Schema } from "@site/src/components/ApiReference/schema";

const S = (description: string): Schema => ({ type: "string", description });
const SN = (description: string): Schema => ({ type: ["string", "null"], description });
const money = (description: string): Schema => ({ type: ["string", "null"], description });

const ACTOR = (description: string): Schema => ({
  type: "object",
  description: `${description} One shape wherever a "who" appears; all five keys are always present, and a value that does not apply is \`null\`. See [Actor](#actor).`,
  properties: {
    kind: {
      type: "string",
      enum: ["user", "api_key", "customer", "system", "connector"],
      description:
        "`user` (a dashboard or Basic-auth user), `api_key` (a call made with your API key), `customer` (the payer), `system` (Ottu itself, such as the expiry job) or `connector` (the gateway reported it).",
    },
    id: {
      type: ["integer", "string", "null"],
      description: "The user id for `user`, the `customer.id` for `customer`, otherwise `null`.",
    },
    first_name: SN("Filled in for `user`."),
    last_name: SN("Filled in for `user`."),
    email: SN("Filled in for `user`."),
  },
});

const ATTEMPT_PROPERTIES: Record<string, Schema> = {
  result: SN("The attempt state the [catalogue](#catalogue) gives, such as `success`, `failed` or `pending`."),
  message: SN(
    "Text of the attempt. A successful or rejected attempt carries one of the [texts](#messages) in the payment's language; otherwise it is the attempt's own message.",
  ),
  channel: {
    type: ["string", "null"],
    enum: ["hosted", "web_sdk", "mobile_sdk", "api", null],
    description: "Where the payer paid. Payer tries only.",
  },
  form_of_payment: {
    type: ["string", "null"],
    enum: ["redirect", "card", "token", "apple_pay", "google_pay", "samsung_pay", "stc_pay", "urpay", "wallet", null],
    description: "How the payer paid. Payer tries only.",
  },
  card: {
    type: "object",
    description:
      "The card used in this attempt. All `null` (and `agreements` `[]`) when there is no card.",
    properties: {
      number: SN("First six and last four digits, the rest hidden, such as `4111 11** **** 1111`."),
      brand: SN("Such as `visa`."),
      scheme: SN("Such as `VISA`."),
      bin: SN("The first six digits."),
      expiry_month: SN("`MM`."),
      expiry_year: SN("`YYYY`."),
      name_on_card: SN("As the payer typed it."),
      token: SN("Set when the card is saved."),
      cvv_required: { type: ["boolean", "null"], description: "Whether the saved card needs its CVV to pay." },
      is_preferred: { type: ["boolean", "null"], description: "The payer's preferred saved card." },
      agreements: { type: "array", items: { type: "object" }, description: "Agreements tied to the saved card. `[]` when none." },
    },
  },
  connector: {
    type: "object",
    description:
      "Everything at the gateway. `currency`, `amount`, `fee` and `total` are in the **gateway's** currency; on a converted payment, `amount` and `totals` at the top level stay in the session currency.",
    properties: {
      code: SN("Your gateway configuration code."),
      identifier: SN("The gateway connector."),
      processor: SN("The processor behind the connector."),
      reference_number: SN("The attempt id Ottu sends to the gateway. A refund or capture has its own."),
      currency: SN("The gateway's currency, ISO 4217."),
      amount: money("The event's amount in the gateway's currency."),
      exchange_rate: SN("Converts the session currency to the gateway currency."),
      fee: money("The fee in the gateway's currency."),
      total: money("`amount + fee`."),
      params: {
        type: "object",
        description:
          'Normalised gateway attributes, each with a bilingual label: `{"rrn": {"label": {"en": "RRN", "ar": "…"}, "value": "530812345678"}}`. See [PG Params](/developers/webhooks/pg-params). `{}` when none.',
      },
      responses: {
        type: "array",
        description:
          "Every gateway call of the attempt, oldest first. A card number in `body` is cut. `[]` when none.",
        items: {
          type: "object",
          properties: {
            step: {
              type: "string",
              enum: ["pay", "capture", "refund", "void", "queue", "approve", "reject"],
              description: "A queued refund shows `queue`, then `approve` or `reject`.",
            },
            at: S("When the call was made, ISO 8601 UTC."),
            body: { type: "object", description: "The gateway's own response, as JSON." },
          },
        },
      },
    },
  },
};

const ADDRESS: Record<string, Schema> = {
  line1: SN("First address line."),
  line2: SN("Second address line."),
  city: SN("City."),
  state: SN("State or region."),
  country: SN("ISO 3166-1 alpha-2 code, such as `KW`."),
  postal_code: SN("Postal code."),
};

export const EVENT_SCHEMA: Schema = {
  type: "object",
  properties: {
    id: S(
      "The event id, `evt_` followed by 26 characters. Identical on every retry and on every URL that receives the event, and sent as the [`Idempotency-Key`](/developers/webhooks/delivery-and-retries#idempotency-key) header. De-duplicate on it.",
    ),
    event: S("The event name, such as `payment.paid`. See the [catalogue](#catalogue)."),
    created: S("When Ottu recorded the event, UTC, `YYYY-MM-DDTHH:MM:SSZ`."),
    version: { type: "integer", description: "Always `3` for this format." },
    is_sandbox: {
      type: "boolean",
      description: "`true` when the payment runs on a sandbox gateway. See [`is_sandbox`](#is-sandbox).",
    },
    merchant_id: S("Your merchant domain, such as `merchant.ottu.net`."),
    initiator: ACTOR("Who caused this event."),
    data: {
      type: "object",
      description:
        "The payment, flat, with the same keys in **every** event. Every key is always present: an empty value is `null`, `{}` or `[]`, never a dropped key and never `\"\"`.",
      properties: {
        session_id: S("The payment you created, on every event, including capture, refund and void events."),
        order_no: SN("Your order reference."),
        payment_type: {
          type: ["string", "null"],
          enum: ["one_off", "auto_debit", "save_card", "auto_pay", null],
          description: "How the payment was set up.",
        },
        language: SN("The payment's language."),
        amount: S("The session's original amount, with the currency's decimals (`\"10.000\"` KWD, `\"100.00\"` QAR)."),
        currency: S("ISO 4217 code of the session."),
        status: S("The status of the transaction the event is about. See the [catalogue](#catalogue)."),
        operation: {
          type: "string",
          enum: ["purchase", "authorize", "capture", "refund", "void"],
          description: "Never `null`. The payment's own (`purchase`, `authorize`), or `capture`, `refund`, `void` on a child's event.",
        },
        processed_at: S("When the transaction reached `status`, ISO 8601 UTC."),
        ...ATTEMPT_PROPERTIES,
        totals: {
          type: "object",
          description: "Money strings in `currency`, fees excluded.",
          properties: {
            paid: S("Paid so far."),
            settled: S("Settled so far."),
            refunded: S("Refunded so far: the running total."),
            refund_pending: S("Refunds the gateway has not confirmed yet."),
            voided: S("Voided so far."),
            remaining: S("What is still due."),
          },
        },
        customer: {
          type: "object",
          description: "The payer.",
          properties: {
            id: SN("Your customer id."),
            email: SN("Email."),
            first_name: SN("First name."),
            last_name: SN("Last name."),
            phone: SN("Phone, international format."),
            phone_2: SN("Second phone."),
            birthdate: SN("`YYYY-MM-DD`."),
          },
        },
        billing_address: { type: "object", description: "The billing address.", properties: ADDRESS },
        shipping_address: {
          type: "object",
          description: "The billing keys plus the recipient's name and contact.",
          properties: {
            first_name: SN("Recipient's first name."),
            last_name: SN("Recipient's last name."),
            email: SN("Recipient's email."),
            phone: SN("Recipient's phone."),
            ...ADDRESS,
          },
        },
        agreement: {
          type: "object",
          description: "The recurring-payment agreement. All `null` when the payment has none.",
          properties: {
            id: SN("Agreement id."),
            type: {
              type: ["string", "null"],
              enum: ["event_based", "installment", "recurring", "unscheduled", "other", null],
              description: "Agreement type.",
            },
            frequency: {
              type: ["string", "null"],
              enum: ["irregular", "daily", "weekly", "semi_monthly", "monthly", "quarterly", "semi_annually", "yearly", "other", null],
              description: "How often it charges.",
            },
            amount_variability: {
              type: ["string", "null"],
              enum: ["fixed", "variable", null],
              description: "Whether the amount can change between cycles.",
            },
            cycle_interval_days: { type: ["integer", "null"], description: "Days between cycles." },
            total_cycles: { type: ["integer", "null"], description: "Number of cycles." },
            start_date: SN("First day."),
            expiry_date: SN("Last day."),
            max_amount_per_cycle: money("Highest amount one cycle may charge."),
            seller: {
              type: "object",
              description: "The seller named on the agreement.",
              properties: { name: SN("Name."), short_name: SN("Short name."), category_code: SN("Merchant category code.") },
            },
          },
        },
        wallets: {
          type: "array",
          items: { type: "object" },
          description: "One entry per wallet leg of a split payment, each with the attempt keys plus `operation` and `processed_at`. `[]` when none.",
        },
        extra: { type: "object", description: "Your own `extra` data, without `merchant_id`. A card number in it is cut. `{}` when none." },
        created_by: ACTOR("Who created the payment."),
        created_at: S("When the payment was created, ISO 8601 UTC."),
        updated_at: S("When the payment was last modified, ISO 8601 UTC."),
      },
    },
  },
};
