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
  id: SUB_ID,
  customer_id: "cust_sample",
  customer_email: CUSTOMER_EMAIL,
  frequency: "monthly",
  currency: "KWD",
  recurring_amount: "9.900",
  first_payment_amount: "9.900",
  start_date: "2026-11-06",
  end_date: null,
  status: "active",
  cancel_at_period_end: false,
  canceled_at: null,
  cancellation_initiator: null,
  agreement_id: "AGR-demo-order-1001",
  next_billing_date: "2026-12-06",
  description: "Demo plan - monthly",
  merchant_reference: ORDER_NO,
  retry_count: 3,
  created_at: "2026-11-06T10:00:00Z",
};

export const samplePageLink = {
  page_token: "sample-page-token",
  page_url: "https://merchant.example.com/en/subscription/sample-page-token",
};

export const sampleCancelResponse = {
  ...sampleSubscription,
  cancel_at_period_end: true,
  cancellation_initiator: "merchant",
};
