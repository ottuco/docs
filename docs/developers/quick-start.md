# Developer Quick Start

This guide helps developers integrate Ottu's payment processing into their applications quickly and efficiently.

## Overview

Ottu provides a comprehensive payment API that handles:

- Payment creation and processing
- Customer management
- Webhook notifications
- Transaction operations (refunds, captures, voids)
- Multi-currency support
- Tokenization and saved payment methods

## Before You Start

### Prerequisites

- Basic understanding of REST APIs
- Access to your development environment
- Ottu account with API keys

### Get Your API Keys

1. Log into your [Ottu Dashboard](https://dashboard.ottu.com)
2. Navigate to **Settings** → **API Keys**
3. Create a new key pair for your environment

## Integration Options

### 🔧 Code Examples in Multiple Languages

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="node" label="Node.js" default>

```javascript
const response = await fetch("https://api.sandbox.ottu.com/v1/payments", {
  method: "POST",
  headers: {
    Authorization: "Bearer sk_test_your_secret_key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: 2500,
    currency: "USD",
    description: "Test payment",
    customer: {
      email: "customer@example.com",
      name: "John Doe",
    },
    success_url: "https://yoursite.com/success",
    cancel_url: "https://yoursite.com/cancel",
  }),
});

const payment = await response.json();
console.log("Payment URL:", payment.payment_url);
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
import requests

response = requests.post(
    'https://api.sandbox.ottu.com/v1/payments',
    headers={
        'Authorization': 'Bearer sk_test_your_secret_key',
        'Content-Type': 'application/json'
    },
    json={
        'amount': 2500,
        'currency': 'USD',
        'description': 'Test payment',
        'customer': {
            'email': 'customer@example.com',
            'name': 'John Doe'
        },
        'success_url': 'https://yoursite.com/success',
        'cancel_url': 'https://yoursite.com/cancel'
    }
)

payment = response.json()
print(f"Payment URL: {payment['payment_url']}")
```

  </TabItem>
  <TabItem value="php" label="PHP">

```php
<?php

$data = [
    'amount' => 2500,
    'currency' => 'USD',
    'description' => 'Test payment',
    'customer' => [
        'email' => 'customer@example.com',
        'name' => 'John Doe'
    ],
    'success_url' => 'https://yoursite.com/success',
    'cancel_url' => 'https://yoursite.com/cancel'
];

$ch = curl_init('https://api.sandbox.ottu.com/v1/payments');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer sk_test_your_secret_key',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$payment = json_decode($response, true);

echo "Payment URL: " . $payment['payment_url'];
curl_close($ch);
?>
```

  </TabItem>
  <TabItem value="curl" label="cURL">

```bash
curl -X POST https://api.sandbox.ottu.com/v1/payments \
  -H "Authorization: Bearer sk_test_your_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500,
    "currency": "USD",
    "description": "Test payment",
    "customer": {
      "email": "customer@example.com",
      "name": "John Doe"
    },
    "success_url": "https://yoursite.com/success",
    "cancel_url": "https://yoursite.com/cancel"
  }'
```

  </TabItem>
  <TabItem value="ruby" label="Ruby">

```ruby
require 'net/http'
require 'json'

uri = URI('https://api.sandbox.ottu.com/v1/payments')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request['Authorization'] = 'Bearer sk_test_your_secret_key'
request['Content-Type'] = 'application/json'
request.body = {
  amount: 2500,
  currency: 'USD',
  description: 'Test payment',
  customer: {
    email: 'customer@example.com',
    name: 'John Doe'
  },
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel'
}.to_json

response = http.request(request)
payment = JSON.parse(response.body)
puts "Payment URL: #{payment['payment_url']}"
```

  </TabItem>
  <TabItem value="go" label="Go">

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

type PaymentRequest struct {
    Amount     int      `json:"amount"`
    Currency   string   `json:"currency"`
    Description string  `json:"description"`
    Customer   Customer `json:"customer"`
    SuccessURL string   `json:"success_url"`
    CancelURL  string   `json:"cancel_url"`
}

type Customer struct {
    Email string `json:"email"`
    Name  string `json:"name"`
}

type PaymentResponse struct {
    PaymentURL string `json:"payment_url"`
}

func main() {
    payment := PaymentRequest{
        Amount:      2500,
        Currency:    "USD",
        Description: "Test payment",
        Customer: Customer{
            Email: "customer@example.com",
            Name:  "John Doe",
        },
        SuccessURL: "https://yoursite.com/success",
        CancelURL:  "https://yoursite.com/cancel",
    }

    jsonData, _ := json.Marshal(payment)

    req, _ := http.NewRequest("POST", "https://api.sandbox.ottu.com/v1/payments", bytes.NewBuffer(jsonData))
    req.Header.Set("Authorization", "Bearer sk_test_your_secret_key")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    var result PaymentResponse
    json.Unmarshal(body, &result)

    fmt.Printf("Payment URL: %s\n", result.PaymentURL)
}
```

  </TabItem>
</Tabs>

### 1. Server-Side Integration (Recommended)

Best for: Full control, custom payment flows, server-side validation

```javascript
// Create payment on your server
const payment = await fetch("https://api.ottu.com/v1/payments", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${SECRET_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: 2000, // $20.00 in cents
    currency: "USD",
    customer: {
      email: "customer@example.com",
    },
  }),
});

