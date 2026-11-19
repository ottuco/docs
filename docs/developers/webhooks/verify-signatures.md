---
title: Verify Signatures
sidebar_label: Verify Signatures
description: Verify the Ottu-Signature header on every webhook - HMAC-SHA256 over the timestamp and the raw body - with code in eight languages and published test vectors.
displayed_sidebar: developerSidebar
hide_table_of_contents: true
---

import CodeBlock from "@theme/CodeBlock";
import { OTTU_CONNECT_BASE_URL } from "@site/src/constants/api";
import Beside, { Visual } from "@site/src/components/Beside";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Verify Signatures

Ottu signs every [webhook](/developers/webhooks#api-reference) with HMAC-SHA256 and your HMAC key. Verifying the signature proves the request came from Ottu and was not changed on the way. Do it before you parse the body.

## Which signature do I verify? {#which-signature}

One: the `v2` part of the **`Ottu-Signature` header**, computed over the timestamp and the **raw body bytes**. The key is the **HMAC Key** from [Webhook Config](/developers/webhooks#admin-setup).

If the header is missing, treat the request as unsigned and reject it.

## The Ottu-Signature header {#ottu-signature-header}

<Beside>

Every delivery carries one header, on one line. The example is the header for the [test vector](#test-vectors) body. The parts are separated by commas: read them by name, not by position.

#### `t` {#header-t}

Unix time in **seconds** when this attempt was signed. Ottu signs every attempt again, so a retry has a new `t` and a new signature.

#### `v2` {#header-v2}

`HMAC-SHA256(key, "{t}." + raw body bytes)`, hex-encoded, lowercase.

<Visual>

```text title="The header"
Ottu-Signature: t=1792417440,v2=b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e
```

</Visual>

</Beside>

### Verify v2 {#verify-v2}

<Beside>

1. Read the **raw request body** as bytes, before any JSON parsing.
2. Split the header on `,`, then each part on the first `=`. Take `t` and `v2`.
3. Reject the request when `t` is more than **300 seconds** from your clock. This stops a captured request from being replayed.
4. Compute `HMAC-SHA256(key, t + "." + raw_body)` and hex-encode it.
5. Compare it with `v2` using a **constant-time** comparison.

:::danger Never re-serialise the body before verifying
`v2` covers the exact bytes Ottu sent. Parsing the JSON and dumping it again changes spacing, key order and the escaping of non-ASCII characters, and the signature then fails. Read the raw body first, verify, and only then parse it: `express.raw()` in Express, `request.get_data()` in Flask, `file_get_contents('php://input')` in PHP.
:::

More frameworks: [Raw-body recipes](/developers/webhooks#raw-body-recipes).

<Visual>

<Tabs groupId="language">
<TabItem value="curl" label="cURL">

Compute the expected `v2` for a body you saved, with `openssl`. `printf '%s'` adds no trailing newline, which would change the bytes.

```bash title="Compute v2 with openssl"
KEY='pu9MpX3yPR'
T=1792417440
BODY='{"id":"evt_1","data":{"customer_first_name":"Zoë احمد"}}'

printf '%s' "$T.$BODY" |
  openssl dgst -sha256 -hmac "$KEY" |
  awk '{print $NF}'
# b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e
```

</TabItem>
<TabItem value="python" label="Python">

```python
import hashlib
import hmac
import time

TOLERANCE_SECONDS = 300


def verify_ottu_signature(
    raw_body: bytes,
    header: str,
    key: str,
    tolerance: int = TOLERANCE_SECONDS,
    now: "float | None" = None
) -> bool:
    """raw_body is the request body exactly as received
    (bytes), never re-serialised JSON."""
    parts = {}
    for item in header.split(","):
        name, _, value = item.strip().partition("=")
        parts[name] = value
    if "t" not in parts or "v2" not in parts:
        return False
    if not (
        parts["t"].isascii() and parts["t"].isdigit()
    ):
        return False
    if abs(
        (now if now is not None else time.time())
        - int(parts["t"])
    ) > tolerance:
        return False
    expected = hmac.new(
        key.encode(),
        f"{parts['t']}.".encode() + raw_body,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, parts["v2"])
```

</TabItem>
<TabItem value="node" label="Node.js">

```javascript
import crypto from "node:crypto";

const TOLERANCE_SECONDS = 300;

// rawBody must be the Buffer exactly as received
// (express.raw), never JSON.stringify(req.body).
export function verifyOttuSignature(
  rawBody,
  header,
  key,
  tolerance = TOLERANCE_SECONDS,
  now = Date.now() / 1000
) {
  const parts = Object.fromEntries(
    header.split(",").map((item) => {
      const i = item.indexOf("=");
      return i < 0
        ? [item.trim(), ""]
        : [item.slice(0, i).trim(), item.slice(i + 1)];
    }),
  );
  if (!/^\d+$/.test(parts.t ?? "") || !parts.v2)
    return false;
  if (Math.abs(now - Number(parts.t)) > tolerance)
    return false;
  const expected = crypto
    .createHmac("sha256", key)
    .update(
      Buffer.concat([
        Buffer.from(`${parts.t}.`),
        rawBody
      ])
    )
    .digest("hex");
  const received = Buffer.from(parts.v2, "utf8");
  const wanted = Buffer.from(expected, "utf8");
  return received.length === wanted.length &&
    crypto.timingSafeEqual(received, wanted);
}
```

</TabItem>
<TabItem value="php" label="PHP">

```php
<?php
function verifyOttuSignature(
    string $rawBody,
    string $header,
    string $key,
    int $tolerance = 300,
    ?int $now = null
): bool {
    // $rawBody = file_get_contents('php://input');
    // the exact bytes, never json_encode($decoded)
    $parts = [];
    foreach (explode(',', $header) as $item) {
        [$name, $value] = array_pad(
            explode('=', trim($item), 2),
            2,
            ''
        );
        $parts[$name] = $value;
    }
    if (!isset($parts['t'], $parts['v2'])
        || !ctype_digit($parts['t'])) {
        return false;
    }
    if (abs(($now ?? time()) - (int) $parts['t'])
        > $tolerance) {
        return false;
    }
    $expected = hash_hmac(
        'sha256',
        $parts['t'] . '.' . $rawBody,
        $key
    );
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

// rawBody must be the request body exactly as received
// (io.ReadAll(r.Body)), never re-marshalled JSON.
// Pass now = 0 to use the current time.
func VerifyOttuSignature(
  rawBody []byte,
  header, key string,
  tolerance int64,
  now int64) bool {
  parts := map[string]string{}
  for _, item := range strings.Split(header, ",") {
    name, value, _ := strings.Cut(
      strings.TrimSpace(item), "=")
    parts[name] = value
  }
  t, v2 := parts["t"], parts["v2"]
  if t == "" || v2 == "" ||
    strings.Trim(t, "0123456789") != "" {
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

  public static boolean verifyOttuSignature(
      byte[] rawBody, String header, String key)
      throws Exception {
    return verifyOttuSignature(
        rawBody, header, key, TOLERANCE_SECONDS, null);
  }

  // rawBody is the request body exactly as received
  // (byte[]), never re-serialised JSON.
  public static boolean verifyOttuSignature(
      byte[] rawBody, String header, String key,
      long tolerance, Long now)
      throws Exception {
    Map<String, String> parts = new HashMap<>();
    for (String item : header.split(",")) {
      String[] kv = item.trim().split("=", 2);
      parts.put(kv[0], kv.length > 1 ? kv[1] : "");
    }
    String t = parts.get("t"), v2 = parts.get("v2");
    if (t == null || v2 == null
        || !t.matches("[0-9]{1,18}")) {
      return false;
    }
    long nowSeconds = now != null
        ? now
        : System.currentTimeMillis() / 1000;
    if (Math.abs(nowSeconds - Long.parseLong(t))
        > tolerance) {
      return false;
    }
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(
        key.getBytes(StandardCharsets.UTF_8),
        "HmacSHA256"));
    mac.update(
        (t + ".").getBytes(StandardCharsets.UTF_8));
    StringBuilder expected = new StringBuilder();
    for (byte b : mac.doFinal(rawBody)) {
      expected.append(String.format("%02x", b));
    }
    return MessageDigest.isEqual(
        expected.toString()
            .getBytes(StandardCharsets.UTF_8),
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

    // rawBody is the request body exactly as received
    // (byte[]), never re-serialised JSON.
    public static bool VerifyOttuSignature(
        byte[] rawBody,
        string header,
        string key,
        long tolerance = ToleranceSeconds,
        long? now = null)
    {
        var parts = new Dictionary<string, string>();
        foreach (var item in header.Split(','))
        {
            var kv = item.Trim().Split('=', 2);
            parts[kv[0]] = kv.Length > 1 ? kv[1] : "";
        }
        if (!parts.TryGetValue("t", out var t)
            || !parts.TryGetValue("v2", out var v2)
            || !long.TryParse(
                t,
                NumberStyles.None,
                CultureInfo.InvariantCulture,
                out var ts))
            return false;
        if (Math.Abs(
                (now ?? DateTimeOffset.UtcNow
                    .ToUnixTimeSeconds()) - ts)
            > tolerance)
            return false;

        var prefix = Encoding.UTF8.GetBytes(t + ".");
        var message =
            new byte[prefix.Length + rawBody.Length];
        prefix.CopyTo(message, 0);
        rawBody.CopyTo(message, prefix.Length);
        var expected = Convert.ToHexString(
                HMACSHA256.HashData(
                    Encoding.UTF8.GetBytes(key),
                    message))
            .ToLowerInvariant();
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(expected),
            Encoding.UTF8.GetBytes(v2));
    }
}
```

</TabItem>
<TabItem value="ruby" label="Ruby">

```ruby
require "openssl"

TOLERANCE_SECONDS = 300

# raw_body is the request body exactly as received
# (request.body.read), never re-serialised JSON.
def verify_ottu_signature(
  raw_body, header, key,
  tolerance = TOLERANCE_SECONDS, now = Time.now.to_i
)
  parts = header.split(",").to_h do |item|
    name, value = item.strip.split("=", 2)
    [name, value.to_s]
  end
  t, v2 = parts["t"], parts["v2"]
  return false if t.nil? || v2.nil? ||
                  !t.match?(/\A\d+\z/)
  return false if (now - t.to_i).abs > tolerance

  expected = OpenSSL::HMAC.hexdigest(
    "SHA256", key, "#{t}.".b + raw_body.b
  )
  expected.bytesize == v2.bytesize &&
    OpenSSL.fixed_length_secure_compare(expected, v2)
end
```

</TabItem>
</Tabs>

</Visual>

</Beside>

### Test vectors {#test-vectors}

Prove your code with these published values before you receive live traffic. The body is UTF-8 and has non-ASCII characters on purpose.

<Beside>

Your code must **accept** this request. Pass `now=1792417440` (the `now` argument in the samples) so the old `t` of the vector is inside the 300-second window. With the real clock, the same header is correctly rejected as too old.

Your code must **reject** each of these:

- **`t` changed to `1792417441`.** The signature would be `b8e9781183a995e3834b3fadf4b5af4db2d0b5fb5b0417ec8d17a9ad141e3f91`.
- **Key `wrongkey000`.** The signature would be `7e13ee0138c41bb2037bb631f6f7254be8c04cecb366c8884cd680028906660d`.
- **The body re-serialised with non-ASCII escaped**, as `json.dumps` does. The signature no longer matches.

All samples on this page were run against these vectors: the `openssl` command produces the expected `v2`, and the seven verifiers (Python, Node.js, PHP, Go, Java, C# on .NET 8, Ruby 3.3) accept the vector and reject the changed `t`, the wrong key, and the vector's old `t` on the real clock.

<Visual>

```text title="Test vector"
Key:       pu9MpX3yPR
t:         1792417440
Raw body:
{"id":"evt_1","data":{"customer_first_name":"Zoë احمد"}}

Expected v2:
b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e

Header:
t=1792417440,v2=b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e
```

</Visual>

</Beside>

## Sign API {#sign-api}

<Beside>

`POST /b/pbl/v2/sign/` signs a JSON payload you send, with your HMAC key. Post a payload to it and compare what it returns with what your own code computes for the same bytes. It uses the same [authentication](/developers/getting-started/authentication) as the operations endpoints, and the caller needs the permission to view the webhook configuration.

#### `t` (query parameter) {#sign-api-t}

Integer, optional. The Unix time in seconds to sign with. It defaults to the current time. Pass a fixed `t` to reproduce a [test vector](#test-vectors).

#### Request body {#sign-api-body}

The JSON payload to sign.

#### `ottu_signature` (answer) {#sign-api-ottu-signature}

`t={t},v2={hex}`: the [`v2` header value](#verify-v2) over the **exact bytes of your request body**, spaces included. Compute `HMAC-SHA256(key, "{t}." + those same bytes)` in your code and compare.

#### `signature` (answer) {#sign-api-signature}

The [`signature` field](#body-signature) of the payload.

The example is for an account whose HMAC key is `pu9MpX3yPR`.

<Visual>

<CodeBlock language="bash" title="Sign a payload with a fixed t">{`curl --location \\
  '${OTTU_CONNECT_BASE_URL}/b/pbl/v2/sign/?t=1792417440' \\
  --header 'Authorization: Api-Key {your_api_key}' \\
  --header 'Content-Type: application/json' \\
  --data '{"amount": "86.000", "currency_code": "KWD", "customer_first_name": "example-customer"}'`}</CodeBlock>

<CodeBlock language="json" title="Answer">{`{
  "signature": "6143b8ad4bd283540721ab000f6de746e722231aaaa90bc38f639081d3ff9f67",
  "ottu_signature": "t=1792417440,v2=460dab8fd7b2418f87575841c2cf69ee4392ba6ce45bf43af1cafb1dc9644e8b"
}`}</CodeBlock>

</Visual>

</Beside>

### Sign API errors {#sign-api-errors}

<Beside>

#### `400` invalid_t {#sign-api-invalid-t}

`t` is not an integer. Send whole seconds, for example `t=1792417440`.

<Visual>

```json title="400"
{
  "t": "Must be a unix timestamp in seconds.",
  "code": "invalid_t"
}
```

</Visual>

</Beside>

#### `401` Not authenticated {#sign-api-401}

The credentials are missing or invalid. See [Authentication](/developers/getting-started/authentication).

#### `403` No permission {#sign-api-403}

The caller cannot view the webhook configuration. Use a user with that permission.

## The `signature` field in API answers {#where-signatures-appear}

Some payment endpoints answer straight away, with no webhook. Their answer carries a `signature` field in the body, so you can check it came from Ottu. These endpoints return it:

- `POST /b/pbl/v2/payment/auto-debit`: charging a saved token.
- `POST /b/pbl/v2/payment/apple-pay` and `POST /b/pbl/v2/payment/google-pay`: [native payments](/developers/payments/native-payments).
- `POST /b/pbl/v2/payment/wallet`: a [wallet](/developers/payments/wallet) balance payment.
- `POST /b/pbl/v2/payment/cash`: the cash on delivery acknowledgement.
- `POST /b/pbl/v2/sign/`: the [Sign API](#sign-api).

### Compute the `signature` field {#body-signature}

<Beside>

It is the HMAC-SHA256 (hex) of `fieldvalue` pairs joined with no separator, over these 18 fields only, in **alphabetical order of the field name**, skipping any field that is missing or empty:

`amount`, `currency_code`, `customer_address_city`, `customer_address_country`, `customer_address_line1`, `customer_address_line2`, `customer_address_postal_code`, `customer_address_state`, `customer_email`, `customer_first_name`, `customer_last_name`, `customer_phone`, `gateway_account`, `gateway_name`, `order_no`, `reference_number`, `result`, `state`.

**Test vector:** key `pu9MpX3yPR` and payload `{"amount": "86.000", "currency_code": "KWD", "customer_first_name": "example-customer"}` give `6143b8ad4bd283540721ab000f6de746e722231aaaa90bc38f639081d3ff9f67`. The sample returns that value.

A webhook event has no `signature` field in its body: verify the [`Ottu-Signature` header](#verify-v2).

<Visual>

```python title="Compute the signature field"
import hashlib
import hmac

BODY_SIGNATURE_FIELDS = {
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


def body_signature(payload: dict, key: str) -> str:
    message = "".join(
        f"{name}{payload[name]}"
        for name in sorted(payload)
        if name in BODY_SIGNATURE_FIELDS
        and payload[name]
    )
    return hmac.new(
        key.encode(), message.encode(), hashlib.sha256
    ).hexdigest()
```

</Visual>

</Beside>

## What's Next?

- [**Webhooks guide**](/developers/webhooks#step-by-step): where the check sits in your receiver.
- [**Troubleshooting**](/developers/webhooks#signature-mismatch): when the signature does not match.
- [**Delivery & retries**](/developers/webhooks#delivery-and-retries): what counts as success, and `Idempotency-Key`.
- [**Events**](/developers/webhooks#api-reference): the event object and every event.
