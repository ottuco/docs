---
toc_min_heading_level: 2
toc_max_heading_level: 4
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Checkout SDK

If you are planning to use the Checkout SDK for your application, it is important to note that you will need to first implement the [Checkout API](../checkout-api) on your backend server. This is because the Checkout SDK requires a [session ID](../checkout-api) in order to function, and the [session ID](../checkout-api) is obtained through the [Checkout API](../checkout-api).

The [Checkout API](../checkout-api) is responsible for generating a [session ID](../checkout-api), which is a unique identifier that is used to initiate the Checkout SDK. This [session ID](../checkout-api) is required to be passed to the Checkout SDK in order for it to work properly.

It is important to keep in mind that the Checkout SDK cannot work without a backend implementation, as it relies on the [Checkout API](../checkout-api) to generate the necessary [session ID](../checkout-api). Therefore, it is recommended that you first implement the [Checkout API](../checkout-api) on your backend server before integrating the Checkout SDK into your application.

By following this process, you can ensure that your application is able to properly leverage the features and functionality provided by the Checkout SDK, while also maintaining a secure and reliable payment processing system for your users.

### Ottu-Checkout definition

Ottu-checkout is a seamless, confidential and flexible payment checkout. Allows the merchant(s) to proceed the payment either single or bulk payment by a few steps. Ottu-checkout gives the merchant(s) the possibility to utilize many multiple payment gateways, simply generate the payment link and share it by different ways such as Email, WhatsApp, and SMS.

### Ottu-Checkout SDK flow

#### Merchant backend

<figure><img src="/img/checkout-sdk/1%20%2812%29%20%282%29.png" alt="Merchant backend payment flow" /><figcaption></figcaption></figure>

In the event the due amount is determined, the merchant should be notified to initiate the payment transaction. The merchant server calls the [Checkout API](../checkout-api), then it goes to process the response. The API needs to be updated each time the amount changes. In case there is a validation error while updating the API, the current session will be ended and a new payment transaction should be created once again.

- If the [Checkout API](../checkout-api) returns success, it will render the page after providing the [session ID](../checkout-api).
- If the [Checkout API](../checkout-api)returns error, the admin should be notified, then redirect to an error page and end the session.&#x20;

<figure><img src="/img/checkout-sdk/2%20%2811%29%20copy.png" alt="Checkout API success and error handling flow" /><figcaption></figcaption></figure>

#### Merchant frontend

After rendering the page, SDK will be fetched and embed from CDN (content delivery network). Then initiating the checkout SDK, and the SDK will render all the available payment methods.&#x20;

<figure><img src="/img/checkout-sdk/2%20%2813%29%20%281%29%20copy.png" alt="SDK fetched and embedded from CDN" /><figcaption></figcaption></figure>

<figure><img src="/img/checkout-sdk/Checkout%20SDK%20Payment%20Methods%20copy.png" alt="Checkout SDK available payment methods" /><figcaption></figcaption></figure>

The customer has the option of choosing from different payment methods.

1. Card: Customer enters the card details directly.
2. Saved card: tokenization.
3. Ottu redirect: Will guide to the required payment gateway page.
4. Apple Pay: A type of payment service, Apple Pay is only available for iOS devices.

<figure><img src="/img/checkout-sdk/diagram%20copy.png" alt="Payment method selection flow diagram" /><figcaption></figcaption></figure>

e.g., After selecting the payment method, the response will be proceeded to one of the three below flow. <span style={{ color: "red" }}><strong>Form error:</strong></span> for example when customer enter invalid card expiry dates, error message will be appeared, then the customer can try again. (this is only for multiple trial payment). <span style={{ color: "red" }}><strong>Error:</strong></span> The cancel callback will be executed when the payment has an error. e.g., the session has expired. <span style={{ color: "green" }}><strong>Success</strong></span>.&#x20;

<figure><img src="/img/checkout-sdk/image%20%283%29%20copy.png" alt="Payment response handling: form error, error, and success flows" /><figcaption></figcaption></figure>

Depending on the customer's selected payment method, there are different cases after success flow.&#x20;

**1- Redirect:** where the payment URL is generated.&#x20;

<figure><img src="/img/checkout-sdk/7%20%284%29%20copy.png" alt="Redirect payment flow" /><figcaption></figcaption></figure>

&#x20;**2-3DS required:** when the customer decides either the tokenization or card payment method. The 3DS page will be displayed > customer fills the required information Then proceed to either success call back or cancel call back.&#x20;

&#x20;**3-Payment success:** Just success call back and then end.&#x20;

<figure><img src="/img/checkout-sdk/8%20%283%29%20copy.png" alt="3DS verification and payment success flow" /><figcaption></figcaption></figure>

After Passing the 3DS

<figure><img src="/img/checkout-sdk/9%20%281%29%20copy.png" alt="Post-3DS payment completion flow" /><figcaption></figcaption></figure>

---
