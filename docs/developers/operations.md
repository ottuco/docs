---
title: Operations
sidebar_label: Operations
hide_table_of_contents: true
---

import ApiDocEmbed from "@site/src/components/ApiDocEmbed";

# Operations

In the evolving landscape of businesses, the necessity to perform subsequent operations on a payment often emerges. These may include issuing a refund, or making a payment link unavailable, effectively cancelling a payment to prevent a customer from proceeding with it. Ottu’s Operations API has been meticulously designed to facilitate seamless payment integration between your merchant system and the [Payment Gateway](/docs/developers/payments/payment-methods) (PG). One of Ottu’s standout features is the concept of a Unified API. With this approach, Ottu accepts a uniform payload structure, irrespective of the targeted payment gateway. Ottu takes on the role of managing the intricate communication with the PG, effectively relieving your team of the heavy-lifting. Ottu offers a total of six operations. Three are [Internal Operations](#internal-operations), performed within Ottu’s system itself: [cancel](#cancel), [delete](#delete), and [expire](#expire). If any of these operations are triggered and the payment transaction is in a valid state for that operation, the payment transaction state is updated directly within Ottu’s system. The other three operations are [External Operations](#external-operations), synchronized with the Payment Gateway level: [refund](#refund), [capture](#capture), and [void](#void). For these operations, when a request is initiated by the merchant, Ottu communicates with the corresponding PG to attempt the operation, thus ensuring synchronization.

:::info
Ottu’s Operations API provides a seamless and unified interface for performing subsequent operations on a payment, including refunds, cancellations, and expiration. It ensures consistent communication with different payment gateways, lifting the burden of direct interaction.
:::

Importantly, if a PG accepts an operation, a [child payment transaction](/docs/developers/reference/payment-states) is created within Ottu’s system. This child transaction, [linked](/docs/developers/reference/payment-states) to the original payment transaction against which the operation was triggered, will record the new state along with the PG’s response, the operational [amount](/docs/developers/reference/payment-states), and the [currency code](/docs/developers/payments/checkout-api). For example, if a payment transaction of 100 KWD has been processed and the merchant now wishes to issue a `refund` of 20 KWD, triggering the operation will not change the state or amount of the original payment transaction. Instead, a child transaction will be created within Ottu’s system, reflecting the refunded amount of 20 KWD, the currency, and the new state as `refund`. Please note that **not** all payment gateways support all external operations. Ottu is consistently working to broaden its payment gateway integrations. However, if a particular payment gateway does not offer support for certain operations, Ottu is unable to facilitate those specific operations. In such cases, API calls for unsupported external operations will be rejected by Ottu, with an appropriate error message indicating the lack of support. For a comprehensive list of payment gateways and the operations they support see [Operation Definitions & Conditions](/docs/developers/payments/payment-methods#activating-payment-gateway-codes).

:::warning
Please be aware that operations via the Operations API do not function with **foreign currencies**. If your customer has completed a payment using a [currency exchange](/docs/developers/getting-started/api-fundamentals) (for instance, if the Merchant ID or MID is set to KWD but the customer has paid the amount in USD using Ottu's currency exchange to calculate and display the amount), external operations will not be successful. External operations only work when the payment currency is identical to the MID currency.
:::

The Operations API is part of Ottu’s ongoing commitment to development, and the recent upgrade to **version 2** is testament to this. Nevertheless, the documentation for **version 1** of the operation API remains accessible [here](https://app.gitbook.com/o/QvpaILbKwb9WBfHGe5bZ/s/HliFFcthyaYAsSykrr31/). It’s worth noting that certain conditions must be met to perform operations, and not all PGs support all operations. For more details, please see our section on [Operation Definitions & Conditions.](/docs/developers/payments/payment-methods#activating-payment-gateway-codes)

:::info
Ottu’s Operations API supports both system-side operations `cancel`, `delete`, `expire` and gateway-level operations `capture`, `refund`, `void`, ensuring your transaction data is always in sync with the PG. Remember, availability of gateway-level operations may depend on the specific payment gateway’s capabilities.
:::

## [Setup](#setup)

Before proceeding with any operation, it is essential to have an existing payment transaction. This transaction can be created in one of two ways:

1. **Via the Checkout API:** You can initiate a payment transaction through Ottu’s [Checkout API](/docs/developers/payments/checkout-api). This will create a new transaction and return a unique [session_id](/docs/developers/payments/checkout-api) which you can use for subsequent operations.
2. **Via the Ottu Dashboard:** Alternatively, you can manually create a payment transaction directly from the Ottu Dashboard. Check [Creating Payment Request](/docs/business/dashboard-tour). From the dashboard, you can track and manage all your transactions. See [Payment Tracking](/docs/developers/reference/payment-states).

Once a payment transaction has been initiated, you will receive either a [session_id](/docs/developers/payments/checkout-api) or an [order_no](/docs/developers/payments/checkout-api). It is recommended to use the session_id for operations, as it is always present in the response, whereas order_no is a property defined by the merchant and may not always be available. Remember to securely store these identifiers, as they are essential for performing operations on the payment transaction.

### [Boost Your Integration](#boost-your-integration)

To enhance your integration with Operation APIs such as [Cancel](#cancel), [Expire](#expire), [Delete](#delete), [Capture](#capture), [Refund](#refund), and [Void](#void), consider leveraging our dedicated Python SDK. This SDK simplifies the integration process by encapsulating complex API interactions, thus allowing you to focus on the core functionalities of your business.

**Available Package:**

- **Python SDK:** Streamlines the management of operations like cancellation, expiration, deletion, capture, refund, and void actions through a straightforward, object-oriented interface. [Learn more](https://github.com/ottuco/ottu-py?tab=readme-ov-file#operations)
- **Django SDK:** Seamlessly integrates payment methods into Django projects, offering specialized tools and utilities that simplify payment processes. [Explore details](https://github.com/ottuco/ottu-py?tab=readme-ov-file#django-integration)

Understanding the key concepts and frameworks documented is crucial for utilizing this package effectively and ensuring robust, maintainable integration.

## [Authentication](#authentication)

To interact with Ottu’s Operation API, both [API-Key](/docs/developers/getting-started/authentication#private-key-api-key) and [Basic Authentication](/docs/developers/getting-started/authentication#basic-authentication) methods are supported. Using the API Key for authentication provides superadmin privileges, enabling the performance of any operation. It’s crucial to handle this information with utmost care and restrict its sharing to prevent misuse. For enhanced security, it is recommended to use Basic Authentication and assign specific permissions, ensuring controlled access to different API endpoints.

:::info
For optimal security, we highly recommend using Basic Authentication and assigning specific permissions to control access to various API endpoints.
:::

## [Permissions](#permissions)

**API Key:** Superadmin privileges are automatically granted to the [private API Key](/docs/developers/getting-started/authentication#private-key-api-key). For more information on using the API Key, check this [resource](/docs/developers/getting-started/authentication#private-key-api-key).

**Basic Authentication:** This method works with any user and permission that has access to the system. If a user is a superadmin, they have access to all operations. However, for a more granular control, you can assign specific permissions to the user.

Each action performed on the system is logged and can be traced back to the specific user who performed the operation. For this reason, it’s strongly recommended not to share a single user among multiple people. Instead, create an individual user for each person who needs access. Permissions can be assigned for one or more specific operations.&#x20;

#### Permission codes for each operation:

- `payment.capture`: For the **Capture** operation
- `payment.expire`: For the **Expire** operation
- `payment.refund`: For the **Refund** operation
- `payment.void`: For the **Void** operation
- `payment.cancel`: For the **Cancel** operation
- `payment.delete`: For the **Delete** operation
- `payment.inquiry`: For the **Inquiry** operation

:::info
Remember to assign the relevant permissions to your users based on the operations they need to perform.
:::

## [Internal Operations](#internal-operations)

Internal operations are actions performed directly on Ottu’s system level, affecting the status of transactions without interacting with external payment gateways. They provide control over transaction lifecycles and data management.

### [Cancel](#cancel)

The Payment Cancel operation is employed to halt a payment process in progress. It’s applicable to transactions in the following states:

- `created`
- `pending`
- `cod`
- `attempted`

This operation provides a means for a merchant to stop a payment process that hasn’t reached its completion.

### [Expire](#expire)

The Expire operation is used to automatically invalidate a payment transaction that hasn’t been completed within a certain period of time. This operation targets transactions in these states:

- `created`
- `pending`
- `attempted`

It ensures that lingering incomplete payments are tidied up by transitioning them to an `expired` state, from which they cannot be resumed or completed.

### [Delete](#delete)

The Delete operation allows for the removal of transactions that are no longer needed. The action taken depends on the current state of the transaction:

- For transactions in the `paid`, `authorized`, or `cod/cash` state, a soft deletion is applied. These transactions are removed from reports and dashboard listings but remain retrievable from the Deleted Transactions section.
- For all other transaction states, a hard delete is executed, resulting in the permanent removal of the transactions from the system.

## [External Operations](#external-operations)

External operations involve communication with [payment gateways](/docs/developers/payments/payment-methods), aiming to modify the state of transactions on the payment gateway’s side. These operations provide additional control over the payment lifecycle by allowing further actions after initial payment authorization. They include Capture, Refund, and Void operations. Not all payment gateways support all operations. Check [here](/docs/developers/payments/payment-methods#activating-payment-gateway-codes) to see which operations are supported by each payment gateway.

### [Capture](#capture)

The Capture operation is a function that lets merchants secure authorized funds for transactions that haven’t yet been settled. This operation can only be performed on transactions in the `authorized` state. Merchants can opt to capture the full authorized amount or just a portion of it, however, capturing more than the authorized amount is not possible. If the operation is successful, a [child transaction](/docs/developers/reference/payment-states) linked to the original payment transaction is created, which contains the details of the capture operation. Child transactions can be tracked in the [Child Transaction Table](/docs/developers/reference/payment-states).

### [Refund](#refund)

The Refund operation enables merchants to refund previously captured or paid transactions, effectively returning funds back to the customer’s account when necessary. To carry out a refund on an authorized payment transaction, a prior [capture ](#capture)operation must have been completed and the captured amount must be sufficient to cover the refund. For paid transactions, the refund amount should not exceed the paid amount. The refund can be done either fully or partially.

Just like the Capture operation, a successful refund operation creates a [child transaction](/docs/developers/reference/payment-states) linked to the [parent transaction](/docs/developers/reference/payment-states), containing all the details related to the refund. Ottu also offers an [approval feature](/docs/business/dashboard-tour) for refund operations, enabling merchants to assign a checker role to specific staff members. This checker can approve or reject any refund requests, thus preventing unauthorized or fraudulent refunds.

Additionally, Ottu provides an `extra` object field, which is optional and serves to specify additional parameters for the operation. This field is generally utilized to support the Instant Fund Gratification (IFG) feature. IFG refers to a capability where refunds are processed instantly or very quickly following a transaction cancellation or return request.

### [Void](#void)

The Void operation allows merchants to cancel an `authorized` payment transaction before a capture operation is performed. This means that the transaction won’t be captured and the customer will not be charged. The Void operation is strictly applicable to transactions in the `authorized`state.

## [Tracking-Key Header](#tracking-key-header)

### [Overview](#overview)

The `Tracking-Key`, in the context of the Operation API, is a unique identifier embedded in the header of each [external operation](#external-operations) request initiated by the merchant. This key plays a pivotal role in maintaining the distinctiveness of every operation transaction, ensuring precise tracking and efficient retrieval of the latest status information.

### [Purpose of Tracking Key](#purpose-of-tracking-key)

It enables merchants to obtain the most recent status of an operation without the possibility of triggering **duplicate operations** in subsequent requests when using the same key.

### [Guide: Step by Step](#guide-step-by-step)

In this section will delve into an example illustrating how a merchant can employ the `Tracking-Key`.

#### 1. Perform Operation Request

The merchant initiates the process by including the `Tracking-Key` in the header of the operation API when submitting a request. This key serves as a distinctive identifier, differentiating each operation initiated by the merchant from others.

To prevent the occurrence of multiple operations, the `Tracking-Key`, once added during the initial operation, is stored in the [child payment transaction](/docs/developers/reference/payment-states) data. **Consequently**, if the same `Tracking-Key`is later included in the header of **any** [external operation API](#external-operations) with the `session_id` or `order_no`,whether it was previously associated with the Tracking-Key or not, the system will refrain from initiating a new operation. Instead, it will promptly provide the latest operation status response. \
**Nevertheless,** if the initial operation performed unsuccessfully, the `Tracking Key` will not be stored.

#### **Example:**&#x20;

The merchant initiates a POST [Refund](#refund) request by submitting the [session_id](/docs/developers/payments/checkout-api) of the previous paid transaction and specifying the refund `amount`. Additionally, a new header parameter, `Tracking-Key`, is included, with "`trackingtest`" used as an example value for demonstration purposes.

#### **Header Parameter:**

```json
Tracking-Key: "trackingtest"
```

#### **Body Parameters:**

```json
{
  "operation": "refund",
  "session_id": "2a956e4c9294c2c0e9253c21b1a592ceb4018c68",
  "amount": "1"
}
```

#### 2. **Retrieve the Latest Operation Status**

When the merchant seeks to inquire about the status of a previously conducted operation, he should initiate another operation request using the same `Tracking-Key` value as the one utilized in the initial targeted operation transaction.

- The merchant should include a new header parameter, `Tracking-Key`, with the same value as in the previous operation transaction.
- Alongside the `Tracking-Key`, the [session_id](/docs/developers/payments/checkout-api) / [order_no](/docs/developers/payments/checkout-api) of the specified operation transaction should be provided in the operation request.
- Regardless of the `session_id`/`order_no`, `amount` (no need to provide), and `operation` parameter values provided within the external operation request, the response will consistently provide the latest status of the original operation request from the initial provision of the `Tracking-key` value.

#### Example:

The merchant initiates a new operation request, employing the same `Tracking-Key`, `session_id`, and operation parameters as specified in the last [Example](#example).

#### **Header Parameter:**

```json
Tracking-Key: "trackingtest"
```

#### **Body Parameters:**

```json
{
  "operation": "refund",
  "session_id": "2a956e4c9294c2c0e9253c21b1a592ceb4018c68"
}
```

#### **Response:**

Ottu's system, recognizing the `Tracking-Key` and the associated `session_id` retrieves the relevant transaction details from the database. The response to the operation request includes the latest status information for the origin operation transaction.

```json
{
   "amount":"1.00",
   "amount_details":{
      "currency_code":"SAR",
      "amount":"1.0",
      "total":"1.0",
      "fee":"0"
   },
   "currency_code":"SAR",
   "customer_id":"Example_id",
   "customer_phone":"12345678",
   "extra":{},
   "gateway_account":"Credit-Card",
   "gateway_name":"mpgs",
   "gateway_response":{
      It will contain the raw pg response sent by the pg to Ottu
   },
   "initiator":{},
   "is_sandbox":true,
   "payment_type":"one_off",
   "reference_number":"SMAUGGGLERDK",
   "remaining_amount":"1.000",
   "result":"success",
   "session_id":"cb4b9e4cde8f2ac9664eba743497657d13e3c9b6",
   "signature":"3f312d13**************",
   "state":"refunded",
   "timestamp_utc":"2023-11-23 11:20:50"
}
```

---

<ApiDocEmbed path="public-operations.api.mdx" />

---

:::warning
[Operations API](/docs/developers/operations) are not working for foreign [currenies](/docs/developers/getting-started/api-fundamentals).&#x20;
:::

## [FAQ](#faq)

#### 1. **What happens if I try to perform an operation that is not supported by the Payment Gateway (PG)?**

If you attempt to perform an operation that is not supported by the PG, the operation will be rejected by Ottu with an error message. The list of supported operations for each PG can be found [here](/docs/developers/payments/payment-methods#activating-payment-gateway-codes).

#### 2. **Can I perform operations on a transaction that is already completed?**

For certain operations like [refund](#refund), you can perform operations on transactions that have been successfully completed. However, operations like [cancel](#cancel) or [expire](#expire) can only be performed on transactions that are not yet completed.

#### 3. **Can I partially refund or capture a transaction?**

Yes, for operations like [refund](#refund) or [capture](#capture), you can specify the amount to be actioned. If not specified, Ottu will attempt to perform the operation on the full amount of the transaction.

#### 4. **What does 'soft delete' and 'hard delete' mean?**

**Soft delete** is used for transactions that are `paid`, `authorized`, or `cod`/`cash`. These transactions are removed from reports and dashboard listings, but they're still available in the **deleted transactions** section and can be restored anytime. \
**Hard delete** is used for non-success transactions, which are permanently removed from the system

#### 5. **What does a 'child transaction' mean?**

A [child transaction](/docs/developers/reference/payment-states) is a sub-transaction created when operations like [refund](#refund) or [capture](#capture) are performed. This child transaction holds the details of the operation, including the new state, the [amount](/docs/developers/reference/payment-states), and the [payment gateway](/docs/developers/payments/payment-methods)'s response.&#x20;

#### 6. **How do I know which operations a payment gateway supports?**

Ottu maintains a list of the operations supported by each payment gateway, which can be found [here](/docs/developers/payments/payment-methods#activating-payment-gateway-codes).

#### 7. **What is the difference between using API-Key authentication and Basic Authentication?**

Using an [API-Key](/docs/developers/getting-started/authentication#private-key-api-key) grants you superadmin privileges and allows you to perform any operation. However, with [Basic Authentication](/docs/developers/getting-started/authentication#basic-authentication), you can assign specific [permissions ](#permissions)to control access to various API endpoints. It's recommended to use Basic Authentication for granular access control.

#### 8. **What permissions are required to perform operations?**

The required permissions depend on the operation you want to perform. You can grant permissions for specific operations like 'payment.capture' for [capture](#capture), 'payment.expire' for [expire](#expire), and so on. See the list of permission codes for each operation [here](#permission-codes-for-each-operation).

#### 9. **What happens when a refund operation is requested via the API?**

When a [refund](#refund) operation is requested via the API, the request goes directly to the payment gateway and the maker-checker flow is not activated. Currently, the maker-checker flow can only be enabled for operations performed manually via the Ottu dashboard. This ensures that refunds are issued directly when requested via the API, bypassing the internal approval process.

As we conclude this guide, we hope that the provided information has given you a comprehensive understanding of the operations endpoint and its various functionalities. We've covered everything from initial setup to the various types of operations and how they interact with different transaction states. However, in case you need to delve deeper into the technical implementation, feel free to explore the [API Schema Reference](/docs/developers/apis/ottu-api). Remember, each operation has specific requirements and behaviors, so it's important to carefully review this documentation before proceeding. As always, we're here to help should you need any further assistance or clarification. Happy integrating with Ottu!
