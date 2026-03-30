---
title: Samsung Wallet
sidebar_label: Samsung Wallet
---

# Samsung Wallet

Samsung Wallet allows your customers to complete online payments quickly and securely using their Samsung Wallet. Once enabled, a Samsung Wallet button appears on your web checkout page, giving customers a fast, device-authenticated payment option.

To enable Samsung Wallet, you will:

1. [Create a Samsung Developer account](#create-your-samsung-developer-account)
2. [Set up a Samsung Wallet service in the Developer Portal](#create-a-samsung-wallet-service)
3. [Request approval from Samsung](#request-service-approval-from-samsung)
4. [Share your Service ID with Ottu for final configuration](#share-your-service-id-with-ottu)

## Create Your Samsung Developer Account

1. Visit the Samsung Wallet Developer Portal: [https://pay.samsung.com/developer](https://pay.samsung.com/developer)
2. Register for a Samsung developer membership.
3. When asked about company registration:
   - **If you are the first Samsung Wallet member:** Select **"I am the first Samsung Wallet member of my company."**
   - **If your company already has a Partner ID:** Select **"My company is already registered"** and enter your Partner ID.
4. Contact your Samsung Wallet relationship manager to approve your membership.
5. After approval, log in again at [https://pay.samsung.com/developer](https://pay.samsung.com/developer).

## Create a Samsung Wallet Service

1. Navigate to **My Projects > Service Management**.

   ![Service Management section in the Samsung Wallet Developer Portal](/img/business/placeholder.png)

2. Click **Create New Service**.

   ![Click "Create New Service" to begin setup](/img/business/placeholder.png)

3. Choose **Web Online Payment** as the service type.

   ![Select Web Online Payment as the service type](/img/business/placeholder.png)

4. Fill in the required fields:

   | Field | Description |
   |-------|-------------|
   | **Service Name** | A name to identify this service in the Samsung portal |
   | **Service Country** | The country where this service will operate |
   | **Payment Gateway** | The payment gateway connected to this service |
   | **CSR File** | Upload the Certificate Signing Request file provided by Ottu |
   | **Service Domain** | Your Ottu installation domain (e.g., `merchant.ottu.net`) |

   ![Upload the CSR file and enter your service domain](/img/business/placeholder.png)

5. Click **Save and Next**.
6. Leave the debugging fields empty and click **Done**.

:::tip
Your service is now created. Next, you need Samsung's approval before it can go live.
:::

## Request Service Approval From Samsung

1. Return to the **Service Management** page.
2. Find the service you created.
3. Click **Request** in the Status column.

   ![Use the Request button to submit your service for review](/img/business/placeholder.png)

**Message template for approval request:**

> I would like to request the registration and activation of the Samsung Wallet service having the [service id] within the Samsung Developer Portal. Please assist in enabling the required service permissions.

Replace `[service id]` with your actual Service ID from the portal.

## Share Your Service ID With Ottu

1. Open your **Service Details** page in the Samsung Developer Portal.
2. Copy the **Service ID**.
3. Share it with the Ottu team.

   ![Copy your Service ID from the Service Details page](/img/business/placeholder.png)

Once provided, Ottu will finalize the configuration on their side.

## Completion

After Ottu finishes linking your Service ID, Samsung Wallet will be active and ready for use on your online checkout page.

:::tip
Your customers can now enjoy smooth and secure Samsung Wallet payments directly from your checkout page.
:::

## What's Next?

- **[Apple Pay](apple-pay/)** — Set up Apple Pay for customers on iPhone, iPad, and Mac
- **[Payment Services](./)** — Overview of all available payment services
- **[Payment Gateways](/business/payments/gateways)** — Browse and configure your payment gateways
