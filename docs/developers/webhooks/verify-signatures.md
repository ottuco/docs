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

Two proofs of origin exist, and which one you verify depends on your [webhook format](/developers/webhooks/migrate-to-v3#formats). This page is self-contained: it gives the exact recipe, a published test vector and working code for each.

## Which signature do I verify? {#which-signature}

| Webhook format | Where the signature is | What is signed | Verify this |
|---|---|---|---|
| **3** (envelope) | `Ottu-Signature` header, `v2=` part | `<t>.` followed by the **raw body bytes** | [`v2` over the raw body](#verify-v2) |
| **1 and 2** | `Ottu-Signature` header, `v1=` part (default) | `t=<t>` plus 26 `path=value` lines of the payload | [`v1`](#header-v1) |
| **1 and 2** | `signature` field in the JSON body | 18 fields concatenated | [Body signature](#body-signature) (unchanged) |
| Synchronous responses and the [Sign API](#sign-api) | `signature` field, and `ottu_signature` on the Sign API | as above | [Sign API](#sign-api) |

:::note Header versions
On formats 1 and 2 the header carries `v1` (and may also carry `v2`: `t=...,v1=...,v2=...`). Format 3 always sends `v2` only. A signing failure never blocks the delivery: if the header is missing, treat the request as unsigned and reject it.
:::

## The Ottu-Signature header {#ottu-signature-header}

Every webhook delivery carries one header:

```text
Ottu-Signature: t=1792417440,v1=469fb5c5ad75e589acd9c6d14c78af62f7c807adb49004dbe71b80c11467d837,v2=b230321937edb54b51b91f65d544aa8039e413f0a8e034e59acb9b13e11e7d4e
```

| Part | Meaning |
|---|---|
| `t` | Unix time in **seconds** when this attempt was signed. It is recomputed for **every attempt**, so a retry has a new `t` and a new signature. |
| `v1` | Signs the payload fields (formats 1 and 2 only). See [Header v1](#header-v1). |
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

```bash
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
                          tolerance: int = TOLERANCE_SECONDS, now: float | None = None) -> bool:
    """raw_body is the request body exactly as received (bytes), never re-serialised JSON."""
    parts = {}
    for item in header.split(","):
        name, _, value = item.strip().partition("=")
        parts[name] = value
    if "t" not in parts or "v2" not in parts:
        return False
    try:
        t = int(parts["t"])
    except ValueError:
        return False
    if abs((now if now is not None else time.time()) - t) > tolerance:
        return False
    expected = hmac.new(key.encode(), f"{t}.".encode() + raw_body, hashlib.sha256).hexdigest()
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
      return [item.slice(0, i).trim(), item.slice(i + 1)];
    }),
  );
  const t = Number(parts.t);
  if (!Number.isInteger(t) || !parts.v2) return false;
  if (Math.abs(now - t) > tolerance) return false;
  const expected = crypto
    .createHmac("sha256", key)
    .update(Buffer.concat([Buffer.from(`${t}.`), rawBody]))
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
    $t = (int) $parts['t'];
    if (abs(($now ?? time()) - $t) > $tolerance) {
        return false;
    }
    $expected = hash_hmac('sha256', $t . '.' . $rawBody, $key);
    return hash_equals($expected, $parts['v2']);
}
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

### Header v1 {#header-v1}

On formats 1 and 2 the `v1=` part signs the payload's fields rather than its bytes. It is the same 26-field recipe described in [Important components](#important-components) below with one addition: the string starts with a first line `t=<t>`, taking `t` from the same header, so a captured header cannot be reused later. The test vector for `v1`:

| Input | Value |
|---|---|
| Key | `pu9MpX3yPR` |
| `t` | `1792417440` |
| Payload | the sample below |
| Expected `v1` | `469fb5c5ad75e589acd9c6d14c78af62f7c807adb49004dbe71b80c11467d837` |

```json
{
  "amount": "86.000", "currency_code": "KWD", "customer_email": "jane@example.com",
  "customer_first_name": "Jane", "customer_last_name": "", "gateway_account": "credit-card",
  "gateway_name": "mpgs", "order_no": "ORD-1001", "reference_number": "ABC12",
  "result": "success", "state": "paid", "session_id": "6c2a1f0e9b", "payment_type": "auto_pay",
  "extra": { "merchant_id": "merchant.ottu.net", "autopay": { "subscription_id": "sub_1eQ" } },
  "token": { "token": "9923965822244314", "pg_code": "credit-card", "customer_id": "cust_123", "brand": "VISA" },
  "agreement": { "id": "A123456789" }
}
```

:::warning In `v1`, `0` and `false` are signed
Only a **missing** path, `null` and an **empty string** are skipped in the `v1` string. The number `0` and the boolean `false` are signed, not skipped. Skipping every falsy value is the mistake that makes `v1` fail only on zero-amount payments.
:::

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

Test vector: key `pu9MpX3yPR` and payload `{"amount": "86.000", "currency_code": "KWD", "customer_first_name": "example-customer"}` give `6143b8ad4bd283540721ab000f6de746e722231aaaa90bc38f639081d3ff9f67`. The body signature is not present in format 3, where `data.payment` and `data.operation` have no `signature` field.


## Important Components

This section describes the 26-field recipe used by the `v1` part of the [`Ottu-Signature` header](#header-v1) on formats 1 and 2. For the body `signature` field see [Body signature](#body-signature); for format 3 see [Verify v2](#verify-v2).

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
2. A path whose value is `null` or an empty string is also skipped. **An empty string signs identically to an absent key.** `0` and `false` are **not** skipped: they are signed.
3. Values are used exactly as they appear in the payload, with no type coercion, trimming, or case folding.

#### 3. Signature Creation

0. Start the string with the line `t=<t>`, where `<t>` is the `t` value from the same `Ottu-Signature` header.
1. Sort the 26 paths above alphabetically. (The list is already in sorted order, so you can hard-code it as shown.)
2. For each path in that order, resolve it against the payload. Skip it if it is missing, `null` or an empty string.
3. Render each surviving path as `path=value`.
4. Join the `t=<t>` line and the rendered pairs with a single newline character, `\n`. There is no trailing newline.
5. Compute **HMAC-SHA256** over that string using your HMAC Key, and hex-encode the result.

The resulting signature is dispatched with the [webhook notification](/developers/webhooks/payment-events) as the `v1=` part of the `Ottu-Signature` header.

#### 4. Verification by Merchant

- On receipt, rebuild the signed string from the payload you received, using the steps above.
- Generate an HMAC signature using your stored [HMAC Key](/developers/webhooks).
- Compare it to the `v1` value of the `Ottu-Signature` header. Use a constant-time comparison (`hmac.compare_digest` in Python, `hash_equals` in PHP, `crypto.timingSafeEqual` in Node.js) rather than `==`.
- If they match, the payload is authentic. Any discrepancy suggests tampering, or a verifier that skips `0`/`false` or forgot the `t=<t>` first line.

## Where signatures appear {#where-signatures-appear}

The body `signature` field (the [18-field recipe](#body-signature)) is also returned by the synchronous responses of these endpoints:

| Endpoint | Notes |
|---|---|
| `POST /b/pbl/v2/payment/auto-debit` | Charging a saved token (MIT) |
| `POST /b/pbl/v2/payment/apple-pay` | [Native payments](/developers/payments/native-payments/) |
| `POST /b/pbl/v2/payment/google-pay` | [Native payments](/developers/payments/native-payments/) |
| `POST /b/pbl/v2/payment/wallet` | [Wallet](/developers/payments/wallet/) balance payment |
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
| `ottu_signature` | `t=<t>,v1=<hex>`: the [`v1` header value](#header-v1) for this payload and `t`. |

<CodeBlock language="bash" title="Sign a payload with a fixed t">{`curl --location '${OTTU_CONNECT_BASE_URL}/b/pbl/v2/sign/?t=1792417440' \
  --header 'Authorization: Api-Key YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"amount": "86.000", "currency_code": "KWD", "customer_first_name": "example-customer"}'`}</CodeBlock>

<CodeBlock language="json" title="Response">{`{
  "signature": "6143b8ad4bd283540721ab000f6de746e722231aaaa90bc38f639081d3ff9f67",
  "ottu_signature": "t=1792417440,v1=c8ade60bcdb15089987a636cdc451d85728e498b814ac1d2b1cf5e88fc75362c"
}`}</CodeBlock>

**Errors**

| Status | Body | Cause | Fix |
|---|---|---|---|
| 400 | `{"t": "Must be a unix timestamp in seconds.", "code": "invalid_t"}` | `t` is not an integer | Send whole seconds, for example `t=1792417440` |
| 401 | authentication error | Missing or invalid credentials | See [Authentication](/developers/getting-started/authentication) |
| 403 | permission error | The caller cannot view the webhook configuration | Use a user with that permission |

:::warning The Sign API cannot produce `v2`
`v2` signs the exact raw body bytes of a delivery, which the Sign API never sees (it re-reads your JSON). The response carries `signature` and `ottu_signature` (`v1`) only. The earlier `signature_v2` response key is gone; use `ottu_signature`. To check a `v2` implementation, use the [published vector](#test-vectors).
:::

## Payload additions you should know about {#payload-additions}

Two related additions land alongside this change, and the distinction between them matters for security.

**`extra.merchant_id` is always present now**, even when you sent no `extra` object on the checkout call. It holds your merchant domain, and it **is** inside the signed set.

**A top-level `autopay` block may be present** on payments created through [AutoPay](/developers/payments/autopay/). It sits at the top level of the payload, *not* under `extra`, and contains `subscription_id`, `subscription_status`, `cycle_number`, `cycle_status`, `next_billing_date` and `event_type`.

:::warning The top-level `autopay` block is not covered by the signature
It is fetched live from the AutoPay service while the response is being assembled, with a short timeout, and is **silently omitted** if that lookup times out or fails. Treat it as informational only:

- **Never** make a security or money-moving decision based on it. Use the signed [`extra.autopay.subscription_id`](#2-fields-for-signature) to identify the subscription, then read authoritative state from the [subscription endpoints](/developers/payments/autopay/#api-reference).
- Its absence means the lookup did not complete. It does **not** mean the payment is not an AutoPay payment.
- `event_type` is one of `cit_success`, `cit_failure`, `mit_success`, `mit_failure`, `card_updated`, or `null`. `null` means the setup outcome is still undecided, not that it succeeded. It's AutoPay's own best-guess classification, computed independently of the payment result; it is **not** authoritative. Read `result` and `state` on the payment for the actual outcome.
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
  "reference_number": "sandboxAQ5DJ",
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

**HMAC Key**: `pu9MpX3yPR`, **`t`**: `1792417440`

The `v1` string built from it is exactly this — the `t` line plus 18 lines, joined by `\n`, with no trailing newline:

```text title="Canonical string"
t=1792417440
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
reference_number=sandboxAQ5DJ
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

`a1bc78c76d5652f605f1fe5d9223d401cee354853f2cf40c3efb2a608da618bc`

Compare that against the `v1` part of the `Ottu-Signature` header you received.

## Signature Generation

The `v2` check for [Python, Node.js and PHP](#verify-v2) and the [body signature](#body-signature) are covered above with tested code. The implementations below compute the **field lines** of the `v1` recipe (steps 1 to 4 of [Signature Creation](#3-signature-creation)) in other languages.

:::warning These samples were written for the field lines only
To get the `v1` value of the `Ottu-Signature` header with them, make `t=<t>` the **first line** of the joined string and skip only missing, `null` and empty-string values (so `0` and `false` are signed), then compare against the header's `v1` part instead of a `signature` body field. The example digest above is the check: your result for the payload and `t` in the [example](#example) must equal it.
:::

## Specific Examples

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

- [**Webhook Events (v3)**](/developers/webhooks/event-catalogue/) — The format 3 envelope and every event type
- [**Delivery and Retries**](/developers/webhooks/delivery-and-retries/) — Success rules, retry schedule and `Idempotency-Key`
- [**Migrating to v3**](/developers/webhooks/migrate-to-v3/) — Format 1 and 2 to format 3
- [**Payment Events**](/developers/webhooks/payment-events/) — Payment webhook payload reference
- [**Operation Events**](/developers/webhooks/operation-events/) — Operation webhook payload reference
- [**AutoPay**](/developers/payments/autopay/) — Subscriptions, and the `autopay` payload blocks described above
- [**Webhooks Overview**](./) — Setup, delivery guarantees, and configuration

## Related

- [Webhooks Overview](/developers/webhooks)
- [Payment States](/developers/reference/payment-states)
- [Authentication](/developers/getting-started/authentication)
