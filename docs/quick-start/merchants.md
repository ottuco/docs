# Merchant Quick Start

Get your business ready to accept payments with Ottu in under 30 minutes. This guide will help you set up your account, connect a payment gateway, and send your first payment link.

## Prerequisites

- A business bank account
- Business registration documents
- Valid business email address
- Access to your business website (optional)

## Step 1: Create Your Ottu Account

1. **Sign Up**
   - Visit [dashboard.ottu.com/signup](https://dashboard.ottu.com/signup)
   - Enter your business email and create a password
   - Verify your email address

2. **Complete Business Profile**
   - **Business Information**: Company name, address, phone
   - **Industry**: Select your business category
   - **Website**: Add your business website (if available)
   - **Contact Person**: Primary contact details

3. **Upload Documents**
   - Business registration certificate
   - Tax identification number
   - Bank account details
   - Identity verification (passport/ID)

⏱️ **Processing Time**: Account verification typically takes 1-2 business days.

## Step 2: Connect a Payment Gateway

### Choose Your Payment Gateway

Select from our supported gateways based on your location and needs:

#### Popular Options
- **Stripe**: Best for global businesses
- **PayPal**: Worldwide acceptance
- **Square**: Great for US businesses
- **Authorize.Net**: Established US gateway
- **Cybersource**: Enterprise-grade solution

### Configure Your Gateway

1. **Add Payment Gateway**
   - Go to **Settings** → **Payment Gateways**
   - Click **"Add Gateway"**
   - Select your preferred gateway

2. **Enter Gateway Credentials**
   - **API Keys**: From your gateway account
   - **Webhook URL**: Automatically configured
   - **Currency**: Set your default currency
   - **Test Mode**: Enable for testing

3. **Test Configuration**
   - Click **"Test Connection"**
   - Verify all settings are correct
   - Save configuration

### Gateway-Specific Setup

#### Stripe Setup
```
1. Get your keys from Stripe Dashboard
2. Publishable Key: pk_test_...
3. Secret Key: sk_test_...
4. Add webhook endpoint: https://api.ottu.com/webhooks/stripe
```

#### PayPal Setup
```
1. Create PayPal Business Account
2. Get Client ID and Secret
3. Configure webhook URL
4. Enable Express Checkout
```

## Step 3: Configure Your Settings

### 1. Payment Methods
- **Cards**: Visa, Mastercard, American Express
- **Digital Wallets**: Apple Pay, Google Pay (if supported)
- **Bank Transfers**: ACH, wire transfers
- **Local Methods**: Region-specific options

### 2. Currencies
- Set your **primary currency**
- Enable **multi-currency** if selling internationally
- Configure **exchange rates** (automatic or manual)

### 3. Fees & Taxes
- **Processing Fees**: Automatically calculated
- **Additional Fees**: Custom fees per transaction
- **Tax Configuration**: VAT, sales tax settings
- **Fee Display**: Show/hide fees to customers

### 4. Notifications
- **Email Templates**: Customize payment confirmations
- **SMS Notifications**: Enable for important updates
- **Webhook URLs**: For your development team

## Step 4: Send Your First Payment Link

### Method 1: Dashboard (No Coding Required)

1. **Create Payment Request**
   - Go to **Payments** → **Create Payment**
   - Enter amount and currency
   - Add customer details
   - Set description

2. **Customize Payment Page**
   - **Logo**: Upload your business logo
   - **Colors**: Match your brand colors
   - **Thank You Message**: Custom success message

3. **Generate Payment Link**
   - Click **"Generate Link"**
   - Copy the payment URL
   - Share with your customer

### Method 2: Quick API Call

```bash
curl -X POST https://api.ottu.com/v1/payments \
  -H "Authorization: Bearer your_secret_key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "USD",
    "description": "Product purchase",
    "customer": {
      "email": "customer@example.com",
      "name": "John Smith"
    }
  }'
```

### Method 3: Email Invoice

1. **Create Invoice**
   - Go to **Invoices** → **Create Invoice**
   - Add line items and customer details
   - Set payment terms

2. **Send Invoice**
   - Review invoice details
   - Click **"Send Invoice"**
   - Customer receives email with payment link

## Step 5: Process a Test Transaction

### Using Test Mode

1. **Enable Test Mode**
   - Go to **Settings** → **General**
   - Toggle **"Test Mode"** ON
   - All transactions will be simulated

2. **Use Test Card**
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: 12/25
   CVC: 123
   Name: Any name
   ```

3. **Complete Payment**
   - Open your payment link
   - Enter test card details
   - Click **"Pay Now"**
   - Verify success page

### Monitor the Transaction

1. **Check Dashboard**
   - Go to **Payments** → **All Payments**
   - Find your test transaction
   - Status should be **"Succeeded"**

2. **View Details**
   - Click on the transaction
   - Review payment details
   - Check customer information

## Step 6: Track and Manage Payments

### Transaction Management

1. **View All Payments**
   - **Dashboard** → **Payments**
   - Filter by date, status, amount
   - Export transaction lists

2. **Individual Transaction Actions**
   - **View Details**: Complete transaction information
   - **Refund**: Process full or partial refunds
   - **Download Receipt**: Customer receipt PDF
   - **Send Receipt**: Email receipt to customer

### Reporting

1. **Built-in Reports**
   - **Daily Summary**: Today's transactions
   - **Weekly Report**: 7-day performance
   - **Monthly Report**: Complete month overview
   - **Custom Reports**: Date range selection

2. **Export Options**
   - **CSV Export**: For spreadsheet analysis
   - **PDF Reports**: Professional summaries
   - **API Export**: Integration with accounting software

## Step 7: Go Live

When you're ready to accept real payments:

### 1. Complete Account Verification
- Submit all required documents
- Wait for approval (1-2 business days)
- Receive confirmation email

### 2. Switch to Live Mode
- Go to **Settings** → **General**
- Toggle **"Test Mode"** OFF
- Confirm you want to go live

### 3. Update Payment Gateway
- Switch to **live credentials**
- Update webhook URLs
- Test with small real transaction

### 4. Monitor First Transactions
- Watch for successful payments
- Check webhook delivery
- Verify bank deposits

## Advanced Features

### Recurring Payments
- Set up subscription billing
- Automatic payment collection
- Customer self-service portal

### Multi-Currency
- Accept payments in 100+ currencies
- Automatic currency conversion
- Local payment methods

### Team Management
- Add team members
- Set role-based permissions
- Audit trail for all actions

### Custom Integrations
- **Website Integration**: Add payment buttons
- **Mobile Apps**: iOS and Android SDKs
- **E-commerce**: Shopify, WooCommerce plugins

## Common Questions

### How long do payments take to settle?
- **Card payments**: 1-3 business days
- **Bank transfers**: 3-5 business days
- **Digital wallets**: 1-2 business days

### What are the fees?
- **Processing fees**: Varies by gateway and payment method
- **Ottu platform fee**: Transparent pricing
- **No hidden fees**: All costs clearly displayed

### Is it secure?
- **PCI DSS Level 1** compliant
- **SSL encryption** for all data
- **Fraud detection** included
- **3-D Secure** authentication

### Can I customize the payment page?
- **Yes!** Upload your logo and set brand colors
- **Custom domains** available
- **White-label** options for enterprise

## Support & Resources

### Getting Help
- **Live Chat**: Available 24/7 in dashboard
- **Email Support**: support@ottu.com
- **Phone Support**: Available for verified accounts
- **Help Center**: Comprehensive self-service guides

### Resources
- **Video Tutorials**: Step-by-step guides
- **Webinars**: Monthly training sessions
- **Community**: Connect with other merchants
- **Status Page**: Real-time system status

### Account Management
- **Dedicated Support**: For high-volume merchants
- **Integration Assistance**: Technical implementation help
- **Training Sessions**: Team onboarding support

---

**🎉 Congratulations!** Your business is now ready to accept payments with Ottu. Start sending payment links to your customers and watch your sales grow!