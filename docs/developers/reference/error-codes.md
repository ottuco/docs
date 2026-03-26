---
title: Error Codes
sidebar_label: Error Codes
---

# Error Codes

Ottu's APIs return standard HTTP status codes and structured error responses. This page is the canonical reference for all error codes across the platform.

## Error Response Format

All error responses follow this JSON structure:

```json title="Error Response"
{
  "error": {
    "type": "validation_error",
    "code": "invalid_amount",
    "message": "Amount must be a positive integer",
    "field": "amount"
  }
}
```

| Field | Description |
|-------|-------------|
| `type` | Error category (e.g., `validation_error`, `authentication_error`, `rate_limit_error`) |
| `code` | Machine-readable error code (e.g., `invalid_amount`, `required_field_missing`) |
| `message` | Human-readable description of the error |
| `field` | *(optional)* The request field that caused the error |

## HTTP Status Codes

| Code | Name | Description |
|:----:|------|-------------|
| 200 | OK | Request succeeded. Response body contains the result. |
| 201 | Created | Resource created successfully (e.g., new payment transaction). |
| 400 | Bad Request | Invalid request — missing required fields, invalid values, or malformed JSON. |
| 401 | Unauthorized | Authentication failed — missing, invalid, or expired API key or credentials. |
| 403 | Forbidden | Authenticated but insufficient permissions for this action. |
| 404 | Not Found | Resource not found — wrong `session_id`, `order_no`, or endpoint path. |
| 422 | Validation Error | Request is well-formed but contains semantic errors (e.g., amount exceeds balance). |
| 429 | Rate Limited | Too many requests — implement exponential backoff and retry. |
| 500 | Internal Server Error | Unexpected server error — retry the request or contact support. |

## Error Types

### Validation Errors (400)

Returned when request parameters are missing, malformed, or invalid.

```json title="Missing Required Field"
{
  "error": {
    "type": "validation_error",
    "code": "required_field_missing",
    "message": "Amount is required",
    "field": "amount"
  }
}
```

**Common causes:**
- Missing required fields (`amount`, `currency_code`, `pg_codes`, `session_id`)
- Invalid field values (negative amount, unsupported currency, malformed date)
- Conflicting parameters (e.g., both `discount_percentage` and `discount_amount` in invoices)
- Invalid date ranges (e.g., `created_before` < `created_after` in reports)

### Authentication Errors (401)

Returned when credentials are missing or invalid.

```json title="Invalid API Key"
{
  "error": {
    "type": "authentication_error",
    "code": "invalid_api_key",
    "message": "Invalid API key provided"
  }
}
```

**Common causes:**
- Missing `Authorization` header
- Invalid or revoked API key
- Malformed Basic Auth credentials
- Using a [Public API Key](/developers/getting-started/authentication#public-key) where a [Private API Key](/developers/getting-started/authentication#private-key-api-key) is required

### Permission Errors (403)

Returned when the user is authenticated but lacks the required permission.

```json title="Insufficient Permissions"
{
  "error": {
    "type": "permission_error",
    "code": "forbidden",
    "message": "Insufficient permissions for this action"
  }
}
```

**Common causes:**
- Basic Auth user missing a required permission (e.g., `report.can_view_report` for Reports API, `payment.capture` for capture operations)
- Attempting to access another merchant's resources
- Using staff credentials without the required role

See [Authentication](/developers/getting-started/authentication) for permission configuration.

### Rate Limit Errors (429)

Returned when the request rate exceeds the allowed limit.

```json title="Rate Limit Exceeded"
{
  "error": {
    "type": "rate_limit_error",
    "code": "rate_limit_exceeded",
    "message": "Too many requests. Please try again later."
  }
}
```

**Handling:** Implement exponential backoff — wait 1s, then 2s, then 4s before retrying. Check the `Retry-After` header if present.

## Endpoint-Specific Errors

Some endpoints return specific error codes beyond the standard HTTP errors:

### Operations API

| HTTP | Code | When |
|:----:|------|------|
| 400 | Operation not supported | The payment gateway doesn't support this operation (e.g., refund) |
| 400 | Invalid state for operation | Transaction is not in a valid state for the requested operation (see [State Groups](/developers/reference/payment-states#state-groups)) |
| 400 | Amount exceeds balance | Refund or capture amount exceeds the available amount |

### Reports API

| HTTP | Code | When |
|:----:|------|------|
| 400 | `invalid_parameters` | Invalid filter values (e.g., `created_before` < `created_after`) |
| 404 | `not_found` | Report not found or download token expired |
| 429 | `rate_limited` | Download rate limit exceeded per user |

### Invoice API

| HTTP | Code | When |
|:----:|------|------|
| 400 | Validation error | `discount_percentage` and `discount_amount` both provided on same item/invoice |
| 400 | VAL CALC mismatch | Frontend-calculated value doesn't match Ottu's backend calculation |

## Error Handling Best Practices

1. **Always check the HTTP status code first** — `2xx` means success, `4xx` means client error, `5xx` means server error.
2. **Parse the error response body** — extract `type`, `code`, and `message` for programmatic handling and user-facing messages.
3. **Implement retries for `429` and `5xx`** — use exponential backoff with jitter.
4. **Don't retry `400`, `401`, `403`, `404`** — these are client errors that require fixing the request, not retrying.
5. **Log error responses** — store the full error response for debugging and support tickets.

## FAQ

#### What should I do when I get a 401 error?

Check your `Authorization` header. Ensure you're using the correct API key format (`Api-Key your_key`) and that the key hasn't been revoked. See [Authentication](/developers/getting-started/authentication).

#### How do I handle rate limiting?

Implement exponential backoff: wait 1s after the first `429`, then 2s, then 4s. For Reports API downloads, respect per-user rate limits.

#### Why am I getting 403 with valid credentials?

Your user account is authenticated but lacks the specific permission for this endpoint. Check the Permissions table in the API Reference for the required permission code. Contact your admin to grant access.

#### Are error response formats consistent across all endpoints?

Most endpoints follow the standard error format documented above. Gateway-specific operations may include additional fields in the response (e.g., `pg_response` for operation errors). Always check the `message` field for human-readable details.

## What's Next?

- [**Payment States**](/developers/reference/payment-states) — Transaction and attempt state machine
- [**Authentication**](/developers/getting-started/authentication) — API key setup and permissions
- [**API Fundamentals**](/developers/getting-started/api-fundamentals) — Request/response format, pagination, currencies
