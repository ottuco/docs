// The prompt a merchant developer pastes into their coding agent to build an
// Ottu webhook receiver (webhooks v3). Every rule here is stated on a docs page
// (docs/developers/webhooks/*) or is marked as our advice; keep it in step.
// Links are absolute so the agent can open them.
const DOCS = "https://docs.ottu.com/developers/webhooks";

export const WEBHOOKS_PROMPT = `You are adding an Ottu webhook receiver to this codebase. Ottu is a payment platform: it sends a signed HTTPS POST to our endpoint whenever something happens to a payment (created, paid, refunded, and so on). Build it production-ready, following every rule below.

## Before you start
Fill these in, and ask me if they are not clear from the code:
- Language and framework: {for example Python / Django, Node.js / Express, PHP / Laravel}
- Where the Ottu HMAC key is stored: {environment variable or secret manager entry}. The key is the HMAC Key on the Webhook Config page of the Ottu Administration panel. Never hard-code it, commit it or log it.
- Our order / payment model that a webhook updates: {model or table name}

Build for Ottu webhooks v3: the body is an event with "version": 3 and an "event" key. It is on when Version is 3 on the Webhook Config page (Ottu dashboard > Administration panel > Webhook > Webhook Config). If the bodies we receive have no "event" key, tell me before building: the account is still on the old webhooks, and the way to move is ${DOCS}/migrate-to-v3

Docs to open when in doubt:
- Setup and the receiver, step by step: ${DOCS}
- Events, fields and example bodies: ${DOCS}#api-reference
- Signatures and test vectors: ${DOCS}/verify-signatures
- Delivery, retries and Idempotency-Key: ${DOCS}#delivery-and-retries
- Which fields to match before fulfilling or refunding: ${DOCS}#reconciliation

## 1. The request Ottu sends
- Method POST, body JSON, UTF-8.
- Headers to read:
  - Ottu-Signature: t={unix_seconds},v2={hex}. The signature. t is new on every attempt.
  - Idempotency-Key: the event id (evt_...), the same as "id" in the body.
  - Content-Type: application/json.
- Body: the envelope {id, event, created, version, is_sandbox, merchant_id, initiator, data}. "data" is the payment itself, flat, with the same keys in every event; every key is always present (empty values are null, {} or []).

## 2. The route
- One POST endpoint, HTTPS only, publicly reachable, with no redirect in front of it (Ottu does not follow 3xx; a redirect counts as a failure).
- Exempt it from CSRF protection and from session or login middleware: it is server to server, and the signature is the authentication.
- Read the RAW body bytes. Do not let the framework parse or re-serialise JSON before verification (Express: express.raw(), Flask: request.get_data(), Django: request.body, PHP: file_get_contents('php://input')).

## 3. Verify the signature, exactly like this
1. Take the Ottu-Signature header. If it is missing, reject with 401.
2. Split it on "," and each part on the first "=". Read the parts by name (t, v2), never by position. If t or v2 is missing, reject with 401.
3. If |now - t| > 300 seconds, reject with 401 (replay protection). Use the server clock in UTC seconds; keep the server clock synced (NTP).
4. message = the bytes of t (as sent, a decimal string) + "." + the raw body bytes.
5. expected = HMAC-SHA256(key, message), hex-encoded, lowercase.
6. Compare expected with v2 using a constant-time comparison (hmac.compare_digest, crypto.timingSafeEqual, hash_equals). Never == or ===.
7. Only after it matches, parse the JSON.
Pitfalls that break the signature: parsing then re-encoding the JSON (changes spacing, key order and non-ASCII escaping), decoding the body with a non-UTF-8 charset, trimming whitespace or a trailing newline, using a key with spaces around it.
Unit test it with Ottu's published vector:
- key pu9MpX3yPR, t 1792417440
- raw body (UTF-8): {"id":"evt_1","data":{"customer_first_name":"Zoë احمد"}}
- expected v2: b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e
- pass now = 1792417440 into the verifier in the test (with the real clock the vector is correctly rejected as too old)
- must be rejected: t 1792417441, key wrongkey000, the body re-serialised with non-ASCII escaped

## 4. Answer fast, work later
- Ottu waits 15 seconds by default. Do the minimum in the request: verify, de-duplicate, store the raw event, answer.
- Do the business work (update the order, send emails, release goods) in a background job or queue that reads the stored event.
- Ottu reads only the status code, never our response body.

## 5. Response codes (handle errors gracefully)
- Signature missing or invalid: 401. Do not process. Ottu retries; this usually means a wrong key or a parsed body.
- Body is not valid JSON after a valid signature: 400 (should never happen).
- Event id already processed: 200, and do nothing else.
- Unknown event name or unknown keys: 200, store it, change nothing. Ottu adds events over time.
- Our database or queue is temporarily down, so we cannot store the event: 503. Ottu retries.
- Stored successfully: 200 (any 2xx is success).
- Never let an exception in our business logic turn into a 500 for an event we already stored: the job retries on our side, not Ottu's.
- Ottu treats 3xx, 4xx, 5xx, timeouts and connection errors as failures and tries 8 times in total (the first try plus 7 retries) over about 42 hours, with the same id and the same body bytes. After the last failure Ottu emails the addresses in the webhook configuration once.
- Log every rejection with its reason (bad signature, stale t, bad JSON) and the event id when known, so failures can be traced. Alert on a burst of 401s: it usually means the key changed.

## 6. De-duplicate
- Store each processed event id with a UNIQUE constraint, in the same transaction as the business change, so a crash never applies an event twice.
- The same event can arrive more than once (retries, a manual re-send, or two of our URLs configured for the same event); processing an id twice must change nothing.

## 7. How our system reacts to each event
Branch on "event" and data.operation, never on the human text in data.message.
- payment.created: record that the payment exists; nothing to fulfil.
- payment.pending: the payer opened the payment page; optional, for analytics. Sent once.
- payment.attempted: one try failed but the payer can still pay; do not cancel the order.
- payment.authorized: money is held, not taken. Reserve stock; capture later.
- payment.paid with data.operation "purchase": paid. Mark the order paid and fulfil it.
- payment.paid with data.operation "capture": an authorized payment was captured; data.totals.paid is the amount captured so far.
- payment.cod: cash on delivery was acknowledged by the merchant; mark accordingly.
- payment.failed: final failure; release reserved stock and tell the customer.
- payment.canceled / payment.expired / payment.invalidated: the payment will not complete; close or release the order.
- payment.refund_pending: the gateway accepted a refund but has not confirmed it; show "refund in progress", do not mark refunded yet.
- payment.refunded: money went back; data.totals.refunded is the running total (partial refunds add up).
- payment.refund_rejected: the refund failed; the money did not go back. Alert a human.
- payment.voided: the authorization was released; nothing will be charged.
- payment.deleted: the payment was archived on Ottu's side; keep our records.
Capture, refund and void events describe the child transaction: data.status, data.result and data.connector.reference_number are that operation's own, while data.session_id and data.order_no stay the original payment's.

## 8. Before you fulfil an order or move money
- Find our order by data.order_no (our reference) or data.session_id (Ottu's).
- Check that data.amount and data.currency match the order (our advice: refuse to fulfil on a mismatch and alert).
- Keep a record of applied data.connector.reference_number values: act only when the event id is new AND that reference has not been applied yet.
- Events can arrive out of order (a retried payment.paid can arrive after a payment.refunded). Order the events of one payment by "created". Never move an order backwards (for example from paid back to pending because a late payment.pending arrived). When two events have the same "created" second, or the final state matters, ask Ottu with the Payment Status Query v3 API: https://docs.ottu.com/developers/payments/psq-v3
- "data" is a snapshot of the payment when the event happened, not its current state.
- "is_sandbox": true is a test payment: never ship goods for it in production.

## 9. Security and privacy
- Do not log the HMAC key, the Ottu-Signature header, or full bodies in production logs. data.card.number is already masked (first six and last four digits); keep it that way and never store a full card number.
- Store the raw body (it is the signed record) in a table with limited access, for audit and replays.

## 10. Tests
- Signature: the vector above (valid), a tampered body, a stale t, a missing header, a missing v2 part.
- A duplicate id is processed once and answers 200.
- One test per event in section 7, using the example bodies on ${DOCS}#api-reference.
- An out-of-order pair (payment.pending after payment.paid) leaves the order paid.
- An unknown event returns 200 and changes nothing.
- Storage down returns 503.

When you finish, list the files you changed, how to run the tests, and the URL I should register in the Ottu webhook configuration.`;
