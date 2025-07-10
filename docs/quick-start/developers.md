# Developer Quick Start

Get up and running with Ottu's payment APIs in under 10 minutes. This guide will walk you through creating your first payment, receiving webhooks, and going live.

## Prerequisites

- An Ottu account ([sign up here](https://dashboard.ottu.com/signup))
- Basic knowledge of REST APIs
- Access to a development environment

## Step 1: Get Your API Keys

1. **Log in to your Ottu Dashboard**
   - Navigate to [dashboard.ottu.com](https://dashboard.ottu.com)
   - Go to **Settings** → **API Keys**

2. **Create API Keys**
   - Click **"Create New Key"**
   - Name: `Development Key`
   - Environment: `Sandbox`
   - Permissions: `Full Access` (for testing)
   - Click **"Generate"**

3. **Copy Your Keys**
   ```
   Public Key: pk_test_abcd1234...
   Secret Key: sk_test_wxyz5678...
   ```

⚠️ **Important**: Keep your secret key secure and never expose it in client-side code.

## Step 2: Set Up Your Environment

### Base URLs
- **Sandbox**: `https://api.sandbox.ottu.com`
- **Production**: `https://api.ottu.com`

### Authentication
Include your API key in the request headers:
```bash
Authorization: Bearer sk_test_your_secret_key
Content-Type: application/json
```

## Step 3: Create Your First Payment

### Using cURL
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

### Using Node.js
```javascript
const axios = require('axios');

const payment = await axios.post('https://api.sandbox.ottu.com/v1/payments', {
  amount: 2500, // Amount in cents ($25.00)
  currency: 'USD',
  description: 'Test payment',
  customer: {
    email: 'customer@example.com',
    name: 'John Doe'
  },
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel'
}, {
  headers: {
    'Authorization': 'Bearer sk_test_your_secret_key',
    'Content-Type': 'application/json'
  }
});

console.log('Payment URL:', payment.data.payment_url);
```

### Using Python
```python
import requests

response = requests.post('https://api.sandbox.ottu.com/v1/payments', 
  headers={
    'Authorization': 'Bearer sk_test_your_secret_key',
    'Content-Type': 'application/json'
  },
  json={
    'amount': 2500,  # Amount in cents ($25.00)
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

print('Payment URL:', response.json()['payment_url'])
```

### Response
```json
{
  "id": "pay_abc123",
  "amount": 2500,
  "currency": "USD",
  "status": "pending",
  "payment_url": "https://checkout.ottu.com/pay/abc123",
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Step 4: Test the Payment Flow

1. **Visit the Payment URL**
   - Open the `payment_url` in your browser
   - You'll see Ottu's secure checkout page

2. **Use Test Card**
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: Any future date
   CVC: Any 3 digits
   ```

3. **Complete Payment**
   - Fill in the test card details
   - Click "Pay Now"
   - You'll be redirected to your success URL

## Step 5: Set Up Webhooks

Webhooks notify your application when payment events occur.

### 1. Create Webhook Endpoint
```javascript
// Express.js example
app.post('/webhooks/ottu', (req, res) => {
  const signature = req.headers['ottu-signature'];
  const payload = req.body;
  
  // Verify signature (see security guide)
  if (!verifySignature(payload, signature)) {
    return res.status(400).send('Invalid signature');
  }
  
  // Handle the event
  switch (payload.event) {
    case 'payment.succeeded':
      console.log('Payment succeeded:', payload.data.id);
      // Update your database
      break;
    case 'payment.failed':
      console.log('Payment failed:', payload.data.id);
      // Handle failure
      break;
  }
  
  res.status(200).send('OK');
});
```

### 2. Configure Webhook in Dashboard
1. Go to **Settings** → **Webhooks**
2. Click **"Add Webhook"**
3. URL: `https://yoursite.com/webhooks/ottu`
4. Events: Select `payment.succeeded` and `payment.failed`
5. Click **"Save"**

## Step 6: Verify the Integration

### Check Payment Status
```bash
curl -X GET https://api.sandbox.ottu.com/v1/payments/pay_abc123 \
  -H "Authorization: Bearer sk_test_your_secret_key"
```

### Response
```json
{
  "id": "pay_abc123",
  "amount": 2500,
  "currency": "USD",
  "status": "succeeded",
  "payment_method": "card",
  "customer": {
    "email": "customer@example.com",
    "name": "John Doe"
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

## Step 7: Go Live

When you're ready to process real payments:

1. **Get Production Keys**
   - Go to **Settings** → **API Keys**
   - Create keys for `Production` environment

2. **Update Your Code**
   - Replace sandbox URL with production URL
   - Update API keys
   - Use real webhook URLs

3. **Test with Small Amount**
   - Process a small real payment first
   - Verify webhook delivery
   - Check your bank account

## Next Steps

Now that you have basic payments working, explore:

### Advanced Features
- **Tokenization**: Save customer payment methods
- **Webhooks**: Handle all payment events
- **Operations API**: Refunds, captures, voids

### Integration Guides
- **Frontend Integration**: Client-side payments
- **Laravel Tutorial**: PHP integration
- **Node.js Tutorial**: Complete backend setup

### SDKs & Tools
- **JavaScript SDK**: Frontend integration
- **Mobile SDKs**: iOS and Android
- **Postman Collection**: API testing

## Common Issues

### Payment Not Completing
- Check webhook configuration
- Verify success/cancel URLs are accessible
- Ensure proper error handling

### Webhook Not Receiving
- Check webhook URL is publicly accessible
- Verify endpoint returns 200 status
- Check webhook logs in dashboard

### API Errors
- Verify API key is correct
- Check request format matches documentation
- Ensure proper authentication headers

## Support

Need help? We're here to assist:
- **Developer Support**: dev-support@ottu.com
- **Documentation**: Browse our comprehensive guides
- **Community**: Join our developer community
- **Status**: Check [status.ottu.com](https://status.ottu.com) for service status

---

**🎉 Congratulations!** You've successfully integrated Ottu payments. Your customers can now make secure payments through your application.