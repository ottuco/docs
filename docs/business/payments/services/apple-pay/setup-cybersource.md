---
title: Apple Pay — Cybersource Setup
sidebar_label: Setup Cybersource
---

# Apple Pay — Cybersource Setup

This guide walks you through integrating Apple Pay with Cybersource. By the end, your Cybersource account will be configured to process Apple Pay transactions through Ottu.

**Prerequisites:**

- A valid Cybersource account
- An [Apple Developer account](https://developer.apple.com) with a [Merchant ID](./index.md#creating-merchant-id) already created

The process involves four steps:

1. [Generate a Cybersource RESTful Key](#generating-a-cybersource-restful-key)
2. [Provide the RESTful Keys to Ottu](#providing-the-restful-keys-to-ottu)
3. [Generate a Certificate Signing Request from Cybersource](#generating-a-certificate-signing-request)
4. [Download the Apple Pay Payment Processing Certificate](#download-the-apple-pay-payment-processing-certificate)

## Generating a Cybersource RESTful Key

1. Log in to your Cybersource account.
2. Navigate to **Payment Configuration**.
3. Click **Key Management**.
4. Click the **+ Generate Key** button.

   ![Cybersource Key Management](/img/business/placeholder.png)

5. On the configuration page, select the **REST - Shared Secret** option.
6. Click **Generate Key**.

   ![Select REST - Shared Secret and generate](/img/business/placeholder.png)

7. The **REST API Keys** (Key and Shared Secret) have been generated successfully. Copy both values — you will need them in the next step.

   ![REST API Keys generated](/img/business/placeholder.png)

## Providing the RESTful Keys to Ottu

1. Log in to the **Ottu Dashboard**.
2. Navigate to the **Administration Panel**.
3. Locate the **Gateway** tab.
4. Go to **Settings**.
5. Select the **Cybersource PG Setting** associated with your Apple Pay service.
6. Enter the two generated keys (Key and Shared Secret) in the appropriate fields and save.

   ![Enter RESTful keys in Ottu Gateway Settings](/img/business/placeholder.png)

## Generating a Certificate Signing Request

1. Log in to the **Cybersource portal dashboard**.
2. Under **Payment Configuration**, access **Digital Payment Solutions**.
3. Click the **Configure** button.

   ![Cybersource Digital Payment Solutions](/img/business/placeholder.png)

4. Enter the [Apple Merchant ID](./index.md#creating-merchant-id) associated with your Apple Pay and click **Generate new certificate signing request**.

   ![Enter Merchant ID and generate CSR](/img/business/placeholder.png)

5. Download the generated certificate signing request.

   ![Download the generated CSR](/img/business/placeholder.png)

## Download the Apple Pay Payment Processing Certificate

### Upload the CSR to Apple

1. Log in to your [Apple Developer account](https://developer.apple.com).
2. Go to the [Merchant ID](./index.md#creating-merchant-id) you created and click **Create Certificate** under **Apple Pay Payment Processing Certificate**.

   ![Create Certificate in Apple Developer portal](/img/business/placeholder.png)

3. On the next page, select **No** and click **Continue**.

   ![Select No and continue](/img/business/placeholder.png)

4. Upload the Certificate Signing Request you [generated from Cybersource](#generating-a-certificate-signing-request) and click **Continue**.

   ![Upload the Cybersource CSR to Apple](/img/business/placeholder.png)

5. Download the **Apple Pay Payment Processing Certificate** file.

   ![Download the Payment Processing Certificate](/img/business/placeholder.png)

:::tip
After downloading, your Apple Pay integration with Cybersource is complete. The certificate enables Cybersource to decrypt Apple Pay transaction data for processing through Ottu.
:::

## What's Next?

- **[Apple Pay Configuration](./index.md)** — Return to the main Apple Pay setup guide
- **[Setup MPGS](setup-mpgs)** — Set up Apple Pay with MPGS instead
- **[Payment Gateways](/business/payments/gateways)** — Browse and configure your payment gateways
- **[Payment Services](../)** — Overview of all available payment services
