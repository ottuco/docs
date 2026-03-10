# Authentication

Navigating the digital commerce and financial transactions landscape requires a keen understanding of security, specifically authentication methods. At Ottu, we support three distinct types of authentication to help ensure the safe and seamless operation of your payment system: [Basic Authentication](authentication.md#basic-authentication), [Private Key (API-Key)](authentication.md#private-key-api-key), and [Public Key](authentication.md#public-key).

## [**Basic Authentication**](authentication.md#basic-authentication)

Basic Authentication employs a username and password combination. The access permissions associated with the username must be explicitly defined.

**Header:** `Authorization Basic <username:password>` **basic auth string**.

Please ensure that you follow best practices for credential security. Never **store** passwords in your code or on the client side. It’s recommended not to assign super-admin permissions via this method, but to carefully regulate the access permissions for each user. Securely store the credentials within the server environment.

## [**Private Key (API-Key)**](authentication.md#private-key-api-key)

This key is a high-privilege access token used for server-side communication between your server and Ottu’s API. The private API key should be closely guarded and never shared.

**Header:** `Authorization`\
**Value:** `Api-Key {{api_key}}`

Bear in mind, this key grants admin-level privileges across all public endpoints, and leaking it can lead to serious security implications.&#x20;

:::warning

It should NEVER be embedded in SDKs or made public. Ensure it’s used on the server side and securely stored within the server environment, separate from your code.

:::

## [**Public Key**](authentication.md#public-key)

The Public Key is used to initialize the [Checkout SDK](../payments/checkout-sdk/index.md) and can safely be shared with clients. This key doesn’t provide access to public API endpoints, making it secure for client-side use.

:::info

For detailed instructions on generating API keys for both [Public ](authentication.md#public-key)& [Private ](authentication.md#private-key-api-key)Keys, kindly refer to the [Private Key (API-Key)](authentication.md#private-key-api-key) section.

:::

## [**Token Authentication**](authentication.md#token-authentication)

Please note that Token Authentication, an earlier method, is now considered obsolete and isn’t recommended.

Understanding and implementing these authentication methods correctly are crucial steps toward ensuring the security of your transactions and the protection of your data. Secure key management significantly contributes to the overall safety and integrity of your operations.
