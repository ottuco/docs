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

export const sampleWebhook = {
  session_id: SESSION_ID,
  state: "paid",
  extra: { autopay: { subscription_id: SUB_ID } },
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
