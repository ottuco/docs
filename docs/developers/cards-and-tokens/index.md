# Tokenization

Tokenization significantly reduces the risk associated with handling sensitive customer card data. Instead of storing the actual card details, a unique token is generated and used for future transactions, thus enhancing the security of your payment processes. This feature is currently compatible with MasterCard, Visa, and STC Pay, with further options planned for future inclusion.

## [What is Tokenization?](#what-is-tokenization)

Consider tokenization as a powerful security vault where all sensitive data is replaced with a secure code, or [token](https://en.wikipedia.org/wiki/Security_token).&#x20;

Just like a vault secures precious jewels by keeping them out of sight and replacing them with a secure code, tokenization replaces sensitive card data with unique identifiers, protecting it from prying eyes. This process is paramount for securing payments, offering merchants the luxury of securely processing transactions without having to be PCI DSS compliant. For more details, please check [here](<https://en.wikipedia.org/wiki/Tokenization_(data_security)>).

With Ottu, we handle this complexity, so you don’t have to! To activate tokenization or for any inquiries, KSA merchants can reach us at [support@ottu.com](mailto:support@ottu.com).

## [How to Add New Card](#how-to-add-new-card)

Ottu provides two distinct methods for merchants to add a new card to a customer's profile, catering to different scenarios and requirements. These methods are:

1. **Adding a New Card Without Payment**: This approach is designed for situations where you want to store a customer's card details for future transactions without charging them at the moment of addition. It's especially useful for streamlining the checkout process for repeat customers, enhancing the user experience by removing the need to enter card details for every purchase. Please check [here](#tokenization-without-payment) for mroe details.
2. **Adding a New Card With Payment**: Conversely, this method allows merchants to add a customer's card details to their profile while simultaneously processing a payment. This is suitable for instances where immediate payment is required, but the customer also prefers to save their card details for future convenience. Please check [here](#tokenization-with-payment) for more information.

## [Tokenization without Payment](#tokenization-without-payment)

It offers a streamlined way for merchants to securely add a new card to a specific customer's profile without conducting an actual payment transaction. This capability is particularly useful for creating a more efficient and user-friendly payment process, allowing for the future use of saved card details without requiring customers to re-enter their information for every transaction.

### [**Requirements**](#requirements)

To successfully tokenize a card, merchants must adhere to the following requirements when sending a request to the Ottu `Checkout API`:

- **Payment Type**: The [payment_type](/docs/developers/payments/checkout-api#payment_type-string-optional) parameter in the request payload must be set to `save_card`. This indicates that the transaction is for the purpose of saving the card information.
- **Amount**: The [amount](/docs/developers/payments/checkout-api#amount-string-required) should be explicitly set to `0`. Setting `amount` to any other value will lead to an API error, as the intention is to tokenize the card, not process a payment.
- **Customer ID**: Merchants must provide the [customer_id](/docs/developers/payments/checkout-api#customer_id-string-optional) parameter.
- **Webhook URL:** [webhook_url](/docs/developers/payments/checkout-api#webhook_url-string-optional) should be provided, where the generated [token](/docs/developers/webhooks-and-events/payment-events) will be saved.

In addition, for the tokenization process to be initiated correctly, all other required parameters for the Ottu [Checkout API](/docs/developers/payments/checkout-api) must be provided, including `currency_code`, `type`, and `pg_codes`.

:::info

The merchant must ensure that the selected Payment Gateway `pg_codes` supports tokenization.

:::

### [The Process](#the-process)

Tokenization involves a series of steps designed to securely capture and convert card details into a `token`. Here is a detailed overview of the process:

1.  **Request Submission**:

    Merchant initiates the tokenization process by sending a request to the Ottu `Checkout API`. This request must specify the `customer_id,` `payment_type` as `save_card`, `amount` as `0`, and any other required parameters. Please refer to the [Checkout API](/docs/developers/payments/checkout-api) section for detailed information on the required `Checkout API` parameters.

2.  **Payment URL Generation**:

    Upon receiving the tokenization request, Ottu generates a [checkout_url](/docs/developers/payments/checkout-api#checkout_url-string-mandatory).

3.  **User Payment Process**:

    Merchant has the two options:&#x20;
    - **Redirect to the Checkout Page**: Using the [checkout_url](/docs/developers/payments/checkout-api#checkout_url-string-mandatory) to redirect the customer to the [Checkout](#id-2.-access-the-checkout-page) page. There, the customer can be redirected to the [Save Card](#id-3.-save-card-page) page by clicking the **Pay** button, even though no actual payment is processed at this step.
    - **Redirect to the Save Card Page**: If a [redirect_url](/docs/developers/payments/checkout-api#redirect_url-string-optional) is provided, the customer can be directly redirected to the [Save Card](#id-3.-save-card-page) page.

    On the **Save Card** page, the customer enters his card information and completes the process by clicking the **Save** button.

4.  **Tokenization**:

    Upon the successful completion of the card information submission, Ottu proceeds to tokenize the card details.<br/>

    The tokenized card details are then securely transmitted back to the merchant's system as part of the [webhook payload](/docs/developers/webhooks-and-events/payment-events) sent by Ottu. Merchants can locate the tokenized card information in the [token](/docs/developers/webhooks-and-events/payment-events) field of the webhook payload.

This tokenization process ensures that merchants can securely store card details for future transactions without handling sensitive card information directly, thereby enhancing the overall security and efficiency of the payment process.

### [Implementation](#implementation)

Getting started with simplifying your checkout process through tokenization is straightforward with Ottu. Here's a detailed guide to help you begin:

#### **1. Create a Payment Link**

Create a payment link through the [Checkout API](/docs/developers/payments/checkout-api), ensuring to include the [customer_id](/docs/developers/payments/checkout-api#customer_id-string-optional) parameter. Additionally, verify that the [pg_codes](/docs/developers/payments/checkout-api#pg_codes-array-required) you are using supports tokenization.

**Request Payload Example:**

```json
{
  "type": "payment_request",
  "pg_codes": ["credit-card"],
  "payment_type": "save_card",
  "amount": "0",
  "customer_id": "Customer Save-Card demo",
  "webhook_url": "https://yourwebsite.com/webhook",
  "currency_code": "KWD"
}
```

#### 2. Access the Checkout Page

Share the generated [checkout_url](/docs/developers/payments/checkout-api#checkout_url-string-mandatory) with the customer. The customer can then click on the **Pay** button to proceed to the [Save Card](#id-3.-save-card-page) page.

<figure><img src="/img/cards-and-tokens/tokenization-access-checkout-page.png" alt="Access the checkout page" /><figcaption></figcaption></figure>

#### 3. Save Card Page

On the **Save Card** page, the customer enters his card details and proceeds to save them.

<figure><img src="/img/cards-and-tokens/tokenization-save-card-page.png" alt="Save card page" /><figcaption></figcaption></figure>

<figure><img src="/img/cards-and-tokens/tokenization-card-form.png" alt="Card details form" /><figcaption></figcaption></figure>

#### 4. Tokenization&#x20;

After successfully submitting card information, Ottu tokenizes the details and securely sends them to the merchant via a [webhook payload](/docs/developers/webhooks-and-events/payment-events), where the tokenized information is found in the [token](/docs/developers/webhooks-and-events/payment-events) field.

<figure><img src="/img/cards-and-tokens/tokenization-webhook-token.png" alt="Tokenization webhook payload" /><figcaption></figcaption></figure>

## [**Tokenization with Payment**](#tokenization-with-payment)

It empowers merchants a seamless way not only to process transactions but also to securely save customer card details for future use.&#x20;

By leveraging the [Checkout API](/docs/developers/payments/checkout-api), a [payment session](/docs/developers/payments/checkout-api#session_id-string-mandatory) is created, associated with a [customer ID](/docs/developers/payments/checkout-api#customer_id-string-optional) and Merchant Identification Number [MID](/docs/developers/payments/checkout-api#pg_codes-array-required) that supports tokenization, thus enhancing the customer experience by providing an option to [save card](#id-3.-use-a-saved-card) details during the payment process. This can be further streamlined by using the [Checkout SDK](/docs/developers/payments/checkout-sdk). It's important to note that the Card Verification Value (CVV) may be required, depending on your Payment Gateway's configuration; this setting can be adjusted by contacting our technical support team.

This method is especially valuable for encouraging repeat business, as it simplifies future transactions by eliminating the need for customers to re-enter their card details.

### [Requirements](#requirements-1)

To ensure the successful tokenization of a card, merchants are required to adhere to the following requirements:

- **Payment Link:** Generate a [payment link](/docs/developers/payments/checkout-api#checkout_url-string-mandatory) by utilizing the [Checkout API](/docs/developers/payments/checkout-api), ensuring all necessary parameters for the `Checkout API` are included, along with the [customer_id](/docs/developers/payments/checkout-api#customer_id-string-optional) parameter.
- **Payment Gateway:** Use a [Payment Gateway](/docs/developers/payments/payment-methods#activating-payment-gateway-codes) that supports tokenization.
- **Save Card:** Ensure the **Save Card** option is enabled and selected by the customer during his initial payment to facilitate token creation.
- **Customer ID:** For subsequent payments utilizing the same token, the same `customer_id` associated with that token must be provided each time it is used.
- **Successful Payment:** The customer must complete a successful payment.

### [The Process](#the-process-1)

This guide outlines the steps for initiating payment sessions and securely saving customer card details, focusing on efficiency and security.

1. **Initiate the Payment Session:**\
   Begin by initiating a payment session through the [Checkout API](/docs/developers/payments/checkout-api), generating a session identified by [session_id](/docs/developers/payments/checkout-api#session_id-string-mandatory) and associated with [customer_id](/docs/developers/payments/checkout-api#customer_id-string-optional). Ensure this session connects to a Merchant Identification Number ([MID)](/docs/developers/payments/checkout-api#pg_codes-array-required) that supports tokenization, allowing for the secure storage of customer card information for later use.
2. **Enable the Save Card Option:**

   Utilize the [Checkout SDK](/docs/developers/payments/checkout-sdk) or manage payments via the [Checkout API](/docs/developers/payments/checkout-api) to enable a **Save Card** option, offering customers the ability to securely store their payment card information for future transactions.\
   \
   **Key Notes:**
   - **Choosing Between Checkout SDK and API:** The `Checkout SDK` is preferred for its user-friendly UI implementation and essential support for specific payment methods like [Apple Pay](/docs/developers/payments/checkout-sdk#ios) and [Google Pay](/docs/developers/payments/checkout-sdk#android). Your choice should align with your specific operational needs.
   - **CVV Requirements:** The necessity for Card Verification Value (CVV) may differ based on the Payment Gateway configuration. Adjustments can be made by reaching out to technical support.

3. **Save the Card:**\
   When customer elects to save his card details, the information is tokenized and securely stored upon payment completed successfuly, enabling easier transactions in the future.
4. **Utilize Saved Cards:**\
   In future transactions with the same `customer_id`, the system automatically showcases all associated cards, simplifying payment method selection. Security is prioritized by displaying only the last four card digits, with CVV requirements determined by the acquiring bank's policies.
5. **Navigate Payment Challenges:**\
   The `Checkout SDK` is adept at handling various payment processing challenges, such as 3D Secure and One-Time Password (OTP) verifications, ensuring a smooth transaction experience for merchants and customers alike.

By adhering to these streamlined steps, merchants are equipped to offer a superior and secure payment experience, fostering customer loyalty and encouraging repeat business through the ease of saved payment details.

### [Implementation](#implementation-1)

Simplifying your checkout process with tokenization is easy with Ottu. Here’s a step-by-step guide on how to get started:

#### **1. Create a Payment Link**

The first step involves creating a payment link via the [Checkout API](/docs/developers/payments/checkout-api). Make sure to include the [customer_id](/docs/developers/payments/checkout-api#customer_id-string-optional) parameter, and the [pg_codes](/docs/developers/payments/checkout-api#pg_codes-array-required) you’re using is enabled for tokenization.\
Request Example:

```json
{
  "type": "payment_request",
  "pg_codes": ["mpgs", "credit-card", "stc-pay"],
  "amount": "19.000",
  "customer_id": "customer_sample_id",
  "order_no": "token_showcase",
  "currency_code": "KWD"
}
```

#### 2. Access the Checkout Page

After generaing the [checkout_url](/docs/developers/payments/checkout-api#checkout_url-string-mandatory), the merchant should shareit with the customer, who then accesses the **Checkout** page via this link. Here, the [Checkout SDK](/docs/developers/payments/checkout-sdk) displays all available payment methods, such as \[`mpgs`, `credit-card`, `stc-pay`].&#x20;

To save a card, the customer selects the desired payment method for both the current purchase and future transactions. The customer will then be redirected to the **Payment** page, where he must enter his card details and opt to **Save Card.** Upon completing a successful payment, the card details will be stored, and a token will be linked to the customer_id."

<figure><img src="/img/cards-and-tokens/tokenization-checkout-page-pre-tokenization-2.png" alt="Checkout page before tokenization" /><figcaption></figcaption></figure>

:::info

**Successful Payment is a Prerequisite:** A saved card, represented by a unique token, can only be created after the customer completes a successful payment transaction. This process ensures the validity of the card and enables tokenization.

:::

#### 3. Use a Saved Card

For subsequent transactions, repeat the same API call as in [Step 1 ](#id-1.-create-a-payment-link-1)using the same [customer_id](/docs/developers/payments/checkout-api#customer_id-string-optional) and [pg_code](/docs/developers/payments/checkout-api#pg_codes-array-required). When reaching the **Checkout** page again, the previously saved card will be available as a new payment method. The customer can simply click on it to process the payment immediately.

<figure><img src="/img/cards-and-tokens/tokenized-checkout-page.png" alt="Tokenized checkout page" /><figcaption></figcaption></figure>

By following these steps, you can easily streamline your payment process, ensuring that customers have a seamless checkout experience. As mentioned, we’ll be providing visual aids between each step to further guide you in implementing this feature. Remember, at Ottu, we are always here to assist you in navigating the complexities of online transactions, so don’t hesitate to reach out if you need any help.

## [FAQ](#faq)

#### :digit_one: [Can I use tokenization if my payment gateway doesn’t support it?](#can-i-use-tokenization-if-my-payment-gateway-doesnt-support-it)

Tokenization is supported by specific payment gateways. If your current gateway doesn't support it, please reach out to our support team at [support@ottu.com](mailto:support@otuu.com) for the latest information and possible alternatives.

#### :digit_two: [**How do I handle the token received in the webhook payload for future transactions?**](#how-do-i-handle-the-token-received-in-the-webhook-payload-for-future-transactions)

Once you receive the tokenized card information in the webhook payload, you can use this token to process future transactions without needing to store sensitive card details. To do this, store the token securely in your system and reference it in subsequent payment requests as the payment method. This approach not only simplifies transaction processing but also enhances security by minimizing the exposure of sensitive card information.

#### :digit_three: [What if a customer wants to remove a saved card?](#what-if-a-customer-wants-to-remove-a-saved-card)

Customers can request the removal of their saved cards at any point. For detailed steps on managing this process, please refer to the [User Cards](/docs/developers/cards-and-tokens/user-cards#delete-card) and [Checkout SDK](/docs/developers/payments/checkout-sdk) sections of our documentation.

#### :digit_four: [Is tokenization safe?](#is-tokenization-safe)

Absolutely. Tokenization replaces sensitive card details with a unique token, reducing the risk of card information exposure and enhancing payment security.

#### :digit_five: [Can I use tokenization for recurring payments?](#can-i-use-tokenization-for-recurring-payments)

Yes, tokenization is an ideal feature for setting up recurring payments. Please refer to our [Auto Debit](/docs/developers/cards-and-tokens/recurring-payments) documentation section for more details.

#### :digit_six: [Can I use tokenization even if I’m not PCI DSS compliant?](#can-i-use-tokenization-even-if-im-not-pci-dss-compliant)

Yes, one of the major benefits of tokenization is that it allows you to securely process transactions without needing to be PCI DSS compliant. Ottu handles the complexities of compliance for you.

#### :digit_seven: [**How can I add a new card for a customer?**](#how-can-i-add-a-new-card-for-a-customer)

You can add a new card using two methods:

1. **Without Making a Payment**: Add a customer's card details directly without the need to process a payment. For more details, please click [here](#tokenization-without-payment).
2. **During a Payment Transaction**: Save the customer's card details while processing an actual payment. For further information, please click [here](#tokenization-with-payment).

#### :digit_eight: [Can I use the Auto-Debit feature even if I’m not PCI DSS compliant?](#can-i-use-the-auto-debit-feature-even-if-im-not-pci-dss-compliant)

Absolutely. With Ottu, you don’t have to worry about PCI DSS compliance. Our platform securely handles all the sensitive data and never exposes this information to the merchant. This means you can safely implement the [auto-debit](/docs/developers/cards-and-tokens/recurring-payments) feature.

#### :digit_nine: [Can I store card tokens in my database if I’m not PCI DSS compliant?](#can-i-store-card-tokens-in-my-database-if-im-not-pci-dss-compliant)

Yes, storing tokenized card details is safe and compliant without PCI DSS compliance. Tokens are secure substitutes for sensitive card information, specifically designed to reduce security risks. When Ottu tokenizes a card, it replaces the card's Primary Account Number (PAN) with a unique identifier or token. This token can be safely stored in your database because it cannot be used outside of the secure payment environment set up by Ottu.

This process significantly minimizes the risk of data breaches because the tokens themselves are not valuable to attackers without access to the decryption mechanism, which is securely managed by Ottu. Additionally, since these tokens do not carry the card's actual details, they fall outside the scope of PCI DSS requirements for data protection, making it easier for merchants to securely process payments while adhering to compliance standards. Please, check out this [Wikipedia article](<https://en.wikipedia.org/wiki/Tokenization_(data_security)>) for a deeper dive.

#### :digit_one::digit_zero: [When should I save the card token in my database?](#when-should-i-save-the-card-token-in-my-database)

The optimal time to save the card token in your database is immediately after the first payment against the subscription that you plan to [auto-debit](/docs/developers/cards-and-tokens/recurring-payments). While it’s not strictly necessary—you can always fetch this information through the [User Cards](/docs/developers/cards-and-tokens/user-cards) API and Payment Methods APIs—it does streamline your processes and reduce development complexity.

#### :digit_one::digit_one: [Do I need to use the Checkout SDK to display payment options to the customer?](#do-i-need-to-use-the-checkout-sdk-to-display-payment-options-to-the-customer)

No, it’s not mandatory to use the [Checkout SDK](/docs/developers/payments/checkout-sdk). You can control the payment process using the responses from the [Checkout API](/docs/developers/payments/checkout-api). However, it’s worth noting that the `Checkout SDK` simplifies the UI implementation and is necessary for certain payment methods such as `Apple Pay`, `Google Pay`, `STC Pay`, and others. While it’s recommended to use the `Checkout SDK` for its simplicity and comprehensive features, the choice ultimately lies in your hands based on your specific needs.

#### :digit_one::digit_two: [**Can I retrieve a list of saved cards for a customer?**](#can-i-retrieve-a-list-of-saved-cards-for-a-customer)

Yes, you can retrieve a list of a customer's saved cards utilizing the [Fetch Card API](/docs/developers/cards-and-tokens/user-cards#fetch-cards). This powerful API provides merchants secure access to essential saved card information,such as:

- **Token**: A unique identifier for the card.
- **Brand**: The card brand (e.g., Visa, MasterCard).
- **Expiry Year**: The year the card expires.
- **Name on Card**: The name of the cardholder as it appears on the card.
- **PG Code**: Payment Gateway code indicating the processing network.

For comprehensive instructions on how to implement this API, including request and response parameters, please consult our detailed documentation [here](/docs/developers/cards-and-tokens/user-cards#fetch-cards).

#### :digit_one::digit_three: [**What happens if a tokenized card expires?**](#what-happens-if-a-tokenized-card-expires)

When a tokenized card expires, transactions using that token will not be processed. Merchants can set up notifications for upcoming card expirations to prompt customers to update their card details, ensuring uninterrupted service
