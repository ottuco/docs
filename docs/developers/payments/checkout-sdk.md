---
toc_min_heading_level: 2
toc_max_heading_level: 4
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Checkout SDK

If you are planning to use the Checkout SDK for your application, it is important to note that you will need to first implement the [Checkout API](./checkout-api) on your backend server. This is because the Checkout SDK requires a [session ID](./checkout-api) in order to function, and the [session ID](./checkout-api) is obtained through the [Checkout API](./checkout-api).

The [Checkout API](./checkout-api) is responsible for generating a [session ID](./checkout-api), which is a unique identifier that is used to initiate the Checkout SDK. This [session ID](./checkout-api) is required to be passed to the Checkout SDK in order for it to work properly.

It is important to keep in mind that the Checkout SDK cannot work without a backend implementation, as it relies on the [Checkout API](./checkout-api) to generate the necessary [session ID](./checkout-api). Therefore, it is recommended that you first implement the [Checkout API](./checkout-api) on your backend server before integrating the Checkout SDK into your application.

By following this process, you can ensure that your application is able to properly leverage the features and functionality provided by the Checkout SDK, while also maintaining a secure and reliable payment processing system for your users.

### Ottu-Checkout definition

Ottu-checkout is a seamless, confidential and flexible payment checkout. Allows the merchant(s) to proceed the payment either single or bulk payment by a few steps. Ottu-checkout gives the merchant(s) the possibility to utilize many multiple payment gateways, simply generate the payment link and share it by different ways such as Email, WhatsApp, and SMS.

### Ottu-Checkout SDK flow

#### Merchant backend

<figure><img src="/img/checkout-sdk/1%20%2812%29%20%282%29.png" alt="" /><figcaption></figcaption></figure>

In the event the due amount is determined, the merchant should be notified to initiate the payment transaction. The merchant server calls the [Checkout API](./checkout-api), then it goes to process the response. The API needs to be updated each time the amount changes. In case there is a validation error while updating the API, the current session will be ended and a new payment transaction should be created once again.

- If the [Checkout API](./checkout-api) returns success, it will render the page after providing the [session ID](./checkout-api).
- If the [Checkout API](./checkout-api)returns error, the admin should be notified, then redirect to an error page and end the session.&#x20;

<figure><img src="/img/checkout-sdk/2%20%2811%29%20copy.png" alt="" /><figcaption></figcaption></figure>

#### Merchant frontend

After rendering the page, SDK will be fetched and embed from CDN (content delivery network). Then initiating the checkout SDK, and the SDK will render all the available payment methods.&#x20;

<figure><img src="/img/checkout-sdk/2%20%2813%29%20%281%29%20copy.png" alt="" /><figcaption></figcaption></figure>

<figure><img src="/img/checkout-sdk/Checkout%20SDK%20Payment%20Methods%20copy.png" alt="" /><figcaption></figcaption></figure>

The customer has the option of choosing from different payment methods.

1. Card: Customer enters the card details directly.
2. Saved card: tokenization.
3. Ottu redirect: Will guide to the required payment gateway page.
4. Apple Pay: A type of payment service, Apple Pay is only available for iOS devices.

<figure><img src="/img/checkout-sdk/diagram%20copy.png" alt="" /><figcaption></figcaption></figure>

e.g., After selecting the payment method, the response will be proceeded to one of the three below flow. <span style={{ color: "red" }}><strong>Form error:</strong></span> for example when customer enter invalid card expiry dates, error message will be appeared, then the customer can try again. (this is only for multiple trial payment). <span style={{ color: "red" }}><strong>Error:</strong></span> The cancel callback will be executed when the payment has an error. e.g., the session has expired. <span style={{ color: "green" }}><strong>Success</strong></span>.&#x20;

<figure><img src="/img/checkout-sdk/image%20%283%29%20copy.png" alt="" /><figcaption></figcaption></figure>

Depending on the customer's selected payment method, there are different cases after success flow.&#x20;

**1- Redirect:** where the payment URL is generated.&#x20;

<figure><img src="/img/checkout-sdk/7%20%284%29%20copy.png" alt="" /><figcaption></figcaption></figure>

&#x20;**2-3DS required:** when the customer decides either the tokenization or card payment method. The 3DS page will be displayed > customer fills the required information Then proceed to either success call back or cancel call back.&#x20;

&#x20;**3-Payment success:** Just success call back and then end.&#x20;

<figure><img src="/img/checkout-sdk/8%20%283%29%20copy.png" alt="" /><figcaption></figcaption></figure>

After Passing the 3DS

<figure><img src="/img/checkout-sdk/9%20%281%29%20copy.png" alt="" /><figcaption></figcaption></figure>

---

## Web

In this documentation, you will find comprehensive resources and guides to help you seamlessly integrate and leverage the features of SDK Version 3 in your development projects. Whether you're an experienced developer or just starting out, this documentation is designed to assist you at every step. For SDK Version 2 Documentation, please visit the following link: [SDK Version 2 Documentation](https://under-review-docs-ottu.gitbook.io/ottu-web-sdk/)

