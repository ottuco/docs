---
title: Verify Signatures
sidebar_label: Verify Signatures
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";
import { OTTU_CONNECT_BASE_URL } from "@site/src/constants/api";

# Signing Mechanism

To ensure the integrity and authenticity of the [webhook notifications](/developers/webhooks/payment-events) sent to the merchant, Ottu employs a signing mechanism based on HMAC (Hash-based Message Authentication Code). By leveraging HMAC, Ottu can guarantee that the webhook's content remains untampered during transmission.

Ottu signs webhooks in two ways. The **`Ottu-Signature` header** (`v2`) signs every byte of the request body, and it is the only scheme new integrations should verify. The **body `signature` field** is the original, legacy scheme: it is still sent on webhook formats 1 and 2 so that live integrations keep working, but it is obsolete. This page is self-contained: it gives the exact recipe, published test vectors and working code for both.

## Which signature do I verify? {#which-signature}

| Where it appears | `Ottu-Signature` header (`v2`) | Body `signature` field (legacy) |
|---|---|---|
| Webhook **format 3** (envelope) | Sent with every delivery. **Verify this.** | Not present: `data.payment` and `data.operation` have no `signature` field |
| Webhook **formats 1 and 2** | Sent with every delivery. **Verify this.** | Still sent, so existing verifiers keep working. Obsolete |
| Synchronous payment responses and the [Sign API](#sign-api) | Not sent. The Sign API returns it as `ottu_signature` | Returned as `signature`, see [Where signatures appear](#where-signatures-appear) |

Not sure which [webhook format](/developers/webhooks/migrate-to-v3#formats) your account uses? It does not matter for the header: verify `v2` on every format.

## Verify a webhook {#signature-scheme}

Pick the scheme. The header is selected by default; the legacy tab documents the body `signature` for integrations that already verify it, and can be linked to directly with [`?signature-scheme=legacy`](/developers/webhooks/verify-signatures/?signature-scheme=legacy#signature-scheme).

<Tabs groupId="signature-scheme" queryString>
<TabItem value="header" label="Ottu-Signature header (v2) — recommended" default>

### The Ottu-Signature header {#ottu-signature-header}

Every webhook delivery carries one header:

```text
Ottu-Signature: t=1792417440,v2=b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e
```

| Part | Meaning |
|---|---|
| `t` | Unix time in **seconds** when this attempt was signed. It is recomputed for **every attempt**, so a retry carries a new `t` and a new signature. |
| `v2` | `HMAC-SHA256(key, "<t>." + raw body bytes)`, hex-encoded, lowercase. |

- **The key** is your **HMAC Key** from the [Webhook configuration](/developers/webhooks), the same key as for the legacy body signature. Keep it secret.
- **Parts are separated by commas.** Read them by name, not by position. A later version can appear alongside `v2` (for example `t=...,v2=...,v3=...`): verify the version you support and ignore the rest.
- **Why `v2` and not `v1`?** `v1` is the original body `signature` field (the legacy tab). There is no header `v1`.
- **No header, no trust.** If Ottu cannot build the header, the delivery is still sent, without it. Treat a request with no `Ottu-Signature`, or one without a `v2` part, as unsigned and reject it.

### Every byte is signed {#every-byte-is-signed}

`v2` covers the **whole request body**, exactly as sent. There is no list of signed fields to keep in sync, and no field (including `extra`, `token`, `session_id` or the top-level `autopay` block on formats 1 and 2) can be changed without the signature failing. The same is true for a format 1 or 2 body sent as XML: the bytes are signed, whatever their encoding.

Request headers are not signed. That includes [`Idempotency-Key`](/developers/webhooks/delivery-and-retries#idempotency-key): use it to detect duplicates, not as proof of anything.

### Verify v2 {#verify-v2}

1. Read the **raw request body** as bytes, before any JSON parsing.
2. Split the `Ottu-Signature` header on `,`, then each part on the first `=`. Take `t` and `v2`. Reject the request if either is missing.
3. Reject it if `t` is more than **300 seconds** away from your clock ([replay protection](#replay-protection)).
4. Compute `HMAC-SHA256(key, t + "." + raw_body)` and hex-encode it.
5. Compare the result with `v2` using a **constant-time** comparison. Only if they match, parse the body and act on it.

:::danger Verify the raw bytes, before parsing
`v2` covers the exact bytes Ottu sent. Parsing the JSON and serialising it again changes spacing, key order and the escaping of non-ASCII characters, and the check then fails. Read the raw body first, verify it, and only then parse it.
:::

How to get the raw body in common frameworks:

| Language / framework | Raw body |
|---|---|
| Python, Django | `request.body` |
| Python, Flask | `request.get_data()` |
| PHP | `file_get_contents('php://input')` |
| Java, Spring | a `@RequestBody byte[] body` parameter |
| .NET, ASP.NET Core | call `Request.EnableBuffering()`, then copy `Request.Body` into a `MemoryStream` |
| Node.js, Express | the `express.raw({ type: "*/*" })` middleware; `req.body` is then a `Buffer` |
| Ruby, Rails / Rack | `request.raw_post` / `request.body.read` |
| Go, `net/http` | `io.ReadAll(r.Body)` |

#### Replay protection {#replay-protection}

`t` is part of the signed message, so it cannot be changed without breaking `v2`. Reject a webhook whose `t` is more than **5 minutes (300 seconds)** from your own clock: a captured request then stops verifying after five minutes. Every attempt, including every retry, is signed with a fresh `t`, so a legitimate retry is never rejected as too old. Keep your server clock synchronised (NTP).

#### Code {#v2-code}

Each function takes the raw body bytes, the `Ottu-Signature` header value and your HMAC key, and returns `true` only when the signature matches and `t` is within the tolerance.

<Tabs groupId="language">
<TabItem value="python" label="Python">

```python
import hashlib
import hmac
import time

TOLERANCE_SECONDS = 300


def verify_ottu_signature(raw_body: bytes, header: str, key: str,
                          tolerance: int = TOLERANCE_SECONDS, now: "float | None" = None) -> bool:
    """raw_body is the request body exactly as received (bytes), never re-serialised JSON."""
    parts = {}
    for item in header.split(","):
        name, _, value = item.strip().partition("=")
        parts.setdefault(name, value)
    t, received = parts.get("t", ""), parts.get("v2", "")
    if not (t.isascii() and t.isdigit()) or not received:
        return False
    if abs((time.time() if now is None else now) - int(t)) > tolerance:
        return False
    expected = hmac.new(key.encode(), f"{t}.".encode() + raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, received)
```

</TabItem>
<TabItem value="php" label="PHP">

```php
<?php
const OTTU_TOLERANCE_SECONDS = 300;

// $rawBody = file_get_contents('php://input'): the exact bytes, never json_encode($decoded).
function verifyOttuSignature(string $rawBody, string $header, string $key, int $tolerance = OTTU_TOLERANCE_SECONDS, ?int $now = null): bool
{
    $parts = [];
    foreach (explode(',', $header) as $item) {
        [$name, $value] = array_pad(explode('=', trim($item), 2), 2, '');
        if (!array_key_exists($name, $parts)) {
            $parts[$name] = $value;
        }
    }
    $t = $parts['t'] ?? '';
    $received = $parts['v2'] ?? '';
    if (!preg_match('/^[0-9]{1,18}$/', $t) || $received === '') {
        return false;
    }
    if (abs(($now ?? time()) - (int) $t) > $tolerance) {
        return false;
    }
    $expected = hash_hmac('sha256', $t . '.' . $rawBody, $key);
    return hash_equals($expected, $received);
}
```

</TabItem>
<TabItem value="java" label="Java">

```java
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class Verify {
    static final long TOLERANCE_SECONDS = 300;

    // rawBody is the request body exactly as received, never re-serialised JSON.
    public static boolean verifyOttuSignature(byte[] rawBody, String header, String key, long nowSeconds)
            throws Exception {
        Map<String, String> parts = new HashMap<>();
        for (String item : header.split(",")) {
            String[] kv = item.trim().split("=", 2);
            parts.putIfAbsent(kv[0], kv.length == 2 ? kv[1] : "");
        }
        String t = parts.getOrDefault("t", "");
        String received = parts.getOrDefault("v2", "");
        if (!t.matches("[0-9]{1,18}") || received.isEmpty()) {
            return false;
        }
        if (Math.abs(nowSeconds - Long.parseLong(t)) > TOLERANCE_SECONDS) {
            return false;
        }
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        mac.update((t + ".").getBytes(StandardCharsets.UTF_8));
        byte[] digest = mac.doFinal(rawBody);
        StringBuilder expected = new StringBuilder();
        for (byte b : digest) {
            expected.append(String.format("%02x", b));
        }
        return MessageDigest.isEqual(
            expected.toString().getBytes(StandardCharsets.UTF_8),
            received.getBytes(StandardCharsets.UTF_8));
    }

    public static boolean verifyOttuSignature(byte[] rawBody, String header, String key) throws Exception {
        return verifyOttuSignature(rawBody, header, key, System.currentTimeMillis() / 1000);
    }
}
```

</TabItem>
<TabItem value="csharp" label=".NET (C#)">

```csharp
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

public static class OttuSignature
{
    public const long ToleranceSeconds = 300;

    // rawBody is the request body exactly as received, never re-serialised JSON.
    public static bool Verify(byte[] rawBody, string header, string key, long nowSeconds)
    {
        var parts = new Dictionary<string, string>();
        foreach (var item in header.Split(','))
        {
            var kv = item.Trim().Split(new[] { '=' }, 2);
            if (!parts.ContainsKey(kv[0]))
            {
                parts[kv[0]] = kv.Length == 2 ? kv[1] : "";
            }
        }
        string t, received;
        if (!parts.TryGetValue("t", out t) || !parts.TryGetValue("v2", out received)
            || !Regex.IsMatch(t, "^[0-9]{1,18}$") || received.Length == 0)
        {
            return false;
        }
        if (Math.Abs(nowSeconds - long.Parse(t)) > ToleranceSeconds)
        {
            return false;
        }
        var prefix = Encoding.UTF8.GetBytes(t + ".");
        var message = new byte[prefix.Length + rawBody.Length];
        Buffer.BlockCopy(prefix, 0, message, 0, prefix.Length);
        Buffer.BlockCopy(rawBody, 0, message, prefix.Length, rawBody.Length);
        string expected;
        using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key)))
        {
            expected = BitConverter.ToString(hmac.ComputeHash(message)).Replace("-", "").ToLowerInvariant();
        }
        return FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(received));
    }

    public static bool Verify(byte[] rawBody, string header, string key)
    {
        return Verify(rawBody, header, key, DateTimeOffset.UtcNow.ToUnixTimeSeconds());
    }

    // Constant-time comparison. On .NET Core 2.1+ you can use CryptographicOperations.FixedTimeEquals.
    private static bool FixedTimeEquals(byte[] a, byte[] b)
    {
        if (a.Length != b.Length)
        {
            return false;
        }
        int diff = 0;
        for (int i = 0; i < a.Length; i++)
        {
            diff |= a[i] ^ b[i];
        }
        return diff == 0;
    }
}
```

</TabItem>
<TabItem value="node" label="Node.js">

```javascript
import crypto from "node:crypto";

const TOLERANCE_SECONDS = 300;

// rawBody is the Buffer exactly as received (express.raw), never JSON.stringify(req.body).
export function verifyOttuSignature(rawBody, header, key, tolerance = TOLERANCE_SECONDS, now = Date.now() / 1000) {
  const parts = {};
  for (const item of header.split(",")) {
    const i = item.indexOf("=");
    const name = (i < 0 ? item : item.slice(0, i)).trim();
    if (!(name in parts)) parts[name] = i < 0 ? "" : item.slice(i + 1).trim();
  }
  const t = parts.t ?? "";
  const received = parts.v2 ?? "";
  if (!/^\d+$/.test(t) || !received) return false;
  if (Math.abs(now - Number(t)) > tolerance) return false;
  const expected = crypto
    .createHmac("sha256", key)
    .update(Buffer.concat([Buffer.from(`${t}.`), rawBody]))
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
```

</TabItem>
<TabItem value="ruby" label="Ruby">

```ruby
require 'openssl'

OTTU_TOLERANCE_SECONDS = 300

# raw_body is the request body exactly as received (request.raw_post in Rails,
# request.body.read in Rack/Sinatra), never re-serialised JSON.
def verify_ottu_signature(raw_body, header, key, tolerance: OTTU_TOLERANCE_SECONDS, now: Time.now.to_i)
  parts = {}
  header.split(',').each do |item|
    name, value = item.strip.split('=', 2)
    parts[name] = value.to_s unless parts.key?(name)
  end
  t = parts['t'].to_s
  received = parts['v2'].to_s
  return false unless t.match?(/\A[0-9]{1,18}\z/) && !received.empty?
  return false if (now - t.to_i).abs > tolerance

  message = "#{t}.".b + raw_body.b
  expected = OpenSSL::HMAC.hexdigest('SHA256', key, message)
  OpenSSL.secure_compare(expected, received)
end
```

</TabItem>
<TabItem value="go" label="Go">

```go
package ottu

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"regexp"
	"strconv"
	"strings"
	"time"
)

const toleranceSeconds = 300

var digitsOnly = regexp.MustCompile(`^[0-9]{1,18}$`)

// VerifyOttuSignature checks the Ottu-Signature header against rawBody, the
// request body exactly as received (io.ReadAll(r.Body)), never re-encoded JSON.
func VerifyOttuSignature(rawBody []byte, header, key string, now time.Time) bool {
	parts := map[string]string{}
	for _, item := range strings.Split(header, ",") {
		name, value, _ := strings.Cut(strings.TrimSpace(item), "=")
		if _, seen := parts[name]; !seen {
			parts[name] = value
		}
	}
	t, received := parts["t"], parts["v2"]
	if !digitsOnly.MatchString(t) || received == "" {
		return false
	}
	ts, err := strconv.ParseInt(t, 10, 64)
	if err != nil {
		return false
	}
	if diff := now.Unix() - ts; diff > toleranceSeconds || diff < -toleranceSeconds {
		return false
	}
	mac := hmac.New(sha256.New, []byte(key))
	mac.Write([]byte(t + "."))
	mac.Write(rawBody)
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(received))
}
```

</TabItem>
</Tabs>

:::info How these samples were checked
All seven samples were run, exactly as shown, against both [test vectors](#test-vectors) and return `true`. They return `false` after a one-byte change to the body, for the wrong key, for a `t` more than 300 seconds old, and for a header without `v2`.
:::

To check a vector, pass the vector's `t` as the current time (the `now` / `nowSeconds` argument): with the real clock, the old `t` of a published vector is correctly rejected as too old.

### Worked example and test vectors {#test-vectors}

Use these published values to prove your implementation before you receive live traffic. Both use:

| Input | Value |
|---|---|
| Key | `pu9MpX3yPR` |
| `t` | `1792417440` |

The signed message is `1792417440.` followed by the body bytes, exactly as sent.

| Body bytes (UTF-8, exactly as sent) | Expected `v2` |
|---|---|
| `{"id":"evt_1","data":{"customer_first_name":"Zoë احمد"}}` | `b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e` |
| The 536-byte payment payload below, byte for byte | `9ccd4a0297b242c1132e09e382fa23fc5c56720ba60ca5af028088d0bd46d823` |

The first body is UTF-8 and contains non-ASCII characters on purpose. Its full header is:

```text
Ottu-Signature: t=1792417440,v2=b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e
```

The second body is a format 2 payment payload. It is one line, with no spaces and no trailing newline:

```json title="536-byte payload"
{"amount":"86.000","currency_code":"KWD","customer_email":"jane@example.com","customer_first_name":"Jane","customer_last_name":"","gateway_account":"credit-card","gateway_name":"mpgs","order_no":"ORD-1001","reference_number":"ABC12","result":"success","state":"paid","session_id":"6c2a1f0e9b","payment_type":"auto_pay","extra":{"merchant_id":"merchant.ottu.net","autopay":{"subscription_id":"sub_1eQ"}},"token":{"token":"9923965822244314","pg_code":"credit-card","customer_id":"cust_123","brand":"VISA"},"agreement":{"id":"A123456789"}}
```

```text
Ottu-Signature: t=1792417440,v2=9ccd4a0297b242c1132e09e382fa23fc5c56720ba60ca5af028088d0bd46d823
```

For the same payload, the legacy body `signature` is `bb0e1db6fa9b7e3bd62a731a0e105431427498aa2a5a2282deee4f8737743c27`.

You can reproduce the first vector with `openssl`. `printf '%s'` adds no trailing newline, which would change the bytes:

```bash
KEY='pu9MpX3yPR'
T=1792417440
BODY='{"id":"evt_1","data":{"customer_first_name":"Zoë احمد"}}'

printf '%s' "$T.$BODY" | openssl dgst -sha256 -hmac "$KEY" | awk '{print $NF}'
# b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e
```

Each of these must be **rejected** (all with the first body and its header above):

| Change | `v2` you would compute instead |
|---|---|
| `t` changed to `1792417441` | `b8e9781183a995e3834b3fadf4b5af4db2d0b5fb5b0417ec8d17a9ad141e3f91` |
| Key `wrongkey000` | `7e13ee0138c41bb2037bb631f6f7254be8c04cecb366c8884cd680028906660d` |
| One byte of the body changed (the third-to-last byte with its lowest bit flipped) | `50cbd5f84b9cba2555d1d7349323909ef6a9e5d8db0e8cfc464e0d5b22934d4b` |
| Body parsed and re-serialised (`json.dumps` escapes `ë` and the Arabic letters) | does not match `b2303219...` |

### Versions are frozen {#versions-are-frozen}

A version's recipe never changes. Any change to what is signed or how is published as a **new version name**, sent alongside the existing one, so a verifier you write for `v2` today keeps working unchanged. When a new version appears in the header, you can adopt it at your own pace; until then, ignore it.

</TabItem>
<TabItem value="legacy" label="Body signature (legacy)">

:::warning Obsolete — for existing integrations only
The body signature is still sent with every format 1 and 2 webhook, so integrations that already verify it keep working. Do not build new integrations on it: verify the [`Ottu-Signature` header](/developers/webhooks/verify-signatures/?signature-scheme=header#signature-scheme) instead. Every webhook already carries that header.
:::

### Important Components {#legacy-important-components}

#### 1. HMAC Key (Secret Key) {#legacy-1-hmac-key-secret-key}

- This is the backbone of the signing and verification process. Merchants can retrieve their unique HMAC Key from the Webhook Configuration panel within Ottu's admin dashboard [here](/developers/webhooks).
- It's paramount that this key remains confidential. Always store it securely and avoid exposing it to the public.

#### 2. Fields for Signature {#legacy-2-fields-for-signature}

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

#### 3. Signature Creation {#legacy-3-signature-creation}

- Fields from the payload are extracted based on the aforementioned list, sorted alphabetically by key name, and then concatenated to form a unique message string.

:::warning Sort the fields before you concatenate them
The fields must be joined in **alphabetical order of their names** (plain byte order, case-sensitive), whatever order they have in the payload or in your own code. Many JSON libraries change the key order, so always sort. For example, `customer_email` comes before `customer_first_name`, and `gateway_account` comes before `gateway_name`. Joining them in any other order gives a different signature.
:::

- This string, combined with the HMAC Key, is used to create the **HMAC-SHA256** signature. This resultant signature is then dispatched with the [webhook notification](/developers/webhooks/payment-events).

#### 4. Verification by Merchant {#legacy-4-verification-by-merchant}

- On receipt of the webhook, merchants should rebuild the message string, using the listed fields.
- Generate an HMAC signature using their stored [HMAC Key](/developers/webhooks).
- Compare your result with the `signature` field of the payload. The `signature` field itself is not part of the signed fields.
- If the computed signature corresponds to the provided one, the payload's authenticity is confirmed. Any discrepancies suggest potential tampering.

:::tip
- Sign the values exactly as they arrive. All signed fields are strings (for example `"amount": "86.000"`), so don't convert them to numbers first.
- Compare the two signatures with a constant-time function instead of `==`: `hmac.compare_digest` (Python), `hash_equals` (PHP), `MessageDigest.isEqual` (Java), `CryptographicOperations.FixedTimeEquals` (C#), `crypto.timingSafeEqual` (Node.js), `OpenSSL.secure_compare` (Ruby), `hmac.Equal` (Go).
:::

### Example {#legacy-example}

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

1. Keep only the fields from the [Fields for Signature](#legacy-2-fields-for-signature) list that have a non-empty value. Here `session_id` is not in the list and `customer_last_name` is empty, so both are left out.
2. Sort the remaining field names alphabetically.
3. Concatenate each field name followed by its value, with no separator:

   ```text
   amount86.000currency_codeKWDcustomer_emailcustomer@example.comcustomer_first_nameexample-customergateway_accountknetgateway_namekpayorder_noORDER-1001reference_numberABC12resultsuccessstatepaid
   ```

4. Apply the HMAC algorithm using the **SHA256** hash function and the provided HMAC key.

Following these steps, the resulting signature is:

`29e70de083707b3a738e9d5f4df4e4481d082c4614db97a55f50d4b4583dc5f2`

Developers should compare this generated signature to the signature received in the webhook payload to validate its authenticity.

### Signature Generation {#legacy-signature-generation}

Ensuring the integrity and authenticity of webhook payloads is paramount for the security of both the service provider and the merchants. To achieve this, an HMAC (Hash-Based Message Authentication Code) signature is generated and sent along with the payload. This signature needs to be validated at the merchant's end to confirm that the data has not been tampered with. For the convenience of developers working with different programming languages, we provide ready-to-use code snippets in various popular languages to generate and verify this HMAC signature. This section showcases how to compute the HMAC signature for the payload in languages like Python, PHP, Java, .NET (C#), Node.js, Ruby, and Go.

### Specific Examples {#legacy-specific-examples}

Each snippet below signs the [example payload](#legacy-example) above. Run it and the printed result should be `29e70de083707b3a738e9d5f4df4e4481d082c4614db97a55f50d4b4583dc5f2`.

<Tabs groupId="language">
<TabItem value="python" label="Python">

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

</TabItem>
<TabItem value="php" label="PHP">

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

</TabItem>
<TabItem value="java" label="Java">

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

</TabItem>
<TabItem value="csharp" label=".NET (C#)">

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
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
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

</TabItem>
<TabItem value="node" label="Node.js">

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

</TabItem>
<TabItem value="ruby" label="Ruby">

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

# payload must use string keys, as JSON.parse(body) returns them.
# With symbolize_names: true every field is skipped.
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

</TabItem>
<TabItem value="go" label="Go">

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

</TabItem>
</Tabs>

The above examples provide a way for developers in different languages to generate the HMAC signature from a payload using the provided HMAC key.

</TabItem>
</Tabs>

## Legacy body signature at a glance {#legacy-body-signature}

<span id="important-components"></span><span id="1-hmac-key-secret-key"></span><span id="2-fields-for-signature"></span><span id="3-signature-creation"></span><span id="4-verification-by-merchant"></span><span id="example"></span><span id="signature-generation"></span><span id="specific-examples"></span><span id="python"></span><span id="php"></span><span id="java"></span><span id="net-c"></span><span id="nodejs"></span><span id="ruby"></span><span id="go"></span>

The body `signature` field is the legacy scheme, kept for integrations that already verify it. It is the HMAC-SHA256 (hex) of the signed fields' names and values concatenated with no separator, over these 18 fields only, in alphabetical order of the field name, skipping any field that is missing or empty: `amount`, `currency_code`, `customer_address_city`, `customer_address_country`, `customer_address_line1`, `customer_address_line2`, `customer_address_postal_code`, `customer_address_state`, `customer_email`, `customer_first_name`, `customer_last_name`, `customer_phone`, `gateway_account`, `gateway_name`, `order_no`, `reference_number`, `result`, `state`.

The full recipe, a worked example and code in seven languages are on the [Body signature (legacy) tab](/developers/webhooks/verify-signatures/?signature-scheme=legacy#signature-scheme). New integrations should verify the [`Ottu-Signature` header](#ottu-signature-header) instead.

## Where signatures appear {#where-signatures-appear}

The body `signature` field (the [legacy 18-field recipe](#legacy-body-signature)) is also returned by the synchronous responses of these endpoints. They do not carry an `Ottu-Signature` header.

| Endpoint | Notes |
|---|---|
| `POST /b/pbl/v2/payment/auto-debit` | Charging a saved token (MIT) |
| `POST /b/pbl/v2/payment/apple-pay` | [Native payments](/developers/payments/native-payments) |
| `POST /b/pbl/v2/payment/google-pay` | [Native payments](/developers/payments/native-payments) |
| `POST /b/pbl/v2/payment/wallet` | [Wallet](/developers/payments/wallet) balance payment |
| `POST /b/pbl/v2/payment/cash` | Cash / COD acknowledgement |
| `POST /b/pbl/v2/sign/` | Signs a payload you supply, using your HMAC Key. See [Sign API](#sign-api) |

Those five payment responses share the payment-webhook body shape, so they also carry `extra.merchant_id` (see below).

## Sign API {#sign-api}

`POST /b/pbl/v2/sign/` signs the request body you send with your HMAC Key and returns both signatures. Use it to check your implementation: post a body to it and compare the values it returns with what your own code computes for the same bytes. It uses the same [authentication](/developers/getting-started/authentication) as the other operations endpoints and requires the permission to view the webhook configuration.

**Query parameter**

| Parameter | Type | Required | Meaning |
|---|---|---|---|
| `t` | integer | No | Unix time in seconds to sign with. Defaults to the current time. Pass a fixed `t` to reproduce a [test vector](#test-vectors). |

**Request body:** the JSON payload to sign (for example a payment body).

**Response (200)**

| Key | Meaning |
|---|---|
| `signature` | The [legacy body signature](#legacy-body-signature) of the payload. |
| `ottu_signature` | `t=<t>,v2=<hex>`: the [`Ottu-Signature` header](#ottu-signature-header) value for the **exact bytes** of the request body you sent, and that `t`. |

<CodeBlock language="bash" title="Sign a payload with a fixed t">{`curl --location '${OTTU_CONNECT_BASE_URL}/b/pbl/v2/sign/?t=1792417440' \\
  --header 'Authorization: Api-Key YOUR_API_KEY' \\
  --header 'Content-Type: application/json' \\
  --data '{"amount": "86.000", "currency_code": "KWD", "customer_first_name": "example-customer"}'`}</CodeBlock>

<CodeBlock language="json" title="Response">{`{
  "signature": "6143b8ad4bd283540721ab000f6de746e722231aaaa90bc38f639081d3ff9f67",
  "ottu_signature": "t=1792417440,v2=460dab8fd7b2418f87575841c2cf69ee4392ba6ce45bf43af1cafb1dc9644e8b"
}`}</CodeBlock>

:::note `v2` follows the bytes, `signature` follows the fields
`ottu_signature` is computed over the body exactly as you sent it, spaces included. Sending the same payload compactly, `{"amount":"86.000","currency_code":"KWD","customer_first_name":"example-customer"}`, returns `t=1792417440,v2=cf24962667741ed9396bd1d7352783cf997fcef6ceff53c477eb67e7e7d7f475`, while `signature` stays `6143b8ad...` because it is computed from the parsed fields.
:::

**Errors**

| Status | Body | Cause | Fix |
|---|---|---|---|
| 400 | `{"t": "Must be a unix timestamp in seconds.", "code": "invalid_t"}` | `t` is not an integer | Send whole seconds, for example `t=1792417440` |
| 401 | authentication error | Missing or invalid credentials | See [Authentication](/developers/getting-started/authentication) |
| 403 | permission error | The caller cannot view the webhook configuration | Use a user with that permission |

## Payload additions you should know about {#payload-additions}

Two related additions affect formats 1 and 2, and the distinction between them matters for security.

**`extra.merchant_id` is always present now**, even when you sent no `extra` object on the checkout call. It holds your merchant domain. It is covered by the [`Ottu-Signature` header](#every-byte-is-signed), like every byte of the body. It is **not** one of the 18 fields of the legacy body `signature`.

**A top-level `autopay` block may be present** on payments created through [AutoPay](/developers/payments/autopay). It sits at the top level of the payload, *not* under `extra`, and contains `subscription_id`, `subscription_status`, `cycle_number`, `cycle_status`, `next_billing_date` and `event_type`. It is not part of a format 3 `data.payment`.

:::warning Treat the top-level `autopay` block as informational
It is added after the legacy body `signature` is computed, so that signature does not cover it (the `Ottu-Signature` header does, because it signs the whole body). More importantly, it is fetched live from the AutoPay service while the webhook is being assembled, with a short timeout, and is **silently omitted** if that lookup times out or fails:

- **Never** make a security or money-moving decision based on it. Use `extra.autopay.subscription_id` (verified with the `Ottu-Signature` header) to identify the subscription, then read authoritative state from the [subscription endpoints](/developers/payments/autopay#api-reference).
- Its absence means the lookup did not complete. It does **not** mean the payment is not an AutoPay payment.
- `event_type` is one of `cit_success`, `cit_failure`, `mit_success`, `mit_failure`, `card_updated`, or `null`. `null` means the setup outcome is still undecided, not that it succeeded. It's AutoPay's own best-guess classification, computed independently of the payment result; it is **not** authoritative. Read `result` and `state` on the payment for the actual outcome.
:::

**Need Further Assistance?** Our dedicated support team is always on hand to help. Reach out to us at [support@ottu.com](mailto:support@ottu.com).

## Related

- [Webhooks Overview](/developers/webhooks)
- [Payment States](/developers/reference/payment-states)
- [Authentication](/developers/getting-started/authentication)

## What's Next?

- [**Webhook Events (v3)**](/developers/webhooks/event-catalogue) — The format 3 envelope and every event type
- [**Delivery and Retries**](/developers/webhooks/delivery-and-retries) — Success rules, retry schedule and `Idempotency-Key`
- [**Migrating to v3**](/developers/webhooks/migrate-to-v3) — Format 1 and 2 to format 3
- [**Payment Events**](/developers/webhooks/payment-events) — Payment webhook payload reference
- [**Operation Events**](/developers/webhooks/operation-events) — Operation webhook payload reference
- [**AutoPay**](/developers/payments/autopay) — Subscriptions, and the `autopay` payload blocks described above
- [**Webhooks Overview**](./) — Setup, delivery guarantees, and configuration
