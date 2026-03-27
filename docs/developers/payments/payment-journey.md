---
title: Payment Journey
sidebar_label: Payment Journey
hide_table_of_contents: true
---

import PaymentJourney from "@site/src/components/PaymentJourney";

# Payment Journey

This interactive guide walks you through a complete payment integration with Ottu. Each step is live — you'll make real API calls to our sandbox, render the actual Checkout SDK, receive real webhook notifications, and query payment status. No real charges are made.

<PaymentJourney />

## What You've Learned

- **Payment Methods API** discovers available gateways dynamically — add or remove gateways in the control panel and they're automatically reflected.
- **Checkout API** creates payment sessions with a single POST call, returning a `session_id` and `checkout_url`.
- **Two payment paths** — redirect customers to Ottu's hosted checkout page, or embed the Checkout SDK directly on your site.
- **Webhooks** deliver payment results to your server in real-time — this is the primary integration mechanism.
- **PG Params** normalize gateway responses into consistent fields — switch gateways without changing your webhook handling code.
- **Payment Status Query** is your fallback when webhooks don't arrive — same response structure, same fields.

## Dive Deeper

- [**Checkout API**](./checkout-api.mdx) — Full API reference with all parameters and response fields
- [**Checkout SDK**](./checkout-sdk/) — SDK integration guides for Web, iOS, Android, and Flutter
- [**Payment Methods**](./payment-methods) — Gateway discovery, filtering, and dynamic updates
- [**Webhooks**](../webhooks/payment-events) — Setup, payload reference, and signature verification
- [**PG Params**](../webhooks/pg-params) — Normalized gateway response fields for consistent webhook handling
- [**Payment Status Query**](./psq) — Throttling rules, automatic inquiry, and timing guidance
- [**Recurring Payments**](../cards-and-tokens/recurring-payments) — Tokenization and auto-debit for saved cards
- [**Operations**](../operations) — Refund, capture, void, cancel, and expire payment transactions
- [**Payment States**](../reference/payment-states) — Complete state machine reference for payment transactions and attempts
