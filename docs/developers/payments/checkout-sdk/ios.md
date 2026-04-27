---
toc_min_heading_level: 2
toc_max_heading_level: 3
---

import FAQ, { FAQItem } from '@site/src/components/FAQ';

The [Checkout SDK](../) is a Swift framework (library) provided by Ottu, designed to facilitate the seamless integration of an Ottu-powered checkout process into iOS applications.

With the Checkout SDK, both the visual appearance and the forms of payment available during the [checkout process](../#ottu-checkout-sdk-flow) can be fully customized.

To integrate the Checkout SDK, the library must be included in the iOS application and initialized with the following parameters:

- [merchant_id](https://app.gitbook.com/s/su3y9UFjvaXZBxug1JWQ/#merchant_id-string)
- [session_id](../../checkout-api)
- [API public key](../../../getting-started/authentication#public-key)

Additionally, optional configurations such as the [forms of payment](#formsofpayment-array-optional) to accept and the theme styling for the checkout interface can be specified.

:::warning

[API private key](../../../getting-started/authentication#api-key-auth) should never be used on the client side. Instead, [API public key ](../../../getting-started/authentication#public-key)should be used. This is essential to ensure the security of your application and the protection of sensitive data.
:::

This video walks you step-by-step through the iOS SDK integration process. Watch it to quickly understand setup, configuration, and key features in action.

<iframe
  title="iOS SDK Integration Video"
  src="https://drive.google.com/file/d/10qN4Iuy-6dU6-rLNRZNodgjdB_AEHZCk/preview"
  style={{ width: "100%", height: "480px", border: "0" }}
  loading="lazy"
  allow="fullscreen"
/>

## Installation

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
- However, there's also a **minimalistic SwiftUI-based demo app**:\
  [ottu-ios/Example_SwiftUI at main · ottuco/ottu-ios](https://github.com/ottuco/ottu-ios/tree/main/Example_SwiftUI?utm_source=chatgpt.com)

### Swift Package Manager

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

### CocoaPods

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

If you see _"could not find compatible versions for pod"_, run:

```bash
pod repo update
```

:::

## Initialization

### Checkout.init

The `Checkout.init` function is responsible for initializing the checkout process and configuring the necessary settings for the Checkout SDK.

It must be called once by the parent application and provided with a set of configuration fields that define all the required options for the checkout process.

When `Checkout.init` is invoked, the SDK automatically sets up the essential components, including:

- Generating a form for the customer to enter their payment details.
- Handling communication with Ottu's servers to process the payment.

This function returns a `View` object, which is a native iOS UI component. It can be embedded within any `ViewController` instance in the application.

### Integration Guide

Once the SDK is installed (via Swift Package Manager or CocoaPods), follow these steps to integrate it into your app.

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

## Properties

### Required Properties

#### **merchantId** _`string`_ _`required`_

The **`merchant_id`** specifies the **Ottu merchant domain** and must be set to the **root domain** of the **Ottu account**, excluding the **"https://"** or **"http://"** prefix.

For example, if the **Ottu URL** is **`https://example.ottu.com`**, then the corresponding **`merchant_id`** is **`example.ottu.com`**.

This parameter is used to **link** the **checkout process** to the appropriate **Ottu merchant account**.

#### **apiKey** _`string`_ _`required`_

The `apiKey` is the Ottu API [public key](../../../getting-started/authentication#public-key), used for authentication when communicating with Ottu's servers during the checkout process.

:::warning

Only the public key should be used. The private key must remain confidential at all times and must not be shared with any clients.
:::

#### **sessionId** _`string`_ _`required`_

The `session_id` is a unique identifier assigned to the payment transaction associated with the checkout process.

This identifier is automatically generated when the payment transaction is created.

For more details on how to use the `session_id` parameter in the Checkout API, refer to the session_id.

#### **delegate** _`object`_ _`required`_

An object is used to provide SDK callbacks to the application. Typically, this is the parent app's class that conforms to `OttuDelegate`, aggregating the SDK object.

To implement this delegate, the class must define three callback functions. More details are accessible next secion.

### Display Options

#### **formsOfPayment** _`array`_ _`optional`_

The forms of payment displayed in the [checkout process](../#ottu-checkout-sdk-flow) can be customized using `formsOfPayment`. By default, all forms of payment are enabled.

Available options for `formsOfPayment`:

- `applePay`: Supports Apple Pay, allowing purchases to be made using Apple Pay-enabled devices.
- `stcPay`: Requires customers to enter their mobile number and authenticate with an OTP sent to their device to complete the payment.
- `cardOnsite`: Enables direct payments (onsite checkout), where Cardholder Data (CHD) is entered directly in the SDK. If 3DS authentication is required, a payment provider is involved in the process.
- `tokenPay`: Uses tokenization to securely store and process customers' payment information.
- `redirect`: Redirects customers to an external payment gateway or a third-party payment processor to complete the transaction.

#### displaySettings _`object`_ _`optional`_

The display of payment options is configured using the `PaymentOptionsDisplaySettings` struct. Additional information is provided in the Payment Options Display Mode section.

#### Payment Options Display Mode

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

### Preloading

#### **setupPreload** _`object`_ _`optional`_

An `ApiTransactionDetails` struct object is used to store transaction details.

If provided, the SDK will not request transaction details from the backend, reducing processing time and improving efficiency.

### Theme

#### **theme** _`object`_ _`optional`_

The `Theme` struct object is used for UI customization, allowing modifications to background colors, text colors, and fonts for various components. It supports customization for both light and dark device modes. All fields in the `Theme` struct are optional. If a theme is not provided, the default UI settings will be applied.

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

#### Properties Description

All properties in the `CheckoutTheme` class are optional, allowing users to customize any of them as needed.

If a property is not specified, the default value (as defined in the Figma design [here](https://www.figma.com/proto/BmLOTN8QCvMaaIteZflzgG?content-scaling=fixed&kind=proto&node-id=1-624&scaling=scale-down)) will be automatically applied.

##### **Texts**

##### **General**

| Property Name |                            Description                            |   Data Type    |
| ------------- | :---------------------------------------------------------------: | :------------: |
| `mainTitle`   |                 Font and color for all "Captions"                 | LabelComponent |
| `title`       |          Font and color for payment options in the list           | LabelComponent |
| `subtitle`    | Font and color for payment options details (like expiration date) | LabelComponent |

##### **Fees**

| Property Name  |                          Description                           |   Data Type    |
| -------------- | :------------------------------------------------------------: | :------------: |
| `feesTitle`    |    Font and color of fees value in the payment options list    | LabelComponent |
| `feesSubtitle` | Font and color of fees description in the payment options list | LabelComponent |

##### **Data**

| Property Name |                       Description                        |   Data Type    |
| ------------- | :------------------------------------------------------: | :------------: |
| `dataLabel`   | Font and color of payment details fields (like "Amount") | LabelComponent |
| `dataValue`   |         Font and color of payment details values         | LabelComponent |

##### **Other**

| Property Name                   |                          Description                           |   Data Type    |
| ------------------------------- | :------------------------------------------------------------: | :------------: |
| `errorMessageText`              |        Font and color of error message text in pop-ups         | LabelComponent |
| `selectPaymentMethodTitleLabel` | The text of "Select Payment Method" in the bottom sheet header | LabelComponent |

##### **Text Fields**

| Property Name    |                             Description                              |     Data Type      |
| ---------------- | :------------------------------------------------------------------: | :----------------: |
| `inputTextField` | Font and color of text in any input field (including disabled state) | TextFieldComponent |

##### **Colors**

| Property Name                             |                            Description                            | Data Type |
| ----------------------------------------- | :---------------------------------------------------------------: | :-------: |
| `backgroundColor`                         |           The main background of the SDK view component           |  UIColor  |
| `backgroundColorModal`                    |                The background of any modal window                 |  UIColor  |
| `iconColor`                               |               The color of the icon of the payment                |  UIColor  |
| `paymentItemBackgroundColor`              |         The background of an item in payment options list         |  UIColor  |
| `selectPaymentMethodTitleBackgroundColor` | The background of the "Select Payment Method" bottom sheet header |  UIColor  |

##### **Buttons**

| Property Name    |                            Description                            |    Data Type    |
| ---------------- | :---------------------------------------------------------------: | :-------------: |
| `button`         |          Background, text color and font for any button           | ButtonComponent |
| `selectorButton` | Background, text color and font for payment item selection button | ButtonComponent |

##### **Switch**

| Property Name       |             Description              | Data Type |
| ------------------- | :----------------------------------: | :-------: |
| `switchOnTintColor` | The color of switch (toggle) control |  UIColor  |

##### **Margins**

| Property Name |                     Description                     |  Data Type   |
| ------------- | :-------------------------------------------------: | :----------: |
| margins       | Top, left, bottom and right margins between compone | UIEdgeInsets |

##### Payment Details

| Property Name        |                                            Description                                            | Data Type |
| -------------------- | :-----------------------------------------------------------------------------------------------: | :-------: |
| `showPaymentDetails` | Boolean variable determining whether the "Payment Details" section should be displayed or hidden. |  Boolean  |

#### Data Types Description

##### **LabelComponent**

| Property Name | Data Type |
| ------------- | :-------: |
| `color`       |  UIColor  |
| `font`        |  UIFont   |
| `fontFamily`  |  String   |

##### **TextFieldComponent**

| Property Name     |                                                                    Data Type                                                                    |
| ----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------: |
| `label`           |                                                                 LabelComponent                                                                  |
| `text`            | [LabelComponent](https://app.gitbook.com/o/RxY0H8C3fNw3knTb5iVs/s/XdPwy0yrnZJ8gfKCUk9E/~/changes/601/developer/checkout-sdk/ios#labelcomponent) |
| `backgroundColor` |                                                                     UIColor                                                                     |

##### **ButtonComponent**

| Property Name             | Data Type |
| ------------------------- | :-------: |
| `enabledTitleColor`       |  UIColor  |
| `disabledTitleColor`      |  UIColor  |
| `font`                    |  UIFont   |
| `enabledBackgroundColor`  |  UIColor  |
| `disabledBackgroundColor` |  UIColor  |
| `fontFamily`              |  String   |

##### **UIEdgeInsets**

| Property Name | Data Type |
| ------------- | :-------: |
| `left`        |    Int    |
| `top`         |    Int    |
| `right`       |    Int    |
| `bottom`      |    Int    |

#### Theme Example

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

### SDK Configuration

#### Language

The SDK supports two languages: English and Arabic, with English set as the default.

The language applied in the device settings is automatically used by the SDK, requiring no manual adjustments within the application.

However, if the transaction is created in a different language and setup preload is enabled, texts retrieved from the backend (such as fee descriptions) will be displayed in the transaction language rather than the device's language.

Therefore, the currently selected device language or the app's selected language should be considered when specifying a language code in the transaction creation request of the [Checkout API](../../checkout-api).

#### Light and dark theme

The SDK also supports UI adjustments based on the device's theme settings (light or dark mode).

The appropriate theme is applied automatically during SDK initialization, aligning with the device's settings. Similar to language settings, no manual adjustments are required within the application.

## Wallet Configuration

### Apple Pay

When the [integration ](#apple-pay)between Ottu and Apple for Apple Pay is completed, the necessary checks to display the Apple Pay button are handled automatically by the Checkout SDK.

1. **Initialization**: Upon initialization of the Checkout SDK with the provided [session_id](#sessionid-string-required) and payment gateway codes ([pg_codes](../../checkout-api)), several conditions are automatically verified:
   - It is confirmed that a `session_id` and `pg_codes` associated with the Apple Pay Payment Service have been supplied.
   - It is ensured that the customer is using an Apple device that supports Apple Pay. If the device is not supported, the button will not be shown, and an error message stating `This device doesn't support Apple Pay` will be displayed to inform the user of the compatibility issue.
   - It is verified that the customer has a wallet configured on their Apple Pay device. if the wallet is not configured (i.e., no payment cards are added), the Setup button will appear. Clicking on this button will prompt the Apple Pay wallet on the user's device to open, allowing them to configure it by adding payment cards.
2. **Displaying the Apple Pay Button**: If all these conditions are met, the Apple Pay button is displayed and made available for use in the checkout flow.
3. **Restricting Payment Options**: To display only the Apple Pay button, `applePay` should be passed within the `formsOfPayment` parameter. The `formsOfPayment` property instructs the Checkout SDK to render only the Apple Pay button. If this property is not included, all available payment options are rendered by the SDK.

This setup ensures a seamless integration and user experience, allowing customers to easily set up and use Apple Pay during the checkout process.

#### KNET Integration

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

### STC Bank

When the [integration](#stc-bank) between Ottu and STC Bank is completed, the necessary checks to display the STC Bank button are handled seamlessly by the Checkout SDK.

**Initialization**: Upon initialization of the Checkout SDK with the provided [session_id](#sessionid-string-required) and payment gateway codes ([pg_codes](../../checkout-api)), several conditions are automatically verified:

- It is confirmed that the `session_id` and `pg_codes` provided during SDK initialization are associated with the STC Bank Payment Service. This ensures that the STC Bank option is available for the customer to choose as a payment method.
- It is ensured that the STC Bank button is displayed by the iOS SDK, regardless of whether the customer has provided a mobile number while creating the transaction.

This setup ensures a seamless integration and user experience, allowing customers to easily set up and use STC Bank during the checkout process.

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

## Callbacks

In the Checkout SDK, callback functions are essential for providing real-time updates on the status of payment transactions.

These `callbacks` improve the user experience by enabling seamless and efficient handling of different payment scenarios, including:

- Successful payments
- Transaction cancellations
- Errors encountered during the payment process

All the callbacks described below can be triggered for any type of payment.

### errorCallback

The `errorCallback` function is triggered when an issue occurs during the payment process. Proper error handling is essential to ensure a smooth user experience.

**Best Practice for Handling Errors**

In the event of an error, the recommended approach is to restart the checkout process by generating a new `session_id` through the [Checkout API](../../checkout-api).

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

### cancelCallback

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

### successCallback

In the [Checkout SDK](../), the `successCallback` function is triggered upon the successful completion of the [payment process](../#ottu-checkout-sdk-flow).

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

## Examples

### Basic Example

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

#### Callback behavior:

- **Error** → Displays an error alert and navigates back
- **Cancel** → Displays cancel reason (custom handling for `kpay`)
- **Success** → Displays success confirmation

> This code describes callbacks to be handled by the parent app.

### Full Example

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

## Error Reporting & Security

### Error Reporting

The SDK utilizes Sentry for error logging and reporting, which is initialized based on the configuration from SDK Studio. However, since the SDK is integrated into the merchant's app, conflicts may arise if the app also uses Sentry. To avoid this, merchants can disable Sentry in the Checkout SDK by setting the `is_enabled` flag to `false` in the configuration.

### Jailbreak Detection

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

### Screen Capture Prevention

The SDK implements screen capture restrictions to prevent the collection of sensitive data. This applies to fields containing Cardholder Data (CHD), such as the onsite checkout form for entering card details and the CVV field for tokenized payments.

This technique works in two ways:

1. When attempting to take a screenshot of a protected screen, the fields appear empty, even if they contain input.
2. When attempting to record a video of the screen, the video is completely blurred, making the content unreadable.

## FAQ

<FAQ>
  <FAQItem question="1 What forms of payments are supported by the SDK?">
    The SDK supports the following payment forms: `tokenPay`, `ottuPG`, `redirect` `applePay` and `stcPay`. Merchants can display specific methods according to their needs.

    **For example,** if you want to only show the STC Bank button, you can do so using formsOfPayment = `stcPay`, and only the STC Bank button will be displayed. The same applies for `applePay` and other methods.
  </FAQItem>
  <FAQItem question="2 What are the minimum system requirements for the SDK integration?">
    It is required to have a device running iOS 13 or higher.
  </FAQItem>
  <FAQItem question="3 Can I customize the appearance beyond the provided themes?">
    Yes, see the Customization theme section.
  </FAQItem>
  <FAQItem question="4 How do I customize the payment request for Apple Pay?">
    The payment request for Apple Pay can be customized using its initialization methods. These methods allow the configuration of various properties, including:

    - API version
    - Supported card types
    - Accepted networks
    - Applicable countries
    - Merchant capabilities

    For a complete list of supported properties, refer to the [Apple Pay](https://developer.apple.com/documentation/apple_pay_on_the_web/applepaypaymentrequest) documentation.
  </FAQItem>
</FAQ>
