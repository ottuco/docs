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

### 1. Server-Side Integration (Recommended)
Best for: Full control, custom payment flows, server-side validation

```javascript
// Create payment on your server
const payment = await fetch('https://api.ottu.com/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SECRET_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 2000, // $20.00 in cents
    currency: 'USD',
    customer: {
      email: 'customer@example.com'
    }
  })
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
  publicKey: 'pk_test_your_public_key',
  environment: 'sandbox'
});

// Create payment session
ottu.createPayment({
  amount: 2000,
  currency: 'USD',
  customer: {
    email: 'customer@example.com'
  }
}).then(payment => {
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
ottu.embed('#ottu-checkout', {
  amount: 2000,
  currency: 'USD',
  onSuccess: (payment) => {
    console.log('Payment successful:', payment);
  },
  onError: (error) => {
    console.error('Payment failed:', error);
  }
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
app.post('/webhook', (req, res) => {
  const event = req.body;
  
  switch(event.type) {
    case 'payment.succeeded':
      // Handle successful payment
      break;
    case 'payment.failed':
      // Handle failed payment
      break;
    case 'payment.refunded':
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
    currency: 'USD'
  });
} catch (error) {
  if (error.type === 'validation_error') {
    // Handle validation errors
  } else if (error.type === 'authentication_error') {
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
  currency: 'USD',
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890'
  },
  metadata: {
    order_id: 'order_123',
    product: 'Premium Plan'
  }
});
```

### Tokenization for Saved Cards
```javascript
const payment = await ottu.createPayment({
  amount: 2000,
  currency: 'USD',
  customer: {
    id: 'cust_123' // Existing customer
  },
  save_payment_method: true
});
```

### Multi-Currency Payment
```javascript
const payment = await ottu.createPayment({
  amount: 2000,
  currency: 'EUR',
  customer: {
    email: 'customer@example.com'
  },
  allowed_currencies: ['EUR', 'USD', 'GBP']
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

Ready to start building? Check out our [API Fundamentals](./api-fundamentals) guide for detailed implementation instructions.