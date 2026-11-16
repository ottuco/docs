import { getWebhookBaseUrl, type PaymentPlugin } from "@site/src/utils/sandbox";

// Gateway discovery and session creation must name the same plugin (#159191).
export const AUTOPAY_PLUGIN: PaymentPlugin = "e_commerce";

// YYYY-MM-DD of a date in UTC.
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function buildAutoPayRequest(
  orderId: string,
  customerId: string,
  pgCodes: string[],
) {
  // start_date must be today or later in the server's time zone, which the
  // reader's clock doesn't know. Tomorrow in UTC is on or after "today" in
  // every time zone, and a day's delay changes nothing for a sandbox demo.
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 1);
  // As the page says: expiry_date is the last day of the month of cycle 12,
  // which is 11 months after start_date (day 0 of the next month).
  const expiry = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 12, 0),
  );
  return {
    type: AUTOPAY_PLUGIN,
    pg_codes: pgCodes,
    amount: "9.900",
    currency_code: "KWD",
    customer_id: customerId,
    customer_first_name: "Demo",
    customer_phone: "50000000",
    customer_email: `demo.${orderId}@example.com`,
    payment_type: "auto_pay",
    include_sdk_setup_preload: true,
    order_no: orderId,
    webhook_url: `${getWebhookBaseUrl()}/webhook/${orderId}`,
    // AutoPay needs the full recurring agreement; the autopay block repeats the schedule.
    agreement: {
      id: `AGR-${orderId}`,
      type: "recurring",
      frequency: "monthly",
      amount_variability: "fixed",
      cycle_interval_days: 30,
      total_cycles: 12,
      expiry_date: isoDate(expiry),
    },
    autopay: {
      frequency: "monthly",
      recurring_amount: "9.900",
      start_date: isoDate(start),
      description: "Demo plan - monthly",
    },
  };
}
