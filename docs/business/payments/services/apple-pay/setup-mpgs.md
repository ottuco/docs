---
title: Apple Pay — MPGS Setup
sidebar_label: Setup MPGS
---

# Apple Pay — MPGS Setup

This guide walks you through integrating Apple Pay with Mastercard Payment Gateway Services (MPGS). By the end, your MPGS account will be configured to process Apple Pay transactions through Ottu.

**Prerequisites:**

- A valid MPGS account
- An [Apple Developer account](https://developer.apple.com) with a [Merchant ID](./index.md#creating-merchant-id) already created

The process involves three steps:

1. [Obtain a CSR from MPGS](#obtaining-apple-pay-csr)
2. [Create the Payment Processing Certificate in Apple](#obtaining-apple-pay-payment-processing-certificate)
3. [Upload the certificate back to MPGS](#providing-apple-pay-payment-processing-certificate)

## Obtaining Apple Pay CSR

1. Log in to the Mastercard Payment Gateway Services (MPGS) portal.
2. Go to **Device Payments**.

   ![MPGS Device Payments section](/img/business/placeholder.png)

3. Click **Add New Certificate**.
4. Download the **Apple Pay Certificate Signing Request (CSR)** file.

   ![Download the CSR file from MPGS](/img/business/placeholder.png)

## Obtaining Apple Pay Payment Processing Certificate

1. Log in to your [Apple Developer account](https://developer.apple.com) and go to the [Merchant ID](./index.md#creating-merchant-id) you created.
2. Under **Apple Pay Payment Processing Certificate**, click **Create Certificate**.

   ![Create Payment Processing Certificate in Apple](/img/business/placeholder.png)

3. On the next page, choose **No** and click **Continue**.

   ![Select No and continue](/img/business/placeholder.png)

4. Upload the CSR file you downloaded from MPGS in the [previous step](#obtaining-apple-pay-csr).

   ![Upload the MPGS CSR file](/img/business/placeholder.png)

5. Download the resulting file — this is your **Apple Pay Payment Processing Certificate**.

   ![Download the Payment Processing Certificate](/img/business/placeholder.png)

## Providing Apple Pay Payment Processing Certificate

1. Log in to the MPGS portal and go to **Device Payments**.

   ![MPGS Device Payments section](/img/business/placeholder.png)

2. Upload the [Payment Processing Certificate](#obtaining-apple-pay-payment-processing-certificate) you downloaded from Apple in the previous step.

   ![Upload certificate to MPGS portal](/img/business/placeholder.png)

:::tip
After uploading, MPGS will process the certificate. Your Apple Pay integration with MPGS is now complete, and transactions can be processed through Ottu.
:::

## What's Next?

- **[Apple Pay Configuration](./index.md)** — Return to the main Apple Pay setup guide
- **[Setup Cybersource](setup-cybersource)** — Set up Apple Pay with Cybersource instead
- **[Payment Gateways](/docs/business/payments/gateways)** — Browse and configure your payment gateways
- **[Payment Services](../)** — Overview of all available payment services
