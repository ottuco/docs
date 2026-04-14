---
title: Verify Signatures
sidebar_label: Verify Signatures
---

# Signing Mechanism

To ensure the integrity and authenticity of the [webhook notifications](/developers/webhooks/payment-events) sent to the merchant, Ottu employs a signing mechanism based on HMAC (Hash-based Message Authentication Code). By leveraging HMAC, Ottu can guarantee that the webhook's content remains untampered during transmission.

## Important Components

#### 1. HMAC Key (Secret Key)

* This is the backbone of the signing and verification process. Merchants can retrieve their unique HMAC Key from the Webhook Configuration panel within Ottu's admin dashboard [here](/developers/webhooks).
* It's paramount that this key remains confidential. Always store it securely and avoid exposing it to the public.

#### 2. Fields for Signature

The signature is not derived from every field in the webhook payload. See payload example [here](/developers/webhooks/payment-events#payload-example-paid). Only specific fields are considered. These are:

* amount
* currency\_code
* customer\_first\_name
* customer\_last\_name
* customer\_email
* customer\_phone
* customer\_address\_line1
* customer\_address\_line2
* customer\_address\_city
* customer\_address\_state
* customer\_address\_country
* customer\_address\_postal\_code
* gateway\_account
* gateway\_name
* order\_no
* reference\_number
* result
* state

**Key Considerations**:

1. Fields not present in the webhook payload or those with an empty string value are not considered when constructing the signature.
2. Only fields present in the above list and in the payload with valid non-empty values are considered for signature generation.

This update ensures that developers understand the significance of field presence and their values in the payload when constructing the HMAC signature.

#### 3. Signature Creation

* Fields from the payload are extracted based on the aforementioned list, sorted alphabetically by key name, and then concatenated to form a unique message string.
* This string, combined with the HMAC Key, is used to create the **HMAC-SHA256** signature. This resultant signature is then dispatched with the [webhook notification](/developers/webhooks/payment-events).

#### 4. Verification by Merchant

* On receipt of the webhook, merchants should rebuild the message string, using the listed fields.
* Generate an HMAC signature using their stored [HMAC Key](/developers/webhooks).
* If the computed signature corresponds to the provided one, the payload's authenticity is confirmed. Any discrepancies suggest potential tampering.

## Example

For illustration purposes, let's consider a sample webhook payload and a hypothetical HMAC key.

**Webhook Payload**:

```json
{
   "amount":"86.000",
   "currency_code":"KWD",
   "customer_first_name":"example-customer"
}
```

**HMAC Key**: `pu9MpX3yPR`

Given this payload and key, the steps to construct the HMAC signature are:

1. Sort the payload keys.
2. Use the list of specific fields (as defined in the [Fields for Signature](#2-fields-for-signature) section) to extract values from the payload.
3. Concatenate the key-value pairs.
4. Apply the HMAC algorithm using the **SHA256** hash function and the provided HMAC key.

Following these steps, the resulting signature is:

`6143b8ad4bd283540721ab000f6de746e722231aaaa90bc38f639081d3ff9f67`

Developers should compare this generated signature to the signature received in the webhook payload to validate its authenticity.

## Signature Generation

Ensuring the integrity and authenticity of webhook payloads is paramount for the security of both the service provider and the merchants. To achieve this, an HMAC (Hash-Based Message Authentication Code) signature is generated and sent along with the payload. This signature needs to be validated at the merchant's end to confirm that the data has not been tampered with. For the convenience of developers working with different programming languages, we provide ready-to-use code snippets in various popular languages to generate and verify this HMAC signature. This section showcases how to compute the HMAC signature for the payload in languages like [Python](#python), [PHP](#php), [Java](#java), [.NET (C#)](#net-c), [Node.js](#nodejs) [Ruby](#ruby), and [Go](#go).

## Specific Examples

### Python

Python function for generating the HMAC signature given a payload and an HMAC key:

```python title="Python"
import hmac
import hashlib

def generate_hmac_signature(payload, hmac_key):
    # List of fields that are considered for the HMAC signature
    keys = [
        "amount",
        "currency_code",
        "customer_first_name",
        "customer_last_name",
        "customer_email",
        "customer_phone",
        "customer_address_line1",
        "customer_address_line2",
        "customer_address_city",
        "customer_address_state",
        "customer_address_country",
        "customer_address_postal_code",
        "gateway_name",
        "gateway_account",
        "order_no",
        "reference_number",
        "result",
        "state",
    ]

    # Extract and sort the payload keys based on the 'keys' list, and ignore any missing or empty string values
    message = [(k, payload[k]) for k in sorted(payload) if k in keys and payload[k]]

    # Concatenate the key-value pairs
    message_str = "".join([f"{k}{v}" for (k, v) in message])

    # Compute the HMAC signature
    digest = hmac.new(
        bytes(hmac_key, encoding="utf8"),
        bytes(message_str, encoding="utf8"),
        digestmod=hashlib.sha256
    ).hexdigest()

    return digest

# Test
payload = {
   "amount":"86.000",
   "currency_code":"KWD",
   "customer_first_name":"example-customer"
}
hmac_key = "pu9MpX3yPR"

print(generate_hmac_signature(payload, hmac_key))
```

When you run this code, the printed result should match the provided HMAC signature: `6143b8ad4bd283540721ab000f6de746e722231aaaa90bc38f639081d3ff9f67`.

### PHP

```php title="PHP"
<?php

function generateHmacSignature($payload, $hmacKey) {
    $keys = [
        "amount", "currency_code", "customer_first_name",
        "customer_last_name", "customer_email", "customer_phone",
        // ... [add all the other keys here] ...
        "reference_number", "result", "state"
    ];
    
    $message = "";
    foreach ($keys as $key) {
        if (isset($payload[$key]) && $payload[$key] !== "") {
            $message .= $key . $payload[$key];
        }
    }
    
    return hash_hmac('sha256', $message, $hmacKey);
}

// Test
$payload = [
    "amount" => "86.000",
    "currency_code" => "KWD",
    "customer_first_name" => "example-customer"
];
$hmacKey = "pu9MpX3yPR";

echo generateHmacSignature($payload, $hmacKey);
?>
```

### Java

```java title="Java"
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SignatureGenerator {

    public static String generateHmacSignature(Map<String, String> payload, String hmacKey) throws Exception {
        String[] keys = {
            "amount",
            "currency_code",
            "customer_first_name",
            "customer_last_name",
            "customer_email",
            "customer_phone",
            "customer_address_line1",
            "customer_address_line2",
            "customer_address_city",
            "customer_address_state",
            "customer_address_country",
            "customer_address_postal_code",
            "gateway_name",
            "gateway_account",
            "order_no",
            "reference_number",
            "result",
            "state",
        };

        List<String> sortedKeys = new ArrayList<>();
        StringBuilder message = new StringBuilder();
        for (String key : keys) {
            if (payload.containsKey(key) && !payload.get(key).isEmpty()) {
              sortedKeys.add(key);
            }
        }
        Collections.sort(sortedKeys);
        for (String key : sortedKeys) 
        {
              message.append(key).append(payload.get(key));
        } 

 
        Mac sha256HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(hmacKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256HMAC.init(secretKey);

        byte[] hashBytes = sha256HMAC.doFinal(message.toString().getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hashBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    public static void main(String[] args) throws Exception {
        Map<String, String> payload = new HashMap<>();
        payload.put("amount", "86.000");
        payload.put("currency_code", "KWD");
        payload.put("customer_first_name", "example-customer");

        String hmacKey = "pu9MpX3yPR";
        
        System.out.println(generateHmacSignature(payload, hmacKey));
    }
}
```

### .NET (C#)

```csharp title="C# (.NET)"
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

public class SignatureGenerator {
    public static string GenerateHmacSignature(Dictionary<string, string> payload, string hmacKey) {
        string[] keys = {
            "amount", "currency_code", "customer_first_name",
            // ... [add all the other keys here] ...
            "reference_number", "result", "state"
        };

        StringBuilder message = new StringBuilder();
        foreach (string key in keys) {
            if (payload.ContainsKey(key) && !String.IsNullOrEmpty(payload[key])) {
                message.Append(key).Append(payload[key]);
            }
        }

        using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(hmacKey))) {
            byte[] hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(message.ToString()));
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }
    }

    static void Main(string[] args) {
        var payload = new Dictionary<string, string> {
            {"amount", "86.000"},
            {"currency_code", "KWD"},
            {"customer_first_name", "example-customer"}
        };
        string hmacKey = "pu9MpX3yPR";

        Console.WriteLine(GenerateHmacSignature(payload, hmacKey));
    }
}
```

### Node.js

```javascript title="Node.js"
const crypto = require('crypto');

function generateHmacSignature(payload, hmacKey) {
    const keys = [
        'amount', 'currency_code', 'customer_first_name',
        // ... [add all the other keys here] ...
        'reference_number', 'result', 'state'
    ];
    
    const sortedKeys = Object.keys(payload).sort();
    const messageArray = sortedKeys.filter(key => keys.includes(key)).map(key => [key, payload[key]]);
    const message = messageArray.map(([k, v]) => `${k}${v}`).join('');
    
    const hmac = crypto.createHmac('sha256', hmacKey);
    hmac.update(message);
    
    return hmac.digest('hex');
}


const payload = {
    amount: "86.000",
    currency_code: "KWD",
    customer_first_name: "example-customer"
};
const hmacKey = "pu9MpX3yPR";

console.log(generateHmacSignature(payload, hmacKey));
```

### Ruby

```ruby title="Ruby"
require 'openssl'

def generate_hmac_signature(payload, hmac_key)
    keys = [
        'amount', 'currency_code', 'customer_first_name',
        # ... [add all the other keys here] ...
        'reference_number', 'result', 'state'
    ]

    message = ""
    keys.each do |key|
        if payload[key] && payload[key] != ''
            message += key + payload[key]
        end
    end

    digest = OpenSSL::HMAC.hexdigest('sha256', hmac_key, message)
    return digest
end

# Test
payload = {
    "amount" => "86.000",
    "currency_code" => "KWD",
    "customer_first_name" => "example-customer"
}


hmac_key = "pu9MpX3yPR"

puts generate_hmac_signature(payload, hmac_key)
```

### Go

```go title="Go"
package main

import(
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "fmt"
    "sort"
    "strings"
)

func SignMerchantPayload(payload map[string] interface {}, key string) string {
    // Define keys in sorted order
    keys: = [] string {
        "amount",
        "currency_code",
        "customer_email",
        "customer_first_name",
        "customer_last_name",
        "customer_phone",
        "gateway_account",
        "gateway_name",
        "order_no",
        "reference_number",
        "result",
        "state",
    }

    // Sort the keys
    sort.Strings(keys)

    // Create the message by concatenating key-value pairs
    var message strings.Builder
    for _,
    k: = range keys {
        v: = fmt.Sprintf("%v", payload[k]) // Get value as string
        if v != "" {
            message.WriteString(k + v)
        }
    }

    // Generate the HMAC
    h: = hmac.New(sha256.New, [] byte(key))
    h.Write([] byte(message.String()))
    digest: = hex.EncodeToString(h.Sum(nil))

    return digest
}

func main() {
    // Example payload
    payload: = map[string] interface {} {
        "amount": "14.000",
        "amount_details": map[string] interface {} {
            "currency_code": "KWD",
            "amount": "14.000",
            "total": "14.000",
            "fee": "0.000",
        },
        "currency_code": "KWD",
        "customer_email": "example@gmail.com",
        "customer_first_name": "name",
        "customer_id": "1",
        "customer_last_name": "last name",
        "customer_phone": "+96500000000",
        "fee": "0.000 KWD",
        "gateway_account": "credit-card",
        "gateway_name": "mpgs",
        "gateway_response": map[string] interface {} {},
        "initiator": map[string] interface {} {},
        "is_sandbox": true,
        "order_no": "4567f45оkgkh6hjаhjg77hjh5645",
        "paid_amount": "14.000",
        "payment_type": "one_off",
        "pg_params": map[string] interface {} {},
        "reference_number": "sandboxAQ5DJ",
        "result": "success",
        "session_id": "a12f71075a834a34d692736ac43a212fcebfb6ec",
        "settled_amount": "14.000",
        "signature": "293023d42eec624fc92b869812a53ee97c98398a80511537deaa27501ff378c3",
        "state": "paid",
        "timestamp_utc": "2024-04-17 08:46:21",
        "token": map[string] interface {} {
            "customer_id": "1",
            "brand": "MASTERCARD",
            "name_on_card": "Test Test",
            "number": "**** 0008",
            "expiry_month": "01",
            "expiry_year": "39",
            "token": "9491500736137502",
            "pg_code": "credit-card",
            "pg": "mpgs",
            "is_preferred": true,
            "is_expired": false,
            "will_expire_soon": false,
            "cvv_required": true,
            "agreements": [] interface {} {},
        },
    }

    // Example HMAC key
    key: = "your_hmac_key"

    // Sign the payload
    signature: = SignMerchantPayload(payload, key)
    fmt.Println("Signature:", signature)
}
```

The above examples provide a way for developers in different languages to generate the HMAC signature from a payload using the provided HMAC key.

**Need Further Assistance?** Our dedicated support team is always on hand to help. Reach out to us at [support@ottu.com](mailto:support@ottu.com).

## What's Next?

- [**Payment Events**](./payment-events.md) — Payment webhook payload reference
- [**Operation Events**](./operation-events.md) — Operation webhook payload reference
- [**Webhooks Overview**](./) — Setup, delivery guarantees, and configuration
