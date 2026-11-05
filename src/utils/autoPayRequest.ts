import { getWebhookBaseUrl, type PaymentPlugin } from "@site/src/utils/sandbox";

// Gateway discovery and session creation must name the same plugin (#159191).
export const AUTOPAY_PLUGIN: PaymentPlugin = "e_commerce";

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function buildAutoPayRequest(orderId: string, customerId: string, pgCodes: string[]) {
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setUTCFullYear(today.getUTCFullYear() + 1);
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
      expiry_date: isoDate(nextYear),
    },
    autopay: {
      frequency: "monthly",
      recurring_amount: "9.900",
      start_date: isoDate(today),
      description: "Demo plan - monthly",
    },
  };
}
