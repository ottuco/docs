---
title: Test Cards
sidebar_label: Sandbox & Test Cards
toc_max_heading_level: 2
---

# Test Cards

This page contains test card numbers for various payment methods. Use these cards to test your integration in development and sandbox environments. These test cards will not process real transactions.

## Standard Test Cards

| Card Number | Expiry | CVV | Brand | Status | 3DS |
|-------------|--------|-----|-------|--------|-----|
| `4242 4242 4242 4242` | 12/28 | 123 | | <span class="badge-success">Success</span> | Yes |
| `3782 822463 10005` | 12/28 | 123 | Mastercard | <span class="badge-success">Success</span> | Yes |
| `4566 6456 6631 5676` | 12/28 | 123 | | <span class="badge-success">Success</span> | Yes |
| `1234 1243 1631 1859` | 12/28 | 123 | | <span class="badge-success">Success</span> | Yes |
| `3782 822463 10005` | 12/28 | 123 | Visa | <span class="badge-success">Success</span> | Yes |
| `3782 822463 10005` | 12/28 | 123 | | <span class="badge-success">Success</span> | Yes |

## Apple Pay

To test Apple Pay, it is necessary to use their approved test cards, which can be accessed at [developer.apple.com/apple-pay/sandbox-testing/](https://developer.apple.com/apple-pay/sandbox-testing/).

It is important to keep in mind that these cards are only able to be added on Apple developer accounts.

## Ottu PG

Use these test card numbers to simulate different card scenarios in your integration.

| Card Number | Expiry | CVV | Brand | Status | 3DS |
|-------------|--------|-----|-------|--------|-----|
| `4242 4242 4242 4242` | 12/28 | 123 | Visa | <span class="badge-success">Success</span> | Yes |
| `3782 822463 10005` | 12/28 | 123 | American Express | <span class="badge-success">Success</span> | No |
| `5555 5555 5555 4444` | 12/28 | 123 | Mastercard | <span class="badge-declined">Declined</span> | No |
| `4000 0000 0000 9995` | 12/28 | 123 | Mastercard | <span class="badge-declined">Insufficient Funds</span> | No |

If you need additional test cards, please refer to the official documentation.

[View official documentation ↗](https://docs.ottu.com)

## Amazon Pay

Use these test cards for Amazon Pay integration testing.

**Non-3DS:**

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `4005 5500 0000 0001` | 05/25 | 123 | Visa | <span class="badge-success">Success</span> |
| `5123 4567 8901 2346` | 05/25 | 123 | Mastercard | <span class="badge-success">Success</span> |
| `3456 7890 1234 564` | 05/25 | 1234 | Amex | <span class="badge-success">Success</span> |

**3DS:**

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `4557 0123 4567 8902` | 05/25 | 123 | Visa | <span class="badge-success">Success</span> |
| `5313 5810 0012 3430` | 05/25 | 123 | Mastercard | <span class="badge-success">Success</span> |
| `3742 0000 0000 004` | 05/25 | 1234 | Amex | <span class="badge-success">Success</span> |

## Bambora

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `4030 0000 1000 1234` | 05/25 | 123 | Visa | <span class="badge-success">Success</span> |

## Bookeey

Test using merchant login credentials: `66333333/1234`

## Burgan

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `4012 0000 3333 0026` | 01/39 | 100 | Visa | <span class="badge-success">Success</span> |

## Checkout.com

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `4242 4242 4242 4242` | 05/25 | 100 | Visa | <span class="badge-success">Success</span> |

## FSS

| Card Number | Expiry | CVV | Brand | Status | Note |
|-------------|--------|-----|-------|--------|------|
| `4012 0010 3714 1112` | 12/27 | 212 | Visa | <span class="badge-success">Success</span> | Secure Code: 123456, OTP: 123456 |

## N-Genius

| Card Number | Expiry | CVV | Brand | Status | Note |
|-------------|--------|-----|-------|--------|------|
| `4012 0010 3714 1112` | 05/25 | — | Visa | <span class="badge-success">Success</span> | PIN: 123 |

## MiGS

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `5123 4500 0000 0008` | 01/39 | 123 | Mastercard | <span class="badge-success">Success</span> |

## Cybersource

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `4111 1111 1111 1111` | Any future | Any 3 digits | Visa | <span class="badge-success">Success</span> |
| `5555 5555 5555 4444` | Any future | Any 3 digits | Mastercard | <span class="badge-success">Success</span> |

## MPGS

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `5123 4500 0000 0008` | 01/39 | 100 | Mastercard | <span class="badge-success">Success</span> |
| `4508 7500 1574 1019` | 01/39 | 100 | Visa | <span class="badge-success">Success</span> |
| `5120 3501 0006 4537` | Any future | Any 3 digits | Mastercard | <span class="badge-success">Success</span> |
| `5120 3501 0006 4545` | Any future | Any 3 digits | Mastercard | <span class="badge-success">Success</span> |

:::info
Cards 3 and 4 are specifically for receiving token data during tokenization testing.
:::

## KNET

KNET is a popular payment method in Kuwait. Use these test cards for integration testing.

| Card Number | Expiry | PIN | Brand | Status | Note |
|-------------|--------|-----|-------|--------|------|
| `8888 8800 0000 0001` | 09/2030 | Any 4 digits | KNET | <span class="badge-success">Success</span> | For not captured, use expiry 08/21 |

## MADA

| Card Number | Expiry | CVV | Brand | Status | Note |
|-------------|--------|-----|-------|--------|------|
| `5588 4800 0000 0003` | 05/21 | 100 | Mastercard | <span class="badge-success">Success</span> | On 3DS page, click Submit |

## OmanNet

| Card Number | Expiry | CVV | Brand | Status | Note |
|-------------|--------|-----|-------|--------|------|
| `4837 9150 8285 6089` | 06/27 | 766 | Visa | <span class="badge-success">Success</span> | OTP sent to registered email |

## CBK

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `5123 4500 0000 0008` | 01/39 | 100 | Mastercard | <span class="badge-success">Success</span> |

## PayPal

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `3714 4963 5398 431` | 01/39 | 1000 | American Express | <span class="badge-success">Success</span> |

## PayU India

| Card Number | Expiry | CVV | Brand | Status | Note |
|-------------|--------|-----|-------|--------|------|
| `5123 4567 8901 2346` | Any future | 123 | Mastercard | <span class="badge-success">Success</span> | OTP: 123456 |

## NBO

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `5421 6033 0039 7131` | 01/25 | 070 | Mastercard | <span class="badge-success">Success</span> |

## QPay

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `4215 3755 0088 3243` | 06/26 | 1234 | NAPS | <span class="badge-success">Success</span> |
| `4151 8012 0000 3960` | Any future | Any 4 digits | NAPS | <span class="badge-declined">Declined</span> |

OTP for all QPay cards: `1234`

## HyperPay

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `4111 1111 1111 1111` | Any future | 123 | Visa | <span class="badge-success">Success</span> |
| `5204 7300 0000 2514` | Any future | 251 | Mastercard | <span class="badge-declined">Declined</span> |

## Benefit

Expiry date for all cards: any future date. CVV: any 4 digits.

| Card Number | Brand | Status | Response Code |
|-------------|-------|--------|---------------|
| `4600 4101 2345 6789` | Benefit | <span class="badge-success">Approved</span> | 00 |
| `4550 1201 2345 6789` | Benefit | <span class="badge-declined">Expired Card</span> | 54 |
| `4889 7801 2345 6789` | Benefit | <span class="badge-declined">Limit Exceeded</span> | 61 |
| `4415 5501 2345 6789` | Benefit | <span class="badge-declined">Insufficient Funds</span> | 51 |
| `4575 5501 2345 6789` | Benefit | <span class="badge-declined">Refer to Issuer</span> | 78 |
| `4845 5501 2345 6789` | Benefit | <span class="badge-declined">Invalid PIN</span> | 55 |
| `4895 5501 2345 6789` | Benefit | <span class="badge-declined">Do Not Honor</span> | 05 |

## UPG

| Card Number | Expiry | CVV | Brand | Status | Note |
|-------------|--------|-----|-------|--------|------|
| `5078 0362 4660 0381` | 09/25 | 331 | Mastercard | <span class="badge-success">Success</span> | OTP: 111111 |

## AlRajhi Bank

| Card Number | Expiry | CVV | Brand | Status | Note |
|-------------|--------|-----|-------|--------|------|
| `5105 1051 0510 5100` | 12/23 | 123 | Visa / Mastercard | <span class="badge-success">Success</span> | OTP: 123123 |

## Tamara

| Card Number | Expiry | CVV | Brand | Status |
|-------------|--------|-----|-------|--------|
| `5436 0310 3060 6378` | 01/99 | 257 | Mastercard | <span class="badge-success">Success</span> |

## What's Next?

- [**Checkout API**](./checkout-api.mdx) — Create payment sessions to test with these cards
- [**Checkout SDK**](./checkout-sdk/) — Drop-in UI for collecting card details
- [**Native Payments**](./native-payments) — Direct Apple Pay and Google Pay payments
- [**Webhooks**](../webhooks/payment-events) — Receive payment result notifications
