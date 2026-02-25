# API Fundamentals

Learn the core concepts and conventions of Ottu's REST API to build robust payment integrations.

## Base URLs

| Environment | Base URL |
|-------------|----------|
| Sandbox | `https://api.sandbox.ottu.com` |
| Production | `https://api.ottu.com` |

## Authentication

### API Keys
Ottu uses API keys for authentication. There are two types:

- **Public Key** (`pk_`): Used for client-side operations
- **Secret Key** (`sk_`): Used for server-side operations

### Authentication Header
```http
Authorization: Bearer sk_test_your_secret_key
```

### Key Management
- Store secret keys securely (environment variables, key management services)
- Never expose secret keys in client-side code
- Rotate keys regularly for security
- Use different keys for different environments

## Request Format

### Content Type
All requests must include the content type header:
```http
Content-Type: application/json
```

### Request Body
Send data as JSON in the request body:
```json
{
  "amount": 2000,
  "currency": "USD",
  "customer": {
    "email": "customer@example.com"
  }
}
```

### URL Parameters
Use URL parameters for filtering and pagination:
```http
GET /v1/payments?limit=10&status=succeeded&created_after=2024-01-01
```

## Response Format

### Success Response
```json
{
  "id": "pay_abc123",
  "amount": 2000,
  "currency": "USD",
  "status": "succeeded",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "error": {
    "type": "validation_error",
    "code": "invalid_amount",
    "message": "Amount must be a positive integer",
    "field": "amount"
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |

## Error Handling

### Error Types

#### Validation Errors (400)
```json
{
  "error": {
    "type": "validation_error",
    "code": "required_field_missing",
    "message": "Amount is required",
    "field": "amount"
  }
}
```

#### Authentication Errors (401)
```json
{
  "error": {
    "type": "authentication_error",
    "code": "invalid_api_key",
    "message": "Invalid API key provided"
  }
}
```

#### Rate Limit Errors (429)
```json
{
  "error": {
    "type": "rate_limit_error",
    "code": "rate_limit_exceeded",
    "message": "Too many requests. Please try again later."
  }
}
```

### Error Handling Best Practices

```javascript
async function createPayment(paymentData) {
  try {
    const response = await fetch('https://api.ottu.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error.message}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Payment creation failed:', error);
    throw error;
  }
}
```

## Idempotency

Prevent duplicate operations by using idempotency keys:

```http
POST /v1/payments
Idempotency-Key: unique_key_123
```

```json
{
  "amount": 2000,
  "currency": "USD",
  "customer": {
    "email": "customer@example.com"
  }
}
```

If you retry the same request with the same idempotency key, you'll get the same response without creating a duplicate payment.

## Pagination

For endpoints that return lists, use pagination parameters:

```http
GET /v1/payments?limit=10&starting_after=pay_abc123
```

### Response
```json
{
  "data": [
    {
      "id": "pay_def456",
      "amount": 2000,
      "currency": "USD"
    }
  ],
  "has_more": true,
  "next_page": "pay_ghi789"
}
```

### Parameters
- `limit`: Number of items to return (max 100)
- `starting_after`: Pagination cursor for next page
- `ending_before`: Pagination cursor for previous page

## Rate Limiting

### Limits
- **Sandbox**: 1,000 requests per minute
- **Production**: 5,000 requests per minute

### Headers
Check rate limit status in response headers:
```http
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1642261200
```

### Handling Rate Limits
```javascript
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(url, options) {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    const resetTime = parseInt(response.headers.get('X-RateLimit-Reset'));
    const waitTime = (resetTime * 1000) - Date.now();
    
    if (waitTime > 0) {
      await delay(waitTime);
      return makeRequest(url, options); // Retry
    }
  }
  
  return response;
}
```

## Versioning

### API Version
Current version: `v1`

### Backward Compatibility
- Additive changes (new fields, endpoints) don't require version changes
- Breaking changes will be introduced in new versions
- Deprecated features will be supported for at least 12 months

### Version Header
Optionally specify API version:
```http
Ottu-Version: 2024-01-15
```

## Data Types

### Common Fields

#### Amounts
- Always in smallest currency unit (cents for USD, pence for GBP)
- Integer type, no decimal places
- Example: $25.99 = 2599

#### Currencies
- ISO 4217 currency codes
- Three-letter uppercase format
- Example: USD, EUR, GBP

#### Dates
- ISO 8601 format with UTC timezone
- Example: `2024-01-15T10:30:00Z`

#### IDs
- Unique identifiers with type prefix
- Example: `pay_abc123`, `cust_def456`

### Metadata
Add custom key-value pairs to objects:
```json
{
  "amount": 2000,
  "currency": "USD",
  "metadata": {
    "order_id": "order_123",
    "customer_tier": "premium"
  }
}
```

## Webhooks

### Overview
Webhooks notify your application when events occur:
- Payment status changes
- Refund processing
- Dispute updates
- Customer actions

### Webhook Endpoint
```javascript
app.post('/webhook', (req, res) => {
  const event = req.body;
  
  // Verify webhook signature
  const signature = req.headers['ottu-signature'];
  if (!verifySignature(event, signature)) {
    return res.status(400).send('Invalid signature');
  }
  
  // Process event
  handleWebhookEvent(event);
  
  res.status(200).send('OK');
});
```

### Event Structure
```json
{
  "id": "evt_abc123",
  "type": "payment.succeeded",
  "created_at": "2024-01-15T10:30:00Z",
  "data": {
    "id": "pay_abc123",
    "amount": 2000,
    "currency": "USD",
    "status": "succeeded"
  }
}
```

## Testing

### Test Mode
- Use test API keys (`sk_test_` prefix)
- No real money transactions
- Simulate various scenarios

### Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
```

### Webhook Testing
Use tools like ngrok for local development:
```bash
ngrok http 3000
# Use the https URL for webhook endpoints
```

## SDK Libraries

### Official SDKs
- **Node.js**: `npm install @ottu/node`
- **Python**: `pip install ottu-python`
- **PHP**: `composer require ottu/ottu-php`
- **Ruby**: `gem install ottu-ruby`

### Community SDKs
- **Go**: Available on GitHub
- **Java**: Available on GitHub
- **.NET**: Available on NuGet

## Best Practices

### Security
- Use HTTPS for all requests
- Validate webhook signatures
- Store API keys securely
- Implement proper error handling

### Performance
- Cache responses when appropriate
- Use appropriate timeout values
- Implement retry logic with exponential backoff
- Monitor API response times

### Error Handling
- Check HTTP status codes
- Parse error responses
- Provide meaningful error messages to users
- Log errors for debugging

### Code Organization
- Use environment-specific configurations
- Implement proper logging
- Write tests for API interactions
- Use consistent error handling patterns

## Next Steps

Now that you understand the API fundamentals, explore:

- **Checkout API**: Create and manage payments
- **Webhooks**: Handle real-time events
- **Operations API**: Refunds, captures, and voids
- **SDKs**: Use our official libraries

## Support

### Documentation
- **API Reference**: Complete endpoint documentation
- **Webhook Reference**: All webhook events
- **Error Codes**: Troubleshooting guide

### Community
- **GitHub**: Sample code and examples
- **Discord**: Developer community
- **Stack Overflow**: Technical questions

### Direct Support
- **Email**: dev-support@ottu.com
- **Chat**: Available in dashboard
- **Phone**: For enterprise customers