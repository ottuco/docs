// Sample responses for the Live Demo walk-through, shown only when the sandbox cannot create a
// subscription. Field names and shapes follow the AutoPay v3 subscription object. Not from a live call.
const SUB_ID = "sub_sample0001";
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
  customer_email: "demo@example.com",
  customer_first_name: "Demo",
  customer_id: "cust_sample",
  gateway_account: "Credit-Card",
  is_sandbox: true,
  order_no: "demo-order-1001",
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
    subscription_status: "active",
    cycle_number: 1,
    cycle_status: "paid",
    next_billing_date: "2026-12-06",
    event_type: "cit_success",
  },
};

export const sampleSubscription = {
  subscription_id: SUB_ID,
  status: "active",
  order_no: "demo-order-1001",
  plan_name: "",
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
  customer: { id: "cust_sample", email: "demo@example.com", first_name: "Demo", last_name: null },
  card: { brand: "VISA", number: "411111******1111", token: null },
  cancellation: { at_period_end: false, cancel_date: null, canceled_at: null, reason: null },
  setup_session_id: SESSION_ID,
  latest_session_id: SESSION_ID,
  status_changed_at: "2026-11-06T10:02:11Z",
  current_cycle: { cycle_number: 2, scheduled_date: "2026-12-06", amount_due: "9.900", status: "scheduled" },
};

export const samplePageLink = {
  page_token: "sample-page-token",
  page_url: "https://merchant.example.com/en/subscription/sample-page-token",
};

export const sampleCancelResponse = {
  ...sampleSubscription,
  next_billing_date: null,
  cancellation: { at_period_end: true, cancel_date: "2026-12-05", canceled_at: null, reason: null },
};
