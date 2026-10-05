---
title: Verify Signatures
sidebar_label: Verify Signatures
---

# Signing Mechanism

To ensure the integrity and authenticity of the [webhook notifications](/developers/webhooks/payment-events) sent to the merchant, Ottu employs a signing mechanism based on HMAC (Hash-based Message Authentication Code). By leveraging HMAC, Ottu can guarantee that the webhook's content remains untampered during transmission.

## Important Components

#### 1. HMAC Key (Secret Key)

- This is the backbone of the signing and verification process. Merchants can retrieve their unique HMAC Key from the Webhook Configuration panel within Ottu's admin dashboard [here](/developers/webhooks).
- It's paramount that this key remains confidential. Always store it securely and avoid exposing it to the public.

#### 2. Fields for Signature

The signature is not derived from every field in the webhook payload. See payload example [here](/developers/webhooks/payment-events#payload-example-paid). Only specific fields are considered. These are:

- amount
- currency_code
- customer_address_city
- customer_address_country
- customer_address_line1
- customer_address_line2
- customer_address_postal_code
- customer_address_state
- customer_email
- customer_first_name
- customer_last_name
- customer_phone
- gateway_account
- gateway_name
- order_no
- reference_number
- result
- state

**Key Considerations**:

1. Fields not present in the webhook payload or those with an empty string value are not considered when constructing the signature.
2. Only fields present in the above list and in the payload with valid non-empty values are considered for signature generation.

This update ensures that developers understand the significance of field presence and their values in the payload when constructing the HMAC signature.

#### 3. Signature Creation

- Fields from the payload are extracted based on the aforementioned list, sorted alphabetically by key name, and then concatenated to form a unique message string.

:::warning Sort the fields before you concatenate them
The fields must be joined in **alphabetical order of their names**, whatever order they have in the payload or in your own code. For example, `customer_email` comes before `customer_first_name`, and `gateway_account` comes before `gateway_name`. Joining them in any other order gives a different signature.
:::

- This string, combined with the HMAC Key, is used to create the **HMAC-SHA256** signature. This resultant signature is then dispatched with the [webhook notification](/developers/webhooks/payment-events).

#### 4. Verification by Merchant

- On receipt of the webhook, merchants should rebuild the message string, using the listed fields.
- Generate an HMAC signature using their stored [HMAC Key](/developers/webhooks).
- If the computed signature corresponds to the provided one, the payload's authenticity is confirmed. Any discrepancies suggest potential tampering.

## Example

For illustration purposes, let's consider a sample webhook payload and a hypothetical HMAC key.

**Webhook Payload**:

```json
{
  "amount": "86.000",
  "currency_code": "KWD",
  "customer_first_name": "example-customer",
  "customer_last_name": "",
  "customer_email": "customer@example.com",
  "gateway_name": "kpay",
  "gateway_account": "knet",
  "order_no": "ORDER-1001",
  "reference_number": "ABC12",
  "result": "success",
  "session_id": "a12f71075a834a34d692736ac43a212fcebfb6ec",
  "state": "paid"
}
```

**HMAC Key**: `pu9MpX3yPR`

Given this payload and key, the steps to construct the HMAC signature are:

1. Keep only the fields from the [Fields for Signature](#2-fields-for-signature) list that have a non-empty value. Here `session_id` is not in the list and `customer_last_name` is empty, so both are left out.
2. Sort the remaining field names alphabetically.
3. Concatenate each field name followed by its value, with no separator:

   ```text
   amount86.000currency_codeKWDcustomer_emailcustomer@example.comcustomer_first_nameexample-customergateway_accountknetgateway_namekpayorder_noORDER-1001reference_numberABC12resultsuccessstatepaid
   ```

4. Apply the HMAC algorithm using the **SHA256** hash function and the provided HMAC key.

Following these steps, the resulting signature is:

`29e70de083707b3a738e9d5f4df4e4481d082c4614db97a55f50d4b4583dc5f2`

Developers should compare this generated signature to the signature received in the webhook payload to validate its authenticity.

## Signature Generation

Ensuring the integrity and authenticity of webhook payloads is paramount for the security of both the service provider and the merchants. To achieve this, an HMAC (Hash-Based Message Authentication Code) signature is generated and sent along with the payload. This signature needs to be validated at the merchant's end to confirm that the data has not been tampered with. For the convenience of developers working with different programming languages, we provide ready-to-use code snippets in various popular languages to generate and verify this HMAC signature. This section showcases how to compute the HMAC signature for the payload in languages like [Python](#python), [PHP](#php), [Java](#java), [.NET (C#)](#net-c), [Node.js](#nodejs) [Ruby](#ruby), and [Go](#go).

## Specific Examples

Each snippet below signs the [example payload](#example) above. Run it and the printed result should be `29e70de083707b3a738e9d5f4df4e4481d082c4614db97a55f50d4b4583dc5f2`.

### Python

```python title="Python"
import hmac
import hashlib

# Fields used for the signature, in alphabetical order
SIGNED_FIELDS = [
    "amount",
    "currency_code",
    "customer_address_city",
    "customer_address_country",
    "customer_address_line1",
    "customer_address_line2",
    "customer_address_postal_code",
    "customer_address_state",
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
]


def generate_hmac_signature(payload, hmac_key):
    # Keep the signed fields that have a value, sorted alphabetically by name
    fields = sorted(k for k in payload if k in SIGNED_FIELDS and payload[k])

    # Concatenate name + value of each field
    message = "".join(f"{k}{payload[k]}" for k in fields)

    return hmac.new(
        hmac_key.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


# Test
payload = {
    "amount": "86.000",
    "currency_code": "KWD",
    "customer_first_name": "example-customer",
    "customer_last_name": "",
    "customer_email": "customer@example.com",
    "gateway_name": "kpay",
    "gateway_account": "knet",
    "order_no": "ORDER-1001",
    "reference_number": "ABC12",
    "result": "success",
    "session_id": "a12f71075a834a34d692736ac43a212fcebfb6ec",
    "state": "paid",
}
hmac_key = "pu9MpX3yPR"

print(generate_hmac_signature(payload, hmac_key))
```

### PHP

```php title="PHP"
<?php

function generateHmacSignature($payload, $hmacKey) {
    // Fields used for the signature, in alphabetical order
    $signedFields = [
        "amount", "currency_code",
        "customer_address_city", "customer_address_country",
        "customer_address_line1", "customer_address_line2",
        "customer_address_postal_code", "customer_address_state",
        "customer_email", "customer_first_name", "customer_last_name",
        "customer_phone", "gateway_account", "gateway_name",
        "order_no", "reference_number", "result", "state",
    ];

    // Keep the signed fields that have a value, sorted alphabetically by name
    $fields = [];
    foreach ($signedFields as $key) {
        if (isset($payload[$key]) && $payload[$key] !== "") {
            $fields[] = $key;
        }
    }
    sort($fields, SORT_STRING);

    // Concatenate name + value of each field
    $message = "";
    foreach ($fields as $key) {
        $message .= $key . $payload[$key];
    }

    return hash_hmac('sha256', $message, $hmacKey);
}

// Test
$payload = [
    "amount" => "86.000",
    "currency_code" => "KWD",
    "customer_first_name" => "example-customer",
    "customer_last_name" => "",
    "customer_email" => "customer@example.com",
    "gateway_name" => "kpay",
    "gateway_account" => "knet",
    "order_no" => "ORDER-1001",
    "reference_number" => "ABC12",
    "result" => "success",
    "session_id" => "a12f71075a834a34d692736ac43a212fcebfb6ec",
    "state" => "paid",
];
$hmacKey = "pu9MpX3yPR";

echo generateHmacSignature($payload, $hmacKey) . PHP_EOL;
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

    // Fields used for the signature, in alphabetical order
    private static final String[] SIGNED_FIELDS = {
        "amount",
        "currency_code",
        "customer_address_city",
        "customer_address_country",
        "customer_address_line1",
        "customer_address_line2",
        "customer_address_postal_code",
        "customer_address_state",
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
    };

    public static String generateHmacSignature(Map<String, String> payload, String hmacKey) throws Exception {
        // Keep the signed fields that have a value, sorted alphabetically by name
        List<String> fields = new ArrayList<>();
        for (String key : SIGNED_FIELDS) {
            String value = payload.get(key);
            if (value != null && !value.isEmpty()) {
                fields.add(key);
            }
        }
        Collections.sort(fields);

        // Concatenate name + value of each field
        StringBuilder message = new StringBuilder();
        for (String key : fields) {
            message.append(key).append(payload.get(key));
        }

        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(hmacKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hashBytes = mac.doFinal(message.toString().getBytes(StandardCharsets.UTF_8));

        StringBuilder hex = new StringBuilder();
        for (byte b : hashBytes) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    public static void main(String[] args) throws Exception {
        Map<String, String> payload = new HashMap<>();
        payload.put("amount", "86.000");
        payload.put("currency_code", "KWD");
        payload.put("customer_first_name", "example-customer");
        payload.put("customer_last_name", "");
        payload.put("customer_email", "customer@example.com");
        payload.put("gateway_name", "kpay");
        payload.put("gateway_account", "knet");
        payload.put("order_no", "ORDER-1001");
        payload.put("reference_number", "ABC12");
        payload.put("result", "success");
        payload.put("session_id", "a12f71075a834a34d692736ac43a212fcebfb6ec");
        payload.put("state", "paid");

        String hmacKey = "pu9MpX3yPR";

        System.out.println(generateHmacSignature(payload, hmacKey));
    }
}
```

### .NET (C#)

```csharp title="C# (.NET)"
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

public class SignatureGenerator {
    // Fields used for the signature, in alphabetical order
    private static readonly string[] SignedFields = {
        "amount",
        "currency_code",
        "customer_address_city",
        "customer_address_country",
        "customer_address_line1",
        "customer_address_line2",
        "customer_address_postal_code",
        "customer_address_state",
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
    };

    public static string GenerateHmacSignature(Dictionary<string, string> payload, string hmacKey) {
        // Keep the signed fields that have a value, sorted alphabetically by name.
        // StringComparer.Ordinal sorts like the other languages, not by culture rules.
        var fields = SignedFields
            .Where(key => payload.TryGetValue(key, out var value) && !string.IsNullOrEmpty(value))
            .OrderBy(key => key, StringComparer.Ordinal);

        // Concatenate name + value of each field
        var message = new StringBuilder();
        foreach (var key in fields) {
            message.Append(key).Append(payload[key]);
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
            {"customer_first_name", "example-customer"},
            {"customer_last_name", ""},
            {"customer_email", "customer@example.com"},
            {"gateway_name", "kpay"},
            {"gateway_account", "knet"},
            {"order_no", "ORDER-1001"},
            {"reference_number", "ABC12"},
            {"result", "success"},
            {"session_id", "a12f71075a834a34d692736ac43a212fcebfb6ec"},
            {"state", "paid"}
        };
        string hmacKey = "pu9MpX3yPR";

        Console.WriteLine(GenerateHmacSignature(payload, hmacKey));
    }
}
```

### Node.js

```javascript title="Node.js"
const crypto = require("crypto");

// Fields used for the signature, in alphabetical order
const SIGNED_FIELDS = [
  "amount",
  "currency_code",
  "customer_address_city",
  "customer_address_country",
  "customer_address_line1",
  "customer_address_line2",
  "customer_address_postal_code",
  "customer_address_state",
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
];

function generateHmacSignature(payload, hmacKey) {
  // Keep the signed fields that have a value, sorted alphabetically by name
  const fields = Object.keys(payload)
    .filter((key) => SIGNED_FIELDS.includes(key) && payload[key])
    .sort();

  // Concatenate name + value of each field
  const message = fields.map((key) => `${key}${payload[key]}`).join("");

  return crypto.createHmac("sha256", hmacKey).update(message, "utf8").digest("hex");
}

// Test
const payload = {
  amount: "86.000",
  currency_code: "KWD",
  customer_first_name: "example-customer",
  customer_last_name: "",
  customer_email: "customer@example.com",
  gateway_name: "kpay",
  gateway_account: "knet",
  order_no: "ORDER-1001",
  reference_number: "ABC12",
  result: "success",
  session_id: "a12f71075a834a34d692736ac43a212fcebfb6ec",
  state: "paid",
};
const hmacKey = "pu9MpX3yPR";

console.log(generateHmacSignature(payload, hmacKey));
```

### Ruby

```ruby title="Ruby"
require 'openssl'

# Fields used for the signature, in alphabetical order
SIGNED_FIELDS = %w[
  amount
  currency_code
  customer_address_city
  customer_address_country
  customer_address_line1
  customer_address_line2
  customer_address_postal_code
  customer_address_state
  customer_email
  customer_first_name
  customer_last_name
  customer_phone
  gateway_account
  gateway_name
  order_no
  reference_number
  result
  state
].freeze

def generate_hmac_signature(payload, hmac_key)
  # Keep the signed fields that have a value, sorted alphabetically by name
  fields = SIGNED_FIELDS.select { |key| payload[key] && payload[key] != '' }.sort

  # Concatenate name + value of each field
  message = fields.map { |key| "#{key}#{payload[key]}" }.join

  OpenSSL::HMAC.hexdigest('sha256', hmac_key, message)
end

# Test
payload = {
  'amount' => '86.000',
  'currency_code' => 'KWD',
  'customer_first_name' => 'example-customer',
  'customer_last_name' => '',
  'customer_email' => 'customer@example.com',
  'gateway_name' => 'kpay',
  'gateway_account' => 'knet',
  'order_no' => 'ORDER-1001',
  'reference_number' => 'ABC12',
  'result' => 'success',
  'session_id' => 'a12f71075a834a34d692736ac43a212fcebfb6ec',
  'state' => 'paid'
}
hmac_key = 'pu9MpX3yPR'

puts generate_hmac_signature(payload, hmac_key)
```

### Go

```go title="Go"
package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sort"
	"strings"
)

// Fields used for the signature, in alphabetical order
var signedFields = []string{
	"amount",
	"currency_code",
	"customer_address_city",
	"customer_address_country",
	"customer_address_line1",
	"customer_address_line2",
	"customer_address_postal_code",
	"customer_address_state",
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

func GenerateHmacSignature(payload map[string]interface{}, hmacKey string) string {
	// Keep the signed fields that have a value, sorted alphabetically by name
	var fields []string
	for _, key := range signedFields {
		value, ok := payload[key]
		if ok && value != nil && fmt.Sprintf("%v", value) != "" {
			fields = append(fields, key)
		}
	}
	sort.Strings(fields)

	// Concatenate name + value of each field
	var message strings.Builder
	for _, key := range fields {
		message.WriteString(key)
		message.WriteString(fmt.Sprintf("%v", payload[key]))
	}

	mac := hmac.New(sha256.New, []byte(hmacKey))
	mac.Write([]byte(message.String()))
	return hex.EncodeToString(mac.Sum(nil))
}

func main() {
	payload := map[string]interface{}{
		"amount":              "86.000",
		"currency_code":       "KWD",
		"customer_first_name": "example-customer",
		"customer_last_name":  "",
		"customer_email":      "customer@example.com",
		"gateway_name":        "kpay",
		"gateway_account":     "knet",
		"order_no":            "ORDER-1001",
		"reference_number":    "ABC12",
		"result":              "success",
		"session_id":          "a12f71075a834a34d692736ac43a212fcebfb6ec",
		"state":               "paid",
	}
	hmacKey := "pu9MpX3yPR"

	fmt.Println(GenerateHmacSignature(payload, hmacKey))
}
```

The above examples provide a way for developers in different languages to generate the HMAC signature from a payload using the provided HMAC key.

**Need Further Assistance?** Our dedicated support team is always on hand to help. Reach out to us at [support@ottu.com](mailto:support@ottu.com).

## What's Next?

- [**Payment Events**](/developers/webhooks/payment-events/) — Payment webhook payload reference
- [**Operation Events**](/developers/webhooks/operation-events/) — Operation webhook payload reference
- [**Webhooks Overview**](./) — Setup, delivery guarantees, and configuration
