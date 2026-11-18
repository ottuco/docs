// The prompt a merchant developer pastes into their coding agent to build an
// AutoPay integration. Every rule here is stated on the AutoPay page
// (docs/developers/payments/autopay/index.mdx) or its API Reference; keep it
// in step. Links are absolute so the agent can open them.
const PAGE = "https://docs.ottu.com/developers/payments/autopay";

export const AUTOPAY_PROMPT = `You are adding Ottu AutoPay subscriptions to this codebase. Ottu is a payment platform. With AutoPay we make one Checkout API call, and Ottu runs the rest of the subscription: every billing cycle, the retries, the customer emails and the customer's self-service page. Build it production-ready, following every rule below.

## Before you start
Fill these in, and ask me if they are not clear from the code:
- Language and framework: <for example Python / Django, Node.js / Express, PHP / Laravel>
- Where the Ottu API key is stored: <environment variable or secret manager entry>. Never hard-code it, commit it or log it. Send it as the header "Authorization: Api-Key <key>". The public key does not work on these endpoints.
- Our Ottu domain: <for example https://sandbox.ottu.net while testing, our own merchant domain in production>
- The pg_code to charge: <a code from the Payment Methods API called with auto_debit: true>. A gateway without auto-debit cannot renew a subscription.
- Our user / plan model that a subscription gives access to: <model or table name>

The full reference, with every field: ${PAGE}

## 1. Create the subscription
- POST {domain}/b/checkout/v1/pymt-txn/ with payment_type "auto_pay", customer_email (required), customer_id, an "agreement" object and an "autopay" block (frequency "monthly" or "yearly", recurring_amount, start_date as YYYY-MM-DD, today or later). Copy the required fields from the Create tab: ${PAGE}/?autopay-api=create#create-api
- The checkout amount is the first charge, and it is billing cycle 1. An amount of 0.000 starts a free trial: the card is saved and the first real charge is one period after start_date.
- Store extra.autopay.subscription_id from the 201 response on our record. Every later call takes it.
- Show the checkout in one of two ways: send the customer to checkout_url (Ottu's hosted page), or start the Ottu Checkout SDK (web, iOS, Android or Flutter) on our own page with the session_id from the same response. After the first charge, the only Ottu page the customer opens is their self-service page.
- Each create call makes a new subscription. Guard the button and the request against double submits.

## 2. Give access only from the subscription's status
- The new subscription is "pending_setup". Do not grant access yet.
- GET {domain}/b/pbl/v2/subscriptions/{subscription_id}/ returns the Subscription object. Ottu activates the subscription when the payment result arrives, usually within one to two minutes, and sends the subscription.activated event to our webhook endpoint (Ottu support sets it up). Grant access on that event. If Ottu misses the result, a backup check activates it 20 to about 35 minutes after creation. If it is still pending_setup 35 minutes after creation and at least 15 minutes after the payment, contact Ottu support.
- Grant access on "active" or "trialing". End access on "canceled" or "expired". On "setup_failed", create a new subscription; if the first payment went through, refund it, because Ottu does not.
- "past_due" means a billing cycle used up every retry. Ottu stops billing and never cancels it. Our policy decides access; ask me which one we want.
- The checkout webhook (our webhook_url) only says the first payment was received. Its autopay block is not covered by the body signature and can be missing. Do not grant access from it alone.

## 3. Renewals and events
- Renewals do not call our webhook_url.
- If an Ottu webhook endpoint is subscribed to subscription.* events, handle them: verify the Ottu-Signature v2 header on the raw body, de-duplicate on the event id, read data.subscription_id, then GET the subscription and act on its current status. Events can arrive out of order. Events and what to do: ${PAGE}#webhook-events
- With or without events, run a daily job: POST {domain}/b/pbl/v2/subscriptions/ with {"status": "past_due"} in the body, and follow "next" with POST (not GET) until it is null.

## 4. Cancel
- POST {domain}/b/pbl/v2/subscriptions/{subscription_id}/cancel/ with {"mode": "immediate"} or {"mode": "at_period_end"}.
- The Idempotency-Key header is required: a new UUID v4 per cancel, stored with our cancel record so a retry sends the same key.
- at_period_end keeps the status until the paid period ends. Ottu refuses it with 422 while a payment is due or in progress (past_due, or a cycle being retried); use immediate then.
- A running subscription cannot be edited. To change the amount or plan, cancel it and create a new one.

## 5. Tests
- On the sandbox, use pg_codes ["ottu-sandbox-kwd"] and pay with card 411111111111111 (success). 411111111111114, 411111111111115 and 411111111111116 save on the first payment and decline every renewal.
- Unit test: the status-to-access mapping for all seven statuses, the double-submit guard, the cancel retry with the same Idempotency-Key, and the daily past_due job with paging.

Do not invent field names. If something here is unclear or a field is missing from the reference, stop and ask me.`;
