---
title: Verify Signatures
sidebar_label: Verify Signatures
description: Verify the Ottu-Signature header on every webhook - v2, HMAC-SHA256 over t and the raw body, on formats 1, 2 and 3 - plus the body signature of formats 1 and 2, with code in eight languages, published test vectors and an in-browser lab.
---

import SignatureLab from "@site/src/components/SignatureLab";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";
import { OTTU_CONNECT_BASE_URL } from "@site/src/constants/api";

# Verify Signatures

Every [webhook](/developers/webhooks/event-catalogue) Ottu sends is signed with HMAC-SHA256 and your HMAC key, so you can prove it came from Ottu and was not changed on the way. Every [webhook format](/developers/webhooks/migrate-to-v3#formats) carries the same `Ottu-Signature` header; formats 1 and 2 also keep a `signature` field in the body. This page gives the exact recipe, published test vectors and working code for each.

:::tip Start with three sections
[Verify v2](#verify-v2) (the recipe and code in eight languages), [Test vectors](#test-vectors) (prove your code), and [Try it in your browser](#signature-lab). They apply to every format. Everything from [Body signature](#body-signature) down is extra material for formats 1 and 2.
:::

## Which signature do I verify? {#which-signature}

| Webhook format | Where the signature is | What is signed | Verify this |
|---|---|---|---|
| **1, 2 and 3** | `Ottu-Signature` header, `v2=` part | `<t>.` followed by the **raw body bytes** | [`v2` over the raw body](#verify-v2) |
| **1 and 2** (additionally) | `signature` field in the JSON body | 18 fields concatenated | [Body signature](#body-signature) (unchanged) |
| Synchronous responses and the [Sign API](#sign-api) | `signature` field, and `ottu_signature` on the Sign API | `signature`: the same 18-field recipe as the body signature. `ottu_signature`: the `v2` header value over the exact request body, for the `t` you pass. | [Sign API](#sign-api) |

:::note Header versions
`v2` is the only header version, and every format sends it: `t=<t>,v2=<hex>`. On formats 1 and 2, verify the header `v2` exactly as on format 3; you can additionally check the body `signature` field with the [18-field recipe](#body-signature). A signing failure never blocks the delivery: if the header is missing, treat the request as unsigned and reject it.
:::

## The Ottu-Signature header {#ottu-signature-header}

Every webhook delivery, on every format, carries one header. The example below is the header for the [test vector](#test-vectors) body.

```text
Ottu-Signature: t=1792417440,v2=b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e
```

| Part | Meaning |
|---|---|
| `t` | Unix time in **seconds** when this attempt was signed. It is recomputed for **every attempt**, so a retry has a new `t` and a new signature. |
| `v2` | `HMAC-SHA256(key, "<t>." + raw body bytes)`, hex-encoded, lowercase. |

The key is your **HMAC Key** from the Webhook configuration, the same key as for the body signature. Parts are separated by commas; read them by name, not by position.

### Verify v2 {#verify-v2}

1. Read the **raw request body** as bytes, before any JSON parsing.
2. Split the header on `,`, then each part on the first `=`. Take `t` and `v2`.
3. Reject if `t` is more than **300 seconds** from your clock (replay protection).
4. Compute `HMAC-SHA256(key, t + "." + raw_body)` and hex-encode it.
5. Compare with `v2` using a **constant-time** comparison.

:::danger Never re-serialise the body before verifying
`v2` covers the exact bytes Ottu sent. Parsing the JSON and dumping it again changes spacing, key order and non-ASCII escaping, and the signature then fails (or, worse, you are tempted to disable the check). Read the raw body first, verify, and only then parse it. In Express use `express.raw()`, in Flask `request.get_data()`, in PHP `file_get_contents('php://input')`.
:::

<Tabs groupId="language">
<TabItem value="curl" label="cURL">

Compute the expected `v2` for a body you saved, with `openssl`. `printf '%s'` adds no trailing newline, which would change the bytes.

```bash title="Compute v2 with openssl"
KEY='pu9MpX3yPR'
T=1792417440
BODY='{"id":"evt_1","data":{"customer_first_name":"Zoë احمد"}}'

printf '%s' "$T.$BODY" | openssl dgst -sha256 -hmac "$KEY" | awk '{print $NF}'
# b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e
```

</TabItem>
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
        parts[name] = value
    if "t" not in parts or "v2" not in parts:
        return False
    if not (parts["t"].isascii() and parts["t"].isdigit()):
        return False
    if abs((now if now is not None else time.time()) - int(parts["t"])) > tolerance:
        return False
    expected = hmac.new(key.encode(), f"{parts['t']}.".encode() + raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, parts["v2"])
```

</TabItem>
<TabItem value="node" label="Node.js">

```javascript
import crypto from "node:crypto";

const TOLERANCE_SECONDS = 300;

// rawBody must be the Buffer exactly as received (express.raw), never JSON.stringify(req.body).
export function verifyOttuSignature(rawBody, header, key, tolerance = TOLERANCE_SECONDS, now = Date.now() / 1000) {
  const parts = Object.fromEntries(
    header.split(",").map((item) => {
      const i = item.indexOf("=");
      return i < 0 ? [item.trim(), ""] : [item.slice(0, i).trim(), item.slice(i + 1)];
    }),
  );
  if (!/^\d+$/.test(parts.t ?? "") || !parts.v2) return false;
  if (Math.abs(now - Number(parts.t)) > tolerance) return false;
  const expected = crypto
    .createHmac("sha256", key)
    .update(Buffer.concat([Buffer.from(`${parts.t}.`), rawBody]))
    .digest("hex");
  const received = Buffer.from(parts.v2, "utf8");
  const wanted = Buffer.from(expected, "utf8");
  return received.length === wanted.length && crypto.timingSafeEqual(received, wanted);
}
```

</TabItem>
<TabItem value="php" label="PHP">

```php
<?php
function verifyOttuSignature(string $rawBody, string $header, string $key, int $tolerance = 300, ?int $now = null): bool {
    // $rawBody = file_get_contents('php://input'); the exact bytes, never json_encode($decoded)
    $parts = [];
    foreach (explode(',', $header) as $item) {
        [$name, $value] = array_pad(explode('=', trim($item), 2), 2, '');
        $parts[$name] = $value;
    }
    if (!isset($parts['t'], $parts['v2']) || !ctype_digit($parts['t'])) {
        return false;
    }
    if (abs(($now ?? time()) - (int) $parts['t']) > $tolerance) {
        return false;
    }
    $expected = hash_hmac('sha256', $parts['t'] . '.' . $rawBody, $key);
    return hash_equals($expected, $parts['v2']);
}
```

</TabItem>
<TabItem value="go" label="Go">

```go
package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"strconv"
	"strings"
	"time"
)

const ToleranceSeconds = 300

// rawBody must be the request body exactly as received (io.ReadAll(r.Body)), never re-marshalled JSON.
// Pass now = 0 to use the current time.
func VerifyOttuSignature(rawBody []byte, header, key string, tolerance int64, now int64) bool {
	parts := map[string]string{}
	for _, item := range strings.Split(header, ",") {
		name, value, _ := strings.Cut(strings.TrimSpace(item), "=")
		parts[name] = value
	}
	t, v2 := parts["t"], parts["v2"]
	if t == "" || v2 == "" || strings.Trim(t, "0123456789") != "" {
		return false
	}
	ts, err := strconv.ParseInt(t, 10, 64)
	if err != nil {
		return false
	}
	if now == 0 {
		now = time.Now().Unix()
	}
	if d := now - ts; d > tolerance || -d > tolerance {
		return false
	}
	mac := hmac.New(sha256.New, []byte(key))
	mac.Write([]byte(t + "."))
	mac.Write(rawBody)
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(v2))
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

public final class OttuSignature {
    public static final long TOLERANCE_SECONDS = 300;

    public static boolean verifyOttuSignature(byte[] rawBody, String header, String key) throws Exception {
        return verifyOttuSignature(rawBody, header, key, TOLERANCE_SECONDS, null);
    }

    // rawBody is the request body exactly as received (byte[]), never re-serialised JSON.
    public static boolean verifyOttuSignature(byte[] rawBody, String header, String key, long tolerance, Long now)
            throws Exception {
        Map<String, String> parts = new HashMap<>();
        for (String item : header.split(",")) {
            String[] kv = item.trim().split("=", 2);
            parts.put(kv[0], kv.length > 1 ? kv[1] : "");
        }
        String t = parts.get("t"), v2 = parts.get("v2");
        if (t == null || v2 == null || !t.matches("[0-9]{1,18}")) {
            return false;
        }
        long nowSeconds = now != null ? now : System.currentTimeMillis() / 1000;
        if (Math.abs(nowSeconds - Long.parseLong(t)) > tolerance) {
            return false;
        }
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        mac.update((t + ".").getBytes(StandardCharsets.UTF_8));
        StringBuilder expected = new StringBuilder();
        for (byte b : mac.doFinal(rawBody)) {
            expected.append(String.format("%02x", b));
        }
        return MessageDigest.isEqual(expected.toString().getBytes(StandardCharsets.UTF_8),
                v2.getBytes(StandardCharsets.UTF_8));
    }
}
```

</TabItem>
<TabItem value="csharp" label="C#">

```csharp
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;

public static class OttuSignature
{
    public const long ToleranceSeconds = 300;

    // rawBody is the request body exactly as received (byte[]), never re-serialised JSON.
    public static bool VerifyOttuSignature(byte[] rawBody, string header, string key,
                                           long tolerance = ToleranceSeconds, long? now = null)
    {
        var parts = new Dictionary<string, string>();
        foreach (var item in header.Split(','))
        {
            var kv = item.Trim().Split('=', 2);
            parts[kv[0]] = kv.Length > 1 ? kv[1] : "";
        }
        if (!parts.TryGetValue("t", out var t) || !parts.TryGetValue("v2", out var v2)
            || !long.TryParse(t, NumberStyles.None, CultureInfo.InvariantCulture, out var ts))
            return false;
        if (Math.Abs((now ?? DateTimeOffset.UtcNow.ToUnixTimeSeconds()) - ts) > tolerance)
            return false;

        var prefix = Encoding.UTF8.GetBytes(t + ".");
        var message = new byte[prefix.Length + rawBody.Length];
        prefix.CopyTo(message, 0);
        rawBody.CopyTo(message, prefix.Length);
        var expected = Convert.ToHexString(HMACSHA256.HashData(Encoding.UTF8.GetBytes(key), message)).ToLowerInvariant();
        return CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(v2));
    }
}
```

</TabItem>
<TabItem value="ruby" label="Ruby">

```ruby
require "openssl"

TOLERANCE_SECONDS = 300

# raw_body is the request body exactly as received (request.body.read), never re-serialised JSON.
def verify_ottu_signature(raw_body, header, key, tolerance = TOLERANCE_SECONDS, now = Time.now.to_i)
  parts = header.split(",").to_h do |item|
    name, value = item.strip.split("=", 2)
    [name, value.to_s]
  end
  t, v2 = parts["t"], parts["v2"]
  return false if t.nil? || v2.nil? || !t.match?(/\A\d+\z/)
  return false if (now - t.to_i).abs > tolerance

  expected = OpenSSL::HMAC.hexdigest("SHA256", key, "#{t}.".b + raw_body.b)
  expected.bytesize == v2.bytesize && OpenSSL.fixed_length_secure_compare(expected, v2)
end
```

</TabItem>
</Tabs>

### Test vectors {#test-vectors}

Use these published values to prove your implementation before you receive live traffic. The body is UTF-8 and contains non-ASCII characters on purpose.

| Input | Value |
|---|---|
| Key | `pu9MpX3yPR` |
| `t` | `1792417440` |
| Raw body (UTF-8) | `{"id":"evt_1","data":{"customer_first_name":"Zoë احمد"}}` |
| Expected `v2` | `b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e` |
| Header | `t=1792417440,v2=b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e` |

Each of these must be **rejected**:

| Change | `v2` you would get |
|---|---|
| `t` changed to `1792417441` | `b8e9781183a995e3834b3fadf4b5af4db2d0b5fb5b0417ec8d17a9ad141e3f91` |
| Key `wrongkey000` | `7e13ee0138c41bb2037bb631f6f7254be8c04cecb366c8884cd680028906660d` |
| Body re-serialised with non-ASCII escaped (`json.dumps`) | does not match `b2303219...` |

Pass `now=1792417440` (the `now` argument in the samples above) so that the old `t` of the vector is inside the tolerance window. With the real clock the same header is correctly rejected as too old.

### Try it in your browser {#signature-lab}

Sign a body and see the exact header Ottu would send, check a header you received step by step, or copy a signed `curl` to test your own receiver. It runs in this page: the key never leaves your browser.

<SignatureLab />

---

:::note Formats 1 and 2 from here
The rest of this page covers what formats 1 and 2 add on top of the header: the body `signature` field, the Sign API and the synchronous responses. A format 3 receiver needs none of it.
:::

### No `v1` header part {#header-v1}

There is no `v1` part in the `Ottu-Signature` header. Formats 1 and 2 send the same `v2` as format 3, so [verify `v2`](#verify-v2) on them too. "v1" referred to the [body signature](#body-signature), the `signature` field inside the JSON body, which never moves into the header.

### Body signature (formats 1 and 2) {#body-signature}

The `signature` field inside a format 1 or 2 body is **unchanged**. It is the HMAC-SHA256 (hex) of the concatenation of `fieldvalue` pairs, with no separators, over these 18 fields only, in **alphabetical order of the field name**, skipping any field that is missing or empty:

`amount`, `currency_code`, `customer_address_city`, `customer_address_country`, `customer_address_line1`, `customer_address_line2`, `customer_address_postal_code`, `customer_address_state`, `customer_email`, `customer_first_name`, `customer_last_name`, `customer_phone`, `gateway_account`, `gateway_name`, `order_no`, `reference_number`, `result`, `state`.

```python
import hashlib
import hmac

BODY_SIGNATURE_FIELDS = {
    "amount", "currency_code", "customer_address_city", "customer_address_country",
    "customer_address_line1", "customer_address_line2", "customer_address_postal_code",
    "customer_address_state", "customer_email", "customer_first_name", "customer_last_name",
    "customer_phone", "gateway_account", "gateway_name", "order_no", "reference_number",
    "result", "state",
}


def body_signature(payload: dict, key: str) -> str:
    message = "".join(
        f"{name}{payload[name]}"
        for name in sorted(payload)
        if name in BODY_SIGNATURE_FIELDS and payload[name]
    )
    return hmac.new(key.encode(), message.encode(), hashlib.sha256).hexdigest()
```

Test vector: key `pu9MpX3yPR` and payload `{"amount": "86.000", "currency_code": "KWD", "customer_first_name": "example-customer"}` give `6143b8ad4bd283540721ab000f6de746e722231aaaa90bc38f639081d3ff9f67`. Format 3 has no body `signature` field: its authenticity comes from the [`Ottu-Signature` header](#ottu-signature-header) only.

:::info How these samples were checked
- **`v2` verifiers [above](#verify-v2):** all were run against the [`v2` vectors](#test-vectors). The openssl command produces the expected `v2`; the seven verifiers (Python, Node.js, PHP, Go, Java, C# on .NET 8, Ruby 3.3) accept the vector and reject the changed `t`, the wrong key, and the vector's old `t` on the real clock.
- **Body signature sample (Python):** run against the test vector above and returns `6143b8ad...`.
:::

## Where signatures appear {#where-signatures-appear}

The body `signature` field (the [18-field recipe](#body-signature)) is also returned by the synchronous responses of these endpoints:

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

`POST /b/pbl/v2/sign/` signs a JSON payload you send with your HMAC Key. Use it while migrating: post a payload to it and compare the values it returns with what your own implementation produces for the same payload. It uses the same [authentication](/developers/getting-started/authentication) as the other operations endpoints and requires the permission to view the webhook configuration.

**Query parameter**

| Parameter | Type | Required | Meaning |
|---|---|---|---|
| `t` | integer | No | Unix time in seconds to sign with. Defaults to the current time. Pass a fixed `t` to reproduce a [test vector](#test-vectors). |

**Request body:** the JSON payload to sign (for example a payment body).

**Response (200)**

| Key | Meaning |
|---|---|
| `signature` | The [body signature](#body-signature) of the payload. |
| `ottu_signature` | `t=<t>,v2=<hex>`: the [`v2` header value](#verify-v2) computed over the **exact bytes of your request body** and `t`. |

For an account whose HMAC key is `pu9MpX3yPR`, this request with a fixed `t` returns the response below. `ottu_signature` signs the `--data` string byte for byte, spaces included, so send exactly the bytes your own code signs.

<CodeBlock language="bash" title="Sign a payload with a fixed t">{`curl --location '${OTTU_CONNECT_BASE_URL}/b/pbl/v2/sign/?t=1792417440' \\
  --header 'Authorization: Api-Key YOUR_API_KEY' \\
  --header 'Content-Type: application/json' \\
  --data '{"amount": "86.000", "currency_code": "KWD", "customer_first_name": "example-customer"}'`}</CodeBlock>

<CodeBlock language="json" title="Response">{`{
  "signature": "6143b8ad4bd283540721ab000f6de746e722231aaaa90bc38f639081d3ff9f67",
  "ottu_signature": "t=1792417440,v2=460dab8fd7b2418f87575841c2cf69ee4392ba6ce45bf43af1cafb1dc9644e8b"
}`}</CodeBlock>

**Errors**

| Status | Body | Cause | Fix |
|---|---|---|---|
| 400 | `{"t": "Must be a unix timestamp in seconds.", "code": "invalid_t"}` | `t` is not an integer | Send whole seconds, for example `t=1792417440` |
| 401 | authentication error | Missing or invalid credentials | See [Authentication](/developers/getting-started/authentication) |
| 403 | permission error | The caller cannot view the webhook configuration | Use a user with that permission |

:::tip Checking your `v2` code with the Sign API
`ottu_signature` is `v2` over the request body exactly as you sent it, not over a re-serialised copy. Compute `HMAC-SHA256(key, "<t>." + those same bytes)` in your code and compare. The earlier `signature_v2` response key is gone; use `ottu_signature`. The [published vector](#test-vectors) works without a call.
:::

## Payload additions you should know about {#payload-additions}

Two related additions land alongside this change, and the distinction between them matters for security.

**`extra.merchant_id` is always present now**, even when you sent no `extra` object on the checkout call. It holds your merchant domain. Like every byte of the body, it is covered by the [`v2` header signature](#verify-v2); it is not one of the 18 fields of the [body signature](#body-signature).

**A top-level `autopay` block may be present** on payments created through [AutoPay](/developers/payments/autopay). It sits at the top level of the payload, *not* under `extra`, and contains `subscription_id`, `subscription_status`, `cycle_number`, `cycle_status`, `next_billing_date` and `event_type`.

:::warning Treat the top-level `autopay` block as informational
The `v2` header signs it like the rest of the body when it is present, but it is not part of the [body signature](#body-signature). It is fetched live from the AutoPay service while the response is being assembled, with a short timeout, and is **silently omitted** if that lookup times out or fails. Treat it as informational only:

- **Never** make a security or money-moving decision based on it. Use `extra.autopay.subscription_id` to identify the subscription, then read authoritative state from the [subscription endpoints](/developers/payments/autopay#api-reference).
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