// Redirect customer to payment_url
const { payment_url } = await payment.json();
```

### 2. Client-Side Integration

Best for: Simple payment links, embedded checkout

```html
<!-- Include Ottu SDK -->
<script src="https://sdk.ottu.com/v1/ottu.js"></script>

<script>
  // Initialize Ottu
  const ottu = new Ottu({
    publicKey: "pk_test_your_public_key",
    environment: "sandbox",
  });

  // Create payment session
  ottu
    .createPayment({
      amount: 2000,
      currency: "USD",
      customer: {
        email: "customer@example.com",
      },
    })
    .then((payment) => {
      // Redirect to payment page
      window.location.href = payment.payment_url;
    });
</script>
```

### 3. Embedded Checkout

Best for: Seamless user experience, custom styling

```html
<div id="ottu-checkout"></div>

<script>
  ottu.embed("#ottu-checkout", {
    amount: 2000,
    currency: "USD",
    onSuccess: (payment) => {
      console.log("Payment successful:", payment);
    },
    onError: (error) => {
      console.error("Payment failed:", error);
    },
  });
</script>
```

## Core Concepts

### Payment Lifecycle

1. **Created**: Payment request created
2. **Pending**: Customer redirected to payment page
3. **Processing**: Payment being processed
4. **Succeeded**: Payment completed successfully
5. **Failed**: Payment failed or was declined

### Webhook Events

Stay informed about payment status changes:

```javascript
// Webhook endpoint example
app.post("/webhook", (req, res) => {
  const event = req.body;

  switch (event.type) {
    case "payment.succeeded":
      // Handle successful payment
      break;
    case "payment.failed":
      // Handle failed payment
      break;
    case "payment.refunded":
      // Handle refund
      break;
  }

  res.sendStatus(200);
});
```

### Error Handling

```javascript
try {
  const payment = await ottu.createPayment({
    amount: 2000,
    currency: "USD",
  });
} catch (error) {
  if (error.type === "validation_error") {
    // Handle validation errors
  } else if (error.type === "authentication_error") {
    // Handle authentication errors
  }
}
```

## Next Steps

Choose your integration path:

### For Backend Developers

- **[API Fundamentals](./api-fundamentals)**: Learn the core API concepts
- **Webhook Implementation**: Handle payment events
- **Operations API**: Manage refunds and captures

### For Frontend Developers

- **Web SDK**: JavaScript SDK documentation
- **Embedded Checkout**: Seamless payment forms
- **Mobile SDKs**: iOS and Android integration

### Framework-Specific Guides

- **Laravel Integration**: PHP with Laravel
- **Node.js Express**: Complete backend setup
- **React/Vue.js**: Frontend-only integration

## Common Patterns

### Payment with Customer Details

```javascript
const payment = await ottu.createPayment({
  amount: 5000,
  currency: "USD",
  customer: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
  },
  metadata: {
    order_id: "order_123",
    product: "Premium Plan",
  },
});
```

### Tokenization for Saved Cards

```javascript
const payment = await ottu.createPayment({
  amount: 2000,
  currency: "USD",
  customer: {
    id: "cust_123", // Existing customer
  },
  save_payment_method: true,
});
```

### Multi-Currency Payment

```javascript
const payment = await ottu.createPayment({
  amount: 2000,
  currency: "EUR",
  customer: {
    email: "customer@example.com",
  },
  allowed_currencies: ["EUR", "USD", "GBP"],
});
```

## Testing

### Test Environment

- **Base URL**: `https://api.sandbox.ottu.com`
- **Dashboard**: `https://dashboard.sandbox.ottu.com`

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
```

### Test Webhooks

Use tools like ngrok for local webhook testing:

```bash
ngrok http 3000
# Use the https URL for webhook endpoint
```

## Best Practices

### Security

- Never expose secret keys in client-side code
- Always validate webhook signatures
- Use HTTPS for all webhook endpoints
- Store sensitive data securely

### Performance

- Implement proper error handling
- Cache API responses when appropriate
- Use webhooks for real-time updates
- Implement retry logic for failed requests

### User Experience

- Provide clear error messages
- Show payment progress indicators
- Implement proper loading states
- Handle edge cases gracefully

## Support

### Documentation

- **[API Reference](./api-fundamentals)**: Complete API documentation
- **Webhook Guide**: Event handling
- **Error Codes**: Troubleshooting guide

### Community

- **GitHub**: Sample code and examples
- **Discord**: Developer community
- **Stack Overflow**: Technical questions

### Direct Support

- **Email**: dev-support@ottu.com
- **Chat**: Available in dashboard
- **Phone**: For enterprise customers

## 📚 Complete API Documentation

For full interactive API documentation with Swagger UI, including all endpoints, request/response schemas, and live testing:

**[🚀 View Full API Documentation](/docs/developers/apis/ottu-api)**

This includes:

- All available endpoints
- Complete request/response schemas
- Interactive testing for every endpoint
- Authentication examples
- Error handling details

Ready to start building? Check out our [API Fundamentals](./api-fundamentals) guide for detailed implementation instructions.
