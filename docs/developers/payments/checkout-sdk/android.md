---
toc_min_heading_level: 2
toc_max_heading_level: 3
---

import FAQ, { FAQItem } from '@site/src/components/FAQ';

The [Checkout SDK](../) from Ottu is a Kotlin-based library designed to streamline the integration of an Ottu-powered [checkout process](../) into Android applications. This SDK allows for complete customization of the checkout experience, including both appearance and functionality, as well as the selection of accepted payment methods.

To integrate the Checkout SDK, it must be incorporated into the Android application and initialized with the following parameters:

- [merchant_id](https://app.gitbook.com/s/su3y9UFjvaXZBxug1JWQ/#merchant_id-string)
- [session_id](#sessionid-string-required)
- [API public key](../../../getting-started/authentication#public-key)

Additionally, various configuration options, such as accepted [payment methods](#formsofpayment-array-optional) and [theme ](#theme)styling for the checkout interface, can be specified to enhance the user experience.

:::warning

The [API private key](../../../getting-started/authentication#api-key-auth) should never be utilized on the client side; instead, use the [API public key](../../../getting-started/authentication#public-key). This is essential for maintaining the security of your application and safeguarding sensitive data.
:::

This video guides you step-by-step through the **Android SDK integration process**. Watch it to quickly learn how to set up, configure, and see the key features in action.

<iframe
  title="Android SDK Integration Video"
  src="https://drive.google.com/file/d/1UkZQSrF8rPJDguU85akAdsfkQ1sPY-rF/preview"
  style={{ width: "100%", height: "480px", border: "0" }}
  loading="lazy"
  allow="fullscreen"
/>

## Installation

### Prerequisites

The SDK is compatible with devices running Android 8 or higher (API version 26 or later).

### Gradle Setup

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

## Initialization

### Checkout.init

The function initiates the checkout process and configures the required settings for the Checkout SDK. It should be invoked once by the parent app to start the checkout sequence, called with set of configuration fields that encapsulate all essential options for the process.

When you call `Checkout.init`, the SDK manages the setup of key components for the checkout, like generating a form for customers to input their payment information, and facilitating the communication with Ottu's servers to process the payment.

This function returns a `Fragment` object, which is a native Android UI component that can be integrated into any part of an `Activity` instance (also native to Android).

### Integration Guide

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

## Properties

### Required Properties

#### **merchantId** _`string`_ _`required`_

The `merchant_id` identifies your Ottu merchant domain. It should be the root domain of your Ottu account, excluding the "https://" or "http://" prefix.

For instance, if your Ottu URL is https://example.ottu.com, then your `merchant_id` would be example.ottu.com. This attribute is utilized to determine which Ottu merchant account to associate with the checkout process.

#### **apiKey** _`string`_ _`required`_

The `apiKey` is your Ottu [API public key](../../../getting-started/authentication#public-key), which is essential for authenticating communications with Ottu's servers during the checkout process.

:::warning

Make sure to use the public key and avoid using the private key. The [API private key](../../../getting-started/authentication#api-key-auth) must be kept confidential at all times and should never be shared with any clients.
:::

#### **sessionId** _`string`_ _`required`_

The `session_id` serves as the unique identifier for the payment transaction linked to the checkout process.

This identifier is automatically generated at the creation of the payment transaction. For additional details on how to utilize the `session_id` parameter in the [Checkout AP](../../checkout-api)I, refer to the [session_id](../../checkout-api) section.&#x20;

#### **successCallback, errorCallback and cancelCallback** _`Unit`_ _`required`_

Callback functions are used to retrieve the payment status and must be provided directly to the Checkout initialization function. For more details, refer to the [Callbacks](#callbacks) section.

### Display Options

#### **formsOfPayment** _`array`_ _`optional`_

The `formsOfPayment` parameter allows customization of the payment methods displayed in the [checkout process](../). By default, all forms of payment are enabled.

**Available Options for** `formsOfPayment`

- **`cardOnsite`**: A direct payment method (onsite checkout) where cardholder data (CHD) is entered directly in the SDK. If 3DS authentication is required, a payment provider is involved.
- `tokenPay`: Uses [tokenization](../../../cards-and-tokens) to securely store and process customers' payment information.
- `redirect`: Redirects customers to an external [payment gateway](../../payment-methods#activating-payment-gateway-codes) or a third-party payment processor to complete the transaction.
- `stcPay`: Requires customers to enter their mobile number and authenticate with an OTP sent to their device to complete the payment.
- `flexMethods`: Allows payments to be split into multiple installments. These methods, also known as BNPL (Buy Now, Pay Later), support providers such as Tabby and Tamara.

#### **displaySettings** _`object`_ _`optional`_

The `PaymentOptionsDisplaySettings` struct is used to configure how payment options are displayed.&#x20;

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

To view the full function call, please refer to the [Full Example](#full-example) chapter in the documentation.

### Preloading

#### **setupPreload** _`object`_ _`optional`_

The `TransactionDetails` class object stores transaction details.

If this object is provided, the SDK will not need to retrieve transaction details from the backend, thereby reducing processing time and improving efficiency.

### Theme

#### **theme** _`object`_ _`optional`_

The `Theme` class object is used for UI customization, allowing modifications to background colors, text colors, and fonts for various components.

All fields in the `Theme` class are optional. If a theme is not specified, the default UI settings will be applied.

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

The component names within `Appearance` largely correspond to those described [here](../).

<iframe
  title="Ottu SDK Components Documentation"
  src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FJ6WsECtu4F6ynCetrvTLcp%2FOttu-SDK---Components-Documentation--Copy-%3Fnode-id%3D0-1%26p%3Df"
  style={{ width: "100%", height: "480px", border: "0" }}
  loading="lazy"
  allow="fullscreen"
/>

#### **showPaymentDetails**

A boolean field that determines whether the "Payment Details" section should be displayed or hidden.

#### Properties Description

All properties are optional and can be customized by the user.

If a property is not specified, the default value (as defined in the Figma design [here](https://www.figma.com/proto/BmLOTN8QCvMaaIteZflzgG?content-scaling=fixed&kind=proto&node-id=1-624&scaling=scale-down)) will be automatically applied.

##### **Texts**

#### **General**

| Property Name   |                            Description                            |              Data Type              |
| --------------- | :---------------------------------------------------------------: | :---------------------------------: |
| `mainTitleText` |                 Font and color for all "Captions"                 | [Text](#text) |
| `titleText`     |          Font and color for payment options in the list           | [Text](#text) |
| `subtitleText`  | Font and color for payment options details (like expiration date) | [Text](#text) |

#### **Fees**

| Property Name      |                          Description                           |              Data Type              |
| ------------------ | :------------------------------------------------------------: | :---------------------------------: |
| `feesTitleText`    |    Font and color of fees value in the payment options list    | [Text](#text) |
| `feesSubtitleText` | Font and color of fees description in the payment options list | [Text](#text) |

#### **Data**

| Property Name   |                       Description                        |              Data Type              |
| --------------- | :------------------------------------------------------: | :---------------------------------: |
| `dataLabelText` | Font and color of payment details fields (like "Amount") | [Text](#text) |
| `dataValueText` |         Font and color of payment details values         | [Text](#text) |

#### **Other**

| Property Name                   |                          Description                           |              Data Type              |
| ------------------------------- | :------------------------------------------------------------: | :---------------------------------: |
| `errorMessageText`              |        Font and color of error message text in pop-ups         | [Text](#text) |
| `selectPaymentMethodHeaderText` | The text of "Select Payment Method" in the bottom sheet header | [Text](#text) |

#### **Text Fields**

| Property Name    |                             Description                              |                   Data Type                   |
| ---------------- | :------------------------------------------------------------------: | :-------------------------------------------: |
| `inputTextField` | Font and color of text in any input field (including disabled state) | [TextField](#textfield) |

#### **Colors**

| Property Name                              |                      Description                       |               Data Type               |
| ------------------------------------------ | :----------------------------------------------------: | :-----------------------------------: |
| `sdkbackgroundColor`                       |     The main background of the SDK view component      | [Color](#color) |
| `modalBackgroundColor`                     |           The background of any modal window           | [Color](#color) |
| `paymentItemBackgroundColor`               |   The background of an item in payment options list    | [Color](#color) |
| `selectorIconColor`                        |          The color of the icon of the payment          | [Color](#color) |
| `savePhoneNumberIconColor`                 | The color of "Diskette" button for saving phone number | [Color](#color) |
| `selectPaymentMethodHeaderBackgroundColor` |   The background of an item in payment options list    | [Color](#color) |

#### **Buttons**

| Property Name    |                            Description                            |                     Data Type                     |
| ---------------- | :---------------------------------------------------------------: | :-----------------------------------------------: |
| `button`         |          Background, text color and font for any button           |      [Button](#button)      |
| `backButton`     |               Color of the "Back" navigation button               | [RippleColor](#ripplecolor) |
| `selectorButton` | Background, text color and font for payment item selection button |      [Button](#button)      |

#### **Switch**

| Property Name |                                        Description                                        |                 Data Type                 |
| ------------- | :---------------------------------------------------------------------------------------: | :---------------------------------------: |
| `switch`      | Colors of the switch background and its toggle in different states (on, off and disabled) | [Switch](#switch-1) |

#### **Margins**

| Property Name |                      Description                      |                  Data Type                  |
| ------------- | :---------------------------------------------------: | :-----------------------------------------: |
| margins       | Top, left, bottom and right margins between component | [Margins](#margins-1) |

#### Data Types Description

##### **Color**

| Property Name   |             Description             | Data Type |
| --------------- | :---------------------------------: | :-------: |
| `color`         |      Main color integer value       |    Int    |
| `colorDisabled` | Disabled stated color integer value |    Int    |

##### **RippleColor**

| Property Name  |             Description             | Data Type |
| -------------- | :---------------------------------: | :-------: |
| `color`        |      Main color integer value       |    Int    |
| `rippleColor`  |     Ripple color integer value      |    Int    |
| `colorDisaled` | Disabled stated color integer value |    Int    |

##### **Text**

| Property Name |       Description        |               Data Type               |
| ------------- | :----------------------: | :-----------------------------------: |
| `textColor`   | Main color integer value | [Color](#color) |
| `fontType`    |     Font resource ID     |                  Int                  |

##### **TextField**

| Property Name  | Description                    |               Data Type               |
| :------------: | ------------------------------ | :-----------------------------------: |
|  `background`  | Background color integer value | [Color](#color) |
| `primaryColor` | Text color                     | [Color](#color) |
| `focusedColor` | Selected text color            | [Color](#color) |
|     `text`     | Text value                     |  [Text](#text)  |
|    `error`     | Text value                     |  [Text](#text)  |

##### Button

| Property Name |       Description       |                     Data Type                     |
| ------------- | :---------------------: | :-----------------------------------------------: |
| `rippleColor` | Button background color | [RippleColor](#ripplecolor) |
| `fontType`    |   Button text font ID   |                        Int                        |
| `textColor`   |    Button text color    |       [Color](#color)       |

##### Switch

| Property Name                   |             Description             | Data Type |
| ------------------------------- | :---------------------------------: | :-------: |
| `checkedThumbTintColor`         |    Toggle color in checked state    |    Int    |
| `uncheckedThumbTintColor`       |   Toggle color in unchecked state   |    Int    |
| `checkedTrackTintColor`         |    Track color in checked state     |    Int    |
| `uncheckedTrackTintColor`       |   Track color in unchecked state    |    Int    |
| `checkedTrackDecorationColor`   |  Decoration color in checked state  |    Int    |
| `uncheckedTrackDecorationColor` | Decoration color in unchecked state |    Int    |

##### **Margins**

| Property Name | Data Type |
| ------------- | :-------: |
| `left`        |    Int    |
| `top`         |    Int    |
| `right`       |    Int    |
| `bottom`      |    Int    |

#### Theme Example

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

### SDK Configuration

#### Language

The SDK supports two languages, English and Arabic, with English set as the default.

It automatically adopts the language configured in the device settings, requiring no in-app adjustments. However, if a transaction is initiated in a different language and setup preload is utilized, the backend-generated text (such as fee descriptions) will appear in the language of the transaction. Therefore, it is important to ensure that the language code passed to the [Checkout API](../../checkout-api)'s transaction creation request matches the currently selected language on the device or current selected app language.

#### Light and dark theme

The SDK supports UI customization to match the device theme—light or dark. This adjustment is applied during the SDK initialization, based on the device's settings. Similarly, for language, no adjustments are made within the app.

### Native UI

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

## Wallet Configuration

### STC Bank

Once the STC Bank integration between Ottu and STC Bank has been completed, the necessary checks are automatically handled by the Checkout SDK to ensure the seamless display of the STC Bank button.

Upon initialization of the Checkout SDK with the [session_id](../../checkout-api) and payment gateway codes ([pg_codes](../../checkout-api)), the following condition is automatically verified:

- The `session_id` and pg_codes provided during SDK initialization must be linked to the STC Bank Payment Service. This verification ensures that the STC Bank option is made available for selection as a payment method.

Regardless of whether a mobile number has been entered by the customer during transaction creation, the STC Bank button is displayed by the Android SDK.

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

## Callbacks

In the Checkout SDK, callback functions are essential for delivering real-time updates on the status of payment transactions. These callbacks improve the user experience by facilitating smooth and effective management of different payment scenarios, including errors, successful transactions, and cancellations.&#x20;

:::info

The callbacks outlined below are applicable to any type of payment.
:::

### errorCallback

The `errorCallback` is a callback function triggered when issues occur during a payment process. Properly handling these errors is essential for maintaining a smooth user experience.&#x20;

:::info

The best practice recommended in the event of an error is to restart the checkout process by generating a new `session_id` through the [Checkout API](../../checkout-api).
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

### cancelCallback

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

### successCallback

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

## Examples

### Basic Example

The SDK triggers three main callbacks:

- **`successCallback`** – Invoked upon successful payment.
- **`cancelCallback`** – Triggered when the user cancels the transaction.
- **`errorCallback`** – Activated on errors during the checkout process.

Developers should customize the logic within these callbacks to handle transaction results appropriately.

### Full Example

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

## Error Reporting & Security

### Error Reporting

The SDK utilizes Sentry for error logging and reporting, with initialization based on the configuration provided by SDK Studio.

Since the SDK is embedded within the merchant's application, conflicts may arise if Sentry is also integrated into the app. To prevent such conflicts, Sentry can be disabled within the Checkout SDK by setting the `is_enabled` flag to `false` in the configuration.

### Rooting Detection

The SDK prevents execution on rooted devices.

To enforce this restriction, rooting checks are performed during SDK initialization. If a device is detected as rooted, a modal alert dialog is displayed, providing an explanation. The message shown is as follows:

:::danger

This device is not secure for payments. Transactions are blocked for security reasons.
:::

After dismissing the alert, the app crashes unexpectedly

:::info

&#x20;`Checkout.init` function needs to be called in a coroutine.
:::

### Screen Capture Prevention

The SDK is designed to protect sensitive data by restricting screen capture functionalities. These restrictions apply to the entire Activity that contains the SDK and operate as follows:

- **Screenshot Attempts:**\
  If a user attempts to take a screenshot, a toast message will appear stating:\
  &#xNAN;_"This app doesn't allow screenshots."_
- **Screen Recording After SDK Initialization:**\
  If screen recording is initiated **after** the SDK has been initialized, the following toast message is displayed:\
  &#xNAN;_"Can't record screen due to security policy."_
- **Screen Recording Before SDK Initialization:**\
  If screen recording begins **before** the SDK is initialized, the entire Activity containing the SDK will appear as a black screen in the recorded video.

## FAQ

<FAQ>
  <FAQItem question="What forms of payments are supported by the SDK?">
    The SDK accommodates various payment forms including`tokenPay`, `redirect`, `StcPay` and `cardOnsite`.&#x20;

    Merchants have the flexibility to showcase specific methods based on their requirements.&#x20;

    For instance, if you wish to exclusively display the STC Bank button, you can achieve this by setting `formsOfPayment` = `[StcPay]`, which will result in only the STC Bank button being displayed. This approach is applicable to other payment methods as well.
  </FAQItem>
  <FAQItem question="What are the minimum system requirements for the SDK integration?">
    It is required to have a device running Android 8 or higher (Android API level 26 or higher).
  </FAQItem>
  <FAQItem question="Can I customize the appearance beyond the provided themes?">
    Yes, check the [Theme](#theme) section.
  </FAQItem>
</FAQ>
