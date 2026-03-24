---
title: Apple Pay
sidebar_label: Apple Pay
---

# Apple Pay

Apple Pay is a mobile payment and digital wallet service that lets customers pay using their iPhone, iPad, Mac, MacBook, or Apple Watch. It provides a fast, secure checkout experience — customers authenticate with Face ID, Touch ID, or a device passcode instead of entering card details manually.

Ottu supports Apple Pay in **Kuwait**, **Saudi Arabia (KSA)**, and **Bahrain**.

![Apple Pay overview](/img/business/placeholder.png)

## Apple Pay Configuration Guide

Setting up Apple Pay requires coordination between three portals: your **Apple Developer account**, the **Ottu Dashboard**, and your **payment gateway portal**. You will need to:

1. [Create a Merchant ID](#creating-merchant-id)
2. [Add and verify a domain](#adding-and-verifying-a-domain)
3. [Create Apple Pay certificates](#creating-apple-pay-certificates)
4. [Set up the Payment Processing Certificate for your gateway](#creating-apple-payment-processing-certificate)

:::warning
You must have an Apple Developer account to accept Apple Pay payments. If you do not have one, sign up at [developer.apple.com](https://developer.apple.com).
:::

## Creating Merchant ID

1. Log in to your [Apple Developer account](https://developer.apple.com).
2. Go to the **Certificates, IDs & Profiles** section.

   ![Certificates, IDs & Profiles section](/img/business/placeholder.png)

3. From the **App IDs** dropdown, choose **Merchant IDs**, then click the **+** button to add a new one.

   ![Select Merchant IDs and click the add button](/img/business/placeholder.png)

4. From the identifier types, choose **Merchant IDs** and click **Continue**.

   ![Choose Merchant IDs type](/img/business/placeholder.png)

5. Enter the merchant information:

   | Field | Description |
   |-------|-------------|
   | **Display Name** | A friendly name for this merchant ID (e.g., "Ottu Apple Pay") |
   | **Description** | A short description of the merchant ID |
   | **Identifier** | Your Ottu installation URL in reverse order. For example, if your domain is `demo.ottu.net`, enter `net.ottu.demo` |

   ![Enter merchant information](/img/business/placeholder.png)

6. Review the provided details and click **Register**.

   ![Review and register the Merchant ID](/img/business/placeholder.png)

## Adding and Verifying a Domain

### Step 1: Register the domain in Apple

1. From the **Identifiers** section, select the Merchant ID you created (e.g., "Ottu Apple Pay").

   ![Select your Merchant ID](/img/business/placeholder.png)

2. Click **Add Domain**.

   ![Click Add Domain](/img/business/placeholder.png)

3. Enter the domain URL you want to register and click **Save**.

   ![Enter domain URL](/img/business/placeholder.png)

4. Download the `.txt` verification file. Keep it ready — you will upload it to Ottu in the next step.

   ![Download the verification file](/img/business/placeholder.png)

### Step 2: Add the Apple Pay service in Ottu

5. Log in to the **Ottu Dashboard** and click the three dots in the upper-right corner to access the **Administration Panel**.
6. From the left-hand sidebar, select **Payment Service**.

   ![Payment Service in the Administration Panel](/img/business/placeholder.png)

7. Click **Add payment service**.

   ![Click Add payment service](/img/business/placeholder.png)

8. Fill out the fields and click **Save**.

   ![Apple Pay service configuration form](/img/business/placeholder.png)

   | Field | Description |
   |-------|-------------|
   | **Name** | The name displayed in dropdown menus and wherever the service is referenced |
   | **Code** | A code that identifies the service in APIs and URLs |
   | **Apple Merchant Identifier** | The unique identifier Apple assigned when you registered your Merchant ID |
   | **Display Name** | The name shown on the Apple Pay payment sheet during transactions |
   | **Domain** | The domain configured for Apple Pay (e.g., `merchant.ottu.net`) |
   | **Domain Verification File** | Upload the `.txt` file you downloaded in step 4 |
   | **PG** | The [payment gateway](/docs/business/payments/gateways) to use with Apple Pay |

9. The new Apple Pay service has been successfully added.

   ![Apple Pay service added successfully](/img/business/placeholder.png)

### Step 3: Verify the domain in Apple

10. Back in the Apple Developer portal, go to **Certificates, IDs & Profiles** and scroll to the **Merchant Domains** section.
11. Click **Verify** next to your domain. Apple will confirm the verification.

    ![Verify domain in Apple Developer portal](/img/business/placeholder.png)

:::note
If you use your own custom domain alongside Ottu, you must also verify that domain. Follow [Apple's domain verification guide](https://developer.apple.com/documentation/apple_pay_on_the_web/configuring_your_environment#3179109) for instructions.
:::

## Creating Apple Pay Certificates

1. From your Apple Developer account, go to the **Certificates, IDs & Profiles** section.

   ![Certificates, IDs & Profiles](/img/business/placeholder.png)

2. Scroll down to the **Apple Pay Merchant Identity Certificate** section.

3. Click **Create Certificate**.

   ![Create Certificate for Merchant Identity](/img/business/placeholder.png)

### Download the CSR from Ottu

4. Log in to the **Ottu Dashboard**, go to the **Administration Panel**, then select **Payment Service** from the sidebar.
5. Select the payment service associated with your Merchant ID and domain.

   :::tip
   If you have not added the payment service yet, follow the instructions in [Adding and Verifying a Domain](#step-2-add-the-apple-pay-service-in-ottu) above.
   :::

   ![Select the payment service](/img/business/placeholder.png)

6. Click **Download CSR file**.

   ![Download CSR file from Ottu](/img/business/placeholder.png)

### Upload the CSR to Apple

7. Back in Apple, upload the CSR file you downloaded from Ottu.

   ![Upload CSR to Apple](/img/business/placeholder.png)

8. Click **Continue**, then click **Download** to get the certificate (`.CER`) file.

   ![Download the certificate file](/img/business/placeholder.png)

### Upload the Certificate to Ottu

9. From the **Ottu Dashboard**, go to the **Administration Panel** and select **Payment Service**.
10. Select the same Apple Pay service from step 5.
11. Upload the `.CER` file to the **Apple Pay Identifier CER** field and click **Save**.

    ![Upload CER file to Ottu](/img/business/placeholder.png)

After saving, the **PEM Certificate** and **Key File** are generated automatically.

![PEM Certificate and Key File generated](/img/business/placeholder.png)

## Creating Apple Payment Processing Certificate

The Payment Processing Certificate is required by your payment gateway to decrypt Apple Pay transaction data. The setup process differs depending on your gateway.

Ottu supports Apple Pay with **MPGS**, **Cybersource**, and **KNET** gateways. Follow the guide for your gateway:

- **[Setup MPGS](setup-mpgs)** — Integration process for Apple Pay with Mastercard Payment Gateway Services
- **[Setup Cybersource](setup-cybersource)** — Integration process for Apple Pay with Cybersource

:::note
For KNET gateway setup, contact the Ottu support team for assistance.
:::

## What's Next?

- **[Setup MPGS](setup-mpgs)** — Create the Payment Processing Certificate for MPGS
- **[Setup Cybersource](setup-cybersource)** — Create the Payment Processing Certificate for Cybersource
- **[Samsung Pay](../samsung-pay)** — Set up Samsung Pay for customers on Samsung devices
- **[Payment Gateways](/docs/business/payments/gateways)** — Browse and configure your payment gateways
