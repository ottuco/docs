// Sample responses for the Live Demo walk-through, shown only when the sandbox cannot create a
// subscription. Not from a live call.
const SUB_ID = "sub_sample0001";
const ORDER_NO = "demo-order-1001";
const CUSTOMER_EMAIL = `demo.${ORDER_NO}@example.com`;
const SESSION_ID = "sample-session-0001";

export const sampleCreateResponse = {
  session_id: SESSION_ID,
  state: "created",
  payment_type: "auto_pay",
  extra: { autopay: { subscription_id: SUB_ID } },
};

// Shape from docs/developers/webhooks/payment-events.md (formats 1 and 2; that page is the one for the flat payload,
// format 3 wraps it as data.payment). The top-level `autopay` block is the webhook-context from that page. Values are samples.
export const sampleWebhook = {
  amount: "9.900",
  currency_code: "KWD",
  customer_email: CUSTOMER_EMAIL,
  customer_first_name: "Demo",
  customer_id: "cust_sample",
  gateway_account: "Credit-Card",
  is_sandbox: true,
  order_no: ORDER_NO,
  paid_amount: "9.900",
  payment_type: "auto_pay",
  reference_number: "sample-ref-0001",
  result: "success",
  session_id: SESSION_ID,
  state: "paid",
  signature: "60bf40cf******",
  timestamp_utc: "2026-11-06 10:02:07",
  extra: {
    merchant_id: "ksa.ottu.dev",
    autopay: { subscription_id: SUB_ID },
  },
  autopay: {
    subscription_id: SUB_ID,
    subscription_status: "pending_setup",
    cycle_number: null,
    cycle_status: null,
    next_billing_date: null,
    event_type: null,
  },
};

// Same field names as the API Reference on the AutoPay page (the published OpenAPI spec), so one page shows one shape.
export const sampleSubscription = {
  subscription_id: SUB_ID,
  status: "active",
  order_no: ORDER_NO,
  plan_name: null,
  description: "Demo plan - monthly",
  language: "en",
  amount: "9.900",
  first_payment_amount: "9.900",
  currency: "KWD",
  billing_anchor_day: 6,
  retry_count: 3,
  start_date: "2026-11-06",
  end_date: null,
  next_billing_date: "2026-12-06",
  customer: {
    id: "cust_sample",
    email: CUSTOMER_EMAIL,
    first_name: "Demo",
    last_name: "Customer",
    phone: null,
    phone_2: null,
    birthdate: null,
  },
  card: {
    number: "5123 45** **** 0008",
    brand: "MASTERCARD",
    scheme: null,
    bin: null,
    expiry_month: "01",
    expiry_year: "39",
    name_on_card: null,
    token: null,
    cvv_required: null,
    is_preferred: null,
    agreements: [],
  },
  agreement: {
    id: "AGR-demo-order-1001",
    type: "recurring",
    frequency: "monthly",
    amount_variability: "fixed",
    cycle_interval_days: 30,
    total_cycles: null,
    start_date: "2026-11-06",
    expiry_date: null,
    max_amount_per_cycle: null,
    seller: { name: null, short_name: null, category_code: null },
  },
  cancellation: {
    at_period_end: false,
    cancel_date: null,
    canceled_at: null,
    canceled_by: { kind: null, id: null, first_name: null, last_name: null, email: null },
    reason: null,
    note: null,
  },
  setup_session_id: SESSION_ID,
  created_by: { kind: "system", id: null, first_name: null, last_name: null, email: null },
  created_at: "2026-11-06T10:00:00Z",
  updated_at: "2026-11-06T10:02:07Z",
  latest_session_id: SESSION_ID,
  status_changed_at: "2026-11-06T10:02:07Z",
  notification_config: null,
  current_cycle: null,
};

export const samplePageLink = {
  page_token: "sample-page-token",
  page_url: "https://merchant.example.com/en/subscription/sample-page-token",
};

export const sampleCancelResponse = {
  ...sampleSubscription,
  // An end-of-period cancel drops the next charge and keeps the status.
  next_billing_date: null,
  cancellation: {
    ...sampleSubscription.cancellation,
    at_period_end: true,
    cancel_date: "2026-12-05",
    canceled_by: { ...sampleSubscription.cancellation.canceled_by, kind: "api_key" },
  },
};