The [Checkout SDK](./) is a JavaScript library provided by Ottu that allows you to easily integrate an Ottu-powered [checkout process](#ottu-checkout-sdk-flow) into your web application. With the Checkout SDK, you can customize the look and feel of your checkout process, as well as which forms of payment are accepted.

To use the Checkout SDK, you'll need to include the library in your web application and initialize it with your Ottu merchant_id, session_id, and [API key](../getting-started/authentication#public-key). You can also specify additional options such as, which forms of payment to accept, the [theme](#theme-object) styling for the checkout interface, and more.

:::warning

Please note that the Checkout SDK requires the implementation of the [Checkout API](./checkout-api) in order to function properly.

For optimal security, call REST APIs from server-side implementations, not client-side applications such as mobile apps or web browsers.
:::

### Checkout SDK

### Demo

Below is a demo of the Checkout SDK in action. This demo shows how the Checkout SDK can be used to create a streamlined checkout experience for customers, with support for multiple forms of payment and a customizable interface.

<iframe
  title="Ottu Checkout SDK Demo"
  src="https://codepen.io/Ottu/embed/MWZrgPy?default-tab=result"
  style={{ width: "100%", height: "600px", border: "0" }}
  loading="lazy"
  allow="fullscreen"
/>

### Installation

To install the Checkout SDK, you'll need to include the library in your web application by adding a script tag to your HTML section. You can do this by using the following code snippet:

```html
<head>
  <script
    src="https://assets.ottu.net/checkout/v3/checkout.min.js"
    data-error="errorCallback"
    data-cancel="cancelCallback"
    data-success="successCallback"
    data-beforepayment="beforePayment"
  ></script>
</head>
```

Replace [errorCallback](#windowerrorcallback), [cancelCallback](#windowcancelcallback), [successCallback](#windowsuccesscallback), and [beforePayment](#windowsbeforepayment-hook) with the names of your error handling, cancel handling, success handling, and beforePayment handling functions, respectively.

You're all set! You can now use the [Checkout SDK ](./)to create a checkout form on your web page and process payments through Ottu.

### Functions

#### **Checkout.init**

Is the function that initializes the [checkout process](#ottu-checkout-sdk-flow) and sets up the necessary configuration options for the [Checkout SDK](./). It needs to be called once on your web page to initialize the checkout process, and it must be called with a configuration object that includes all the necessary options for the checkout process.

When you call `Checkout.init`, the SDK will take care of setting up the necessary components for the checkout process, such as creating a form for the customer to enter their payment details, and handling communication with Ottu's servers to process the payment.

#### **Checkout.reload**

The `Checkout.reload` function in the Checkout SDK is used to refresh the SDK. It's useful when you want to reload the **content** of the SDK after an **error** has occurred or when the content needs to be **refreshed**.

Here's an example of how `Checkout.reload` might be called:

```javascript
Checkout.reload();
```

### **Properties**

#### **selector** _`string`_

The `selector` property in the Checkout SDK is used to specify the `css` selector for the HTML element that will contain the checkout form. This is typically a `<div>` element on your web page.

To specify the selector, you can add a `<div>` element to your web page with a unique `id` attribute, like this:

```html
<div id="checkout"></div>
```

It's important to note that the `selector` property must be the ID of the HTML element that will contain the checkout form. This is because the Checkout SDK replaces the contents of the specified element with the checkout elements.

Here's an example of how `Checkout.init` might be called with a `selector` property:

```javascript
Checkout.init({
  selector: "checkout",
  // ... other parameters
});
```

#### **merchant_id** _`string`_

The `merchant_id` specifies your Ottu merchant domain. This should be the root domain of your Ottu account, without the "https://" or "http://" prefix.

For example, if your Ottu URL is `https://example.ottu.com`, then your `merchant_id` is **example.ottu.com**. This property is used to identify which Ottu merchant account the checkout process should be linked to.

#### **apiKey** _`string`_

The `apiKey` is your Ottu [API public key](../getting-started/authentication#public-key). This key is used for authentication purposes when communicating with Ottu's servers during the checkout process.

According to the REST [API documentation](../getting-started/authentication), the `apiKey` property should be set to your Ottu API public key.

:::info

Ensure that you utilize the public key and refrain from using the [private key](../getting-started/authentication#private-key-api-key). The private key should remain confidential at all times and must not be shared with any clients.
:::

#### **session_id** _`string`_

The `session_id` is the unique identifier for the payment transaction associated with the checkout process.

This unique identifier is automatically generated when the payment transaction is created. For more information on how to use the `session_id` parameter in the Checkout API, see [session_id](./checkout-api).

#### **lang** _`string`_

The `lang` property serves to designate the language for presenting the checkout elements. You can configure this property with either `en` for English or `ar` for Arabic. When `lang` is configured as `en`, the checkout form will appear in English, and if set to `ar`, the checkout elements will be shown in Arabic. Moreover, when the `lang` parameter is set to `ar`, the layout will adapt to a right-to-left (RTL) orientation to suit Arabic script.

:::warning

For seamless user experience, it's recommended to maintain consistency by passing the same value for `lang` in [Checkout.init](#checkoutinit) used in [Checkout API](./checkout-api) while creating transactions.
:::

For more information on how to use lang parameter in the Checkout API, please refer to [language ](./checkout-api)parameter in `Checkout API` section.

#### **formsOfPayment** _`array`_

`formsOfPayment` allows you to customize which forms of payment will be displayed in your checkout process. By default, all forms of payment are configured.

The available options for `formsOfPayment` are:

- `applePay`: The Apple Pay payment method that allows customers to make purchases using their Apple Pay-enabled devices.
- `googlePay`: The Google Pay payment method that allows customers to make purchases using their Google wallet cards linked in google accounts.
- `ottuPG`: A method that redirects customers to a page where customers enter their credit or debit card details to make a payment.
- `tokenPay`: A payment method that uses tokenization to securely store and process customers' payment information.
- `redirect`: A method where customers are redirected to a payment gateway or a third-party payment processor to complete their payment.
- `stcPay`: A method where customers enter their mobile number and provide an OTP send to their mobile number to complete their payment.
- `urPay`: A method where customers enter their mobile number and provide an OTP send to their mobile number to complete their payment.

#### displayMode _`string`_

There are two display Modes i.e `grid` & `column`.The Default `displayMode` is `column`. Here's an example of how `Checkout.init` might be called to customize the `displayMode`

- #### grid

  In `grid` mode, saved cards will appear on the left side and the redirect links on the right side.

```javascript
Checkout.init({
  // other parameters
  displayMode: "grid",
});
```

<figure><img src="https://lh7-us.googleusercontent.com/olQx9DJHiIsvv3ujwcvPWgg6UNfv6Qet0icjK3GhYOkSQg3PPtP8YcxFBpTty914KyT__aqq_55RdUbNxFSjYXJGekQ5B5CZ3ecTulqkQ1vrK4u_hhmxHCvM1vNJjd0JXSIbn1EMxJvvaQ3SxsxH37x6Lr6t_vpL" alt="" /><figcaption></figcaption></figure>

- #### column

  Default `displayMode` will be `column`, where all forms of payment appear one under another, similar to a responsive view.

```javascript
Checkout.init({
  // other parameters
  displayMode: "column",
});
```

<figure><img src="https://lh7-us.googleusercontent.com/AIAlvACaCny1WZdNgUoMmUd-vuDYAyFjUwktZJFtHYfY5ys5FDIqRBWWRRr0spH8Wdz9BImGZ0oqdLF4SZUt9SqlpEBMDDnP_jhm0lkXhk4r8oKfTJsyq4XJsAnjUwty73ogPG3nXIZ0WzbQdsK6m4eK8WsRyrQp" alt="" /><figcaption></figcaption></figure>

#### setupPreload _`object`_

The `setupPreload` feature is designed to optimize the `SDK` loading experience by allowing merchants to pre-fetch transaction details and pass them to the `SDK` during initialization. This eliminates the need for the `SDK` to make an API call, resulting in faster rendering of the UI.

To utilize the `setupPreload` feature, include it as a property when calling [checkout.init()](#checkoutinit). The `setupPreload` object should contain the prefetched transaction details.

```javascript
Checkout.init({
  // other parameters
  setupPreload: {
    // prefetched transaction details object
  },
});
```

The `setupPreload` functionality relies heavily on the [Checkout API](./checkout-api). When calling the create or update operation of a payment transaction (using the [session_id](./checkout-api)), set the [include_sdk_setup_preload](./checkout-api) flag to `true`. This action will prompt the API to return the `sdk_setup_preload_payload` key, along with other values. Pass this value into the `Checkout.init()` just as you pass the `session_id`, ensuring no modifications are made to it.\
For more information on how to use the `setupPreload` parameter, see [sdk_setup_preload_payload](./checkout-api) in the [Checkout API](./checkout-api).

:::info

If the `setupPreload` object passed during `SDK`initialization is not valid or does not adhere to the required structure, the `SDK` will discard it and automatically fall back to its previous functionality. In such cases, the `SDK` will initiate an API call to fetch the necessary transaction details from the backend. It is essential to ensure that the `setupPreload` object follows the specified format to leverage the instant loading feature effectively and avoid fallback scenarios and ensure a seamless integration.
:::

#### applePayInit _`object`_

The `applePayInit` object enables users to modify the Apple Pay configurations used for generating payment sessions through Apple Pay. By default, all options are pre-configured. However users have the flexibility to customize these configurations using `applePayInit` according to their requirements.

- **buttonLocale**\
  Users can change Apple Pay Button Locale by using buttonLocale property. \
  Value of buttonLocale must be a 2 letter language code like `ar`, `en` etc.
- **version**\
  Users can change the API version used for creating Apple Pay payment session by using the version property. Values supported by version are written[ here](https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_on_the_web_version_history).

In addition to above properties, users have the capability to customize the Apple Pay payment request using properties defined [here](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaypaymentrequest). However, due to backend constraints, not all properties are modifiable. Below is the list of supported and unsupported values:

##### Supported Properties

- `merchantCapabilities`
- `merchantIdentifier`
- `supportedNetworks`
- `countryCode`
- `supportedCountries`
- `total`&#x20;
- `lineItems`
- `currencyCode`

##### Unsupported Properties

- `requiredBillingContactFields`
- `billingContact`
- `requiredShippingContactFields`
- `shippingContact`
- `shippingContactEditingMode`&#x20;
- `supportsCouponCode`
- `couponCode`
- `applicationData`

```javascript
Checkout.init({
    selector: "checkout",
    merchant_id: 'domain',
    session_id: 'session_id',
    apiKey: 'apiKey',
    // Default values configured for Apple Pay
    applePayInit: {
        version: 6
        buttonLocale: 'en',
        supportedNetworks: ['amex', 'masterCard', 'maestro', 'visa', 'mada'],
        merchantCapabilities: ['supports3DS']
        // Remaining values are configured via init checkout API
    }
});
```

#### googlePayInit `object`

The `googlePayInit` object enables users to modify the Google Pay configurations used for generating payment sessions through Google Pay. By default, all options are pre-configured. However, developers have the flexibility to customize these configurations using `googlePayInit` according to their requirements.&#x20;

- **buttonLocale**\
  Users can change Google Pay Button Locale by using `buttonLocale` property. \
  Value of `buttonLocale` must be a 2 letter language code like `ar`, `en,`etc...&#x20;

In addition to above properties, users have the capability to customize Google Pay payment request by utilizing the options outlined in the documentation[ here](https://developers.google.com/pay/api/web/reference/request-objects#PaymentDataRequest).However, due to backend constraints, not all properties are modifiable. Below is the list of supported and unsupported values:

##### Supported Properties

- `apiVersion`
- `apiVersionMinor`
- `environment`
- `emailRequired`
- `merchantId`
- `merchantName`
- `tokenizationSpecificationType`
- `publicKey`
- `gateway`
- `gatewayMerchantId`
- `allowedAuthMethods`
- `allowedCardNetworks`
- `allowPrepaidCards`
- `allowCreditCards`
- `billingAddressRequired`
- `assuranceDetailsRequired`
- `billingAddressParameters`
- `displayItems`
- `totalPrice`
- `totalPriceLabel`
- `totalPriceStatus`
- `countryCode`
- `currencyCode`

##### Unsupported Properties

- `shippingAddressRequired`
- `shippingAddressParameters`
- `shippingOptionRequired`
- `shippingOptionParameters`
- `offerInfo`&#x20;
- `callbackIntents`
- `existingPaymentMethodRequired`

**Example**

```javascript
Checkout.init({
  // Other parameters
  googlePayInit: {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedCardNetworks: [
      "AMEX",
      "DISCOVER",
      "INTERAC",
      "JCB",
      "MASTERCARD",
      "VISA",
    ],
    allowedCardAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
    allowPrepaidCards: true,
    allowCreditCards: true,
    billingAddressRequired: false,
    assuranceDetailsRequired: false,
    existingPaymentMethodRequired: true,
    tokenizationSpecificationType: "PAYMENT_GATEWAY",
    totalPriceStatus: "FINAL",
    totalPriceLabel: "TOTAL",
    buttonLocale: "en",
    // Remaining Values are configured via
    // init checkout API
  },
});
```

#### theme _`object`_

The SDK Theme Customization feature allows you to modify the appearance of elements within the SDK using a `theme` object. This object contains specific `css` properties that are applied to various components, giving you control over their styling. `theme` object consists of key-value pairs, where each key corresponds to a specific component, and the associated value is a set of `css` properties to be applied to that component

```javascript
Checkout.init({
  // other parameters
  theme: {
    "pay-button": {
      background: "black",
    },
  },
});
```

##### Here are some example themes that you can use

<Tabs>
  <TabItem value="sample" label="Sample theme" default>
    ```javascript
    Checkout.init({
      // other parameters
      theme: {
        main: {
          background: "#d4d4d461",
        },
        "primary-text": {
          color: "black",
        },
        "pay-button": {
          background: "black",
          color: "white",
        },
        "amount-box": {
          background: "#1157e878",
        },
        methods: {
          background: "#373f5236",
        },
        "checkbox-label": {
          color: "#003aff",
        },
      },
    });
    ```

    <figure><img src="https://lh7-us.googleusercontent.com/Cuv3H1vhsyWvLR75a4Ccy6--DWoaDYD_5rh2iTii1OWCYbPBlgKQzoG4O8m3axohSSG2yl1CkLCkRKsLvBykhpWegGTqI6twWeHEPyCWyPuoVjUbVNrv-uXGZ65L_Z9Fwb3VwyRNA7kd1C8ccCVEI0A" alt="" width="563" /><figcaption></figcaption></figure>

  </TabItem>
  <TabItem value="dark" label="Dark theme">
    ```
    Checkout.init({
        selector: "checkout",
        merchant_id: 'domain',
        session_id: 'session_id',
        apiKey: 'apiKey',
        theme: {
            "main": {
                "background": "#555555"
            },
            "title-text": {
                "color": "white"
            },
            "primary-text": {
                "color": "white"
            },
            "secondary-text": {
                "color": "white"
            },
            "pay-button": {
                "background": "#333",
                "color": "white"
            },
            "amount-box": {
                "background": "#333"
            },
            "stcPay": {
                "buttonColor": "black"
            },
            "urPay": {
                "buttonColor": "black"
            },
            "payment-modal": {
                "background": "black"
            },
            "mobile-number-input": {
                "color": "black"
            },
            "otp-input": {
                "color": "black"
            },
            "methods": {
                "background": "#333"
            },
            "selected-method": {
                "background": "black",
                "border": "2px solid #6e6ef5d4",
            },
            "card-removal-modal": {
                "background": "black"
            },
            "keep-card-button": {
                "color": "black"
            },
            "info-modal": {
                "background": "black"
            },
            "error-retry-button": {
                "color": "black"
            },
            "ccv-input": {
                "background": "black",
                "color": "white"
            },
            "floating-label": {
                "background": "black"
            },
            "payment-error-message": {
                "color": "red"
            },
            "popup-back-button": {
                "stroke": "red"
            },
            "popup-close-button": {
                "fill": "red"
            },
            "otp-resend-button": {
                "color": "black"
            }
        }
    });
    ```

    <figure><img src="https://lh7-us.googleusercontent.com/38HhHbm74EHLWgca0d-r2bkOx5gliihMtCmyIPol179kZ83QA9HWyg_iAfMgxo1tTsUVOWh_joGDd-2KV1YvJKProWcIyKhSxbVZRXTH75Ze5pf0L-korQTTVpEH_Zpi_blfRdwaI3POVJWupGQ_IiMZLPvn3_tl" alt="" /><figcaption></figcaption></figure>

  </TabItem>
  <TabItem value="minimal" label="Minimal theme">
    ```javascript
    Checkout.init({
      selector: "checkout",
      merchant_id: "domain",
      session_id: "session_id",
      apiKey: "apiKey",
      theme: {
        "title-text": {
          "font-family": "SF PRO REGULAR",
        },
        "primary-text": {
          "font-family": "SF PRO REGULAR",
        },
        "secondary-text": {
          "font-family": "SF PRO REGULAR",
        },
        "amount-box": {
          background: "transparent",
        },
        methods: {
          background: "transparent",
          border: "none",
        },
        "selected-method": {
          background: "transparent",
          border: "none",
        },
        "ccv-input": {
          background: "transparent",
        },
        "floating-label": {
          background: "white",
        },
      },
    });
    ```

    <figure><img src="https://lh7-us.googleusercontent.com/FBmnrDPPvigeZghiNxe0curnjNZgdLkPApKm7uGjXN_tcA1x0xWv0VueOb0nN1eTJeIJVPclHSQK_FYs4VKhEmGEjvW1iseP7FAReZt4cu38foM-Kbs-KZUl89eogn1zaoUwJ2OTMNF9HDRRX3FdKg4" alt="" width="563" /><figcaption></figcaption></figure>

  </TabItem>
  <TabItem value="side-by-side" label="Side By Side Buttons">
    ```javascript
    Checkout.init({
      selector: "checkout",
      merchant_id: "domain",
      session_id: "session_id",
      apiKey: "apiKey",
      googlePayInit: {
        buttonColor: "black",
      },
      theme: {
        "wallet-buttons": {
          "flex-direction": "row",
          gap: "10px",
        },
      },
    });
    ```

    <figure><img src="https://lh7-us.googleusercontent.com/GMOSVNbu0cbFB727v5XLSAGOy5eJ-eBQeTulQCSCbDdHYh2YMRbX7FHMcdP5OtdFEeOxoGqPOha9FHimKh8umiqlXVJzXrF9jur6Qm47b9_ifEjoVzEQvv_lRLo56o-sRyNoG1Mduib1S0rwf8enBM0" alt="" /><figcaption></figcaption></figure>

  </TabItem>
  <TabItem value="hide-header" label="Hide SDK Header">
    ```javascript
    Checkout.init({
      // other parameters
      theme: {
        "payment-details-heading": {
          display: "none",
        },
        "payment-methods-heading": {
          display: "none",
        },
        "amount-box": {
          display: "none",
        },
      },
    });
    ```

    <figure><img src="https://lh7-us.googleusercontent.com/aho82OfKWwwXmo5mjjCDyg9rUcoZ82YIU9B0mDwEDXN9s_SEWUoM4uTpxhu8qlN3sW6PeewCL3ILrpgiZiQYV8HRgEPWp5zqyrSDwAfYIPn5y7ou_njUoo1dwrxbB167gjOELnGXCxPB-rm2kT9hK2A" alt="" width="563" /><figcaption></figcaption></figure>

  </TabItem>
</Tabs>

##### Scenarios

- **Hide Amount**\
  Using the `theme` object merchant can hide the amount and payment details heading according to his/her needs.

```javascript
Checkout.init({
  // other parameters
  theme: {
    "payment-details-heading": {
      display: "none",
    },
    "amount-box": {
      display: "none",
    },
  },
});
```

<figure><img src="https://lh7-us.googleusercontent.com/FCqMapxhs7mgsbqmyjAMN-LMfBsMTYbtZ11SWBSyd_PrT1P0veW_8b3O42UN2tm0Xc_jsc49OqDh2RM1U0-l-XeUDO63aGvhp1YxOrwmHbSqL82DMsad9gzueAuPZY0zIGYK4neKgKLNSKDO-kKOzvY" alt="" width="563" /><figcaption></figcaption></figure>

- **Change Button Type** \
  Using the buttonType property in theme object merchant can change the type of ApplePay and GooglePay buttons according to his/her needs.

```javascript
Checkout.init({
  selector: "checkout",
  merchant_id: "domain",
  session_id: "session_id",
  apiKey: "apiKey",
  theme: {
    applePay: {
      buttonType: "book",
    },
    googlePay: {
      buttonType: "book",
    },
  },
});
```

Values supported by ApplePay buttonType are written [here](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaybuttontype).&#x20;

Values supported by GooglePay buttonType are written [here](https://developers.google.com/pay/api/web/reference/request-objects#ButtonOptions).

:::info

`buttonType` property is only supported by Apple Pay and Google Pay.&#x20;

However, Google Pay supports an additional property `buttonSizeMode` property, which can alter the Google Pay Button Size Mode. Supported values are `static` and `fill`. By default, `fill` is selected. Using `fill` allows you to change the button size, while `static`sets the default size provided by Google
:::

<figure><img src="https://lh7-us.googleusercontent.com/B3DwfPzBMDiIVvu8_rKDZ6-JorEaO2iUz0SxNzYj7XJEDr_YpYAtgyzO_AC3dt3QhBlHsPsZfetu64NrCkWTgF0eC7KM0hTqFDr5ef49fiW1vwneisQ_To8DoCICUQRG6CK1c02Y9t_xc3tKGs8VVv0" alt="" width="563" /><figcaption></figcaption></figure>

- **Change Button Color** \
  Using the `buttonColor` property in `theme` object merchants can change the color of `ApplePay`, `GooglePay`, `StcPay`, and `UrPay` buttons according to his needs.

```javascript
Checkout.init({
  selector: "checkout",
  merchant_id: "domain",
  session_id: "session_id",
  apiKey: "apiKey",
  theme: {
    applePay: {
      buttonColor: "black",
    },
    googlePay: {
      buttonColor: "black",
    },
    stcPay: {
      buttonColor: "black",
    },
    urPay: {
      buttonColor: "black",
    },
  },
});
```

:::info

`buttonColor` property is supported by `applePay`, `googlePay`, `stcPay`, and `urPay`

Values supported by `ApplePay` `buttonColor` are white, black and white-outline

Values supported by `GooglePay` `buttonColor` are white and black

However, `stcPay` and `urPay` can supported any `css` collor in `buttonColor.`
:::

<figure><img src="https://lh7-us.googleusercontent.com/96keCq8NFWAlWYihVR9Z5OrNYsvMJch58H3vSdolSOTiLYyEzyDz1bZ7PK5wbFZo8z3cZA9hwDKVl3V0XJdWzNK8UivZbqpttIXQoN3AFaV6DfNamY27iUa5n2gzJXQDUVBMjBr_OrozZTKAfYVcISo" alt="" width="563" /><figcaption></figcaption></figure>

##### Supported Values

<table>
  <tbody>
    <tr>
      <td><strong>1. Main</strong><br /><code>main</code><br /><code>title-text</code><br /><code>primary-text</code><br /><code>secondary-text</code><br /><code>pay-button</code><br /><code>border</code><br /><code>payment-details-heading</code><br /><code>payment-methods-heading</code></td>
      <td><strong>2. Amount Box</strong><br /><code>amount-box</code><br /><code>amount</code><br /><code>amount-label</code><br /><code>amount-currency</code></td>
      <td><strong>3. Fees</strong><br /><code>fees</code><br /><code>fees-label</code><br /><code>fees-currency</code></td>
    </tr>
    <tr>
      <td><strong>4. Checkboxes</strong><br /><code>checkbox-label</code><br /><code>save-account-label</code><br /><code>selected-checkbox</code></td>
      <td><strong>5. WalletButtons</strong><br /><code>wallet-buttons</code><br /><code>applePay</code><br /><code>applePay-tooltip</code><br /><code>googlePay</code><br /><code>stcPay</code><br /><code>urPay</code></td>
      <td><strong>6. PaymentMethods</strong><br /><code>methods-block</code><br /><code>methods</code><br /><code>saved-cards</code><br /><code>redirect-links</code><br /><code>selected-method</code><br /><code>payment-method-name</code><br /><code>card-number</code><br /><code>card-expiry</code><br /><code>delete-card-logo</code><br /><code>ccv-input</code><br /><code>floating-label</code><br /><code>cvv-info-text</code></td>
    </tr>
    <tr>
      <td><strong>7. Modals</strong><br /><code>card-removal-modal</code><br /><code>info-modal</code><br /><code>payment-modal</code><br /><code>modal-overlay</code></td>
      <td><strong>8. CloseButton</strong><br /><code>popup-close-button</code></td>
      <td><strong>9. DeleteCardPopup</strong><br /><code>delete-card-button</code><br /><code>delete-card-message</code><br /><code>keep-card-button</code></td>
    </tr>
    <tr>
      <td><strong>10. ErrorPopup</strong><br /><code>error-popup-heading</code><br /><code>error-popup-message</code><br /><code>error-popup-data</code><br /><code>retry-button</code></td>
      <td><strong>11. SuccessPopup</strong><br /><code>success-popup-heading</code><br /><code>success-popup-message</code><br /><code>success-popup-data</code></td>
      <td><strong>12. PaymentPopup</strong><br /><code>mobile-number-popup-heading</code><br /><code>otp-popup-heading</code><br /><code>mobile-number-input</code><br /><code>otp-input</code><br /><code>payment-error-message</code><br /><code>otp-send-button</code><br /><code>otp-resend-button</code><br /><code>otp-submit-button</code><br /><code>popup-back-button</code></td>
    </tr>
  </tbody>
</table>

<figure><img src="https://lh7-us.googleusercontent.com/w0VBQopwyWlw-IaYvF5JbGJt768simZGmrNaJFs2B7BOkhnes242a7L_F8AnhKXjW-nSVBpFVnilIPMiYVhjus0SQ9A8O_utzZP9i_ghktNA8By8VB48ZAiqPLT6UDKYuVFRyVSn4mFTlqwGza8rNTI" alt="" /><figcaption></figcaption></figure>

<figure><img src="/img/checkout-sdk/image13%20%281%29.png" alt="" /><figcaption></figcaption></figure>

<figure><img src="https://lh7-us.googleusercontent.com/mO72oFSb5bI3Sg0_h6XYakQfFRUNbvl4iHFxOQHQtlHrgJunVD0QB7MgYG00hX9FYdJYlKp-BhEAnlUPutJVlMb1ggDwnBLhEOOrBDfeVzdtNpttMq9iMBPeAy7ilMEek7Zg9UYTIChgVd_srHJXz3g" alt="" /><figcaption></figcaption></figure>

**Example**

<span style={{ color: "blue" }}>**HTML**</span>

```javascript
<div id="checkout"></div>
```

<span style={{ color: "blue" }}>**Javascript**</span>

```javascript
Checkout.init({
  selector: "checkout",
  merchant_id: "domain",
  session_id: "session_id",
  apiKey: "apiKey",
  lang: "en",
  formsOfPayment: [
    "applePay",
    "tokenPay",
    "ottuPG",
    "redirect",
    "googlePay",
    "stcPay",
    "urPay",
  ],
  displayMode: "grid", // default is column
});
```

#### Checkout.showPopup(type, message, response)

Is a function that shows a message in a popup on the screen. The message parameter must be a string, and the optional `pg_response` parameter is an object that displays key-value pairs representing object values within the popup.

:::info

Popup will not display null values passed in the response.
:::

- **type**`string`\
  he type identifies the modal that should be displayed to the customer. Supported values are `error`, `success`&`redirect`
- **message** `string`\
  The message for a failed payment can be displayed to the customer.
- **pg_response** `object`\
  The raw response data that was received directly from the payment gateway after the transaction attempt. This typically includes transaction status, transaction identifier, and potentially error messages or additional data provided by the gateway. `pg_response` is only supported by type `error`& `success`

##### Example

`Checkout.showPopup("success","Payment Successful! Redirecting you now. Please hold on.")`

<figure><img src="/img/checkout-sdk/image%20%2839%29.png" alt="" /><figcaption></figcaption></figure>

`Checkout.showPopup(‘error’,'Selected payment method failed. Try again.' , { "merchant":"009057332", "timeOfLastUpdate":"2023-08-01T14:19:00.510Z", "version":"65" })`

<figure><img src="https://lh5.googleusercontent.com/5P3n5FivJZCuxEgvohnsHuU3FB_ii8mEm7qRXX1jRi-B43I3g8rn0HntFw-1CyFz7IP0NFSN9Z7FrzK6OOYBmA3PMmyiQ3ln5yOBGivhxJ5n7KfXz8NlnYsCI2YH5Yy1GaO06nBRs3g3l0T5j8Zo1zM" alt="" /><figcaption></figcaption></figure>

`Checkout.showPopup(‘redirect’,’Redirecting to the payment page’)`

<figure><img src="https://lh5.googleusercontent.com/4FD7FOGF-xSMf1MtE4B9WxQ3tkANDDcY2YfKJviKaN0oxI1LYfXLXaZLYoGDkXn7G5HXnvlNHSK6C1Rn-3SClCJgL1yVhZi4624M0EtweUrtXhYxX9RZGlFu5I7_djpXZPmFeC5KIuCcjNMek35uTBI" alt="" /><figcaption></figcaption></figure>

### Callbacks

In the Checkout SDK, callback functions play a vital role in providing real-time updates on the status of payment transactions. `Callbacks` enhance the user experience by enabling seamless and efficient handling of various payment scenarios, such as errors, successful payments, and cancellations.

Please note that due to technical constraints associated with off-site redirection during the payment process, the `successCallback` and `cancelCallback` functions are only called for on-site checkouts. However, the `errorCallback` function is called for any kind of payments. On-site checkouts include options such as Apple Pay, Google Pay, payments with saved cards, and on-site card form transactions, which support callback functionality for a seamless user experience.

#### **window.errorCallback**

The `errorCallback` is a callback function that is invoked when issues arise during a payment. It is important to handle errors appropriately to ensure a smooth user experience. The recommended best practice in case of an error is to restart the checkout process by creating a new [session_id](./checkout-api) using the [Checkout API](./checkout-api).

To define the `errorCallback` function, you can use the `data-error` attribute on the Checkout script tag to specify a global function that will handle errors. If an error occurs during a payment, the `errorCallback` function will be invoked with a [data object](#data-object) with a data.status value of `error`

**Params Available in Data Object for `errorCallback`**

- `message` <span style={{ color: "red" }}>required</span>
- `form_of_payment` <span style={{ color: "red" }}>required</span>
- `status` <span style={{ color: "red" }}>required</span>
- `challenge_occurred`&#x20;
- `session_id`&#x20;
- `order_no`&#x20;
- `reference_number`

**Here's an example of how `errorCallback` might be defined**

```javascript
window.errorCallback = function (data) {
  // If the payment fails with the status "error," the SDK
  // triggers the errorCallback. In errorCallback, we show an
  // error popup by checking if form_of_payment in data is
  // "token_pay" or "redirect".
  const validFormsOfPayments = ["token_pay", "redirect"];
  if (
    validFormsOfPayments.includes(data.form_of_payment) ||
    data.challenge_occurred
  ) {
    const message =
      "Oops, something went wrong. Refresh the page and try again.";
    // Displays a popup with data.message if present; else, it displays a static message.
    window.Checkout.showPopup("error", data.message || message);
  }
  console.log("Error callback", data);
};
```

In this example, the `errorCallback` function is defined and passed as the value of the `data-error` attribute on the Checkout script tag. If an error occurs during a payment, the function will be invoked with a `data object`. This function will handle error as need and show error modal using `Checkout.showPopup()`.

:::info

`errorCallback` function is not required to perform a redirection. It can handle errors in any way that is appropriate for your application.
:::

#### **window.cancelCallback**

The `cancelCallback` in the Checkout SDK is a callback function that is invoked when a payment is canceled. To define the `cancelCallback` function, you can use the `data-cancel` attribute on the Checkout script tag to specify a global function that will handle cancellations. If a customer cancels a payment, the `cancelCallback` function will be invoked with a[ data object](https://ottu-sandbox.gitbook.io/public/developer/checkout-sdk/web-v3#data-object).with a data.status value of "`canceled`”

**Params Available in Data Object for `cancelCallback`**

- `message`
- `form_of_payment`
- `challenge_occurred`&#x20;
- `session_id`&#x20;
- `status`&#x20;
- `order_no`&#x20;
- `reference_number`
- `payment_gateway_info`

**Here's an example of how `cancelCallback` might be defined**

```javascript
window.cancelCallback = function (data) {
  // If the payment fails with the status "canceled," the SDK
  // triggers the cancelCallback. In cancelCallback, we show
  // an error popup by checking if pg_name in
  // data.payment_gateway_info is "kpay" or data.form_of_payment
  // is "token_pay".
  if (
    data.payment_gateway_info &&
    data.payment_gateway_info.pg_name === "kpay"
  ) {
    // Displays a popup with pg_response as key-value pairs.
    window.Checkout.showPopup(
      "error",
      " ",
      data.payment_gateway_info.pg_response,
    );
  } else if (data.form_of_payment === "token_pay" || data.challenge_occurred) {
    const message =
      "Oops, something went wrong. Refresh the page and try again.";
    // Displays a popup with data.message if present; else, it displays a static message.
    window.Checkout.showPopup("error", data.message || message);
  }
  console.log("Cancel callback", data);
};
```

In this example, the `cancelCallback` function is defined and passed as the value of the `data-cancel` attribute on the Checkout script tag. If a customer cancels a payment, the function will be invoked with a[ data object](https://ottu-sandbox.gitbook.io/public/developer/checkout-sdk/web-v3#data-object) containing information about the cancelled transaction. This function will handle cancellation as needed and show error modal using Checkout.showPopup().

#### **window.successCallback**

In the Checkout SDK, the `successCallback` is a function triggered upon successful completion of the payment process. This callback receives a [data object](#data-object),with a data.status value of `success`

**Params Available in Data Object for `successCallback`**

- `message`
- `form_of_payment`
- `challenge_occurred`&#x20;
- `session_id`&#x20;
- `status`&#x20;
- `order_no`&#x20;
- `reference_number`
- `redirect_url`
- `payment_gateway_info`

The `successCallback` function is defined and passed as the value of the data-success attribute on the Checkout script tag. If the payment process completes successfully, the function will be invoked with a [data object](#data-object) containing information about the completed transaction. The function will then redirect the customer to the specified `redirect_url` using `window.location.href`.

**Here's an example of how `successCallback` might be defined**

```javascript
window.successCallback = function (data) {
  // If payment gets completed with status "success," SDK triggers the successCallback.
  // In successCallback, we redirect the user to data.redirect_url.
  window.location.href = data.redirect_url;
};
```

#### windows.beforePayment Hook

To ensure the integrity of your transactions, the Checkout SDK provides a `beforePayment` hook that allows you to take necessary precautions before the payment process starts. It's crucial for e-commerce platforms to implement this feature, especially when considering multi-tab operations by users.

##### How to Implement

**Initialize the Hook**

1. When initializing the SDK, you can set up the `beforePayment` hook which will trigger when the payment process starts.. This hook should return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). If the Promise is **resolved**, the user may **continue** with the payment process. However, if the Promise is **rejected**, the payment process will be **halted**, and an error message will appear in the browser console.&#x20;
2. For wallet payments such as `ApplePay`, `GooglePay`, and `STCPay`, the respective payment sheet will be presented. As soon as the payment process begins, the SDK will invoke the `beforePaymen`t hook.&#x20;
3. For other payment methods, including redirect, `ottuPG`, and `tokenPay`, the `beforePayment` hook is triggered when the `Pay` button is clicked

**Params Available in Data Object for `beforePayment`**

- `redirect_url`

```javascript
window.beforePayment = function (data) {
  return new Promise(function (resolve, reject) {
    fetch("https://api.yourdomain.com/basket/freeze", {
      method: "POST",
    })
      .then(function (response) {
        if (response.ok) {
          if (data && data.redirect_url) {
            window.Checkout.showPopup(
              "redirect",
              data.message || "Redirecting to the payment page",
              null,
            );
          }
          resolve(true);
        } else reject(new Error("Failed to freeze the basket."));
      })
      .catch(reject);
  });
};
```

**Handle Payment Outcomes**

- **Success**: Direct users to the payment success page.
- **Cancel/Error**: It's essential to unfreeze the cart to allow the user to make changes and retry the payment. Use the `cancelCallback` and `errorCallback` provided by the SDK to handle these cases.

##### Best Practices

- Always freeze cart updates during ongoing payment processes. This ensures users can't manipulate cart contents in parallel with a transaction, preserving transaction integrity.
- Ensure that the cart is unfrozen in cases of payment cancellations or errors. This improves user experience, allowing them to adjust their cart if needed.

#### **Example: Apply Discount Based on Card PAN**

In `tokenPay` and `cardPay` payment methods, the SDK passes the card details to the `beforePayment` callback. This allows you to identify the card brand or specific bank (via PAN) and apply a discount dynamically.

**Implementation Steps:**

1.  **Call your backend:** Your frontend should notify your server about the discount eligibility. The server must then call the [Ottu Checkout Patch API](./checkout-api) to update the `amount` to be captured.

    <div data-gb-custom-block data-tag="hint" data-style="info" class="hint hint-info"><p><em>Never call the Ottu Checkout API directly from the client side; always route it through your secure server.</em></p></div>

2.  **Update the UI:** Reflect the applied discount on your checkout page so the customer sees the final price before the payment sheet appears or 3DS starts.
3.  **Return the Promise:** Ensure the `beforePayment` hook returns a promise. Resolve it once the backend update is successful so the payment proceeds with the new amount.
4.  **Handle Cancelation/Errors:** If the customer cancels or the payment fails, call your backend again to restore the original amount via the Patch API.
5.  **Restore UI:** Update the amount shown on the page back to the original value.

**Code Example:**

JavaScript

```javascript
// Helper to restore original amount
const restoreAmount = (sessionId) => {
  fetch("/api/restore-amount", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
    }),
  }).then(() => {
    document.getElementById("total-amount").innerText = "Original Amount";
  });
};
// 1-3: Handle Discount Logic (runs before redirect/wallet payments)
window.beforePayment = (paymentData) => {
  return new Promise((resolve) => {
    const card = paymentData?.card;
    // Check if it's a card payment and has a PAN
    if (card && card.number) {
      // 1. Call your backend to apply discount via Ottu Patch API
      fetch("/api/apply-discount", {
        method: "POST",
        body: JSON.stringify({
          pan: card.number,
          session_id: "your_session_id",
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            // 2. Update the page UI with the new discounted amount
            document.getElementById("total-amount").innerText =
              result.new_amount;
          }
          // 3. Resolve the promise to proceed with updated amount
          resolve();
        })
        .catch((error) => {
          console.error("Discount application failed", error);
          resolve();
        });
    } else {
      resolve();
    }
  });
};
window.cancelCallback = (data) => {
  console.log("Payment Canceled", data);
  restoreAmount(data.session_id);
};
window.errorCallback = (data) => {
  console.error("Payment Error", data);
  restoreAmount(data.session_id);
};
// Handle successful payment
window.successCallback = (data) => {
  console.log("Payment Successful!", data);
  // Redirect to success page if redirect_url is provided
  if (data.redirect_url) {
    window.location.href = data.redirect_url;
  }
};
Checkout.init({
  selector: "checkout",
  merchant_id: "domain",
  session_id: "session_id",
  apiKey: "apiKey",
});
```

##### **Card Data Structure**

When `tokenPay` or `cardPay` is used, the `paymentData` argument in the hook will contain the following `card` object:

JSON

```json
 "card": {
   "number": "445653XXXXXX1096",
   "expiry_month": "01",
   "expiry_year": "29",
   "brand": "VISA",
   "scheme": "Visa"
 }
```

:::info

_This implementation ensures that the financial integrity of the transaction is maintained server-side while providing a smooth, responsive discount experience for the user._
:::

#### **windows.validatePayment Hook**

The `validatePayment` hook is a **pre-validation step** in the **Checkout SDK Web**, ensuring that **all required payer information** (e.g., terms acceptance, additional user inputs) is collected and valid **before** proceeding with payment.

:::info

This hook **runs before any payment trigger**, making sure that the payment can only proceed if all required conditions are met.
:::

##### **Key Features**

- Hook is called before payment initiation.
- Runs before every payment method (Apple Pay, Google Pay, Redirects, Tokenization, etc.)
- **Prevents incomplete payments** by validating payer-provided data.
- **Returns a** [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to control the flow:
  - **Resolves →** Payment proceeds.
  - **Rejects →** Payment submission is blocked.
- Works for all payment types, unlike `beforePayment`, which runs only before redirection-based payments.
- No form of payment can proceed without passing validation.

##### **Implementation**

The `validatePayment` hook must be defined as a **global function** that returns a Promise.

##### **Example: Validating Terms Acceptance**

```javascript
window.validatePayment = function () {
  return new Promise((resolve, reject) => {
    // Custom validations to ensure required fields are valid for payment to proceed.
    const termsAccepted = document.getElementById("termsCheckbox").checked;

    if (termsAccepted) {
      resolve(true); // Proceed with payment
    } else {
      alert("Please accept the terms and conditions before proceeding.");
      reject(new Error("Terms not accepted")); // Block payment
    }
  });
};
```

##### **How to Enable It in Checkout SDK**

To enable `validatePayment`, include it in the SDK script tag:

```html
<script
  src="https://assets.ottu.net/checkout/v3/checkout.min.js"
  data-validatepayment="validatePayment"
></script>
```

##### **How It Works**

1. **User initiates payment** (clicks “Pay”).
2. **validatePayment** is triggered **before any payment request**.
3. If **validation fails**, the payment process stops, preventing submission.
4. If **validation succeeds**, the payment method proceeds normally.
5. Payment is completed or redirected.

<figure><img src="/img/checkout-sdk/_-%20visual%20selection%20%281%29.png" alt="" width="375" /><figcaption></figcaption></figure>

##### **Use Cases**

- **Ensuring Terms & Conditions Acceptance**\
  Require users to **accept terms** before making a payment.
- **Verifying User Input**\
  Ensure **additional fields** (e.g., phone number, promo code) are correctly filled.
- **Checking Cart Consistency**\
  Verify that **items in the cart** haven’t changed before processing payment.
- **Blocking Suspicious Activity**\
  Prevent payments from going through if **unusual behavior** is detected.

##### **Comparison with beforePayment Hook**

| Feature                                                | validatePayment | beforePayment              |
| ------------------------------------------------------ | --------------- | -------------------------- |
| Runs before **any payment method**                     | Yes             | No (only for redirections) |
| Blocks incomplete payments                             | Yes             | No                         |
| Allows verification that the required fields are valid | Yes             | No                         |
| Runs before Apple Pay, Google Pay, Tokenization        | Yes             | Yes                        |
| Runs before Redirects                                  | Yes             | Yes                        |

---

##### **Best Practices for Implementation**

- **Use clear error messages** to guide users if validation fails.
- **Ensure the hook runs quickly** to avoid checkout delays.
- **Combine with UI updates** (e.g., disable the “Pay” button until valid).
- **Test across different payment methods** to confirm expected behavior.

##### **Full Example: Terms + Phone Number Validation**

```javascript
window.validatePayment = function () {
  return new Promise((resolve, reject) => {
    const termsAccepted = document.getElementById("termsCheckbox").checked;
    const phoneNumber = document.getElementById("phoneInput").value;

    if (!termsAccepted) {
      alert("Please accept the terms and conditions.");
      return reject(new Error("Terms not accepted"));
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid phone number.");
      return reject(new Error("Invalid phone number"));
    }

    resolve(true); // Proceed with payment
  });
};
```

#### **data Object**

The data object received by the [errorCallback](#windowerrorcallback), [cancelCallback](#windowcancelcallback) and [successCallback](#windowsuccesscallback) contains information related to the payment transaction, such as the status of the payment process, the session_id generated for the transaction, any error message associated with the payment, and more. This information can be used to handle the payment process and take appropriate actions based on the status of the transaction.

#### Data Object Child Parameters

- ##### message `string`

  It is a string message that can be displayed to the customer. It provides a customer-friendly message regarding the status of the payment transaction.

- ##### session_id `string`

  It is a unique identifier generated when a payment transaction is created. It is used to associate a payment transaction with the checkout process. You can find the `session_id` in the response of the Checkout API's [session_id](./checkout-api) endpoint. This parameter is required to initialize the Checkout SDK.

- ##### status `string`

  It is of the checkout process. Possible values are:
  - `success`: The customer was charged successfully, and they can be redirected to a success page or display a success message.
  - `canceled`: The payment was either canceled by the customer or rejected by the payment gateway for some reason. When a payment is canceled, it's typically not necessary to create a new payment transaction, and the same session_id can be reused to initiate the Checkout SDK and allow the customer to try again. By reusing the same session_id, the customer can resume the checkout process without having to re-enter their payment information or start over from the beginning.
  - `error`: An error occurred during the payment process, This can happen for a variety of reasons, such as a network failure or a problem with the payment gateway's system. The recommended action is to create a new payment transaction using the Checkout API and restart the checkout process.

- ##### redirect_url `URL`

  The URL where the customer will be redirected after the payment stage only if the webhook URL returns a success status. order_no, reference_number and session_id will be appended to the redirect URL as query parameters. The developer implementing the SDK must ensure that the redirection process is smooth and secure, providing a seamless experience for the customer while maintaining the integrity of the payment process.&#x20;

:::warning

It's important to note that while the `redirect_url` option is typically present only in the [successCallback](#windowsuccesscallback), there are specific cases where it may exist in failure scenarios. \
**For example,** in the event of an MPGS cancel or if the transaction includes a `webhook URL` alongside a `redirect URL`, users may be redirected after cancellation, which is communicated to the webhook. Therefore, the presence of `redirect_url` in such cases is possible.
:::

- ##### order_no `string`

  The order number provided in the [Checkout API](./checkout-api). See [Checkout API](./checkout-api) & [order_no](./checkout-api).

- ##### reference_number `string`

  A unique identifier associated with the payment process. It is sent to the payment gateway as a unique reference and can be used for reconciliation purposes.

- ##### form_of_payment `string`

  Enum: `apple_pay`, `google_pay`, `token_pay`, `stc_pay` , `redirect`

  Indicates the form of payment used to process the transaction. This can be one of several options, including `apple_pay`, `google_pay`, `token_pay`, `stc_pay`, or `redirect`. It's important to note that the redirect option is only present in the `errorCallback`. In other scenarios, especially with `cancelCallback` and `successCallback`, it's absent. This is because, in the redirect flow, the customer is redirected to a different page where actions like payment cancellation or confirmation occur, not on the page where the SDK is displayed.
  - `apple_pay` - Apple Pay
  - `google_pay` - Google Pay
  - `token_pay` - Token Pay
  - `stc_pay` - stc pay
  - `redirect` - Redirect

- ##### payment_gateway_info `object`

  Information about the payment gateway, accompanied by the response received from the payment gateway

- ##### pg_code `string`

  The unique identifier, or `pg_code`, for the payment gateway that was used to process the payment. This value corresponds to the specific payment method utilized by the customer, such as `credit-card`.

- ##### pg_name `string`

  The name of the payment gateway, represented in all lowercase letters, that was used to perform the payment. This could be one of several values, such as `kpay` (for KNET), `mpgs`, or `cybersource`. These identifiers provide a human-readable way to understand the payment mechanism that was utilized.

- ##### pg_response `object`

  The raw response data that was received directly from the payment gateway after the transaction attempt. This typically includes transaction status, transaction identifier, and potentially error messages or additional data provided by the gateway.

- ##### challenge_occurred `bool`

  Default: false\
  This flag indicates if an additional verification, such as 3DS, OTP, PIN, etc., was initiated during the payment process. Use this flag in `cancelCallback` and `errorCallback` to control the presentation of error messages, especially for on-site payments undergoing a challenge flow. For example, after a failed 3DS verification, it's useful to show a custom popup informing the user of the payment failure. However, it's crucial to note that not all on-site failed payments need custom error messaging. In cases like `GooglePay` or `ApplePay`, error messages are inherently handled by the Payment Sheet, which remains open for the user to retry, making this distinction vital.

### Example Without googlePayInit/ApplePayInit

```javascript
window.errorCallback = function (data) {
  // If payment fails with status "error," SDK triggers the
  // errorCallback. In errorCallback, we show an error popup by
  // checking if form_of_payment in data is "token_pay" or "redirect".
  let validFormsOfPayments = ["token_pay", "redirect"];
  if (
    validFormsOfPayments.includes(data.form_of_payment) ||
    data.challenge_occurred
  ) {
    const message =
      "Oops, something went wrong. Refresh the page and try again.";
    // Displays a popup with data.message if present, else it displays a static message.
    window.Checkout.showPopup("error", data.message || message);
  }
  console.log("Error callback", data);
  // Unfreeze the basket upon an error
  unfreezeBasket();
};

window.successCallback = function (data) {
  // If payment gets completed with status "success," SDK triggers the
  // successCallback. In successCallback, we redirect the user to data.redirect_url.
  window.location.href = data.redirect_url;
};

window.cancelCallback = function (data) {
  // If payment fails with status "canceled," SDK triggers the cancelCallback.
  // In cancelCallback, we show an error popup by checking if pg_name in
  // data.payment_gateway_info is "kpay" or data.form_of_payment is "token_pay".
  if (
    data.payment_gateway_info &&
    data.payment_gateway_info.pg_name === "kpay"
  ) {
    // Displays a popup with pg_response as key-value pairs.
    window.Checkout.showPopup(
      "error",
      "",
      data.payment_gateway_info.pg_response,
    );
  } else if (data.form_of_payment === "token_pay" || data.challenge_occurred) {
    const message =
      "Oops, something went wrong. Refresh the page and try again.";
    // Displays a popup with data.message if present, else it displays a static message.
    window.Checkout.showPopup("error", data.message || message);
  }
  console.log("Cancel callback", data);
  // Unfreeze the basket upon an error
  unfreezeBasket();
};

// Before any payment action (Apple Pay, Google Pay, token payments, direct payments, etc.)
window.beforePayment = function (data) {
  return new Promise(function (resolve, reject) {
    fetch("https://api.yourdomain.com/basket/freeze", {
      method: "POST",
    })
      .then(function (response) {
        if (response.ok) {
          if (data && data.redirect_url) {
            window.Checkout.showPopup(
              "redirect",
              data.message || "Redirecting to the payment page",
              null,
            );
          }
          resolve(true);
        } else reject(new Error("Failed to freeze the basket."));
      })
      .catch(reject);
  });
};

function unfreezeBasket() {
  fetch("https://api.yourdomain.com/basket/unfreeze", {
    method: "POST",
  });
  // Handle unfreeze basket responses or errors if necessary
}

Checkout.init({
  selector: "checkout",
  merchant_id: "sandbox.ottu.net",
  session_id: "session_id",
  apiKey: "apiKey",
  lang: "en",
  displayMode: "grid", // default is column
});
```

### **Extended example**

##### HTML

```html
</head>
    <div id="checkout"></div>
    <script src='https://assets.ottu.net/checkout/v3/checkout.min.js'
        data-error="errorCallback"
        data-success="successCallback"
        data-cancel="cancelCallback"
        data-beforepayment="beforePayment">
    </script>
```

##### JS

```javascript
window.errorCallback = function(data) {
    // If payment fails with status “error” SDK triggers
    // the errorCallback, In errorCallback we show an error
    // popup by checking if form_of_payment in data is
    // “token_pay” or “redirect”.
    let validFormsOfPayments = ['token_pay', 'redirect'];
    if (validFormsOfPayments.includes(data.form_of_payment) ||
        data.challenge_occurred) {
        const message = "Oops, something went wrong. Refresh the page and try again.";
        // Displays a popup with data.message if present, else displays static message.
        window.Checkout.showPopup("error", data.message || message);
    }
    console.log('Error callback', data);
    // Unfreeze the basket upon an error
    unfreezeBasket();
}

window.successCallback = function(data) {
    // If payment gets completed with status “success” SDK
    // triggers the successCallback, In successCallback we
    // redirect the user to data.redirect_url
    window.location.href = data.redirect_url;
}

window.cancelCallback = function(data) {
    // If payment fails with status “canceled” SDK triggers
    // the cancelCallback, In cancelCallback we show error
    // popup by checking if pg_name in data.
    // payment_gateway_info is “kpay” or data.form_of_payment
    // is “token_pay”.
    if (data.payment_gateway_info &&
        data.payment_gateway_info.pg_name === "kpay") {
        // Displays a popup with pg_response as key-value pairs.
        window.Checkout.showPopup("error", '', data.payment_gateway_info.pg_response);
    } else if (data.form_of_payment === "token_pay" ||
        data.challenge_occurred) {
        const message = "Oops, something went wrong. Refresh the page and try again.";
        // Displays a popup with data.message if present, else displays static message.
        window.Checkout.showPopup("error", data.message || message);
    }
    console.log('Cancel callback', data);
    // Unfreeze the basket upon an error
    unfreezeBasket();
}

// Before any payment action (Apple Pay, Google Pay, token payments, direct payments, etc.)
window.beforePayment = function(data) {
    return new Promise(function(resolve, reject) {
        fetch('https://api.yourdomain.com/basket/freeze', {
            method: 'POST'
        })
        .then(function(response) {
            if (response.ok) {
                if (data && data.redirect_url) {
                    window.Checkout.showPopup('redirect', data.message || 'Redirecting to the payment page', null);
                }
                resolve true;
            }
            else reject new Error('Failed to freeze the basket.');
        })
        .catch(reject);
    });
}

function unfreezeBasket() {
    fetch('https://api.yourdomain.com/basket/unfreeze', {
        method: 'POST'
    })
    // Handle unfreeze basket responses or errors if necessary
}

```

##### JS

Checkout init function

```javascript
Checkout.init({
  selector: "checkout",
  merchant_id: "sandbox.ottu.net",
  session_id: "session_id",
  apiKey: "apiKey",
  lang: "en", // en or ar default en
  formsOfPayments: [
    "applePay",
    "googlePay",
    "stcPay",
    "ottuPG",
    "tokenPay",
    "redirect",
    "urPay",
  ],
  displayMode: "grid", // default is column
  applePayInit: {
    supportedNetworks: ["amex", "masterCard", "maestro", "visa", "mada"],
    merchantCapabilities: ["supports3DS"],
  },
  googlePayInit: {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedCardNetworks: [
      "AMEX",
      "DISCOVER",
      "INTERAC",
      "JCB",
      "MASTERCARD",
      "VISA",
    ],
    allowedCardAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
    tokenizationSpecificationType: "PAYMENT_GATEWAY",
    baseCardPaymentMethodType: "",
    paymentsClient: null,
    totalPriceStatus: "FINAL",
    totalPriceLabel: "Total",
    buttonLocale: "en",
  },
});
```

### Apple Pay

If you have completed the [Apple Pay integration](#apple-pay) between Ottu and Apple, the Checkout SDK will automatically make the necessary checks to display the Apple Pay button.

When you initialize the Checkout SDK with your session_id and payment gateway [codes](./checkout-api), the SDK will automatically verify the following conditions:

- When initializing the Checkout SDK, a session_id with a [pg_codes](./checkout-api) that was associated with the Apple Pay Payment Service was supplied.
- The customer has an Apple device that supports Apple Pay payments.
- The browser being used supports Apple Pay.
- The customer has a wallet configured on their Apple Pay device.

If all of these conditions are met, the Apple Pay button will be displayed and available for use in your checkout flow. If the wallet is not configured, the Apple Pay button will still appear.Clicking on the button Apple Pay wallet on their device will open, allowing them to configure it and add payment cards.

By default, the type of the Apple Pay button is [pay](https://developer.apple.com/documentation/passkit/pkpaymentbuttontype/instore), which is used to initiate a payment. However, you can override the default button type using the [applePayInit](#applepayinit-object) property of the Checkout SDK.

#### Customize Apple Pay button

:::warning

If you're using only the Apple Pay button from the Checkout SDK and wish to customize its appearance, it's vital to adhere to the [ Apple Pay guidelines](https://developer.apple.com/design/human-interface-guidelines/technologies/apple-pay/buttons-and-marks) to ensure your design aligns with Apple's specifications. Note that the SDK uses default styles outlined in the guidelines. Using styles not supported by Apple, such as certain background-colors or border-colors, will not take effect. Failure to comply with these guidelines could lead to your app being rejected or even a ban on your developer account by Apple.
:::

It's the responsibility of the merchant to ensure that their use of the Apple Pay button follows Apple's guidelines, and Ottu cannot be held responsible for any issues that arise from non-compliance. If you have any questions or concerns about using the Apple Pay button, please consult the [Apple Pay guidelines](https://developer.apple.com/design/human-interface-guidelines/technologies/apple-pay/buttons-and-marks) or contact Apple directly for assistance.

If you only want to use Apple Pay with the Ottu Checkout SDK and control the other payment methods yourself, you can customize the Apple Pay button using the Checkout SDK's [formsOfPayment](#formsofpayment-array), [applePayInit](#applepayinit-object) and[ theme](#theme-object) properties.&#x20;

Properties like `buttonColor`, `buttonType` and `css` properties like height, width, margin etc are can be customized using theme while buttonLocale can be customized using `ApplePayInit`&#x20;

To display only the Apple Pay button with default `css`, use the following code:

```javascript
Checkout.init({
  // Define the mandatory properties
  formsOfPayment: ["applePay"],
});
```

The [formsOfPayment](#formsofpayment-array) property tells the Checkout SDK to render only the Apple Pay button. If you don't include this property, the SDK will render all available payment options.

To customize the Apple Pay button's appearance, you can use the theme property. The example below adjusts the size of the button and centers it within the Checkout SDK container:

```javascript
Checkout.init({
    // Define the mandatory properties
    formsOfPayment: ["applePay"],
    theme: {
        applePay: {
            “buttonType”: 'plain',
            “buttonColor”: 'black'
            "width": '100%',
            "height": '50px',
            "margin-top": '0',
            "margin-bottom": '0',
        }
    }
});
```

The Apple Pay button inside the Checkout SDK container can be customized using the ​[theme](#theme-object) property by defining the following:

- `theme.applePay`: This class sets the width,height, margin, and padding of the button.
- `theme.applePay.buttonType`: This determines the type of the Apple Pay button. \
  **For example**, setting `buttonType`:
  - `plain` will render a plain Apple Pay button.
  - `buy` or `donate` will render buttons with the corresponding labels.
- `theme.applePay.buttonColor`: This determines the color of the Apple Pay button. \
  **For example**, setting `buttonColor`:&#x20;
  - `black` will render a black Apple Pay button.
  - `white` or `white-outline` will render buttons with the corresponding colors.

By default, the width of the Apple Pay button is 100% of the Checkout SDK container width, gap of 8px from other buttons. The Checkout SDK creates a containerized div with the css class ottu\_\_sdk-main and places the Apple Pay button inside it. This container has no margin or padding added, as shown in below figure. To learn more about the `applePay` property, see the theme.

<figure><img src="/img/checkout-sdk/Apple%20Pay%20button.png" alt="" /><figcaption></figcaption></figure>

### Google Pay

If you have completed the Google Pay integration between Ottu and Google Pay, the Checkout SDK will handle the necessary checks to display the Google Pay button seamlessly.

When you initialize the Checkout SDK with your [session_id](./checkout-api) and payment gateway codes [pg_codes](./checkout-api) , the SDK will automatically verify the following conditions:

- The `session_id` and `pg_codes` provided during SDK initialization must be associated with the Google Pay Payment Service. This ensures that the Google Pay option is available for the customer to choose as a payment method.
- Web SDK checks if the merchant configuration for Google Pay is correct or not and then show Google Pay button based on it.
- The Web SDK displays the Google Pay button irrespective of whether the customer's Google Pay wallet is configured. When the customer clicks the button, they are prompted to log in with their email and add their card if their wallet is not set up.

Google Pay configuration is controlled by using [googlePayInit](#googlepayinit-object) object.

#### **Customize Google Pay button**

:::info

If you're using only the Google Pay button from the Checkout SDK and wish to customize its appearance, it's vital to adhere to the [Google Pay guidelines](https://developers.google.com/pay/api/web/guides/brand-guidelines) to ensure your design aligns with Google's specifications. Note that the SDK uses default styles outlined in the guidelines. Using styles not supported by Google, such as certain background-colors or border-colors, will not take effect. Failure to comply with these guidelines could lead to your app being rejected or even a ban on your developer account by Google.&#x20;
:::

It's the responsibility of the merchant to ensure that their use of the Google Pay button follows Google's guidelines, and Ottu cannot be held responsible for any issues that arise from non-compliance. If you have any questions or concerns about using the Google Pay button, please consult the [Google Pay guidelines](https://developers.google.com/pay/api/web/guides/brand-guidelines) or contact Google directly for assistance.

You can customize the Google Pay button using the Checkout SDK's [formsOfPayment](#formsofpayment-array), googlePayInit and theme . The `formsOfPayment` property tells the Checkout SDK to render only the Google Pay button. If you don't include this property, the SDK will render all available payment options.

Properties like `buttonColor`, `buttonType`, `buttonSizeMode` and `css` properties like height, width, margin etc can be customized using `theme` while `buttonLocale` can be customized using `googlePayInit` .

```javascript
Checkout.init({
    // Define the mandatory properties
    formsOfPayment: ["googlePay"],
    // Below are the default values configured for googlePay
    },
    theme: {
        googlePay: {
            “buttonType”:”plain”,
            “buttonColor”:”black”,
            "width": "100%",
            "height": "50px",
            "margin-top": "0",
            "margin-bottom": "0",
        }
    }
});
```

<figure><img src="/img/checkout-sdk/Google%20Pay%20Button.png" alt="" /><figcaption></figcaption></figure>

### stc pay​

If you have completed the stc pay integration between Ottu and stc pay, the Checkout SDK will handle the necessary checks to display the stc pay button seamlessly. When you initialize the Checkout SDK with your [session_id](./checkout-api) and payment gateway codes [pg_codes](./checkout-api), the SDK will automatically verify the following conditions:

1. The `session_id` and `pg_codes` provided during SDK initialization must be associated with the stc pay Payment Service. This ensures that the stc pay option is available for the customer to choose as a payment method.
2. The Web SDK displays the stc pay button irrespective of whether the customer has provided a mobile number while creating the transaction or not.

#### Customize stc pay Button

You can customize the stc pay button using the Checkout SDK's [formsOfPayment](#formsofpayment-array) and [theme](#theme-object) properties. The `formsOfPayment` property tells the Checkout SDK to render only the stc pay button. If you don't include this property, the SDK will render all available payment options.

```javascript
Checkout.init({
    // Define the mandatory properties
    formsOfPayment: ["stcPay"],
    theme: {
        "stcPay": {
            “buttonColor”: "black",
            "width": "100%",
            "height": "50px",
            "margin-top": "0",
            "margin-bottom": "0",
        }
    }
});
```

<figure><img src="/img/checkout-sdk/stc%20pay%20Button.png" alt="" /><figcaption></figcaption></figure>

### urpay​​

If you have completed the urpay integration between Ottu and urpay, the Checkout SDK will handle the necessary checks to display the urpay button seamlessly. When you initialize the Checkout SDK with your `session_id` and payment gateway codes `pg_codes`, the SDK will automatically verify the following conditions:

1. The `session_id` and `pg_codes` provided during SDK initialization must be associated with the urpay Payment Service. This ensures that the urpay option is available for the customer to choose as a payment method.
2. The Web SDK displays the urpay button irrespective of whether the customer has provided a mobile number while creating the transaction or not.

#### **Customize** urpay **Button**

You can customize the urpay button using the Checkout SDK's `formsOfPayment` and `theme` properties. The `formsOfPayment` property tells the Checkout SDK to render only the urpay button. If you don't include this property, the SDK will render all available payment options.

```javascript
Checkout.init({
  // define the mandatory properties
  formsOfPayment: ["urPay"],
  theme: {
    urPay: {
      buttonColor: "white",
      width: "100%",
      height: "50px",
      "margin-top": "0",
      "margin-bottom": "0",
    },
  },
});
```

<figure><img src="/img/checkout-sdk/urpay%20Button.png" alt="" /><figcaption></figcaption></figure>

### **KNET - Apple Pay**

Due to compliance requirements, KNET requires a popup displaying the payment result after each failed payment. This is available only on the cancelCallback when there is a response from the payment gateway. As a side effect, the user can not try again the payment without clicking on Apple Pay again.

:::info

The use of the popup notification described above is specific to the KNET payment gateway. Other payment gateways might have different requirements or notification mechanisms, so be sure to follow the respective documentation for each payment gateway integration.
:::

To properly handle the popup notification for KNET, you need to implement the provided code snippet into your payment processing flow. The code looks like this:

```javascript
window.cancelCallback = function (data) {
  // If payment fails with the status "canceled," the SDK triggers the cancelCallback.
  // In cancelCallback, we show an error popup by checking
  // if pg_name is in data.payment_gateway_info is "kpay" or data.form_of_payment is "token_pay".

  if (
    data.payment_gateway_info &&
    data.payment_gateway_info.pg_name === "kpay"
  ) {
    // Displays a popup with pg_response as key-value pairs.
    window.Checkout.showPopup(
      "error",
      " ",
      data.payment_gateway_info.pg_response,
    );
  } else if (data.form_of_payment === "token_pay" || data.challenge_occurred) {
    const message =
      "Oops, something went wrong. Refresh the page and try again.";
    // Displays a popup with data.message if present, else displays a static message.
    window.Checkout.showPopup("error", data.message || message);
  }

  console.log("Cancel callback", data);
};
```

The above code performs the following checks and actions:

1. It first verifies if the `cancel` object contains information about the payment gateway (`payment_gateway_info`).
2. Next, it checks if the `pg_name` property in `payment_gateway_info` is equal to `kpay`, indicating that the payment gateway used is indeed KNET.
3. If the above conditions are met, it retrieves the payment gateway's response from the `pg_response` property or, if not available, uses a default "Payment was cancelled." error message.
4. Finally, it displays the error message in a popup using the `window.Checkout.showPopup()` function to notify the user about the failed payment.

<figure><img src="/img/checkout-sdk/2480DAEF-F1E6-47CE-A271-418F222A0BBD.jpg" alt="" /><figcaption></figcaption></figure>

### FAQ

#### 1 What forms of payments are supported by the SDK?

The SDK supports the following payment forms: `applePay`, `tokenPay`, `ottuPG`, `redirect`, `googlePay`, and `stcPay`. Merchants can display specific methods according to their needs. \
**For example,** if you want to only show the Apple Pay button, you can do so using \
[formsOfPayment](#formsofpayment-array) = \[`applePay`], and only the Apple Pay button will be displayed. The same applies for `stcPay`, `googlePay`, and other methods.

#### 2 How do I migrate from an older version of the SDK to the new version?

To migrate from an older version to the latest version, please refer to the [Installation](#installation) section of the Ottu SDK docs. There you can find the SDK script with the latest version.

#### 3 How can I customize the appearance of the checkout page using themes?

The SDK offers various predefined [themes ](#theme-object)that merchants can use to easily change the checkout page’s appearance. Themes such as [dark theme](#dark-theme), [minimal theme](#minimal-theme), hide headers, and hide amount are available. Each theme is predefined by specific `css` classes with unique properties.

#### 4 Can I customize the appearance beyond the provided themes?

Yes, after familiarizing yourself with the supported `css` classes, you can use the `theme` object to customize the appearance of any component you want.\
**Example:** If you want to change Pay Button color to blue, you can use below class in theme

```javascript
theme: {
    "pay-button": {
        "background": "blue"
    }
}
```

#### 5 Are there any known compatibility issues with browsers or platforms?

Yes, there are some compatibility nuances to be aware of:

- For the Apple Pay button, it is mainly displayed on Apple devices and the Safari browser. For Chrome, it will only be displayed on the latest iOS 16.
- For and Google Pay, stc pay & other payments methods, always refer to their official documentation for the most recent information about compatibility issues.

#### 6 How do I customize the payment request for Apple Pay and Google Pay?

You can tailor the payment request for both Apple Pay and Google Pay using their respective initialization methods. These methods allow you to set various properties like API version, supported cards, networks, countries, and merchant capabilities etc.You can check the list of properties supported by [ApplePay](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaypaymentrequest) & [GooglePay](https://developers.google.com/pay/api/web/reference/request-objects#PaymentDataRequest).

#### 7 Why am I seeing a tooltip related to Apple Pay’s unavailability on the Apple Pay button?

The tooltip indicates certain prerequisites for Apple Pay are not met. Reasons could include a pending iOS update, cards not added to the Wallet, invalid merchant configurations, domain not verified by Apple, or the device being unsupported or old. Ensure all Apple Pay requirements are met for a smooth payment experience.

#### 8 What if a merchant wants to perform specific actions before the payment process?

Merchants can utilize the [beforePayment](#windowsbeforepayment-hook) hook. This allows for specific actions or checks to be performed prior to payment/redirection. Once your actions or checks are complete, resolve the promise to proceed with the redirection/payment.

**In conclusion**, this documentation serves as your comprehensive guide to our Web SDK. Here's a quick recap of the key points covered: Information about the fundamental **Checkout SDK**, the backbone of seamless web-based transactions. Practical [demonstrations ](#demo)have provided valuable insights into effective SDK integration. Detailed descriptions of [functions ](#functions)and methods have equipped you to harness the SDK's full potential. Explaining the essential role of [callbacks](#callbacks) in event handling. A rich array of **examples** has guided you through real-world SDK feature implementations. Exploring [Apple Pay](#apple-pay)**,** [Google Pay](#google-pay)**,** and even KNET-Apple Pay for efficient, secure payments.

As you conclude your journey through this documentation, consider exploring the next section: [**Checkout SDK - iOS**](ios/).&#x20;

---

## iOS

The [Checkout SDK](../) is a Swift framework (library) provided by Ottu, designed to facilitate the seamless integration of an Ottu-powered checkout process into iOS applications.

With the Checkout SDK, both the visual appearance and the forms of payment available during the [checkout process](#ottu-checkout-sdk-flow) can be fully customized.

To integrate the Checkout SDK, the library must be included in the iOS application and initialized with the following parameters:

- [merchant_id](https://app.gitbook.com/s/su3y9UFjvaXZBxug1JWQ/#merchant_id-string)
- [session_id](./checkout-api)
- [API public key](../getting-started/authentication#public-key)

Additionally, optional configurations such as the [forms of payment](#formsofpayment-array-optional) to accept and the theme styling for the checkout interface can be specified.

:::warning

[API private key](../getting-started/authentication#private-key-api-key) should never be used on the client side. Instead, [API public key ](../getting-started/authentication#public-key)should be used. This is essential to ensure the security of your application and the protection of sensitive data.
:::

---

## Quick Start

This guide walks you through installing and integrating the Ottu Checkout iOS SDK into your iOS project.\
Choose your installation **path** and follow the journey step by step.

### Video Tutorial: iOS SDK Integration

This video walks you step-by-step through the iOS SDK integration process. Watch it to quickly understand setup, configuration, and key features in action.

<iframe
  title="iOS SDK Integration Video"
  src="https://drive.google.com/file/d/10qN4Iuy-6dU6-rLNRZNodgjdB_AEHZCk/preview"
  style={{ width: "100%", height: "480px", border: "0" }}
  loading="lazy"
  allow="fullscreen"
/>

### Prerequisites

Before integrating the Checkout SDK, please review the following requirements:

#### Apple Pay Project Settings

If your app should support **Apple Pay**:

1. Enable **Apple Pay capability** in:\
   `Xcode > Targets > Signing & Capabilities`
2. Add **Apple Pay Merchant IDs (MID)** in project settings

#### iOS Supported Versions

- Since the **minimum supported iOS version** is **14**, the **primary demo application** is implemented using **UIKit framework** (SwiftUI is recommended starting from iOS 15).\
  &#x20;[ottu-ios/Example at main · ottuco/ottu-ios](https://github.com/ottuco/ottu-ios/tree/main/Example?utm_source=chatgpt.com)
- However, there’s also a **minimalistic SwiftUI-based demo app**:\
  [ottu-ios/Example_SwiftUI at main · ottuco/ottu-ios](https://github.com/ottuco/ottu-ios/tree/main/Example_SwiftUI?utm_source=chatgpt.com)

### Installation

You can install the SDK via two paths:

- **Path One:** Swift Package Manager (Recommended)
- **Path Two:** CocoaPods (Deprecated)

#### Path One – Install via Swift Package Manager (Recommended)

Add Ottu SDK as a dependency in `Package.swift`:

```swift
dependencies: [
    .package(url: "https://github.com/ottuco/ottu-ios.git", from: "2.1.10")
]
```

Or in Xcode:

1. Open your project
2. Go to **Project > Targets > Package Dependencies**
3. Add `ottu-ios` as a dependency

#### Path Two – Install via CocoaPods (Deprecated)

Add the following line to your **Podfile**:

```ruby
pod 'ottu_checkout_sdk', :git => 'https://github.com/ottuco/ottu-ios.git', :tag => '2.1.10'
```

**Run:**

```bash
pod install
```

:::success

When ottu_checkout_sdk is added to the Podfile, the GitHub repository must also be specified as follows:

```bash
pod 'ottu_checkout_sdk', :git => 'https://github.com/ottuco/ottu-ios'
```

:::

:::warning

If you see _“could not find compatible versions for pod”_, run:

```bash
pod repo update
```

:::

### Integrate Checkout SDK to the Source Code

Once the SDK is installed (via Path One or Path Two), follow these steps to integrate it into your app.

<ol className="stepper">
  <li className="stepper-item">
    <strong>Import the SDK</strong>
    <div>
      In your `ViewController.swift` (or any file responsible for presenting the SDK):
    </div>

    ```swift
    import ottu_checkout_sdk
    ```
  </li>
  <li className="stepper-item">
    <strong>Conform to `OttuDelegate`</strong>
    <div>Your view controller must implement the `OttuDelegate` protocol:</div>

    ```swift
    class ViewController: UIViewController, OttuDelegate
    ```
  </li>
  <li className="stepper-item">
    <strong>Declare a Checkout Member</strong>
    <div>Inside your `ViewController`:</div>

    ```swift
    private var checkout: Checkout?
    ```
  </li>
  <li className="stepper-item">
    <strong>Initialize Checkout</strong>
    <div>Inside `viewDidLoad`, initialize the Checkout SDK:</div>

    ```swift
    do {
        self.checkout = try Checkout(
            displaySettings: PaymentOptionsDisplaySettings(
              mode: PaymentOptionsDisplaySettings.PaymentOptionsDisplayMode.list,
            ),
            sessionId: sessionId,
            merchantId: merchantId,
            apiKey: apiKey,
            delegate: self
        )
    } catch let error as LocalizedError {
        print(error)
        return
    } catch {
        print("Unexpected error: \\(error)")
        return
    }
    ```

    <strong>Required parameters</strong>
    <ul>
      <li>`sessionId` → ID of the created transaction</li>
      <li>`merchantId` → Same as the domain address in API requests</li>
      <li>`apiKey` → Public API key for authorization</li>
      <li>`delegate` → Callback listener (usually `self`)</li>
    </ul>

    <strong>Recommended parameters</strong>
    <ul>
      <li>`formsOfPayment` → Defines available payment methods</li>
      <li>`setupPreload` → Preloads transaction details for faster initialization</li>
    </ul>

    > `setupPreload` comes from the transaction creation response.\
    > Passing it prevents the SDK from re-fetching transaction details, reducing initialization time by **several seconds**. It is a decoded JSON object to a `TransactionDetails` object.\
    > See an example: [MainViewController.swift](https://github.com/ottuco/ottu-ios/blob/main/Example/OttuApp/MainViewController.swift#L259)

    The simplest version of the initialization looks like this:

    ```swift
    do {
        self.checkout =
            try Checkout(
                sessionId: sessionId,
                merchantId: merchantId,
                apiKey: apiKey,
                delegate: self
            )
    } catch
    let error as LocalizedError {
        // display an error here
        return
    } catch {
        print("Unexpected error: \\(error)")
        return
    }

    ```
  </li>
  <li className="stepper-item">
    <strong>Add the Payment View</strong>
    <div>Still inside `viewDidLoad`, embed the payment view into your container:</div>

    ```swift
    if let paymentVC = self.checkout?.paymentViewController(),
        let paymentView = paymentVC.view {

            self.addChild(paymentVC)
            paymentVC.didMove(toParent: self)
            view.addSubview(paymentView)
        }
    ```
  </li>
</ol>

> This is a **basic example** that adds the Checkout view without handling dimensions.\
> For proper layout with constraints, refer to the demo app: [OttuPaymentsViewController.swift](https://github.com/ottuco/ottu-ios/blob/main/Example/OttuApp/OttuPaymentsViewController.swift#L91)

### Callbacks

In order `ViewController` to be compliant to `OttuDelegate`, add the following functions to `ViewController` class:

```swift
func errorCallback(_ data: [String : Any]?) {
    navigationController?.popViewController(animated: true)
    let alert = UIAlertController(title: "Error", message: data?.debugDescription ?? "", preferredStyle: .alert)
    alert.addAction(UIAlertAction(title: "OK", style: .cancel))
    self.present(alert, animated: true)
}

func cancelCallback(_ data: [String : Any]?) {
    var message = ""

    if let paymentGatewayInfo = data?["payment_gateway_info"] as? [String : Any],
       let pgName = paymentGatewayInfo["pg_name"] as? String,
       pgName == "kpay" {
           message = paymentGatewayInfo["pg_response"].debugDescription
    } else {
        message = data?.debugDescription ?? ""
    }

    navigationController?.popViewController(animated: true)
    let alert = UIAlertController(title: "Canсel", message: message, preferredStyle: .alert)
    alert.addAction(UIAlertAction(title: "OK", style: .cancel))
    self.present(alert, animated: true)
}

func successCallback(_ data: [String : Any]?) {
    navigationController?.popViewController(animated: true)
    let alert = UIAlertController(title: "Success", message: data?.debugDescription ?? "", preferredStyle: .alert)
    alert.addAction(UIAlertAction(title: "OK", style: .cancel))
    present(alert, animated: true)
}
```

#### **Callback behavior:**

- **Error** → Displays an error alert and navigates back
- **Cancel** → Displays cancel reason (custom handling for `kpay`)
- **Success** → Displays success confirmation

> This code describes callbacks to be handled by the parent app.

### Advanced Features

- [Forms of Payment](https://docs.ottu.com/developer/checkout-sdk/ios#formsofpayment-string-required)
- [Customization Theme](https://docs.ottu.com/developer/checkout-sdk/ios#customization-theme)
- [Setup Preload](https://docs.ottu.com/developer/checkout-sdk/ios#setuppreload-object-optional)

---

## Installation

### Minimum Requirements <a href="#minimum-requirements" id="minimum-requirements"></a>

The SDK is supported on devices running iOS 14 or higher.

#### **Installation with CocoaPods**

Ottu is available via [CocoaPods](http://cocoapods.org/). To install it, the following line must be added to the Podfile:

```ruby
pod 'ottu_checkout_sdk', :git => 'https://github.com/ottuco/ottu-ios.git', :tag => '2.1.10'
```

:::info

- When `ottu_checkout_sdk` is added to the **Podfile**, the **GitHub repository** must also be specified as follows:
- If CocoaPods returns an error like _"could not find compatible versions for pod"_, try running the `pod repo update` command to resolve it.
  :::

```ruby
pod 'ottu_checkout_sdk', :git => 'https://github.com/ottuco/ottu-ios'
```

#### **Installation with Swift Package Manager**

The [Swift Package Manager](https://swift.org/package-manager/) (SPM) is a tool designed for automating the distribution of Swift code and is integrated into the `Swift` compiler.

Once the Swift package has been set up, adding Alamofire as a dependency requires simply including it in the `dependencies` value of the `Package.swift` file.

```swift
dependencies: [
    .package(url: "https://github.com/ottuco/ottu-ios.git", from: "2.1.10")
]
```

---

## SDK Configuration

#### Language <a href="#language" id="language"></a>

The SDK supports two languages: English and Arabic, with English set as the default.

The language applied in the device settings is automatically used by the SDK, requiring no manual adjustments within the application.

However, if the transaction is created in a different language and setup preload is enabled, texts retrieved from the backend (such as fee descriptions) will be displayed in the transaction language rather than the device's language.

Therefore, the currently selected device language or the app's selected language should be considered when specifying a language code in the transaction creation request of the [Checkout API](./checkout-api).

#### Light and dark theme <a href="#light-and-dark-theme" id="light-and-dark-theme"></a>

The SDK also supports UI adjustments based on the device's theme settings (light or dark mode).

The appropriate theme is applied automatically during SDK initialization, aligning with the device's settings. Similar to language settings, no manual adjustments are required within the application.

---

## Functions

The SDK currently provides a single function, serving as the entry point for the merchant's application.

Additionally, callbacks are provided and must be handled by the parent application. These callbacks are described here.

### **Checkout.init**

The `Checkout.init` function is responsible for initializing the checkout process and configuring the necessary settings for the Checkout SDK.

It must be called once by the parent application and provided with a set of configuration fields that define all the required options for the checkout process.

When `Checkout.init` is invoked, the SDK automatically sets up the essential components, including:

- Generating a form for the customer to enter their payment details.
- Handling communication with Ottu's servers to process the payment.

This function returns a `View` object, which is a native iOS UI component. It can be embedded within any `ViewController` instance in the application.

### Properties <a href="#properties" id="properties"></a>

#### **merchantId** _`string`_ _`required`_

The **`merchant_id`** specifies the **Ottu merchant domain** and must be set to the **root domain** of the **Ottu account**, excluding the **"https://"** or **"http://"** prefix.

For example, if the **Ottu URL** is **`https://example.ottu.com`**, then the corresponding **`merchant_id`** is **`example.ottu.com`**.

This parameter is used to **link** the **checkout process** to the appropriate **Ottu merchant account**.

#### **apiKey** _`string`_ _`required`_

The `apiKey` is the Ottu API [public key](../getting-started/authentication#public-key), used for authentication when communicating with Ottu's servers during the checkout process.

:::warning

Only the public key should be used. The private key must remain confidential at all times and must not be shared with any clients.
:::

#### **sessionId** _`string`_ _`required`_

The `session_id` is a unique identifier assigned to the payment transaction associated with the checkout process.

This identifier is automatically generated when the payment transaction is created.

For more details on how to use the `session_id` parameter in the Checkout API, refer to the session_id.

#### **formsOfPayment** _`array`_ _`optional`_

The forms of payment displayed in the [checkout process](#ottu-checkout-sdk-flow) can be customized using `formsOfPayment`. By default, all forms of payment are enabled.

Available options for `formsOfPayment`:

- `applePay`: Supports Apple Pay, allowing purchases to be made using Apple Pay-enabled devices.
- `stcPay`: Requires customers to enter their mobile number and authenticate with an OTP sent to their device to complete the payment.
- `cardOnsite`: Enables direct payments (onsite checkout), where Cardholder Data (CHD) is entered directly in the SDK. If 3DS authentication is required, a payment provider is involved in the process.
- `tokenPay`: Uses tokenization to securely store and process customers' payment information.
- `redirect`: Redirects customers to an external payment gateway or a third-party payment processor to complete the transaction.

#### **setupPreload** _`object`_ _`optional`_

An `ApiTransactionDetails` struct object is used to store transaction details.

If provided, the SDK will not request transaction details from the backend, reducing processing time and improving efficiency.

#### **theme** _`object`_ _`optional`_

The `Theme` struct object is used for UI customization, allowing modifications to background colors, text colors, and fonts for various components. It supports customization for both light and dark device modes. All fields in the `Theme` struct are optional. If a theme is not provided, the default UI settings will be applied. For more details, refer to the Customization Theme section.

#### displaySettings _`object`_ _`optional`_

The display of payment options is configured using the `PaymentOptionsDisplaySettings` struct. Additional information is provided in the Payment Options Display Mode section.

#### **delegate** _`object`_ _`required`_

An object is used to provide SDK callbacks to the application. Typically, this is the parent app’s class that conforms to `OttuDelegate`, aggregating the SDK object.

To implement this delegate, the class must define three callback functions. More details are accessible next secion.

### Payment Options Display Mode

The payment options display can be adjusted using the SDK with the following settings:

- `mode` (`BottomSheet` or `List`)
- `visibleItemsCount` (default is 5)
- `defaultSelectedPgCode` (default is empty)

By default, **BottomSheet mode** is used, as set in previous releases. **List mode** is a new option, where a list of payment methods is displayed above the **Payment Details** section and the **Pay** button.

<div className="checkout-sdk-image-row">
  <figure>
    <img src="/img/checkout-sdk/image%20%2899%29.png" alt="List mode" />
    <figcaption>List mode</figcaption>
  </figure>
  <figure>
    <img src="/img/checkout-sdk/image%20%28100%29.png" alt="Selected item" />
    <figcaption>Selected item</figcaption>
  </figure>
  <figure>
    <img src="/img/checkout-sdk/image%20%28101%29.png" alt="Expanded list" />
    <figcaption>Expanded list</figcaption>
  </figure>
</div>

- **`visibleItemsCount`** is an unsigned integer that sets how many payment options are shown at once. It only works in **List mode**. If there are fewer options than the number set, the list height will adjust to show only the available options.

:::info

&#x20;If 0 is set, the SDK will throw an exception that the parent app must handle.
:::

- **`defaultSelectedPgCode`** is a payment gateway (PG) code that will be automatically selected. The SDK will look for the matching payment option and select it if found. If not found, no payment option will be selected.

:::info

If there are many payment options, the total height of the payment list, the **Payment Details** section, and the **Pay** button may exceed the screen size. The SDK doesn't support vertical scrolling, so the parent app must handle it. You can refer to the demo app's source code for guidance.
:::

All these parameters are optional and can be passed to `Checkout.init` through the following object:

```swift
displaySettings: PaymentOptionsDisplaySettings(
  mode: paymentOptionsDisplayMode,
  visibleItemsCount: visibleItemsCount,
  defaultSelectedPgCode: defaultSelectedPgCode
)
```

To view the full function call, please refer to the Ottu SDK - iOS | Example chapter in the documentation. This section provides the complete example, including how the function is used in the context of the Ottu SDK.

---

## Callbacks

In the Checkout SDK, callback functions are essential for providing real-time updates on the status of payment transactions.

These `callbacks` improve the user experience by enabling seamless and efficient handling of different payment scenarios, including:

- Successful payments
- Transaction cancellations
- Errors encountered during the payment process

All the callbacks described below can be triggered for any type of payment.

### **errorCallback**

The `errorCallback` function is triggered when an issue occurs during the payment process. Proper error handling is essential to ensure a smooth user experience.

**Best Practice for Handling Errors**

In the event of an error, the recommended approach is to restart the checkout process by generating a new `session_id` through the [Checkout API](./checkout-api).

**Defining the** `errorCallback` **Function**

The `errorCallback` function can be defined using the `data-error` attribute on the Checkout script tag. This attribute allows the specification of a global function to handle errors.

When an **error occurs**, the **`errorCallback`** function is invoked with a **`data` JSON object**, where **`data.status`** is set to **`error`**.

**Params Available in** `data` **`JSONObject` for** `errorCallback`

- `message` mandatory
- `form_of_payment` mandatory
- `status` mandatory
- `challenge_occurred` optional
- `session_id` optional
- `order_no` optional
- `reference_number` optional

### **cancelCallback**

The `cancelCallback` function in the [Checkout SDK](../) is triggered when a payment is canceled.

**Defining the** `cancelCallback` **Function**

The `cancelCallback` function can be defined using the `data-cancel` attribute on the Checkout script tag. This attribute allows the specification of a global function to handle cancellations.

**Invocation of** `cancelCallback`

If a customer cancels a payment, the `cancelCallback` function is invoked with a `data` JSON object, where `data.status` is set to `canceled`.

**Params Available in** `data` **`JSONObject` for** `cancelCallback`

- `message` mandatory
- `form_of_payment` mandatory
- `challenge_occurred` optional
- `session_id` optional
- `status` mandatory
- `order_no` optional
- `reference_number` optional
- `payment_gateway_info` optional

:::warning

In both `cancelCallback` and `errorCallback`, the SDK must be reinitialized, either on the same session or on a new session.
:::

### **successCallback**

In the [Checkout SDK](../), the `successCallback` function is triggered upon the successful completion of the [payment process](#ottu-checkout-sdk-flow).

**Defining the `successCallback` Function**

The `successCallback` function is defined and assigned as the value of the `data-success` attribute within the Checkout script tag.

**Invocation of** `successCallback`

When a payment is successfully processed, the `successCallback` function is invoked with a `data` JSON object, where `data.status` is set to `success`.

**Params Available in** `data` **`JSONObject` for** `successCallback`

- `message` mandatory
- `form_of_payment`mandatory
- `challenge_occurred` optional
- `session_id` optional
- `status` mandatory
- `order_no` optional
- `reference_number` optional
- `redirect_url` optional
- `payment_gateway_info` optional

---

## Example

There are both UIKit and SwiftUI samples available at the sample repo:

- UIKit: [ottu-ios/Example at main · ottuco/ottu-ios](https://github.com/ottuco/ottu-ios/tree/main/Example)
- SwiftUI: [ottu-ios/Example_SwiftUI at main · ottuco/ottu-ios](https://github.com/ottuco/ottu-ios/tree/main/Example_SwiftUI)

The SDK initialization process and the callback delegate remain identical for both implementations.

**Code Sample:**

```swift
do {
  self.checkout =
    try Checkout(
      formsOfPayments: formsOfPayment,
      theme: theme,
      displaySettings: PaymentOptionsDisplaySettings(
        mode: paymentOptionsDisplayMode,
        visibleItemsCount: visibleItemsCount,
        defaultSelectedPgCode: defaultSelectedPgCode
      ),
      sessionId: sessionId,
      merchantId: merchantId,
      apiKey: apiKey,
      setupPreload: transactionDetailsPreload,
      delegate: self
    )
} catch
let error as LocalizedError {
  showFailAlert(error)
  return
} catch {
  print("Unexpected error: \(error)")
  return
}

if let paymentVC = self.checkout?.paymentViewController(),
  let paymentView = paymentVC.view {

    self.addChild(paymentVC)

    let resizableContainer = ResizableContainerView()
    resizableContainer.translatesAutoresizingMaskIntoConstraints = false
    resizableContainer.addSubview(paymentView)
    paymentVC.didMove(toParent: self)

    paymentView.translatesAutoresizingMaskIntoConstraints = false
    NSLayoutConstraint.activate([
    paymentView.topAnchor.constraint(equalTo: resizableContainer.topAnchor),
    paymentView.bottomAnchor.constraint(equalTo: resizableContainer.bottomAnchor),
    paymentView.leadingAnchor.constraint(equalTo: resizableContainer
        .leadingAnchor, constant: 16),
    paymentView.trailingAnchor.constraint(equalTo: resizableContainer
        .trailingAnchor, constant: -16)
  ])

    contentView.addSubview(resizableContainer)
    NSLayoutConstraint.activate([
    resizableContainer.topAnchor.constraint(equalTo: topLabel.bottomAnchor,
        constant: 16),
    resizableContainer.leadingAnchor.constraint(equalTo: contentView
        .leadingAnchor),
    resizableContainer.trailingAnchor.constraint(equalTo: contentView
        .trailingAnchor)
  ])

    resizableContainer.sizeChangedCallback = {
      [weak self] _ in
      guard
      let self
      else {
        return
      }
      updateScrollEnabled(
        for: scrollView)
    }

    let bottomLabel = UILabel()
    bottomLabel.text = "Some user UI elements"
    bottomLabel.translatesAutoresizingMaskIntoConstraints = false

    contentView.addSubview(bottomLabel)
    NSLayoutConstraint.activate([
    bottomLabel.topAnchor.constraint(equalTo: resizableContainer.bottomAnchor,
        constant: 16),
    bottomLabel.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
    bottomLabel.bottomAnchor.constraint(equalTo: contentView.bottomAnchor,
        constant: -16)
  ])
  }

// outside `viewDidLoad`
extension OttuPaymentsViewController: OttuDelegate {
  func errorCallback(_ data: [String: Any] ? ) {
    paymentContainerView.isHidden = true

    let alert = UIAlertController(title: "Error", message: data
      ?.debugDescription ?? "", preferredStyle:
      .alert)
    alert.addAction(UIAlertAction(title: "OK", style: .cancel))
    self.present(alert, animated: true)
  }

  func cancelCallback(_ data: [String: Any] ? ) {
    var message = ""

    if let paymentGatewayInfo = data ? ["payment_gateway_info"] as ? [
        String: Any],
      let pgName = paymentGatewayInfo["pg_name"] as ? String,
        pgName == "kpay" {
          message = paymentGatewayInfo["pg_response"].debugDescription
        } else {
          message = data?.debugDescription ?? ""
        }

    paymentContainerView.isHidden = true

    let alert = UIAlertController(title: "Canсel", message: message,
      preferredStyle: .alert)
    alert.addAction(UIAlertAction(title: "OK", style: .cancel))
    self.present(alert, animated: true)
  }

  func successCallback(_ data: [String: Any] ? ) {
    paymentContainerView.isHidden = true
    paymentSuccessfullLabel.isHidden = false

    let alert = UIAlertController(title: "Success", message: data
      ?.debugDescription ?? "", preferredStyle:
      .alert)
    alert.addAction(UIAlertAction(title: "OK", style: .cancel))
    present(alert, animated: true)
  }
}

```

---

## Customization Theme

The main class describing theme is called `CheckoutTheme`.

It uses additional component classes like:

- `ButtonComponent`
- `LabelComponent`
- `TextFieldComponent`

The `CheckoutTheme` class consists of objects that define various UI components. While the names of these components largely correspond to those listed here, they also include platform-specific fields for further customization.

<iframe
  title="Ottu SDK Components (Figma)"
  src="https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/design/J6WsECtu4F6ynCetrvTLcp/Ottu-SDK---Components-Documentation--Copy-?node-id=0-1"
  style={{ width: "100%", height: "600px", border: "0" }}
  loading="lazy"
  allow="fullscreen"
/>

### Properties Description <a href="#properties-description" id="properties-description"></a>

All properties in the `CheckoutTheme` class are optional, allowing users to customize any of them as needed.

If a property is not specified, the default value (as defined in the Figma design [here](https://www.figma.com/proto/BmLOTN8QCvMaaIteZflzgG?content-scaling=fixed&kind=proto&node-id=1-624&scaling=scale-down)) will be automatically applied.

#### **Texts**

#### **General**

| Property Name |                            Description                            |   Data Type    |
| ------------- | :---------------------------------------------------------------: | :------------: |
| `mainTitle`   |                 Font and color for all “Captions”                 | LabelComponent |
| `title`       |          Font and color for payment options in the list           | LabelComponent |
| `subtitle`    | Font and color for payment options details (like expiration date) | LabelComponent |

#### **Fees**

| Property Name  |                          Description                           |   Data Type    |
| -------------- | :------------------------------------------------------------: | :------------: |
| `feesTitle`    |    Font and color of fees value in the payment options list    | LabelComponent |
| `feesSubtitle` | Font and color of fees description in the payment options list | LabelComponent |

#### **Data**

| Property Name |                       Description                        |   Data Type    |
| ------------- | :------------------------------------------------------: | :------------: |
| `dataLabel`   | Font and color of payment details fields (like “Amount”) | LabelComponent |
| `dataValue`   |         Font and color of payment details values         | LabelComponent |

#### **Other**

| Property Name                   |                          Description                           |   Data Type    |
| ------------------------------- | :------------------------------------------------------------: | :------------: |
| `errorMessageText`              |        Font and color of error message text in pop-ups         | LabelComponent |
| `selectPaymentMethodTitleLabel` | The text of "Select Payment Method" in the bottom sheet header | LabelComponent |

#### **Text Fields**

| Property Name    |                             Description                              |     Data Type      |
| ---------------- | :------------------------------------------------------------------: | :----------------: |
| `inputTextField` | Font and color of text in any input field (including disabled state) | TextFieldComponent |

#### **Colors**

| Property Name                             |                            Description                            | Data Type |
| ----------------------------------------- | :---------------------------------------------------------------: | :-------: |
| `backgroundColor`                         |           The main background of the SDK view component           |  UIColor  |
| `backgroundColorModal`                    |                The background of any modal window                 |  UIColor  |
| `iconColor`                               |               The color of the icon of the payment                |  UIColor  |
| `paymentItemBackgroundColor`              |         The background of an item in payment options list         |  UIColor  |
| `selectPaymentMethodTitleBackgroundColor` | The background of the "Select Payment Method" bottom sheet header |  UIColor  |

#### **Buttons**

| Property Name    |                            Description                            |    Data Type    |
| ---------------- | :---------------------------------------------------------------: | :-------------: |
| `button`         |          Background, text color and font for any button           | ButtonComponent |
| `selectorButton` | Background, text color and font for payment item selection button | ButtonComponent |

#### **Switch**

| Property Name       |             Description              | Data Type |
| ------------------- | :----------------------------------: | :-------: |
| `switchOnTintColor` | The color of switch (toggle) control |  UIColor  |

#### **Margins**

| Property Name |                     Description                     |  Data Type   |
| ------------- | :-------------------------------------------------: | :----------: |
| margins       | Top, left, bottom and right margins between compone | UIEdgeInsets |

#### Payment Details

| Property Name        |                                            Description                                            | Data Type |
| -------------------- | :-----------------------------------------------------------------------------------------------: | :-------: |
| `showPaymentDetails` | Boolean variable determining whether the “Payment Details” section should be displayed or hidden. |  Boolean  |

### Data Types Description <a href="#data-types-description" id="data-types-description"></a>

#### **LabelComponent**

| Property Name | Data Type |
| ------------- | :-------: |
| `color`       |  UIColor  |
| `font`        |  UIFont   |
| `fontFamily`  |  String   |

#### **TextFieldComponent**

| Property Name     |                                                                    Data Type                                                                    |
| ----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------: |
| `label`           |                                                                 LabelComponent                                                                  |
| `text`            | [LabelComponent](https://app.gitbook.com/o/RxY0H8C3fNw3knTb5iVs/s/XdPwy0yrnZJ8gfKCUk9E/~/changes/601/developer/checkout-sdk/ios#labelcomponent) |
| `backgroundColor` |                                                                     UIColor                                                                     |

#### **ButtonComponent**

| Property Name             | Data Type |
| ------------------------- | :-------: |
| `enabledTitleColor`       |  UIColor  |
| `disabledTitleColor`      |  UIColor  |
| `font`                    |  UIFont   |
| `enabledBackgroundColor`  |  UIColor  |
| `disabledBackgroundColor` |  UIColor  |
| `fontFamily`              |  String   |

#### **UIEdgeInsets**

| Property Name | Data Type |
| ------------- | :-------: |
| `left`        |    Int    |
| `top`         |    Int    |
| `right`       |    Int    |
| `bottom`      |    Int    |

### Example <a href="#example.1" id="example.1"></a>

To configure the `theme`, similar steps must be followed as described in the test app file.

**Code Snippet:**

```swift
func createTheme() - > CheckoutTheme {
    var theme = CheckoutTheme()
    theme.backgroundColor = .systemBackground
    theme.backgroundColorModal = .secondarySystemBackground
    theme.margins = UIEdgeInsets(top: 8, left: 2, bottom: 8, right: 2)
    theme.mainTitle.color = .label
    theme.mainTitle.fontFamily = "Arial"
    theme.button.enabledTitleColor = .payButtonTitle
    theme.button.disabledTitleColor = .payButtonDisabledTitle
    theme.button.fontFamily = "Arial"
    theme.button.enabledBackgroundColor = .payButtonBackground
    theme.button.disabledBackgroundColor = .payButtonDisabledBackground
    return theme
}
```

The theme object is passed to the SDK initialization as shown below:

**Code Snippet:**

```swift
self.checkout = Checkout(
    theme: theme,
    sessionId: sessionId,
    merchantId: merchantId,
    apiKey: apiKey,
    delegate: self
)
```

---

## Payment Gateway Compliance & Information

### Apple Pay <a href="#apple-pay" id="apple-pay"></a>

When the [integration ](#apple-pay)between Ottu and Apple for Apple Pay is completed, the necessary checks to display the Apple Pay button are handled automatically by the Checkout SDK.

1. **Initialization**: Upon initialization of the Checkout SDK with the provided [session_id](#sessionid-string-required) and payment gateway codes ([pg_codes](./checkout-api)), several conditions are automatically verified:
   - It is confirmed that a `session_id` and `pg_codes` associated with the Apple Pay Payment Service have been supplied.
   - It is ensured that the customer is using an Apple device that supports Apple Pay. If the device is not supported, the button will not be shown, and an error message stating `This device doesn't support Apple Pay` will be displayed to inform the user of the compatibility issue.
   - It is verified that the customer has a wallet configured on their Apple Pay device. if the wallet is not configured (i.e., no payment cards are added), the Setup button will appear. Clicking on this button will prompt the Apple Pay wallet on the user's device to open, allowing them to configure it by adding payment cards.
2. **Displaying the Apple Pay Button**: If all these conditions are met, the Apple Pay button is displayed and made available for use in the checkout flow.
3. **Restricting Payment Options**: To display only the Apple Pay button, `applePay` should be passed within the `formsOfPayment` parameter. The `formsOfPayment` property instructs the Checkout SDK to render only the Apple Pay button. If this property is not included, all available payment options are rendered by the SDK.

This setup ensures a seamless integration and user experience, allowing customers to easily set up and use Apple Pay during the checkout process.

### STC Pay <a href="#stc-pay" id="stc-pay"></a>

When the [integration](#stc-pay) between Ottu and STC Pay is completed, the necessary checks to display the STC Pay button are handled seamlessly by the Checkout SDK.

**Initialization**: Upon initialization of the Checkout SDK with the provided [session_id](#sessionid-string-required) and payment gateway codes ([pg_codes](./checkout-api)), several conditions are automatically verified:

- It is confirmed that the `session_id` and `pg_codes` provided during SDK initialization are associated with the STC Pay Payment Service. This ensures that the STC Pay option is available for the customer to choose as a payment method.
- It is ensured that the STC Pay button is displayed by the iOS SDK, regardless of whether the customer has provided a mobile number while creating the transaction.

This setup ensures a seamless integration and user experience, allowing customers to easily set up and use STC Pay during the checkout process.

### KNET - Apple Pay <a href="#knet-apple-pay" id="knet-apple-pay"></a>

Due to compliance requirements, KNET necessitates a popup displaying the payment result after each failed payment. This functionality is available only in the `cancelCallback` when there is a response from the payment gateway. As a result, the user must click on the Apple Pay button again to retry the payment.

:::info

The popup notification requirement is specific to the KNET payment gateway. Other payment gateways may have different requirements or notification mechanisms, so it is essential to follow the respective documentation for each payment gateway integration.
:::

To properly handle the popup notification for KNET, the following code snippet should be implemented into your payment processing flow:

```swift
func cancelCallback(_ data: [String: Any] ? ) {
    var message = ""

    if let paymentGatewayInfo = data ? ["payment_gateway_info"] as ? [String: Any],
        let pgName = paymentGatewayInfo["pg_name"] as ? String,
            pgName == "kpay" {
                message = paymentGatewayInfo["pg_response"].debugDescription
            } else {
                message = data?.debugDescription ?? ""
            }

    navigationController?.popViewController(animated: true)
    let alert = UIAlertController(title: "Canсel", message: message, preferredStyle: .alert)
    alert.addAction(UIAlertAction(title: "OK", style: .cancel))
    self.present(alert, animated: true)
}
}
```

The above code performs the following checks and actions:

1. **Verification**: It first checks if the cancel object contains information about the payment gateway `payment_gateway_info`.
2. **Payment Gateway Identification**: It then verifies if the `pg_name` property in `payment_gateway_info` is equal to "kpay", confirming that the payment gateway used is KNET.
3. **Response Handling**: If the conditions are met, it retrieves the payment gateway's response from the `pg_response` property. If not available, it uses a default "Payment was cancelled." error message.
4. **Popup Notification**: Finally, it displays the error message in a popup using `self.present(alert, animated: true)` to notify the user about the failed payment.

This setup ensures compliance with KNET's requirements and provides a clear user experience for handling failed payments.

### Onsite Checkout

This payment option enables direct payments through the mobile SDK. The SDK provides a user interface where the Cardholder Data (CHD) is entered by the user. If permitted by the backend, the card can be tokenized and saved for future payments.

Below is an example of how the onsite checkout screen appears:

<figure className="checkout-sdk-figure">
  <img src="/img/checkout-sdk/image%20%282%29%20%281%29%20%281%29%20%281%29%20%281%29%20%281%29.png" alt="Onsite checkout screen" />
</figure>

The SDK supports multiple instances of onsite checkout payments. Therefore, for each payment method with a PG code of `ottu_pg`, the card form (as described above) will be displayed.

<figure className="checkout-sdk-figure">
  <img src="/img/checkout-sdk/image%20%28102%29.png" alt="Onsite checkout with multiple payment options" />
</figure>

:::info

Fees are not shown for onsite checkout instances because the system supports payments through multiple cards (omni PG). The multiple payment icons indicate the availability of different card options.
:::

---

## Error Reporting & Cybersecurity Measures

### Error Reporting <a href="#error-reporting" id="error-reporting"></a>

The SDK utilizes Sentry for error logging and reporting, which is initialized based on the configuration from SDK Studio. However, since the SDK is integrated into the merchant's app, conflicts may arise if the app also uses Sentry. To avoid this, merchants can disable Sentry in the Checkout SDK by setting the `is_enabled` flag to `false` in the configuration.

### Cyber Security Measures <a href="#cyber-security-measures" id="cyber-security-measures"></a>

#### Jailbreak Detection <a href="#jailbreak-detection" id="jailbreak-detection"></a>

To enable the detection of jailbroken devices, the following section must be added to the application's **Info.plist** file:

```html
<key > LSApplicationQueriesSchemes < /key>
    <array >
        <string > zbra < /string>
        <string > cydia < /string>
        <string > undecimus < /string>
        <string > sileo < /string>
        <string > filza < /string>
        <string > activator < /string>
    </array>

```

#### Screen Capture Prevention

The SDK implements screen capture restrictions to prevent the collection of sensitive data. This applies to fields containing Cardholder Data (CHD), such as the onsite checkout form for entering card details and the CVV field for tokenized payments.

This technique works in two ways:

1. When attempting to take a screenshot of a protected screen, the fields appear empty, even if they contain input.
2. When attempting to record a video of the screen, the video is completely blurred, making the content unreadable.

---

## FAQ

#### 1 What forms of payments are supported by the SDK? <a href="#id-1.-what-forms-of-payments-are-supported-by-the-sdk" id="id-1.-what-forms-of-payments-are-supported-by-the-sdk"></a>

The SDK supports the following payment forms: `tokenPay`, `ottuPG`, `redirect` `applePay` and `stcPay`. Merchants can display specific methods according to their needs.

**For example,** if you want to only show the STC Pay button, you can do so using formsOfPayment = `stcPay`, and only the STC Pay button will be displayed. The same applies for `applePay` and other methods.

#### 2 What are the minimum system requirements for the SDK integration? <a href="#id-2.-what-are-the-minimum-system-requirements-for-the-sdk-integration" id="id-2.-what-are-the-minimum-system-requirements-for-the-sdk-integration"></a>

It is required to have a device running iOS 13 or higher.

#### 3 Can I customize the appearance beyond the provided themes? <a href="#id-3.-can-i-customize-the-appearance-beyond-the-provided-themes" id="id-3.-can-i-customize-the-appearance-beyond-the-provided-themes"></a>

Yes, see the Customization theme section.

#### 4 How do I customize the payment request for Apple Pay? <a href="#id-4.-how-do-i-customize-the-payment-request-for-apple-pay" id="id-4.-how-do-i-customize-the-payment-request-for-apple-pay"></a>

The payment request for Apple Pay can be customized using its initialization methods. These methods allow the configuration of various properties, including:

- API version
- Supported card types
- Accepted networks
- Applicable countries
- Merchant capabilities

For a complete list of supported properties, refer to the [Apple Pay](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaypaymentrequest) documentation.

---

## Android

The [Checkout SDK](../) from Ottu is a Kotlin-based library designed to streamline the integration of an Ottu-powered [checkout process](../#ottu-checkout-sdk-flow) into Android applications. This SDK allows for complete customization of the checkout experience, including both appearance and functionality, as well as the selection of accepted payment methods.

To integrate the Checkout SDK, it must be incorporated into the Android application and initialized with the following parameters:

- [merchant_id](https://app.gitbook.com/s/su3y9UFjvaXZBxug1JWQ/#merchant_id-string)
- [session_id](#sessionid-string-required)
- [API public key](../getting-started/authentication#public-key)

Additionally, various configuration options, such as accepted [payment methods](#formsofpayment-array-optional) and [theme ](#customization-theme)styling for the checkout interface, can be specified to enhance the user experience.

:::warning

The [API private key](../getting-started/authentication#private-key-api-key) should never be utilized on the client side; instead, use the [API public key](../getting-started/authentication#public-key). This is essential for maintaining the security of your application and safeguarding sensitive data.
:::

---

## Quick Start

This guide outlines the essential steps for integrating **Ottu Android Checkout SDK** into your mobile application. It provides a concise flow from setup to callback handling, helping developers achieve a seamless checkout experience.

### Video Tutorial: Android SDK Integration

This video guides you step-by-step through the **Android SDK integration process**. Watch it to quickly learn how to set up, configure, and see the key features in action.

<iframe
  title="Android SDK Integration Video"
  src="https://drive.google.com/file/d/1UkZQSrF8rPJDguU85akAdsfkQ1sPY-rF/preview"
  style={{ width: "100%", height: "480px", border: "0" }}
  loading="lazy"
  allow="fullscreen"
/>

### SDK Installation

<ol className="stepper">
  <li className="stepper-item">
    <strong>Add JitPack Repository</strong>
    <div>
      In your `settings.gradle.kts` file, add JitPack to the repositories
      section under `dependencyResolutionManagement`:
    </div>

    ```swift
    maven { url = uri("https://jitpack.io") }
    ```
  </li>
  <li className="stepper-item">
    <strong>Add the SDK Dependency</strong>
    <div>
      Include the Ottu Checkout SDK in your app-level `build.gradle.kts` file:
    </div>

    ```swift
    implementation("com.github.ottuco:ottu-android-checkout:2.1.7")
    ```
  </li>
</ol>

### Integrate the Checkout SDK

<ol className="stepper">
  <li className="stepper-item">
    <strong>Add FrameLayout to the Layout File</strong>
    <div>
      Inside `activity_main.xml` (located in the `res/layout` folder), add a
      `FrameLayout` with the ID `ottuPaymentView`:
      `android:id="@+id/ottuPaymentView"`
    </div>
  </li>
  <li className="stepper-item">
    <strong>Import Required Modules</strong>
    <div>
      Usually, Android Studio automatically imports the necessary modules.
      However, for reference, the Ottu SDK requires the following imports:
    </div>

    ```swift
    import com.ottu.checkout.Checkout
    import com.ottu.checkout.network.model.payment.ApiTransactionDetails
    import com.ottu.checkout.ui.base.CheckoutSdkFragment
    ```
  </li>
  <li className="stepper-item">
    <strong>Extend the Activity Class</strong>
    <div>
      Ensure that the Activity integrating with the Checkout SDK inherits from
      `AppCompatActivity`:
    </div>

    ```swift
    class MainActivity : AppCompatActivity() {
    ```
  </li>
  <li className="stepper-item">
    <strong>Declare Checkout Fragment Variable</strong>
    <div>Add a member variable for the `CheckoutSdkFragment` object:</div>

    ```swift
    private var checkoutFragment: CheckoutSdkFragment? = null
    ```
  </li>
  <li className="stepper-item">
    <strong>Initialize Checkout SDK</strong>
    <div>Inside the `onCreate` function, add the SDK initialization code:</div>

    ```swift
    // populate the fields below with correct values
    val merchantId = "" // your merchant base URL
    val sessionId = "" // the transaction ID
    val apiKey = "" // merchant public API Key
    val amount = 10.0 // decimal number

    // List mode just to look better
    val paymentOptionsDisplaySettings = Checkout.PaymentOptionsDisplaySettings(
                Checkout.PaymentOptionsDisplayMode.List(5))

    // Builder class is used to construct an object passed to the SDK initializing function
    val builder = Checkout
      .Builder(merchantId!!, sessionId, apiKey!!, amount!!)
        .paymentOptionsDisplaySettings(paymentOptionsDisplaySettings)
        .logger(Checkout.Logger.INFO)
        .build()

    if (Checkout.isInitialized) {
      Checkout.release()
    }

    lifecycleScope.launch {
      runCatching {
        Checkout.init(
          context = this@MainActivity,
            builder = builder,
            successCallback = {
              Log.e("TAG", "successCallback: $it")
              //showResultDialog(it)
            },
            cancelCallback = {
              Log.e("TAG", "cancelCallback: $it")
              //showResultDialog(it)
            },
            errorCallback = { errorData, throwable ->
              Log.e("TAG", "errorCallback: $errorData")
              //showResultDialog(errorData, throwable)
            },
        )
      }.onSuccess {
        checkoutFragment = it
        supportFragmentManager
          .beginTransaction()
          .replace(R.id.ottuPaymentView, it)
          .commit()
      }.onFailure {
        //showErrorDialog(it)
      }
    }
    ```
  </li>
  <li className="stepper-item">
    <strong>(Optional) Implement Result and Error Dialogs</strong>
    <div>
      Uncomment `showResultDialog` and `showErrorDialog` in the code above and
      add their implementations as methods inside the same `MainActivity`:
    </div>

    ```swift
    private fun showResultDialog(result: JSONObject?, throwable: Throwable? = null) {
        val sb = StringBuilder()

        result?.let {
            sb.apply {
                append(("Status : " + result.opt("status")) + "\n")
                append(("Message : " + result.opt("message")) + "\n")
                append(("Session id : " + result.opt("session_id")) + "\n")
                append(("operation : " + result.opt("operation")) + "\n")
                append(("Reference number : " + result.opt("reference_number")) + "\n")
                append(("Challenge Occurred : " + result.opt("challenge_occurred")) + "\n")
                append(("Form of payment: " + result.opt("form_of_payment")) + "\n")
            }
        } ?: run {
            sb.append(throwable?.message ?: "Unknown Error")
        }

        AlertDialog.Builder(this)
            .setTitle("Order Information")
            .setMessage(sb)
            .setPositiveButton(
                android.R.string.ok
            ) { dialog, which ->
                dialog.dismiss()
            }
            .show()
    }

    private fun showErrorDialog(throwable: Throwable? = null) {
        if (throwable is SecurityException) return

        AlertDialog.Builder(this)
            .setTitle("Failed")
            .setMessage(throwable?.message ?: "Unknown Error")
            .setPositiveButton(
                android.R.string.ok
            ) { dialog, which ->
                finish()
                dialog.dismiss()
            }
        .show()
    }
    ```
  </li>
  <li className="stepper-item">
    <strong>Clean Up Memory</strong>
    <div>To ensure proper resource management, override the `onDestroy` method:</div>

    ```swift
    override fun onDestroy() {
      super.onDestroy()
      if (isFinishing) {
        Checkout.release()
      }
    }
    ```
  </li>
  <li className="stepper-item">
    <strong>Verify Imports</strong>
    <div>
      Finally, confirm that all required imports are present. Android Studio
      usually detects and adds them automatically.
    </div>
  </li>
</ol>

##### **Notes on Initialization Parameters**

Not all parameters in `Checkout.init` are mandatory.\
The **required** parameters are:

- `sessionId` – ID of the created transaction
- `merchantId` – Same as the domain used in HTTP requests
- `apiKey` – Public API key used for authorization

**Recommended optional parameters:**

- `formsOfPayment`
- `setupPreload` (to reduce initialization time)

`setupPreload` is an object taken from the transaction creation response. When passed to the SDK, it prevents it from requesting the transaction details on its own and therefore speed-ups the initialization process by several seconds. This `setupPreload` is a decoded JSON object to a `TransactionDetails` \
For reference, check the example: [here](https://github.com/ottuco/ottu-android/blob/main/Example/app/src/main/java/com/ottu/CheckoutSampleActivity.kt)&#x20;

### Callbacks

The SDK triggers three main callbacks:

- **`successCallback`** – Invoked upon successful payment.
- **`cancelCallback`** – Triggered when the user cancels the transaction.
- **`errorCallback`** – Activated on errors during the checkout process.

Developers should customize the logic within these callbacks to handle transaction results appropriately.

### Useful Resources

- [Forms of Payment](#formsofpayment-array-optional)&#x20;
- [Customization Theme](#customization-theme)&#x20;
- [Setup Preload](#setuppreload-object-optional)&#x20;

---

## Installation

### Minimum Requirements <a href="#minimum-requirements" id="minimum-requirements"></a>

The SDK is compatible with devices running Android 8 or higher (API version 26 or later).

### Installation with dependency <a href="#installation-with-dependency" id="installation-with-dependency"></a>

```groovy
allprojects {
    repositories {
        // Other repositories...
        maven { url "https://jitpack.io" }
    }
}

dependencies {
    implementation 'com.github.ottuco:ottu-android-checkout:2.1.7'
}
```

---

## Native UI

The SDK UI is embedded as a Fragment within any part of an Activity in the merchant's application.

**Example:**

<figure className="checkout-sdk-figure">
  <img src="/img/checkout-sdk/image%20%2894%29.png" alt="Android Native UI embedded as a fragment" />
</figure>

If a wallet is the only available payment option, the UI is minimized automatically.

<figure className="checkout-sdk-figure">
  <img src="/img/checkout-sdk/image%20%2895%29.png" alt="Android Native UI minimized for wallet-only payment" />
</figure>

:::info

To avoid style issues and potential crashes, the parent application's theme must be `Theme.AppCompat` or one of its descendant classes. This theme is specified in the `themes.xml` file located in the `values` directory of the project.
:::

---

## SDK Configuration

### Language <a href="#language" id="language"></a>

The SDK supports two languages, English and Arabic, with English set as the default.

It automatically adopts the language configured in the device settings, requiring no in-app adjustments. However, if a transaction is initiated in a different language and setup preload is utilized, the backend-generated text (such as fee descriptions) will appear in the language of the transaction. Therefore, it is important to ensure that the language code passed to the [Checkout API](./checkout-api)'s transaction creation request matches the currently selected language on the device or current selected app language.

### Light and dark theme <a href="#light-and-dark-theme" id="light-and-dark-theme"></a>

The SDK supports UI customization to match the device theme—light or dark. This adjustment is applied during the SDK initialization, based on the device's settings. Similarly, for language, no adjustments are made within the app.

---

## Functions

Currently, the SDK offers a single [function ](functions.md#checkout.init)that serves as the entry point for the merchant's application. It also includes [callbacks](functions.md#callbacks) that must be managed by the parent app, which are detailed in the following [section](functions.md#callbacks).

### **Checkout.init**

The function initiates the checkout process and configures the required settings for the Checkout SDK. It should be invoked once by the parent app to start the checkout sequence, called with set of configuration fields that encapsulate all essential options for the process.

When you call `Checkout.init`, the SDK manages the setup of key components for the checkout, like generating a form for customers to input their payment information, and facilitating the communication with Ottu's servers to process the payment.

This function returns a `Fragment` object, which is a native Android UI component that can be integrated into any part of an `Activity` instance (also native to Android).

### Properties <a href="#properties" id="properties"></a>

#### **merchantId** _<span style={{ color: "blue" }}>`string`</span>_ _<span style={{ color: "red" }}>`required`</span>_

The `merchant_id` identifies your Ottu merchant domain. It should be the root domain of your Ottu account, excluding the "https://" or "http://" prefix.

For instance, if your Ottu URL is https://example.ottu.com, then your `merchant_id` would be example.ottu.com. This attribute is utilized to determine which Ottu merchant account to associate with the checkout process.

#### **apiKey** _<span style={{ color: "blue" }}>`string`</span>_ _<span style={{ color: "red" }}>`required`</span>_

The `apiKey` is your Ottu [API public key](../getting-started/authentication#public-key), which is essential for authenticating communications with Ottu's servers during the checkout process.

:::warning

Make sure to use the public key and avoid using the private key. The [API private key](../getting-started/authentication#private-key-api-key) must be kept confidential at all times and should never be shared with any clients.
:::

#### **sessionId** _<span style={{ color: "blue" }}>`string`</span>_ _<span style={{ color: "red" }}>`required`</span>_

The `session_id` serves as the unique identifier for the payment transaction linked to the checkout process.

This identifier is automatically generated at the creation of the payment transaction. For additional details on how to utilize the `session_id` parameter in the [Checkout AP](./checkout-api)I, refer to the [session_id](/broken/pages/3x6ec6ghiDMkqAeOlBDy#session_id) section.&#x20;

#### **formsOfPayment** _<span style={{ color: "blue" }}>`array`</span>_ _<span style={{ color: "blue" }}>`optional`</span>_

The `formsOfPayment` parameter allows customization of the payment methods displayed in the [checkout process](../#ottu-checkout-sdk-flow). By default, all forms of payment are enabled.

**Available Options for** `formsOfPayment`

- **`cardOnsite`**: A direct payment method (onsite checkout) where cardholder data (CHD) is entered directly in the SDK. If 3DS authentication is required, a payment provider is involved.
- `tokenPay`: Uses [tokenization](../../tokenization.md) to securely store and process customers' payment information.
- `redirect`: Redirects customers to an external [payment gateway](../../../user-guide/payment-gateway.md#payment-gateway-features-summary) or a third-party payment processor to complete the transaction.
- `stcPay`: Requires customers to enter their mobile number and authenticate with an OTP sent to their device to complete the payment.
- `flexMethods`: Allows payments to be split into multiple installments. These methods, also known as BNPL (Buy Now, Pay Later), support providers such as Tabby and Tamara.

#### **setupPreload** _<span style={{ color: "blue" }}>`object`</span>_ _<span style={{ color: "blue" }}>`optional`</span>_

The `TransactionDetails` class object stores transaction details.

If this object is provided, the SDK will not need to retrieve transaction details from the backend, thereby reducing processing time and improving efficiency.

#### **theme** _<span style={{ color: "blue" }}>`object`</span>_ _<span style={{ color: "blue" }}>`optional`</span>_

The `Theme` class object is used for UI customization, allowing modifications to background colors, text colors, and fonts for various components.

All fields in the `Theme` class are optional. If a theme is not specified, the default UI settings will be applied. For more details, refer to the [Customization Theme](functions.md#customization-theme) section.

#### **displaySettings** _<span style={{ color: "blue" }}>`object`</span>_ _<span style={{ color: "blue" }}>`optional`</span>_

The `PaymentOptionsDisplaySettings` struct is used to configure how payment options are displayed.&#x20;

More details can be found in the [Payment Options Display Mode](functions.md#payment-options-display-mode) section.

#### **successCallback, errorCallback and successCallback** _<span style={{ color: "blue" }}>`Uint`</span>_ _<span style={{ color: "red" }}>`required`</span>_

Callback functions are used to retrieve the payment status and must be provided directly to the Checkout initialization function. For more details, refer to the [Callbacks](functions.md#callbacks) section.

### Payment Options Display Mode <a href="#payment-options-display-mode" id="payment-options-display-mode"></a>

The display of payment options can be adjusted using the SDK with the following settings:

- `mode` (`BottomSheet` or List)
- `visibleItemsCount` (default is 5)
- `defaultSelectedPgCode` (default is none)

By default, **BottomSheet mode** is used, as was implemented in previous releases. **List mode** is a new option that allows the list of payment methods to be displayed above the **Payment Details** section and the **Pay** button.

<figure className="checkout-sdk-figure">
  <img src="/img/checkout-sdk/image%20%288%29.png" alt="Payment options display mode: BottomSheet" />
</figure>

**A view with a selected item:**

<figure className="checkout-sdk-figure">
  <img src="/img/checkout-sdk/image%20%281%29%20%281%29%20%281%29%20%281%29.png" alt="Payment options display mode: List with selected item" />
</figure>

**A view with an expanded list:**

<figure className="checkout-sdk-figure">
  <img src="/img/checkout-sdk/image%20%282%29%20%281%29%20%281%29%20%281%29.png" alt="Payment options display mode: List with expanded items" />
</figure>

- `visibleItemsCount` is an unsigned integer that sets the number of items to be displayed at once. It works only in List mode. If the number of available payment options is fewer than this value, the list height is automatically adjusted to the minimum required.

:::info

If 0 is passed, an exception is thrown by the SDK, which must be handled by the parent app.
:::

- `defaultSelectedPgCode` is a PG code that will be automatically selected. The SDK searches for the payment option with the matching PG code and selects it if found. If no match is found, no selection is made.

All these parameters are optional and are constructed using the following function:

```swift
private fun getPaymentOptionSettings(): Checkout.PaymentOptionsDisplaySettings {
    val visibleItemsCount = 5 // set needed value here
    val selectedPgCode = "knet" // set needed value here
    val mode = Checkout.PaymentOptionsDisplaySettings.PaymentOptionsDisplayMode.List(visibleItemsCount)
    return Checkout.PaymentOptionsDisplaySettings(mode, selectedPgCode)
}
```

These parameters are passed to the `Checkout.init` builder class via the following object:

```swift
.displaySettings(displaySettings)
```

To view the full function call, please refer to the [Ottu SDK - Android | Example](functions.md#example) chapter in the documentation.

---

## Callbacks

In the Checkout SDK, callback functions are essential for delivering real-time updates on the status of payment transactions. These callbacks improve the user experience by facilitating smooth and effective management of different payment scenarios, including errors, successful transactions, and cancellations.&#x20;

:::info

The callbacks outlined below are applicable to any type of payment.
:::

### **errorCallback**

The `errorCallback` is a callback function triggered when issues occur during a payment process. Properly handling these errors is essential for maintaining a smooth user experience.&#x20;

:::info

The best practice recommended in the event of an error is to restart the checkout process by generating a new `session_id` through the [Checkout API](https://docs.ottu.com/developer/checkout-api).
:::

To set up the `errorCallback` function, use the `data-error` attribute on the Checkout script tag to designate a global function that will manage errors. If an error arises during a payment, the `errorCallback` function will be called, receiving a `JSONObject` with a `data.status` value indicating an error.

**Params Available in** `data` **`JSONObject` for** `errorCallback`

- `message` mandatory
- `form_of_payment` mandatory
- `status` mandatory
- `challenge_occurred` optional
- `session_id` optional
- `order_no` optional
- `reference_number` optional

### **cancelCallback**

The `cancelCallback` is a callback function in the Checkout SDK that is activated when a payment is canceled.&#x20;

To configure the `cancelCallback` function, you can use the `data-cancel` attribute on the Checkout script tag to specify a global function that will handle cancellations. If a payment is canceled by a customer, the `cancelCallback` function will be called, and it will receive a `JSONObject` containing a `data.status` value of "canceled".

**Params Available in** `data` **`JSONObject` for** `cancelCallback`

- `message` mandatory
- `form_of_payment` mandatory
- `challenge_occurred` optional
- `session_id` optional
- `status` mandatory
- `order_no` optional
- `reference_number` optional
- `payment_gateway_info` optional

:::warning

In both `cancelCallback` and `errorCallback`, the SDK must be reinitialized, either on the same session or on a new session.
:::

### **successCallback**

The `successCallback` is a function that is triggered when the payment process is successfully completed. This callback receives a `JSONObject` containing a `data.status` value of "success."

**Params Available in** `data` `JSONObject` for `successCallback`

- `message` mandatory
- `form_of_payment` mandatory
- `challenge_occurred` optional
- `session_id` optional
- `status` mandatory
- `order_no` optional
- `reference_number` optional
- `redirect_url` optional
- `payment_gateway_info` optional

The `successCallback` function is defined and assigned by setting the `data-success` attribute on the Checkout script tag. This attribute specifies a global function that will be invoked when the payment process successfully completes.

---

## Example

```swift
val theme = getCheckoutTheme()

// Builder class is used to construct an object passed to the SDK initializing function
val builder = Checkout
  .Builder(merchantId!!, sessionId, apiKey!!, amount!!)
  .displaySettings(displaySettings)
  .formsOfPayments(formsOfPayment)
  .theme(theme)
  .logger(Checkout.Logger.INFO)
  .build()


// Actual `init` function calling, returning a `Fragment` object
checkoutFragment = Checkout.init(
  context = this @CheckoutSampleActivity,
  builder = builder,
  transactionResultCallback = object: Checkout.TransactionResultCallback {
    override fun onTransactionResult(result: TransactionResult) {
      showResultDialog(result)
    }
  }
)
```

---

## Customization Theme

The class responsible for defining the theme is called `CheckoutTheme`.

**Customization Theme Class Structure:**

```swift
class CheckoutTheme(
    val uiMode: UiMode = UiMode.AUTO,
    val appearanceLight: Appearance ? = null,
    val appearanceDark : Appearance ? = null,
    val showPaymentDetails : Boolean = true,
)
```

#### uiMode

Specifies the device theme mode, which can be set to:

- Light
- Dark
- Auto (automatically adjusts based on system settings)

#### **appearanceLight & appearanceDark**

These are optional instances of the `Appearance` class, which enable UI customization for light mode and dark mode, respectively.

The `Appearance` class serves as the core inner class of `CheckoutTheme`, containing objects that define various UI components.

The component names within `Appearance` largely correspond to those described [here](customization-theme.md#properties-description).

<iframe
  title="Ottu SDK Components Documentation"
  src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FJ6WsECtu4F6ynCetrvTLcp%2FOttu-SDK---Components-Documentation--Copy-%3Fnode-id%3D0-1%26p%3Df"
  style={{ width: "100%", height: "480px", border: "0" }}
  loading="lazy"
  allow="fullscreen"
/>

#### **showPaymentDetails**

A boolean field that determines whether the "Payment Details" section should be displayed or hidden.

### Properties Description <a href="#properties-description" id="properties-description"></a>

All properties are optional and can be customized by the user.

If a property is not specified, the default value (as defined in the Figma design [here](https://www.figma.com/proto/BmLOTN8QCvMaaIteZflzgG?content-scaling=fixed&kind=proto&node-id=1-624&scaling=scale-down)) will be automatically applied.

##### **Texts**

#### **General**

| Property Name   |                            Description                            |              Data Type              |
| --------------- | :---------------------------------------------------------------: | :---------------------------------: |
| `mainTitleText` |                 Font and color for all “Captions”                 | [Text](customization-theme.md#text) |
| `titleText`     |          Font and color for payment options in the list           | [Text](customization-theme.md#text) |
| `subtitleText`  | Font and color for payment options details (like expiration date) | [Text](customization-theme.md#text) |

#### **Fees**

| Property Name      |                          Description                           |              Data Type              |
| ------------------ | :------------------------------------------------------------: | :---------------------------------: |
| `feesTitleText`    |    Font and color of fees value in the payment options list    | [Text](customization-theme.md#text) |
| `feesSubtitleText` | Font and color of fees description in the payment options list | [Text](customization-theme.md#text) |

#### **Data**

| Property Name   |                       Description                        |              Data Type              |
| --------------- | :------------------------------------------------------: | :---------------------------------: |
| `dataLabelText` | Font and color of payment details fields (like “Amount”) | [Text](customization-theme.md#text) |
| `dataValueText` |         Font and color of payment details values         | [Text](customization-theme.md#text) |

#### **Other**

| Property Name                   |                          Description                           |              Data Type              |
| ------------------------------- | :------------------------------------------------------------: | :---------------------------------: |
| `errorMessageText`              |        Font and color of error message text in pop-ups         | [Text](customization-theme.md#text) |
| `selectPaymentMethodHeaderText` | The text of "Select Payment Method" in the bottom sheet header | [Text](customization-theme.md#text) |

#### **Text Fields**

| Property Name    |                             Description                              |                   Data Type                   |
| ---------------- | :------------------------------------------------------------------: | :-------------------------------------------: |
| `inputTextField` | Font and color of text in any input field (including disabled state) | [TextField](customization-theme.md#textfield) |

#### **Colors**

| Property Name                              |                      Description                       |               Data Type               |
| ------------------------------------------ | :----------------------------------------------------: | :-----------------------------------: |
| `sdkbackgroundColor`                       |     The main background of the SDK view component      | [Color](customization-theme.md#color) |
| `modalBackgroundColor`                     |           The background of any modal window           | [Color](customization-theme.md#color) |
| `paymentItemBackgroundColor`               |   The background of an item in payment options list    | [Color](customization-theme.md#color) |
| `selectorIconColor`                        |          The color of the icon of the payment          | [Color](customization-theme.md#color) |
| `savePhoneNumberIconColor`                 | The color of “Diskette” button for saving phone number | [Color](customization-theme.md#color) |
| `selectPaymentMethodHeaderBackgroundColor` |   The background of an item in payment options list    | [Color](customization-theme.md#color) |

#### **Buttons**

| Property Name    |                            Description                            |                     Data Type                     |
| ---------------- | :---------------------------------------------------------------: | :-----------------------------------------------: |
| `button`         |          Background, text color and font for any button           |      [Button](customization-theme.md#button)      |
| `backButton`     |               Color of the “Back” navigation button               | [RippleColor](customization-theme.md#ripplecolor) |
| `selectorButton` | Background, text color and font for payment item selection button |      [Button](customization-theme.md#button)      |

#### **Switch**

| Property Name |                                        Description                                        |                 Data Type                 |
| ------------- | :---------------------------------------------------------------------------------------: | :---------------------------------------: |
| `switch`      | Colors of the switch background and its toggle in different states (on, off and disabled) | [Switch](customization-theme.md#switch-1) |

#### **Margins**

| Property Name |                      Description                      |                  Data Type                  |
| ------------- | :---------------------------------------------------: | :-----------------------------------------: |
| margins       | Top, left, bottom and right margins between component | [Margins](customization-theme.md#margins-1) |

### Data Types Description <a href="#data-types-description" id="data-types-description"></a>

#### **Color**

| Property Name   |             Description             | Data Type |
| --------------- | :---------------------------------: | :-------: |
| `color`         |      Main color integer value       |    Int    |
| `colorDisabled` | Disabled stated color integer value |    Int    |

#### **RippleColor**

| Property Name  |             Description             | Data Type |
| -------------- | :---------------------------------: | :-------: |
| `color`        |      Main color integer value       |    Int    |
| `rippleColor`  |     Ripple color integer value      |    Int    |
| `colorDisaled` | Disabled stated color integer value |    Int    |

#### **Text**

| Property Name |       Description        |               Data Type               |
| ------------- | :----------------------: | :-----------------------------------: |
| `textColor`   | Main color integer value | [Color](customization-theme.md#color) |
| `fontType`    |     Font resource ID     |                  Int                  |

#### **TextField**

| Property Name  | Description                    |               Data Type               |
| :------------: | ------------------------------ | :-----------------------------------: |
|  `background`  | Background color integer value | [Color](customization-theme.md#color) |
| `primaryColor` | Text color                     | [Color](customization-theme.md#color) |
| `focusedColor` | Selected text color            | [Color](customization-theme.md#color) |
|     `text`     | Text value                     |  [Text](customization-theme.md#text)  |
|    `error`     | Text value                     |  [Text](customization-theme.md#text)  |

#### Button

| Property Name |       Description       |                     Data Type                     |
| ------------- | :---------------------: | :-----------------------------------------------: |
| `rippleColor` | Button background color | [RippleColor](customization-theme.md#ripplecolor) |
| `fontType`    |   Button text font ID   |                        Int                        |
| `textColor`   |    Button text color    |       [Color](customization-theme.md#color)       |

#### Switch

| Property Name                   |             Description             | Data Type |
| ------------------------------- | :---------------------------------: | :-------: |
| `checkedThumbTintColor`         |    Toggle color in checked state    |    Int    |
| `uncheckedThumbTintColor`       |   Toggle color in unchecked state   |    Int    |
| `checkedTrackTintColor`         |    Track color in checked state     |    Int    |
| `uncheckedTrackTintColor`       |   Track color in unchecked state    |    Int    |
| `checkedTrackDecorationColor`   |  Decoration color in checked state  |    Int    |
| `uncheckedTrackDecorationColor` | Decoration color in unchecked state |    Int    |

#### **Margins**

| Property Name | Data Type |
| ------------- | :-------: |
| `left`        |    Int    |
| `top`         |    Int    |
| `right`       |    Int    |
| `bottom`      |    Int    |

### Example <a href="#example.1" id="example.1"></a>

To build the `theme`, the user must follow steps similar to those outlined in the **test app file**.

**Code Snippet:**

```swift
val appearanceLight = CheckoutTheme.Appearance(
    mainTitleText = CheckoutTheme.Text(
        textColor = CheckoutTheme.Color(Color.WHITE),
        R.font.roboto_bold
    ),
    titleText = CheckoutTheme.Text(textColor = CheckoutTheme.Color(Color.BLACK)),
    subtitleText = CheckoutTheme.Text(textColor = CheckoutTheme.Color(Color.BLACK)),

    button = CheckoutTheme.Button(
        rippleColor = CheckoutTheme.RippleColor(
            color = Color.WHITE,
            rippleColor = Color.BLACK,
            colorDisabled = Color.GRAY
        ),
        textColor = CheckoutTheme.Color(color = Color.BLACK),
        fontType = R.font.roboto_bold
    ),

    margins = Margins(left = 12, top = 4, right = 12, bottom = 4),

    sdkBackgroundColor = CheckoutTheme.Color(color = Color.WHITE)
)

return CheckoutTheme(
    uiMode = CheckoutTheme.UiMode.AUTO,
    showPaymentDetails = showPaymentDetails,
    appearanceLight = appearanceLight,
    appearanceDark = appearanceDark,
)
```

---

## Payment Gateway Compliance & Information

### STC Pay <a href="#stc-pay" id="stc-pay"></a>

Once the STC Pay integration between Ottu and STC Pay has been completed, the necessary checks are automatically handled by the Checkout SDK to ensure the seamless display of the STC Pay button.

Upon initialization of the Checkout SDK with the [session_id](payment-gateway-compliance-and-information.md#sessionid-string-required) and payment gateway codes ([pg_codes](./checkout-api#pg_codes-array-required)), the following condition is automatically verified:

- The `session_id` and pg_codes provided during SDK initialization must be linked to the STC Pay Payment Service. This verification ensures that the STC Pay option is made available for selection as a payment method.

Regardless of whether a mobile number has been entered by the customer during transaction creation, the STC Pay button is displayed by the Android SDK.

### Onsite Checkout

This payment option facilitates direct payments within the mobile SDK. A user-friendly interface allows users to securely input their CHD. If permitted by the backend, the card can be stored as a tokenized payment for future transactions.

**Example:**

<figure className="checkout-sdk-figure">
  <img src="/img/checkout-sdk/image%20%2896%29.png" alt="Onsite checkout screen" />
</figure>

The SDK supports multiple instances of onsite checkout payments. Therefore, for each payment method with a PG code of `ottu_pg`, the card form (as shown above) will be displayed.

<figure className="checkout-sdk-figure">
  <img src="/img/checkout-sdk/image%20%283%29%20%281%29.png" alt="Onsite checkout with multiple payment options" />
</figure>

:::info

Fees are not displayed for onsite checkout instances due to the support of multiple card types through omni PG (multi-card) configurations. The presence of multiple payment icons also indicates this multi-card functionality.
:::

---

## Error Reporting & Cybersecurity Measures

### Error Reporting <a href="#error-reporting" id="error-reporting"></a>

The SDK utilizes Sentry for error logging and reporting, with initialization based on the configuration provided by SDK Studio.

Since the SDK is embedded within the merchant's application, conflicts may arise if Sentry is also integrated into the app. To prevent such conflicts, Sentry can be disabled within the Checkout SDK by setting the `is_enabled` flag to `false` in the configuration.

### Cyber Security Measures <a href="#cyber-security-measures" id="cyber-security-measures"></a>

#### Rooting Detection

The SDK prevents execution on rooted devices.

To enforce this restriction, rooting checks are performed during SDK initialization. If a device is detected as rooted, a modal alert dialog is displayed, providing an explanation. The message shown is as follows:

:::danger

This device is not secure for payments. Transactions are blocked for security reasons.
:::

After dismissing the alert, the app crashes unexpectedly

:::info

&#x20;`Checkout.init` function needs to be called in a coroutine.
:::

#### Screen Capture Prevention

The SDK is designed to protect sensitive data by restricting screen capture functionalities. These restrictions apply to the entire Activity that contains the SDK and operate as follows:

- **Screenshot Attempts:**\
  If a user attempts to take a screenshot, a toast message will appear stating:\
  &#xNAN;_"This app doesn’t allow screenshots."_
- **Screen Recording After SDK Initialization:**\
  If screen recording is initiated **after** the SDK has been initialized, the following toast message is displayed:\
  &#xNAN;_"Can't record screen due to security policy."_
- **Screen Recording Before SDK Initialization:**\
  If screen recording begins **before** the SDK is initialized, the entire Activity containing the SDK will appear as a black screen in the recorded video.

---

## FAQ

#### 1 [What forms of payments are supported by the SDK?](faq.md#id-1.-what-forms-of-payments-are-supported-by-the-sdk) <a href="#id-1.-what-forms-of-payments-are-supported-by-the-sdk" id="id-1.-what-forms-of-payments-are-supported-by-the-sdk"></a>

The SDK accommodates various payment forms including`tokenPay`, `redirect`, `StcPay` and `cardOnsite`.&#x20;

Merchants have the flexibility to showcase specific methods based on their requirements.&#x20;

For instance, if you wish to exclusively display the STC Pay button, you can achieve this by setting `formsOfPayment` = `[StcPay]`, which will result in only the STC Pay button being displayed. This approach is applicable to other payment methods as well.

#### 2 [What are the minimum system requirements for the SDK integration?](faq.md#id-2.-what-are-the-minimum-system-requirements-for-the-sdk-integration) <a href="#id-2.-what-are-the-minimum-system-requirements-for-the-sdk-integration" id="id-2.-what-are-the-minimum-system-requirements-for-the-sdk-integration"></a>

It is required to have a device running Android 8 or higher (Android API level 26 or higher).

#### 3 [Can I customize the appearance beyond the provided themes?](faq.md#id-3.-can-i-customize-the-appearance-beyond-the-provided-themes) <a href="#id-3.-can-i-customize-the-appearance-beyond-the-provided-themes" id="id-3.-can-i-customize-the-appearance-beyond-the-provided-themes"></a>

Yes, check the [Customization theme](faq.md#customization-theme) section.

---

## Flutter

The Checkout SDK is a Flutter framework (library) developed by Ottu, designed to seamlessly integrate an Ottu-powered [checkout process](../#ottu-checkout-sdk-flow) into Flutter applications for both iOS and Android platforms. This framework functions as a wrapper over the corresponding native SDKs, ensuring a smooth and efficient payment experience.

With the Checkout SDK, both the visual appearance and the forms of payment available during the checkout process can be fully customized to meet specific requirements.

To integrate the Checkout SDK, the library must be added to the Flutter application and initialized with the following parameters:

- [merchant_id](../web.md#merchant_id-string)
- [session_id](./checkout-api#session_id-string-mandatory)
- [API key](../getting-started/authentication#public-key)

Additionally, optional configurations such as the [forms of payment](./#formsofpayment-array-optional) to be accepted and the [theme](./#customization-theme) styling for the checkout interface can be specified.

---

## Quick Start

This guide explains how to integrate the **Ottu Checkout SDK** into a Flutter application from scratch.\
It walks you through[ project setup](quick-start.md#project-setup), SDK installation, and configuration steps for both [Android](quick-start.md#android-integration) and [iOS](quick-start.md#ios-integration), ensuring a smooth and efficient checkout experience within your Flutter app.

### **Video Tutorial: Flutter SDK Integration**

This video walks you through the complete Flutter SDK integration process. Follow along to easily set up, configure, and explore the core features in action.

<iframe
  title="Flutter Video"
  src="https://drive.google.com/file/d/14nl7dEoxlsozLY6fQOLpMCzciYvj3-Oo/preview"
  style={{ width: "100%", height: "480px", border: "0" }}
  loading="lazy"
  allow="fullscreen"
/>

### Video Tutorial: Releasing Your Android Application

In this video, we'll walk you through the complete process of preparing and releasing your Android application. You'll learn how to verify your **build.gradle.kts** configuration, set up and update **ProGuard rules**, and resolve missing rule issues to ensure a smooth release build. Follow along step by step as we guide you through the commands and configuration updates needed to successfully generate your release APK. For further information, please refer to[ Releasing Your APP](quick-start.md#releasing-your-app) section.

<iframe
  title="Flutter Video"
  src="https://drive.google.com/file/d/1fKtphZ_S5MT45UuJAoaHVxgIXt4hJ0aV/preview"
  style={{ width: "100%", height: "480px", border: "0" }}
  loading="lazy"
  allow="fullscreen"
/>

### Installation <a href="#pre-requisites" id="pre-requisites"></a>

<ol className="stepper">
  <li className="stepper-item">
    <strong>Create a New Flutter Project</strong>
    <div>
      Here are tutorials on how to create a new Flutter project from scratch
      for different IDEs:
      [Create a new Flutter app](https://docs.flutter.dev/reference/create-new-app)
    </div>
    <div>
      You can use any IDE of your choice; however, it is recommended to use
      Android Studio and select “New Flutter Project”, ensuring the selected
      programming language is Kotlin.
    </div>
    <div>
      Once the project is created, you can proceed to add the Ottu Checkout SDK.
    </div>
  </li>
  <li className="stepper-item">
    <strong>Add the Ottu Checkout SDK Dependency</strong>
    <div>
      Open the `pubspec.yaml` file, navigate to the dependencies section, and
      add the following block:
    </div>

    ```yaml
    ottu_flutter_checkout:
      git:
        url: https://github.com/ottuco/ottu-flutter.git
        ref: 2.1.15
    ```
  </li>
  <li className="stepper-item">
    <strong>Install Dependencies</strong>
    <div>Run the following command to download the dependencies:</div>

    ```bash
    flutter pub get
    ```

    :::info
    If you choose to use CocoaPods, please use release version
    **2.1.15-cocoapods**.
    :::
  </li>
</ol>

### SDK Configuration

Integrate the Ottu Checkout SDK into your Flutter app for **Android** and **iOS** to enable seamless in-app payment processing.

#### Android SDK Configuration

To integrate the SDK with **Android**, follow these steps.

<ol className="stepper">
  <li className="stepper-item">
    <strong>Add JitPack Repository</strong>
    <div>The Ottu SDK is a Flutter plugin that includes a native platform view.</div>
    <div>
      From the root directory of your project, open the `android` folder and
      locate the Gradle file: `app/build.gradle` (for Groovy) or
      `app/build.gradle.kts` (for Kotlin).
    </div>
    <div>At the bottom of this file, add the following lines:</div>

    ```kotlin
    allprojects {
      repositories {
        ...
        maven { url = uri("https://www.jitpack.io") }
      }
    }
    ```
  </li>
  <li className="stepper-item">
    <strong>Update Android Build Properties</strong>
    <div>
      The Ottu SDK requires specific Android build configurations. Ensure the
      following values are set in your Gradle script:
    </div>
    <ul>
      <li>`compileSdk` version: **36 or newer**</li>
      <li>`minSdk` version: **26**</li>
    </ul>
    <div>Update these values if they differ from your current setup.</div>
  </li>
  <li className="stepper-item">
    <strong>Verify `MainActivity` Inheritance</strong>
    <div>
      Go to the Android part of your project and open `MainActivity` (or your
      custom Android activity). Ensure that it extends
      **`FlutterFragmentActivity`**:
    </div>

    ```kotlin
    import io.flutter.embedding.android.FlutterFragmentActivity
    class MainActivity : FlutterFragmentActivity()
    ```
  </li>
  <li className="stepper-item">
    <strong>Apply Material Theme</strong>
    <div>
      Check if your app theme uses a Material theme. If not, extend it with
      `Theme.Material3.DayNight`. If you define a night theme, make sure to
      update it accordingly.
    </div>

    ```xml
    <style name="LaunchTheme" parent="Theme.Material3.DayNight">
        <item name="android:windowBackground">@drawable/launch_background</item>
    </style>
    ```
  </li>
  <li className="stepper-item">
    <strong>Run the App</strong>
    <div>
      Run the application using the command line with the following command:
    </div>

    ```bash
    flutter run
    ```

    > Running the app via command line is mandatory.\
    > If all dependencies are configured correctly, the app should launch
    > without errors.
  </li>
</ol>

#### iOS SDK Configuration

To integrate the SDK into an **iOS** app, follow these steps:

<ol className="stepper">
  <li className="stepper-item">
    <strong>Open the iOS Project</strong>
    <div>Open Xcode, then choose the `.xcworkspace` file from your Flutter app:</div>
    <ol className="stepper-sublist">
      <li>Open **Xcode**.</li>
      <li>
        Select **“Open Project”** and choose the `.xcworkspace` file located
        inside the `ios` directory within your Flutter app’s root directory.
      </li>
    </ol>
  </li>
  <li className="stepper-item">
    <strong>Configure iOS Deployment Target</strong>
    <div>Set the minimum deployment target to 15:</div>
    <ol className="stepper-sublist">
      <li>Select the **Runner** target.</li>
      <li>Go to the **General** tab.</li>
      <li>Find the **Minimum Deployment** section and set its value to **15**.</li>
    </ol>
  </li>
  <li className="stepper-item">
    <strong>Run the App</strong>
    <div>Run the application for the first time from the terminal:</div>

    ```bash
    flutter run
    ```

    > This command ensures that all necessary iOS plugin registration files are
    > created automatically.
  </li>
</ol>

### **Add OttuCheckoutWidget**

Open the screen or widget where you plan to add the **Ottu SDK widget**.

<ol className="stepper">
  <li className="stepper-item">
    <strong>Define `ValueNotifier`</strong>
    <div>
      In the State class of your screen widget, define a new member of type
      `ValueNotifier<int>`:
    </div>

    ```dart
    final _checkoutHeight = ValueNotifier(300);
    ```

    <div>
      Here, the default value of **300** represents the most suitable height
      for the `OttuCheckoutWidget`.
    </div>
  </li>
  <li className="stepper-item">
    <strong>Add and Wrap `OttuCheckoutWidget`</strong>
    <div>Add the `OttuCheckoutWidget` to the desired location in your layout.</div>
    <div>
      Wrap the `OttuCheckoutWidget` inside a `SizedBox`, then wrap this
      `SizedBox` within a `ValueListenableBuilder<int>` to dynamically adjust
      the widget height based on the `ValueNotifier` value.
    </div>
    <div>
      Set the `valueListenable` parameter of the builder to the value you
      created earlier in previous step.
    </div>

    ```dart
    ValueListenableBuilder(
      valueListenable: _checkoutHeight,
      builder: (context, height, child) {
        return SizedBox(
          height: height.toDouble(),
          child: OttuCheckoutWidget(
            arguments: CheckoutArguments(
              merchantId: "alpha.ottu.net",
              apiKey: 'your Api key',
              sessionId: 'your session id',
              amount: 20.0,
              showPaymentDetails: true,
              paymentOptionsDisplaySettings: PaymentOptionsDisplaySettings(
                mode: PaymentOptionsDisplayMode.BOTTOM_SHEET,
                visibleItemsCount: 5,
                defaultSelectedPgCode: "",
              ),
            ),
          ),
        );
      },
    ),
    ```
  </li>
  <li className="stepper-item">
    <strong>Define `MethodChannel` and Constant</strong>
    <div>
      Define your `MethodChannel` as a top-level member of the file. It listens
      to messages from the native Android or iOS view:
    </div>

    ```dart
    const _methodChannel = MethodChannel("com.ottu.sample/checkout");
    ```

    <div>
      Also, define a constant string member to identify the channel’s method
      name:
    </div>

    ```dart
    const _methodCheckoutHeight = "METHOD_CHECKOUT_HEIGHT";
    ```
  </li>
  <li className="stepper-item">
    <strong>Register `MethodChannel` Handler</strong>
    <div>
      Register a handler for this `MethodChannel`. It is recommended to do
      this inside the `didChangeDependencies()` widget state callback method:
    </div>
    ```dart
    @override
    void didChangeDependencies() {
      _methodChannel.setMethodCallHandler((call) async {
        switch (call.method) {
          case _methodCheckoutHeight:
            int height = call.arguments as int;
            _checkoutHeight.value = height;
        }
      });
      super.didChangeDependencies();
    }
    ```
  </li>
  <li className="stepper-item">
    <strong>Run the App</strong>
    <div>
      This is the final step to complete the integration. Run your Flutter app
      using the following command or by pressing the Run/Launch icon in your IDE:
    </div>

    ```bash
    flutter run
    ```

    <div>
      If all configurations and dependencies are correctly set, the app should
      build successfully and display the Ottu Checkout Widget.
    </div>
  </li>
</ol>

### Releasing Your App

#### Android

Follow these steps to prepare and release your Android app properly:

<ol className="stepper">
  <li className="stepper-item">
    <strong>Update the `proguard-rules.pro` File</strong>
    <div>
      When you are ready to release your app, the first thing to do is update
      your `proguard-rules.pro` file.
    </div>
    <ul>
      <li>Navigate to your project directory:</li>
    </ul>

    ```kotlin
    App/android/app/
    ```

    <ul>
      <li>Open the `build.gradle.kts` file.</li>
    </ul>
  </li>
  <li className="stepper-item">
    <strong>Verify or Add ProGuard Configuration</strong>
    <ul>
      <li>Scroll to the `buildTypes` section.</li>
      <li>Check whether the ProGuard configuration has been added.</li>
      <li>If it’s missing, add the following lines:</li>
    </ul>

    ```kotlin
    buildTypes {
        getByName("release") {
           ...
           ...
            // Verify this configuration in your build.gradle file
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    ```

    <div>
      Ensure that the `proguard-rules.pro` file exists in the `App/android/app/`
      directory. If it doesn’t exist, create it manually.
    </div>
  </li>
  <li className="stepper-item">
    <strong>Build the Release APK</strong>
    <div>
      Run the following command to build your release APK and verify that all
      required properties are properly configured:
    </div>

    ```kotlin
    flutter build apk
    ```
  </li>
  <li className="stepper-item">
    <strong>Resolve R8 Compilation Errors (If Any)</strong>
    <div>If you encounter an error such as the following:</div>

    ```kotlin
    ERROR: Missing classes detected while running R8. Please add the missing classes or apply additional keep rules that are generated in /build/app/outputs/mapping/release/missing_rules.txt.
    ERROR: R8: Missing class com.google.devtools.ksp.processing.SymbolProcessorProvider (referenced from: com.squareup.moshi.kotlin.codegen.ksp.JsonClassSymbolProcessorProvider)
    FAILURE: Build failed with an exception.
    * What went wrong:
    Execution failed for task ':app:minifyReleaseWithR8'.
    > A failure occurred while executing com.android.build.gradle.internal.tasks.R8Task$R8Runnable
       > Compilation failed to complete
    ```

    <div><strong>Do the following:</strong></div>
    <ol className="stepper-sublist">
      <li>Navigate to the file path below:</li>
    </ol>

    ```
    build/app/outputs/mapping/release/missing_rules.txt
    ```

    <ol className="stepper-sublist" start="2">
      <li>Copy the rules listed in this file.</li>
      <li>Paste them into your `proguard-rules.pro` file.</li>
    </ol>
  </li>
  <li className="stepper-item">
    <strong>Rebuild and Verify</strong>
    <div>
      After updating the ProGuard rules, run the release command again to
      ensure all issues are resolved:
    </div>

    ```gedcom
    flutter build apk
    ```

    <div>If the build completes successfully, your app is ready for release.</div>
  </li>
</ol>

---

## Installation

To install the **Flutter SDK plugin**, the following section must be added to the **`pubspec.yaml`** file:

```yaml
dependencies:
  flutter:
    sdk: flutter

  ottu_flutter_checkout:
    # To use ottu_flutter_checkout SDK from a local source, uncomment the line below
    # and comment out the three lines specifying the Git repository.
    # path: ../ottu_flutter_checkout

    git:
      url: https://github.com/ottuco/ottu-flutter.git
      ref: main
```

And then run `flutter pub get` command in the terminal.

:::info

If the development is being done on Windows or Linux, and iOS support is not required, you need to adjust the following line, [Access it here](https://github.com/ottuco/ottu-flutter/blob/main/Sample/pubspec.yaml#L40), in the `pubspec.yaml` file, by replacing the `ref` value `2.1.15` with `release-no-ios`.

Then, run the following two commands:\
`flutter clean`
\
`flutter pub get`
:::

:::info

If you choose to use CocoaPods, please use release version **2.1.15-cocoapods**.
:::

### Android

#### **Minimum Requirements**

The SDK can be used on devices running **Android 8 (Android SDK 26)** or higher.

:::warning

To prevent application crashes, it must be ensured that the correct parent theme is applied to the Android application. The theme configuration is defined in the `themes.xml` and/or `styles.xml` files located within the `res/values` directory. The `parent` attribute of the `style` tag should be set to `Theme.Material3.DayNight.NoActionBar`.

For reference, the configuration file can be reviewed at the following link: [themes.xml on GitHub](https://github.com/ottuco/ottu-flutter/blob/main/Sample/android/app/src/main/res/values/themes.xml#L3C58-L3C94)
:::

### iOS

#### **Minimum Requirements**

The SDK can be used on devices running **iOS 15** or higher.

---

## UI

### **Android**

The SDK UI is embedded as a `fragment` within any part of an `activity` in the merchant's application.

**Example:**

<figure><img src="/img/checkout-sdk/image%20%284%29%20%281%29.png" alt="" width="375" /><figcaption></figcaption></figure>

If only one payment option is available and it is a wallet, the UI is automatically minimized.

<figure><img src="/img/checkout-sdk/image%20%281%29%20%281%29%20%281%29%20%281%29%20%281%29.png" alt="" width="375" /><figcaption></figcaption></figure>

:::info

The parent application must use a theme based on `Theme.AppCompat` (or a subclass) to prevent crashes and styling problems. This requirement is defined in the `themes.xml` file within the `values` directory of the project.
:::

---

## SDK Configuration

### **Language**

The SDK supports two languages: **English** and **Arabic**, with **English** set as the default.

The SDK automatically applies the language based on the device settings, eliminating the need for manual adjustments within the application.

However, if the transaction is created in a different language and setup preload is enabled, texts retrieved from the backend (such as fee descriptions) will be displayed in the transaction language, regardless of the device’s language settings.

To ensure consistency, the current device language should be taken into account when specifying a language code in the transaction creation request of the [Checkout API](./checkout-api).

### **Light and Dark Theme**

The SDK supports automatic UI adjustments based on the device's theme settings (light or dark mode).

The appropriate theme is applied during [SDK initialization](sdk-configuration.md#sdk-initialization), aligning with the device's configuration. Similar to language settings, no manual adjustments are required within the application.

---

## Functions

### SDK Initialization

The Checkout SDK is initialized using the `CheckoutArguments` class, which includes the [properties](functions.md#properties) listed below.

To initialize the SDK, an instance of `CheckoutArguments` must be passed as an argument to the `OttuCheckoutWidget` object.

For a detailed implementation example, refer to the [Example](functions.md#example) section.

### **Properties**

#### **merchantId** _<span style={{ color: "blue" }}>`string`</span>_ _<span style={{ color: "red" }}>**`required`**</span>_

It is used to define the Ottu merchant domain and must be set to the root domain of the Ottu account, excluding the `https://` or `http://` prefix.

For example, if the Ottu URL is `https://example.ottu.com`, the corresponding merchant_id is `example.ottu.com`.

This property is required to ensure that the checkout process is correctly linked to the associated Ottu merchant account.

#### **apiKey** _<span style={{ color: "blue" }}>`string`</span>_ _<span style={{ color: "red" }}>**`required`**</span>_

It is the Ottu [API public key](../getting-started/authentication#public-key), used for authentication when communicating with **Ottu's servers** during the checkout process.

:::warning

Ensure that only the **public key** is used. The [private key](../getting-started/authentication#private-key-api-key) must remain confidential and must never be shared with any clients.
:::

#### **sessionId** _<span style={{ color: "blue" }}>`string`</span>_ _<span style={{ color: "red" }}>**`required`**</span>_

It is a unique identifier for the payment transaction associated with the checkout process.

This identifier is automatically generated when a payment transaction is created. For further details on how to use the `session_id` parameter in the [Checkout API](./checkout-api), refer to the [session_id](/broken/pages/3x6ec6ghiDMkqAeOlBDy#session_id) documentation.

#### **formsOfPayment** _<span style={{ color: "blue" }}>`array`</span>_ _<span style={{ color: "blue" }}>**`optional`**</span>_

The `formsOfPayment` parameter is used to customize the forms of payment displayed in the [checkout process](../#ottu-checkout-sdk-flow). By default, all forms of payment are enabled.

**Available options for formsOfPayment:**

- `applePay`: The Apple Pay payment method is supported, allowing purchases to be made using Apple Pay-enabled devices.
- `cardOnsite`: A direct (onsite) payment method, where customers are required to enter their card details directly within the SDK.
- `tokenPay`: A method utilizing [tokenization](../../tokenization.md), ensuring that customer payment information is securely stored and processed.
- `redirect`: A payment method where customers are redirected to an external payment gateway or a third-party processor to complete the transaction.
- `stcPay`: A method where customers enter their mobile number and authenticate using an OTP sent to their mobile device.

#### **setupPreload** _<span style={{ color: "blue" }}>`string`</span>_ _<span style={{ color: "blue" }}>**`optional`**</span>_

It is used to store transaction details. If provided, transaction details will not be requested from the backend, thereby reducing processing time.

#### **theme** _<span style={{ color: "blue" }}>`object`</span>_ _<span style={{ color: "blue" }}>**`optional`**</span>_

A Theme class object is used for UI customization. All fields are optional and may include values for background colors, text colors, and fonts for various UI components.

For more details, refer to [Android Customization Theme](../android/#customization-theme).

#### **paymentOptionsDisplaySettings** _<span style={{ color: "blue" }}>`object`</span>_ _<span style={{ color: "blue" }}>**`optional`**</span>_

The `PaymentOptionsDisplaySettings` object accepts a `PaymentOptionsDisplaySettings` configuration, which defines how payment options are presented to the user during checkout. For more details, refer to the [Payment Options Display Mode](functions.md#payment-options-display-mode) section.

#### **successCallback, errorCallback, and successCallback** _<span style={{ color: "blue" }}>`unit`</span>_ _<span style={{ color: "red" }}>**`required`**</span>_

Callback functions are used to retrieve the payment status. These must be provided directly to the Checkout initialization function. For more information, please check [here](functions.md#callbacks).

### Payment Options Display Mode

The SDK provides flexible customization for how payment options are displayed. It supports the following optional parameters:

- **`paymentOptionsListMode`**: Determines the layout style—either `PaymentOptionsDisplayMode.BOTTOM_SHEET` (default) or `PaymentOptionsDisplayMode.LIST`.
  - **BOTTOM_SHEET**: This is the default layout used in previous SDK versions.
  - **LIST**: A new layout that shows payment options in a vertical list placed above the **Payment Details** section and the **Pay** button.
- `visibleItemsCount:` Sets how many payment options are shown at once (default is `5`). Applicable only in `List` mode.
  - This unsigned integer controls how many payment options are visible simultaneously in **List** mode.
  - If the number of available options is less than `visibleItemsCount`, the list automatically resizes to fit the actual number of options.

:::warning

Passing `0` will cause the SDK to throw an exception. This exception must be caught and handled by the parent application.
:::

- **`defaultSelectedPgCode`**: Specifies a payment gateway [(PG) code](/broken/pages/OCLTqphKqkbEMATf9pam#pg_codes) to be pre-selected by default.
  - This field accepts a PG code to auto-select a specific payment option.
  - If the SDK finds a payment method matching the provided PG code, it will be selected by default.
  - If no match is found, no option is selected.

All of these parameters are optional and are demonstrated in the following figures.

#### Android <a href="#android.3" id="android.3"></a>

The `List` mode is displayed as illustrated in the figure below.

<div className="checkout-sdk-image-row">
  <figure>
    <img src="/img/checkout-sdk/image%20%282%29%20%281%29.png" alt="List mode" />
    <figcaption>List mode</figcaption>
  </figure>
  <figure>
    <img src="/img/checkout-sdk/image%20%281%29%20%281%29%20%281%29.png" alt="Selected item" />
    <figcaption>Selected item</figcaption>
  </figure>
  <figure>
    <img src="/img/checkout-sdk/image%20%282%29%20%281%29%20%281%29.png" alt="Expanded list" />
    <figcaption>Expanded list</figcaption>
  </figure>
</div>

Here is a code sample:

```swift
val paymentOptionsDisplayMode =
  if (showPaymentOptionsList) Checkout.PaymentOptionsDisplaySettings.PaymentOptionsDisplayMode.List(
    visibleItemsCount = paymentOptionsListCount
  )
else Checkout.PaymentOptionsDisplaySettings.PaymentOptionsDisplayMode.BottomSheet
val displaySettings = Checkout.PaymentOptionsDisplaySettings(
  mode = paymentOptionsDisplayMode,
  defaultSelectedPgCode = defaultSelectedPgCode
)
```

and passed to `Checkout.init` builder class via the following object:

```swift
.displaySettings(displaySettings)
```

#### iOS <a href="#ios.2" id="ios.2"></a>

The `List` mode looks like the following.

<div className="checkout-sdk-image-row">
  <figure>
    <img src="/img/checkout-sdk/image%20%283%29.png" alt="List mode" />
    <figcaption>List mode</figcaption>
  </figure>
  <figure>
    <img src="/img/checkout-sdk/image%20%284%29.png" alt="Selected item" />
    <figcaption>Selected item</figcaption>
  </figure>
  <figure>
    <img src="/img/checkout-sdk/image%20%285%29.png" alt="Expanded list" />
    <figcaption>Expanded list</figcaption>
  </figure>
</div>

Here is a code sample:

```swift
let paymentOptionsDisplaySettings: PaymentOptionsDisplaySettings =
  if arguments.showPaymentOptionsList {
    PaymentOptionsDisplaySettings(
      mode: .list,
      visibleItemsCount: UInt(arguments.paymentOptionsListCount),
      defaultSelectedPgCode: arguments.defaultSelectedPgCode
    )
  } else {
    PaymentOptionsDisplaySettings(
      mode: .bottomSheet,
      defaultSelectedPgCode: arguments.defaultSelectedPgCode
    )
  }
```

and passed to `Checkout.init` via the following object:

```swift
displaySettings:paymentOptionsDisplaySettings
```

To see the full function call, please refer the code snippet in the [Ottu SDK - Flutter | Example](functions.md#example) section.

---

## Callbacks

The callbacks are handled by the native frameworks. Please see the links here:

- [Android Callbacks](../android/#callbacks)
- [iOS Callbacks](../ios/#callbacks)

It is not necessary to modify anything for the callbacks, as they are managed by the native SDK.

However, the following examples demonstrate how they function on both platforms.

It is needed to add a section like below in a `*.dart` file of the app:

```swift
@override
void didChangeDependencies() {
  super.didChangeDependencies();
  _methodChannel.setMethodCallHandler((call) async {
    switch (call.method) {
      case _methodPaymentSuccessResult:
      {
        String message = call.arguments as String;
        logger.d("didChangeDependencies, success: $message");
        _checkoutMessage.value = ("Success", message);
      }

      case _methodPaymentCancelResult:
      {
        String message = call.arguments as String;
        logger.d("didChangeDependencies, cancel: $message");
        _checkoutMessage.value = ("Cancel", message);
      }

      case _methodPaymentErrorResult:
      {
        String message = call.arguments as String;
        logger.d("didChangeDependencies, error: $message");
        _checkoutMessage.value = ("Error", message);
      }
    }
  });
}
```

where `_methodPaymentSuccessResult`, `_methodPaymentCancelResult` and `_methodPaymentErrorResult` are defined as constants:

```swift
const _methodPaymentSuccessResult = "METHOD_PAYMENT_SUCCESS_RESULT";
const _methodPaymentErrorResult = "METHOD_PAYMENT_ERROR_RESULT";
const _methodPaymentCancelResult = "METHOD_PAYMENT_CANCEL_RESULT";
```

Also, on the Flutter side, you need to define a `MethodChannel` to listen for events from the native platforms.

```swift
const _methodChannel = MethodChannel('com.ottu.sample/checkout');
```

### Android

The `callbacks` are defined within the body of the `Checkout.init` function:

```swift
val sdkFragment = Checkout.init(
  context = checkoutView.context,
  builder = builder,
  setupPreload = apiTransactionDetails,
  successCallback = {
    Log.e("TAG", "successCallback: $it")
    showResultDialog(checkoutView.context, it)
  },
  cancelCallback = {
    Log.e("TAG", "cancelCallback: $it")
    showResultDialog(checkoutView.context, it)
  },
  errorCallback = { errorData, throwable ->
    Log.e("TAG", "errorCallback: $errorData")
    showResultDialog(checkoutView.context, errorData, throwable)
  },

```

### iOS <a href="#ios.1" id="ios.1"></a>

Here is an example of a delegate:

```swift
extension CheckoutPlatformView: OttuDelegate {

    public func errorCallback(_ data: [String: Any]?) {
        debugPrint("errorCallback\n")
        DispatchQueue.main.async {
            self.paymentViewController?.view.isHidden = true
            self.paymentViewController?.view.setNeedsLayout()
            self.paymentViewController?.view.layoutIfNeeded()
            self._view.heightHandlerView.setNeedsLayout()
            self._view.heightHandlerView.layoutIfNeeded()
            self._view.setNeedsLayout()
            self._view.layoutIfNeeded()

            let alert = UIAlertController(
                title: "Error",
                message: data?.debugDescription ?? "",
                preferredStyle: .alert
            )
            alert.addAction(
                UIAlertAction(title: "OK", style: .cancel)
            )
            debugPrint("errorCallback, show alert\n")
            self.paymentViewController?.present(alert, animated: true)
        }
    }

    public func cancelCallback(_ data: [String: Any]?) {
        debugPrint("cancelCallback\n")
        DispatchQueue.main.async {
            var message = ""

            if let paymentGatewayInfo = data?["payment_gateway_info"] as? [String: Any],
               let pgName = paymentGatewayInfo["pg_name"] as? String,
               pgName == "kpay" {
                message = paymentGatewayInfo["pg_response"].debugDescription
            } else {
                message = data?.debugDescription ?? ""
            }

            self.paymentViewController?.view.isHidden = true
            self.paymentViewController?.view.setNeedsLayout()
            self.paymentViewController?.view.layoutIfNeeded()
            self._view.heightHandlerView.setNeedsLayout()
            self._view.heightHandlerView.layoutIfNeeded()
            self._view.setNeedsLayout()
            self._view.layoutIfNeeded()

            let alert = UIAlertController(
                title: "Cancel",
                message: message,
                preferredStyle: .alert
            )
            alert.addAction(
                UIAlertAction(title: "OK", style: .cancel)
            )
            debugPrint("cancelCallback, show alert\n")
            self.paymentViewController?.present(alert, animated: true)
        }
    }

    public func successCallback(_ data: [String: Any]?) {
        debugPrint("successCallback\n")
        DispatchQueue.main.async {
            self.paymentViewController?.view.isHidden = true
            self._view.paymentSuccessfullLabel.isHidden = false
            self.paymentViewController?.view.setNeedsLayout()
            self.paymentViewController?.view.layoutIfNeeded()
            self._view.heightHandlerView.setNeedsLayout()
            self._view.heightHandlerView.layoutIfNeeded()
            self._view.setNeedsLayout()
            self._view.layoutIfNeeded()

            let alert = UIAlertController(
                title: "Success",
                message: data?.debugDescription ?? "",
                preferredStyle: .alert
            )
            alert.addAction(
                UIAlertAction(title: "OK", style: .cancel)
            )
            debugPrint("successCallback, showing alert\n")
            self.paymentViewController?.present(alert, animated: true)
        }
    }
}

```

---

## Example

```swift
final displaySettings = PaymentOptionsDisplaySettings(
mode: state.paymentOptionsDisplayMode ?? PaymentOptionsDisplayMode.BOTTOM_SHEET,
visibleItemsCount: paymentsListItemCount,
defaultSelectedPgCode: state.defaultSelectedPayment,
);
final args = CheckoutArguments(
merchantId: state.merchantId,
apiKey: state.apiKey,
sessionId: state.sessionId ?? "",
amount: amount,
showPaymentDetails: state.showPaymentDetails,
paymentOptionsDisplaySettings: displaySettings,
setupPreload: state.preloadPayload == true ? _apiTransactionDetails : null,
formsOfPayment: formOfPayments?.isNotEmpty == true ? formOfPayments : null,
theme: _theme,
);
//
Scaffold(
appBar: AppBar(
backgroundColor: Theme.of(context).colorScheme.inversePrimary,
title: Text(widget.title),
),
body: SingleChildScrollView(
child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
SizedBox(height: 46),
Text(
"Customer Application",
textAlign: TextAlign.center,
style: ts.TextStyle(fontSize: 24),
),
//Start of Merchant content
const Padding(
padding: EdgeInsets.all(12.0),
child: Text(
"Some users UI elements, Some users UI elements, Some users UI elements, Some users UI elements, Some users UI elements")),
//End of Merchant content
Padding(
padding: const EdgeInsets.all(12.0),
child: ValueListenableBuilder < int > (
builder: (BuildContext context, int height, Widget ? child) {
return SizedBox(
height: height.toDouble(),
child: OttuCheckoutWidget(arguments: widget.checkoutArguments),
);
},
valueListenable: _checkoutHeight,
),
),
const SizedBox(height: 20),
//Start of Merchant content
const Padding(
padding: EdgeInsets.all(12.0),
child: Text(
"Some users UI elements, Some users UI elements, Some users UI elements, Some users UI elements, Some users UI elements,"
" Some users UI elements, Some users UI elements, Some users UI elements,"
" Some users UI elements, Some users UI elements, Some users UI elements")),
//End of Merchant content
])),
);
```

---

## Customization Theme

The class responsible for defining the theme is called `CheckoutTheme`. It utilizes additional component classes, including:

- `ButtonComponent`
- `LabelComponent`
- `TextFieldComponent`

The `CheckoutTheme` class consists of objects representing various UI components. While the component names generally align with those listed above, they also contain platform-specific fields for further customization.

<iframe
  title="Ottu SDK Components (Figma)"
  src="https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/design/J6WsECtu4F6ynCetrvTLcp/Ottu-SDK---Components-Documentation--Copy-?node-id=0-1%26p=f"
  style={{ width: "100%", height: "600px", border: "0" }}
  loading="lazy"
  allow="fullscreen"
/>

Below is the structure of the Customization `Theme` class:

```swift
class CheckoutTheme extends Equatable {
  @_UiModeJsonConverter()
  final CustomerUiMode uiMode;

  final TextStyle? mainTitleText;
  final TextStyle? titleText;
  final TextStyle? subtitleText;
  final TextStyle? feesTitleText;
  final TextStyle? feesSubtitleText;
  final TextStyle? dataLabelText;
  final TextStyle? dataValueText;
  final TextStyle? errorMessageText;

  final TextFieldStyle? inputTextField;

  final ButtonComponent? button;
  final RippleColor? backButton;
  final ButtonComponent? selectorButton;
  final SwitchComponent? switchControl;
  final Margins? margins;

  final ColorState? sdkBackgroundColor;
  final ColorState? modalBackgroundColor;
  final ColorState? paymentItemBackgroundColor;
  final ColorState? selectorIconColor;
  final ColorState? savePhoneNumberIconColor;
}

```

### **uiMode**

Specifies the device `Theme` mode, which can be set to one of the following:

- `light` – Forces the UI to use light mode.
- `dark` – Forces the UI to use dark mode.
- `auto` – Adapts the UI based on the device's system settings.

:::info

The `uiMode` parameter only affects Flutter Android and not Flutter iOS, as the flutter follows the behavior of the native implementation
:::

### Properties Description <a href="#properties-description" id="properties-description"></a>

All properties in the `CheckoutTheme` class are optional, allowing users to customize any of them as needed.

If a property is not set, the default value (as specified in the Figma design [here](https://www.figma.com/proto/BmLOTN8QCvMaaIteZflzgG?content-scaling=fixed&kind=proto&node-id=1-624&scaling=scale-down)) will be applied automatically.

#### **Texts**

#### **General**

| Property Name   |                            Description                            |              Data Type              |
| --------------- | :---------------------------------------------------------------: | :---------------------------------: |
| `mainTitleText` |                 Font and color for all “Captions”                 | [Text](customization-theme.md#text) |
| `titleText`     |          Font and color for payment options in the list           | [Text](customization-theme.md#text) |
| `subtitleText`  | Font and color for payment options details (like expiration date) | [Text](customization-theme.md#text) |

#### **Fees**

| Property Name      |                          Description                           |              Data Type              |
| ------------------ | :------------------------------------------------------------: | :---------------------------------: |
| `feesTitleText`    |    Font and color of fees value in the payment options list    | [Text](customization-theme.md#text) |
| `feesSubtitleText` | Font and color of fees description in the payment options list | [Text](customization-theme.md#text) |

#### **Data**

| Property Name   |                       Description                        |              Data Type              |
| --------------- | :------------------------------------------------------: | :---------------------------------: |
| `dataLabelText` | Font and color of payment details fields (like “Amount”) | [Text](customization-theme.md#text) |
| `dataValueText` |         Font and color of payment details values         | [Text](customization-theme.md#text) |

#### **Other**

| Property Name                   |                          Description                           |              Data Type              |
| ------------------------------- | :------------------------------------------------------------: | :---------------------------------: |
| `errorMessageText`              |        Font and color of error message text in pop-ups         | [Text](customization-theme.md#text) |
| `selectPaymentMethodHeaderText` | The text of "Select Payment Method" in the bottom sheet header | [Text](customization-theme.md#text) |

#### **Text Fields**

| Property Name    |                             Description                              |                   Data Type                   |
| ---------------- | :------------------------------------------------------------------: | :-------------------------------------------: |
| `inputTextField` | Font and color of text in any input field (including disabled state) | [TextField](customization-theme.md#textfield) |

#### **Colors**

| Property Name                              |                      Description                       |               Data Type               |
| ------------------------------------------ | :----------------------------------------------------: | :-----------------------------------: |
| `sdkbackgroundColor`                       |     The main background of the SDK view component      | [Color](customization-theme.md#color) |
| `modalBackgroundColor`                     |           The background of any modal window           | [Color](customization-theme.md#color) |
| `paymentItemBackgroundColor`               |   The background of an item in payment options list    | [Color](customization-theme.md#color) |
| `selectorIconColor`                        |          The color of the icon of the payment          | [Color](customization-theme.md#color) |
| `savePhoneNumberIconColor`                 | The color of “Diskette” button for saving phone number | [Color](customization-theme.md#color) |
| `selectPaymentMethodHeaderBackgroundColor` |   The background of an item in payment options list    | [Color](customization-theme.md#color) |

#### **Buttons**

| Property Name    |                            Description                            |                     Data Type                     |
| ---------------- | :---------------------------------------------------------------: | :-----------------------------------------------: |
| `button`         |          Background, text color and font for any button           |      [Button](customization-theme.md#button)      |
| `backButton`     |               Color of the “Back” navigation button               | [RippleColor](customization-theme.md#ripplecolor) |
| `selectorButton` | Background, text color and font for payment item selection button |      [Button](customization-theme.md#button)      |

#### **Switch**

| Property Name |                                        Description                                        |                 Data Type                 |
| ------------- | :---------------------------------------------------------------------------------------: | :---------------------------------------: |
| `switch`      | Colors of the switch background and its toggle in different states (on, off and disabled) | [Switch](customization-theme.md#switch-1) |

#### **Margins**

| Property Name |                      Description                      |                Data Type                |
| ------------- | :---------------------------------------------------: | :-------------------------------------: |
| margins       | Top, left, bottom and right margins between component | [Margin](customization-theme.md#margin) |

### Data Types Description <a href="#data-types-description" id="data-types-description"></a>

#### **Color**

| Property Name   |             Description             | Data Type |
| --------------- | :---------------------------------: | :-------: |
| `color`         |      Main color integer value       |    Int    |
| `colorDisabled` | Disabled stated color integer value |    Int    |

#### **RippleColor**

| Property Name  |             Description             | Data Type |
| -------------- | :---------------------------------: | :-------: |
| `color`        |      Main color integer value       |    Int    |
| `rippleColor`  |     Ripple color integer value      |    Int    |
| `colorDisaled` | Disabled stated color integer value |    Int    |

#### **Text**

| Property Name |       Description        |               Data Type               |
| ------------- | :----------------------: | :-----------------------------------: |
| `textColor`   | Main color integer value | [Color](customization-theme.md#color) |
| `fontType`    |     Font resource ID     |                  Int                  |

#### **TextField**

| Property Name  | Description                    |               Data Type               |
| :------------: | ------------------------------ | :-----------------------------------: |
|  `background`  | Background color integer value | [Color](customization-theme.md#color) |
| `primaryColor` | Text color                     | [Color](customization-theme.md#color) |
| `focusedColor` | Selected text color            | [Color](customization-theme.md#color) |
|     `text`     | Text value                     |  [Text](customization-theme.md#text)  |
|    `error`     | Text value                     |  [Text](customization-theme.md#text)  |

#### Button

| Property Name |       Description       |                     Data Type                     |
| ------------- | :---------------------: | :-----------------------------------------------: |
| `rippleColor` | Button background color | [RippleColor](customization-theme.md#ripplecolor) |
| `fontType`    |   Button text font ID   |                        Int                        |
| `textColor`   |    Button text color    |       [Color](customization-theme.md#color)       |

#### Switch

| Property Name                   |             Description             | Data Type |
| ------------------------------- | :---------------------------------: | :-------: |
| `checkedThumbTintColor`         |    Toggle color in checked state    |    Int    |
| `uncheckedThumbTintColor`       |   Toggle color in unchecked state   |    Int    |
| `checkedTrackTintColor`         |    Track color in checked state     |    Int    |
| `uncheckedTrackTintColor`       |   Track color in unchecked state    |    Int    |
| `checkedTrackDecorationColor`   |  Decoration color in checked state  |    Int    |
| `uncheckedTrackDecorationColor` | Decoration color in unchecked state |    Int    |

#### **Margin**

| Property Name | Data Type |
| ------------- | :-------: |
| `left`        |    Int    |
| `top`         |    Int    |
| `right`       |    Int    |
| `bottom`      |    Int    |

### Example <a href="#example.1" id="example.1"></a>

To build the `theme`, the user must follow similar steps as described in the corresponding file of the test app.

Here is a **code snippet** demonstrating the process:

```swift
final checkoutTheme = ch.CheckoutTheme(
  uiMode: ch.CustomerUiMode.dark,
  titleText: ch.TextStyle(),
  modalBackgroundColor: ch.ColorState(color: Colors.amber));
```

---

## Payment Gateway Compliance & Information

### STC Pay

If the STC Pay integration between Ottu and STC Pay has been completed, the Checkout SDK will automatically handle the necessary checks to display the STC Pay button seamlessly.

When the Checkout SDK is initialized with the [session_id](./checkout-api#session_id-string-mandatory) and payment gateway codes ([pg_codes](./checkout-api#pg_codes-array-required)), the SDK will verify the following conditions:

- The `session_id` and `pg_codes` provided during initialization must be associated with the STC Pay Payment Service. This ensures that the STC Pay option is available for the customer.
- In the Android SDK, the STC Pay button is displayed regardless of whether the customer has entered a mobile number while creating the transaction.

### **KNET - Apple Pay**

Due to compliance requirements, for iOS, the KNET payment gateway requires a popup notification displaying the payment result after each failed payment. This notification is triggered only in the cancelCallback, but only if a response is received from the payment gateway.

As a result, the user cannot retry the payment without manually clicking on Apple Pay again.

:::info

The popup notification mentioned above is specific to the KNET payment gateway.Other payment gateways may have different requirements or notification mechanisms, so it is essential to follow the respective documentation for each integration.
:::

To properly **handle** the **KNET popup notification**, the following **Swift** code snippet must be implemented into the **payment processing flow**:

:::info

This is only iOS-related stuff, so the callbacks are native and so they are in Swift language.
:::

```swift
func cancelCallback(_ data: [String: Any]?) {
    var message = ""

    if let paymentGatewayInfo = data?["payment_gateway_info"] as? [String: Any],
       let pgName = paymentGatewayInfo["pg_name"] as? String,
       pgName == "kpay" {
        message = paymentGatewayInfo["pg_response"].debugDescription
    } else {
        message = data?.debugDescription ?? ""
    }

    navigationController?.popViewController(animated: true)

    let alert = UIAlertController(
        title: "Cancel",
        message: message,
        preferredStyle: .alert
    )

    alert.addAction(UIAlertAction(title: "OK", style: .cancel))
    self.present(alert, animated: true)
}

```

#### **Function Breakdown**

The above code performs the following checks and actions:

1. Checks if the `cancelCallback` object contains payment gateway information
   - It verifies whether the `payment_gateway_info` field is available in the response.
2. Identifies if the payment gateway used is `KNET`
   - It checks if the `pg_name` property equals `kpay`, confirming that the transaction was processed using KNET.
3. Check the above two conditions are met by retrieving the payment gateway response
   - If the gateway response (`pg_response`) is available, it is displayed; otherwise, a default message (`Payment was cancelled.`) is used.
4. Navigates back and displays an alert
   - The user is returned to the previous screen (`navigationController?.popViewController(animated: true)`).
   - A popup notification is displayed using `self.present(alert, animated: true)`, informing the user about the failed payment.

### **Onsite Checkout**

This payment option enables direct payments through the mobile SDK. The SDK presents a user interface where the customer can enter their cardholder details (CHD). If supported by the backend, the user can also save the card for future payments—stored as a tokenized payment method.

The onsite checkout screen appears identical to the native platform version.

#### Android

<figure className="checkout-sdk-figure">
  <img src="/img/checkout-sdk/image%20%282%29%20%281%29%20%281%29%20%281%29%20%281%29.png" alt="Onsite checkout screen (Android)" />
</figure>

#### iOS

<figure className="checkout-sdk-figure">
  <img src="/img/checkout-sdk/image%20%283%29%20%281%29%20%281%29.png" alt="Onsite checkout screen (iOS)" />
</figure>

The SDK supports multiple instances of onsite checkout payments. Therefore, for each payment method with a PG code equal to `ottu_pg`, the card form (as shown above) will be displayed.

#### **Android**

<figure className="checkout-sdk-figure">
  <img src="/img/checkout-sdk/image%20%286%29.png" alt="Onsite checkout with multiple payment options (Android)" />
</figure>

#### **iOS**

<figure className="checkout-sdk-figure">
  <img src="/img/checkout-sdk/image%20%287%29.png" alt="Onsite checkout with multiple payment options (iOS)" />
</figure>

:::info

No fees are displayed for onsite checkout instances. This is due to the support for multiple multi-card (omni PG) configurations. The presence of multiple payment icons is used to indicate this multi-card feature.
:::

---

## Error Reporting & Cybersecurity Measures

### **Error Reporting**

The SDK utilizes Sentry for error logging and reporting. It is initialized based on the configuration provided by SDK Studio.

However, since the SDK is a framework embedded within the merchant's app, conflicts may arise if the app also integrates Sentry.

To prevent conflicts, the merchant can disable Sentry within the Checkout SDK by setting the `is_enabled` flag to `false` in the configuration inside the SDK studio.

### **Cyber Security Measures**

#### **Rooting and Jailbreak Detection**

The **Flutter SDK** does **not** perform **rooting** or **jailbreak detection** independently. Instead, these security checks are entirely handled by the **native SDKs**.

For more details, refer to the following links:

[Android ](../android/#rooting-detection)

[iOS](../ios/#jailbreak-detection)

#### Screen Capture Prevention

The SDK includes mechanisms to prevent screen capturing (such as screenshots and video recordings) on screens that display sensitive information. The Flutter SDK does not handle this independently; instead, it relies on the logic implemented in the native SDKs for Android and iOS.

Since the implementation differs between the two platforms, please refer to the respective native documentation for more details.

[Android](../android/#screen-capture-prevention)&#x20;

[iOS](../ios/#screen-capture-prevention)

---

## Releasing Your App

### Android

Follow these steps to prepare and release your Android app properly:

<ol className="stepper">
  <li className="stepper-item">
    <strong>Update the `proguard-rules.pro` File</strong>
    <div>
      When you are ready to release your app, the first thing to do is update
      your `proguard-rules.pro` file.
    </div>
    <ul>
      <li>Navigate to your project directory:</li>
    </ul>

    ```kotlin
    App/android/app/
    ```

    <ul>
      <li>Open the `build.gradle.kts` file.</li>
    </ul>
  </li>
  <li className="stepper-item">
    <strong>Verify or Add ProGuard Configuration</strong>
    <ul>
      <li>Scroll to the `buildTypes` section.</li>
      <li>Check whether the ProGuard configuration has been added.</li>
      <li>If it’s missing, add the following lines:</li>
    </ul>

    ```kotlin
    buildTypes {
        getByName("release") {
           ...
           ...
            // Verify this configuration in your build.gradle file
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    ```

    <div>
      Ensure that the `proguard-rules.pro` file exists in the `App/android/app/`
      directory. If it doesn’t exist, create it manually.
    </div>
  </li>
  <li className="stepper-item">
    <strong>Build the Release APK</strong>
    <div>
      Run the following command to build your release APK and verify that all
      required properties are properly configured:
    </div>

    ```kotlin
    flutter build apk
    ```
  </li>
  <li className="stepper-item">
    <strong>Resolve R8 Compilation Errors (If Any)</strong>
    <div>If you encounter an error such as the following:</div>

    ```kotlin
    ERROR: Missing classes detected while running R8. Please add the missing classes or apply additional keep rules that are generated in /build/app/outputs/mapping/release/missing_rules.txt.
    ERROR: R8: Missing class com.google.devtools.ksp.processing.SymbolProcessorProvider (referenced from: com.squareup.moshi.kotlin.codegen.ksp.JsonClassSymbolProcessorProvider)
    FAILURE: Build failed with an exception.
    * What went wrong:
    Execution failed for task ':app:minifyReleaseWithR8'.
    > A failure occurred while executing com.android.build.gradle.internal.tasks.R8Task$R8Runnable
       > Compilation failed to complete
    ```

    <div><strong>Do the following:</strong></div>
    <ol className="stepper-sublist">
      <li>Navigate to the file path below:</li>
    </ol>

    ```
    build/app/outputs/mapping/release/missing_rules.txt
    ```

    <ol className="stepper-sublist" start="2">
      <li>Copy the rules listed in this file.</li>
      <li>Paste them into your `proguard-rules.pro` file.</li>
    </ol>
  </li>
  <li className="stepper-item">
    <strong>Rebuild and Verify</strong>
    <div>
      After updating the ProGuard rules, run the release command again to
      ensure all issues are resolved:
    </div>

    ```gedcom
    flutter build apk
    ```

    <div>If the build completes successfully, your app is ready for release.</div>
  </li>
</ol>

---

## FAQ

### 1 [**What forms of payment are supported by the SDK?**](faq.md#what-forms-of-payment-are-supported-by-the-sdk)

The SDK supports the following [forms of payment](faq.md#formsofpayment-array-optional):

- `tokenPay`
- `redirect`
- `StcPay` &#x20;
- `cardOnsite`
- `applePay` _(iOS only)_

Merchants can configure the forms of payment displayed according to their needs.

For example, to **display only the STC Pay button**, use:

```
formsOfPayment = ["stcPay"]
```

This ensures that only the **STC Pay** button is shown. The same approach applies to other payment methods.

### 2 [**What are the minimum system requirements for SDK integration?**](faq.md#what-are-the-minimum-system-requirements-for-sdk-integration)

The SDK requires a device running:

- **Android 8** or higher (**API level 26** or higher)
- **iOS 14** or higher

### 3 [**Can I customize the appearance beyond the provided themes?**](faq.md#can-i-customize-the-appearance-beyond-the-provided-themes)

Yes, customization is supported. For more details, refer to the [Customization Theme](faq.md#customization-theme) section.
