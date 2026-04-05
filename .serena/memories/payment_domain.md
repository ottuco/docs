# Payment Domain Context

## Actors
- **Merchant** — business integrating with Ottu, calls server-side APIs, primary audience of dev docs
- **Customer** — end user making payment, interacts only with checkout UI, NEVER calls API directly
- **Ottu** — payment platform, provides APIs/SDKs/checkout/webhooks
- **Payment Gateway (PG)** — bank/processor behind the scenes (KNET, MPGS, Cybersource)

## Key Flow (always get this right)
1. Merchant → Ottu API: creates a session
2. Ottu → Merchant: returns session_id, checkout_url
3. Merchant → Customer: presents checkout UI
4. Customer → Ottu: enters card, authenticates (3DS)
5. Ottu → PG: processes payment
6. Ottu → Merchant: webhook to webhook_url
7. Ottu → Customer: redirect to redirect_url

The merchant is always the API caller. The customer is always the UI user.
