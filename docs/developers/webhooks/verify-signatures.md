---
title: Verify Signatures
sidebar_label: Verify Signatures
---

# Signing Mechanism

To ensure the integrity and authenticity of the [webhook notifications](/developers/webhooks/payment-events) sent to the merchant, Ottu employs a signing mechanism based on HMAC (Hash-based Message Authentication Code). By leveraging HMAC, Ottu can guarantee that the webhook's content remains untampered during transmission.

:::danger Breaking change: the signature scheme has changed
The way Ottu builds the string it signs has been rewritten. **Any verifier written against the previous scheme will reject every payload it receives**, including payloads for merchants who never use AutoPay or any other new feature.

Three things changed:

1. Each field is now written as `path=value`, and the pairs are joined with a **newline** (`\n`). Previously the key and value were concatenated with no separator and no delimiter between pairs.
2. The signed set grew from 18 flat fields to **26 fields**, eight of which are **dotted paths into nested objects** such as `token.token` and `extra.merchant_id`.
3. Fields whose value is empty or otherwise falsy are now **skipped**. Previously a present-but-empty field was included.

If you use [ottu-py](https://github.com/ottuco/ottu-py), upgrade it in lockstep with this change; its `verify_signature` implements the same wire contract. If you verify signatures yourself, update your code using the [reference implementations](#specific-examples) below before this reaches your environment.
:::

## Important Components

#### 1. HMAC Key (Secret Key)

- This is the backbone of the signing and verification process. Merchants can retrieve their unique HMAC Key from the Webhook Configuration panel within Ottu's admin dashboard [here](/developers/webhooks).
- It's paramount that this key remains confidential. Always store it securely and avoid exposing it to the public.

#### 2. Fields for Signature {#2-fields-for-signature}

The signature is not derived from every field in the payload. See payload example [here](/developers/webhooks/payment-events#payload-example-paid). Only the following 26 paths are signed, listed here in the exact sort order used to build the signed string:

```
agreement.id
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
extra.autopay.subscription_id
extra.merchant_id
gateway_account
gateway_name
order_no
payment_type
reference_number
result
session_id
state
token.customer_id
token.pg_code
token.token
```

**Dotted paths address nested objects.** A path such as `token.pg_code` means "the `pg_code` key inside the `token` object", not a top-level field literally named `token.pg_code`. Walk the payload one segment at a time; if any segment is missing, or the value at the end is not an object when more segments remain, treat the whole path as absent.

**Eight of these are newly signed**, and they are the ones existing verifiers miss: `session_id`, `payment_type`, `agreement.id`, `token.token`, `token.pg_code`, `token.customer_id`, `extra.merchant_id`, and `extra.autopay.subscription_id`.

:::note Why `session_id` is now signed
`session_id` identifies the payment session the notification belongs to. Leaving it unsigned meant a captured webhook could be replayed against a different session while its signature still verified. Signing it binds each notification to exactly one session and closes that replay hole.
:::

**`token.brand` and `token.number` are deliberately *not* signed.** They exist for display (showing "MASTERCARD •••• 0008" in a UI) and are excluded on purpose. Do not add them to your verifier.

**Key Considerations**:

1. A path that is absent from the payload is skipped.
2. A path whose value is empty or otherwise falsy — `""`, `null`, `0`, `false`, `[]`, `{}` — is also skipped. **An empty string signs identically to an absent key.** This is a change from the previous scheme, which included present-but-empty values.
3. Values are used exactly as they appear in the payload, with no type coercion, trimming, or case folding.

#### 3. Signature Creation

1. Sort the 26 paths above alphabetically. (The list is already in sorted order, so you can hard-code it as shown.)
2. For each path in that order, resolve it against the payload. Skip it if it is missing or falsy.
3. Render each surviving path as `path=value`.
4. Join the rendered pairs with a single newline character, `\n`. There is no trailing newline.
5. Compute **HMAC-SHA256** over that string using your HMAC Key, and hex-encode the result.

The resulting signature is dispatched with the [webhook notification](/developers/webhooks/payment-events) in the `signature` field.

#### 4. Verification by Merchant

- On receipt, rebuild the signed string from the payload you received, using the steps above.
- Generate an HMAC signature using your stored [HMAC Key](/developers/webhooks).
- Compare it to the `signature` field on the payload. Use a constant-time comparison (`hmac.compare_digest` in Python, `hash_equals` in PHP, `crypto.timingSafeEqual` in Node.js) rather than `==`.
- If they match, the payload is authentic. Any discrepancy suggests tampering, or a verifier still running the old scheme.

## Where signatures appear {#where-signatures-appear}

This is not a webhooks-only change. The same `signature` field, computed the same way, is returned by the synchronous responses of these endpoints:

| Endpoint | Notes |
|---|---|
| `POST /b/pbl/v2/payment/auto-debit` | Charging a saved token (MIT) |
| `POST /b/pbl/v2/payment/apple-pay` | [Native payments](/developers/payments/native-payments/) |
| `POST /b/pbl/v2/payment/google-pay` | [Native payments](/developers/payments/native-payments/) |
| `POST /b/pbl/v2/payment/cash` | Cash / COD acknowledgement |
| `POST /b/pbl/v2/sign` | Signs a payload you supply, using your HMAC Key |

Those four payment responses share the payment-webhook body shape, so they also carry `extra.merchant_id` (see below). If you verify the signature on a synchronous response as well as on the webhook, both code paths need the update.

`POST /b/pbl/v2/sign` is useful while migrating: post a payload to it and compare the signature it returns against what your own implementation produces for the same payload.

## Payload additions you should know about {#payload-additions}

Two related additions land alongside this change, and the distinction between them matters for security.

**`extra.merchant_id` is always present now**, even when you sent no `extra` object on the checkout call. It holds your merchant domain, and it **is** inside the signed set.

**A top-level `autopay` block may be present** on payments created through [AutoPay](/developers/payments/autopay/). It sits at the top level of the payload, *not* under `extra`, and contains `subscription_id`, `subscription_status`, `cycle_number`, `cycle_status`, `next_billing_date` and `event_type`.

:::warning The top-level `autopay` block is not covered by the signature
It is fetched live from the AutoPay service while the response is being assembled, with a short timeout, and is **silently omitted** if that lookup times out or fails. Treat it as informational only:

- **Never** make a security or money-moving decision based on it. Use the signed [`extra.autopay.subscription_id`](#2-fields-for-signature) to identify the subscription, then read authoritative state from the [subscription endpoints](/developers/payments/autopay/#step-by-step).
- Its absence means the lookup did not complete. It does **not** mean the payment is not an AutoPay payment.
- `event_type` is one of `cit_success`, `mit_success`, `mit_failure`, `card_updated`, `recovery_success` — never `null` when the block is present. It's AutoPay's own best-guess classification, computed independently of the payment result; it is **not** authoritative. Read `result` and `state` on the payment for the actual outcome.
:::

## Example

Consider this payload and a hypothetical HMAC key.

**Webhook Payload**:

```json
{
  "amount": "49.990",
  "currency_code": "KWD",
  "customer_email": "customer@example.com",
  "customer_first_name": "Jane",
  "customer_last_name": "",
  "gateway_account": "credit-card",
  "gateway_name": "mpgs",
  "order_no": "ORD-1001",
  "payment_type": "auto_pay",
  "reference_number": "betabulkAQ5DJ",
  "result": "success",
  "session_id": "a12f71075a834a34d692736ac43a212fcebfb6ec",
  "state": "paid",
  "agreement": { "id": "AGR-abc123" },
  "extra": {
    "merchant_id": "merchant.ottu.net",
    "autopay": { "subscription_id": "sub_abc123" }
  },
  "token": {
    "token": "9491500736137502",
    "pg_code": "credit-card",
    "customer_id": "cust_12345",
    "brand": "MASTERCARD",
    "number": "**** 0008"
  }
}
```

**HMAC Key**: `pu9MpX3yPR`

The signed string built from it is exactly this — 18 lines, joined by `\n`, with no trailing newline:

```text title="Canonical string"
agreement.id=AGR-abc123
amount=49.990
currency_code=KWD
customer_email=customer@example.com
customer_first_name=Jane
extra.autopay.subscription_id=sub_abc123
extra.merchant_id=merchant.ottu.net
gateway_account=credit-card
gateway_name=mpgs
order_no=ORD-1001
payment_type=auto_pay
reference_number=betabulkAQ5DJ
result=success
session_id=a12f71075a834a34d692736ac43a212fcebfb6ec
state=paid
token.customer_id=cust_12345
token.pg_code=credit-card
token.token=9491500736137502
```

Note what is missing from it, and why:

- `customer_last_name` is present in the payload but empty, so it is skipped.
- `token.brand` and `token.number` are present but are not in the signed set.
- The eight address and phone paths are absent from the payload, so they are skipped.

Applying HMAC-SHA256 with the key above gives:

`4ea44c61554e6b64feeb82e6bfc724dc1c46bf183596f5375f5cb12cca14b7ef`

Compare that against the `signature` field on the payload you received.

## Signature Generation

Ensuring the integrity and authenticity of payloads is paramount for the security of both the service provider and the merchants. To achieve this, an HMAC signature is generated and sent along with the payload, and this signature needs to be validated at the merchant's end. Each implementation below follows the [signature creation](#3-signature-creation) steps exactly; use the payload, key and digest in the [example](#example) as a test vector to confirm your build of it. Snippets are provided for [Python](#python), [PHP](#php), [Java](#java), [.NET (C#)](#net-c), [Node.js](#nodejs), [Ruby](#ruby), and [Go](#go).

:::tip Test your implementation before you need it
Run your updated verifier against the payload and key in the [example](#example) above. If it produces `4ea44c61…`, it implements the current scheme correctly.
:::

## Specific Examples

### Python

```python title="Python"
import hashlib
import hmac

SIGNED_FIELDS = [
    "agreement.id",
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
    "extra.autopay.subscription_id",
    "extra.merchant_id",
    "gateway_account",
    "gateway_name",
    "order_no",
    "payment_type",
    "reference_number",
    "result",
    "session_id",
    "state",
    "token.customer_id",
    "token.pg_code",
    "token.token",
]

_MISSING = object()


def _resolve_path(payload, path):
    """Walk a dotted path through nested dicts. Returns _MISSING if absent."""
    current = payload
    for part in path.split("."):
        if not isinstance(current, dict) or part not in current:
            return _MISSING
        current = current[part]
    return current


def generate_hmac_signature(payload, hmac_key):
    parts = []
    for path in sorted(SIGNED_FIELDS):
        value = _resolve_path(payload, path)
        if value is _MISSING or not value:
            continue
        parts.append(f"{path}={value}")
    message = "\n".join(parts)
    return hmac.new(
        bytes(hmac_key, encoding="utf8"),
        bytes(message, encoding="utf8"),
        digestmod=hashlib.sha256,
    ).hexdigest()


def verify(payload, hmac_key):
    expected = generate_hmac_signature(payload, hmac_key)
    return hmac.compare_digest(expected, payload.get("signature", ""))
```

Running `generate_hmac_signature` against the payload and key from the [example](#example) prints `4ea44c61554e6b64feeb82e6bfc724dc1c46bf183596f5375f5cb12cca14b7ef`.

### PHP

```php title="PHP"
<?php

const SIGNED_FIELDS = [
    "agreement.id", "amount", "currency_code",
    "customer_address_city", "customer_address_country",
    "customer_address_line1", "customer_address_line2",
    "customer_address_postal_code", "customer_address_state",
    "customer_email", "customer_first_name", "customer_last_name",
    "customer_phone", "extra.autopay.subscription_id", "extra.merchant_id",
    "gateway_account", "gateway_name", "order_no", "payment_type",
    "reference_number", "result", "session_id", "state",
    "token.customer_id", "token.pg_code", "token.token",
];

function resolvePath(array $payload, string $path) {
    $current = $payload;
    foreach (explode('.', $path) as $part) {
        if (!is_array($current) || !array_key_exists($part, $current)) {
            return null;
        }
        $current = $current[$part];
    }
    return $current;
}

function generateHmacSignature(array $payload, string $hmacKey): string {
    $fields = SIGNED_FIELDS;
    sort($fields);

    $parts = [];
    foreach ($fields as $path) {
        $value = resolvePath($payload, $path);
        if ($value === null || $value === '' || $value === false || $value === 0 || $value === []) {
            continue;
        }
        $parts[] = $path . '=' . $value;
    }

    return hash_hmac('sha256', implode("\n", $parts), $hmacKey);
}

function verify(array $payload, string $hmacKey): bool {
    return hash_equals(generateHmacSignature($payload, $hmacKey), $payload['signature'] ?? '');
}
?>
```

### Java

```java title="Java"
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

public class SignatureGenerator {

    private static final List<String> SIGNED_FIELDS = Arrays.asList(
        "agreement.id", "amount", "currency_code",
        "customer_address_city", "customer_address_country",
        "customer_address_line1", "customer_address_line2",
        "customer_address_postal_code", "customer_address_state",
        "customer_email", "customer_first_name", "customer_last_name",
        "customer_phone", "extra.autopay.subscription_id", "extra.merchant_id",
        "gateway_account", "gateway_name", "order_no", "payment_type",
        "reference_number", "result", "session_id", "state",
        "token.customer_id", "token.pg_code", "token.token"
    );

    @SuppressWarnings("unchecked")
    private static Object resolvePath(Map<String, Object> payload, String path) {
        Object current = payload;
        for (String part : path.split("\\.")) {
            if (!(current instanceof Map)) {
                return null;
            }
            Map<String, Object> node = (Map<String, Object>) current;
            if (!node.containsKey(part)) {
                return null;
            }
            current = node.get(part);
        }
        return current;
    }

    private static boolean isFalsy(Object value) {
        if (value == null) return true;
        if (value instanceof String) return ((String) value).isEmpty();
        if (value instanceof Boolean) return !((Boolean) value);
        if (value instanceof Number) return ((Number) value).doubleValue() == 0d;
        if (value instanceof Map) return ((Map<?, ?>) value).isEmpty();
        if (value instanceof List) return ((List<?>) value).isEmpty();
        return false;
    }

    public static String generateHmacSignature(Map<String, Object> payload, String hmacKey)
            throws Exception {
        List<String> fields = new java.util.ArrayList<>(SIGNED_FIELDS);
        java.util.Collections.sort(fields);

        StringJoiner message = new StringJoiner("\n");
        for (String path : fields) {
            Object value = resolvePath(payload, path);
            if (isFalsy(value)) {
                continue;
            }
            message.add(path + "=" + value);
        }

        Mac sha256HMAC = Mac.getInstance("HmacSHA256");
        sha256HMAC.init(new SecretKeySpec(hmacKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hashBytes = sha256HMAC.doFinal(message.toString().getBytes(StandardCharsets.UTF_8));

        StringBuilder sb = new StringBuilder();
        for (byte b : hashBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
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
    private static readonly string[] SignedFields = {
        "agreement.id", "amount", "currency_code",
        "customer_address_city", "customer_address_country",
        "customer_address_line1", "customer_address_line2",
        "customer_address_postal_code", "customer_address_state",
        "customer_email", "customer_first_name", "customer_last_name",
        "customer_phone", "extra.autopay.subscription_id", "extra.merchant_id",
        "gateway_account", "gateway_name", "order_no", "payment_type",
        "reference_number", "result", "session_id", "state",
        "token.customer_id", "token.pg_code", "token.token"
    };

    private static object ResolvePath(IDictionary<string, object> payload, string path) {
        object current = payload;
        foreach (var part in path.Split('.')) {
            if (!(current is IDictionary<string, object> node) || !node.ContainsKey(part)) {
                return null;
            }
            current = node[part];
        }
        return current;
    }

    private static bool IsFalsy(object value) {
        switch (value) {
            case null: return true;
            case string s: return s.Length == 0;
            case bool b: return !b;
            case int i: return i == 0;
            case double d: return d == 0d;
            case System.Collections.ICollection c: return c.Count == 0;
            default: return false;
        }
    }

    public static string GenerateHmacSignature(IDictionary<string, object> payload, string hmacKey) {
        var parts = SignedFields
            .OrderBy(f => f, StringComparer.Ordinal)
            .Select(path => new { path, value = ResolvePath(payload, path) })
            .Where(x => !IsFalsy(x.value))
            .Select(x => $"{x.path}={x.value}");

        var message = string.Join("\n", parts);

        using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(hmacKey))) {
            byte[] hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(message));
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }
    }
}
```

### Node.js

```javascript title="Node.js"
const crypto = require("crypto");

const SIGNED_FIELDS = [
  "agreement.id",
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
  "extra.autopay.subscription_id",
  "extra.merchant_id",
  "gateway_account",
  "gateway_name",
  "order_no",
  "payment_type",
  "reference_number",
  "result",
  "session_id",
  "state",
  "token.customer_id",
  "token.pg_code",
  "token.token",
];

const MISSING = Symbol("missing");

function resolvePath(payload, path) {
  let current = payload;
  for (const part of path.split(".")) {
    if (
      current === null ||
      typeof current !== "object" ||
      Array.isArray(current) ||
      !Object.prototype.hasOwnProperty.call(current, part)
    ) {
      return MISSING;
    }
    current = current[part];
  }
  return current;
}

function isFalsy(value) {
  if (!value) return true; // "", 0, false, null, undefined
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

function generateHmacSignature(payload, hmacKey) {
  const parts = [];
  for (const path of [...SIGNED_FIELDS].sort()) {
    const value = resolvePath(payload, path);
    if (value === MISSING || isFalsy(value)) continue;
    parts.push(`${path}=${value}`);
  }

  return crypto.createHmac("sha256", hmacKey).update(parts.join("\n")).digest("hex");
}

function verify(payload, hmacKey) {
  const expected = Buffer.from(generateHmacSignature(payload, hmacKey), "utf8");
  const received = Buffer.from(payload.signature || "", "utf8");
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
```

### Ruby

```ruby title="Ruby"
require 'openssl'

SIGNED_FIELDS = [
  'agreement.id', 'amount', 'currency_code',
  'customer_address_city', 'customer_address_country',
  'customer_address_line1', 'customer_address_line2',
  'customer_address_postal_code', 'customer_address_state',
  'customer_email', 'customer_first_name', 'customer_last_name',
  'customer_phone', 'extra.autopay.subscription_id', 'extra.merchant_id',
  'gateway_account', 'gateway_name', 'order_no', 'payment_type',
  'reference_number', 'result', 'session_id', 'state',
  'token.customer_id', 'token.pg_code', 'token.token'
].freeze

MISSING = Object.new

def resolve_path(payload, path)
  current = payload
  path.split('.').each do |part|
    return MISSING unless current.is_a?(Hash) && current.key?(part)
    current = current[part]
  end
  current
end

def falsy?(value)
  value.nil? || value == false || value == '' || value == 0 ||
    (value.respond_to?(:empty?) && value.empty?)
end

def generate_hmac_signature(payload, hmac_key)
  parts = SIGNED_FIELDS.sort.filter_map do |path|
    value = resolve_path(payload, path)
    next if value.equal?(MISSING) || falsy?(value)
    "#{path}=#{value}"
  end

  OpenSSL::HMAC.hexdigest('sha256', hmac_key, parts.join("\n"))
end

def verify(payload, hmac_key)
  expected = generate_hmac_signature(payload, hmac_key)
  OpenSSL.secure_compare(expected, payload['signature'].to_s)
end
```

### Go

```go title="Go"
package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
	"sort"
	"strings"
)

var signedFields = []string{
	"agreement.id",
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
	"extra.autopay.subscription_id",
	"extra.merchant_id",
	"gateway_account",
	"gateway_name",
	"order_no",
	"payment_type",
	"reference_number",
	"result",
	"session_id",
	"state",
	"token.customer_id",
	"token.pg_code",
	"token.token",
}

// resolvePath walks a dotted path through nested maps.
// The second return value reports whether the path was found.
func resolvePath(payload map[string]interface{}, path string) (interface{}, bool) {
	var current interface{} = payload
	for _, part := range strings.Split(path, ".") {
		node, ok := current.(map[string]interface{})
		if !ok {
			return nil, false
		}
		current, ok = node[part]
		if !ok {
			return nil, false
		}
	}
	return current, true
}

func isFalsy(value interface{}) bool {
	switch v := value.(type) {
	case nil:
		return true
	case string:
		return v == ""
	case bool:
		return !v
	case float64:
		return v == 0
	case int:
		return v == 0
	case []interface{}:
		return len(v) == 0
	case map[string]interface{}:
		return len(v) == 0
	}
	return false
}

func SignMerchantPayload(payload map[string]interface{}, key string) string {
	fields := append([]string(nil), signedFields...)
	sort.Strings(fields)

	var parts []string
	for _, path := range fields {
		value, found := resolvePath(payload, path)
		if !found || isFalsy(value) {
			continue
		}
		parts = append(parts, fmt.Sprintf("%s=%v", path, value))
	}

	h := hmac.New(sha256.New, []byte(key))
	h.Write([]byte(strings.Join(parts, "\n")))
	return hex.EncodeToString(h.Sum(nil))
}

func Verify(payload map[string]interface{}, key string) bool {
	expected := SignMerchantPayload(payload, key)
	received, _ := payload["signature"].(string)
	return subtle.ConstantTimeCompare([]byte(expected), []byte(received)) == 1
}
```

The above examples provide a way for developers in different languages to generate the HMAC signature from a payload using the provided HMAC key.

**Need Further Assistance?** Our dedicated support team is always on hand to help. Reach out to us at [support@ottu.com](mailto:support@ottu.com).

## What's Next?

- [**Payment Events**](/developers/webhooks/payment-events/) — Payment webhook payload reference
- [**Operation Events**](/developers/webhooks/operation-events/) — Operation webhook payload reference
- [**AutoPay**](/developers/payments/autopay/) — Subscriptions, and the `autopay` payload blocks described above
- [**Webhooks Overview**](./) — Setup, delivery guarantees, and configuration
