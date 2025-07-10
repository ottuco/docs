# Glossary & Payment Terms

Comprehensive glossary of payment processing terms, Ottu-specific concepts, and industry terminology.

## General Payment Terms

### Authorization
The process of verifying that a customer's payment method has sufficient funds for a transaction. Authorization holds the amount but doesn't actually charge the customer until the transaction is captured.

### Capture
The process of actually charging the customer's payment method after authorization. This transfers the funds from the customer's account.

### Settlement
The final transfer of funds from the payment processor to the merchant's bank account, typically occurring 1-3 business days after capture.

### Void
Canceling an authorized transaction before it's captured. This releases the hold on the customer's funds without any money changing hands.

### Refund
Returning money to a customer after a transaction has been completed. Can be full or partial.

### Chargeback
A dispute initiated by the customer's bank to reverse a transaction. Often occurs when a customer claims they didn't authorize a purchase.

### 3-D Secure (3DS)
An additional layer of security for online credit card transactions that requires customer authentication through their bank.

## Ottu-Specific Terms

### Payment Request
An Ottu object that represents a customer's intent to pay. Contains all the details needed to process a payment.

### PG Code
Payment Gateway Code - Ottu's internal identifier for different payment gateways and methods.

### Session Token
A temporary identifier used to securely manage payment sessions between your application and Ottu.

### Webhook Secret
A secret key used to verify that webhook events are genuinely from Ottu and haven't been tampered with.

### Auto-Debit
Ottu's recurring payment feature that automatically charges customers on a scheduled basis.

### Payment Gateway
The service that processes credit card transactions. Ottu integrates with multiple gateways like Stripe, PayPal, and others.

## Technical Terms

### API (Application Programming Interface)
A set of protocols and tools for building software applications. Ottu's API allows developers to integrate payment processing.

### REST (Representational State Transfer)
An architectural style for web services. Ottu's API follows REST principles for predictable, easy-to-use endpoints.

### JSON (JavaScript Object Notation)
A lightweight data-interchange format. Ottu's API uses JSON for all request and response data.

### SDK (Software Development Kit)
A collection of software development tools. Ottu provides SDKs for various programming languages and platforms.

### Webhook
HTTP callbacks that notify your application when events occur in Ottu (like successful payments).

### Idempotency
The property of operations that can be performed multiple times without changing the result. Ottu uses idempotency keys to prevent duplicate payments.

### Rate Limiting
Controlling the number of API requests a client can make in a given time period to ensure fair usage and system stability.

### Sandbox
A testing environment that simulates real payment processing without using real money or payment methods.

## Currency & Financial Terms

### Base Currency
The primary currency of your Ottu account, used for reporting and settlements.

### Multi-Currency
The ability to accept payments in multiple currencies and handle currency conversion.

### Exchange Rate
The rate at which one currency can be exchanged for another. Ottu handles real-time currency conversion.

### Merchant Discount Rate (MDR)
The fee charged by payment processors for processing transactions, typically a percentage of the transaction amount.

### Interchange Fee
The fee paid by the merchant's bank to the customer's bank for processing card transactions.

### Processing Fee
The fee charged by Ottu for processing payments, separate from gateway fees.

## Security Terms

### PCI DSS (Payment Card Industry Data Security Standard)
A set of security standards designed to ensure that all companies that process credit card information maintain a secure environment.

### SSL/TLS (Secure Sockets Layer/Transport Layer Security)
Cryptographic protocols that provide communications security over a computer network.

### Tokenization
The process of replacing sensitive payment data with non-sensitive tokens that have no exploitable value.

### Encryption
The process of converting data into a code to prevent unauthorized access.

### Two-Factor Authentication (2FA)
A security process that requires two different authentication factors to verify a user's identity.

## Business Terms

### Merchant
A business that accepts payments from customers. In Ottu's context, this is you - the business using Ottu's services.

### Acquirer
The bank or financial institution that processes credit card transactions for merchants.

### Issuer
The bank that issued the credit card to the customer.

### Compliance
Adherence to laws, regulations, and industry standards. In payments, this often refers to PCI DSS compliance.

### KYC (Know Your Customer)
The process of verifying the identity of customers to prevent fraud and comply with regulations.

### AML (Anti-Money Laundering)
Regulations and procedures designed to prevent money laundering and terrorist financing.

## Transaction States

### Created
The initial state when a payment request is created but not yet processed.

### Pending
The payment is waiting for customer action (e.g., completing checkout form).

### Processing
The payment is being processed by the payment gateway.

### Succeeded
The payment has been successfully processed and funds are captured.

### Failed
The payment was attempted but failed for various reasons (declined card, insufficient funds, etc.).

### Cancelled
The payment was cancelled before completion, either by the customer or merchant.

### Refunded
The payment has been reversed and funds returned to the customer.

### Disputed
The payment is subject to a chargeback or dispute.

## Payment Methods

### Credit Card
A payment method that allows customers to borrow money from a bank to make purchases.

### Debit Card
A payment method that deducts money directly from the customer's bank account.

### Digital Wallet
Electronic payment systems like Apple Pay, Google Pay, or PayPal that store payment information digitally.

### Bank Transfer
Direct transfer of funds from the customer's bank account to the merchant's account.

### ACH (Automated Clearing House)
An electronic network for financial transactions in the United States.

### SEPA (Single Euro Payments Area)
A payment integration initiative of the European Union for Euro transactions.

## Error Types

### Validation Error
An error that occurs when the provided data doesn't meet the required format or constraints.

### Authentication Error
An error that occurs when API credentials are invalid or missing.

### Authorization Error
An error that occurs when the API key doesn't have permission to perform the requested action.

### Rate Limit Error
An error that occurs when too many requests are made in a short time period.

### Gateway Error
An error that occurs at the payment gateway level, often related to payment processing issues.

### Network Error
An error that occurs due to connectivity issues between systems.

## Reporting Terms

### Gross Revenue
The total amount of money received from sales before deducting any fees or costs.

### Net Revenue
The amount of money received after deducting processing fees and other costs.

### Conversion Rate
The percentage of payment attempts that result in successful transactions.

### Average Transaction Value
The average amount of money per transaction over a given period.

### Monthly Recurring Revenue (MRR)
The predictable revenue generated from recurring subscriptions each month.

### Lifetime Value (LTV)
The total amount of money a customer is expected to spend with your business over their lifetime.

## Integration Terms

### Hosted Payment Page
A payment page hosted by Ottu that handles the entire payment process.

### Embedded Checkout
A payment form that's integrated directly into your website or application.

### Server-Side Integration
Integration that processes payments on your server using Ottu's API.

### Client-Side Integration
Integration that processes payments in the customer's browser using Ottu's JavaScript SDK.

### Callback URL
A URL that Ottu calls to notify your application about payment events.

### Return URL
The URL where customers are redirected after completing or cancelling a payment.

## Industry-Specific Terms

### Subscription Billing
Recurring billing model where customers are charged automatically at regular intervals.

### Marketplace Payments
Payment processing for platforms that connect multiple sellers with buyers.

### Split Payments
Dividing a single payment among multiple recipients, common in marketplace scenarios.

### Escrow
A financial arrangement where a third party holds money until certain conditions are met.

### White-label
A product or service that can be rebranded and resold by other companies.

## Need More Help?

If you encounter a term not listed here or need clarification on any concept:

- **Search our documentation**: Use the search function to find detailed explanations
- **Contact support**: Email support@ottu.com for specific questions
- **Developer resources**: Check our API documentation for technical terms
- **Community forums**: Join discussions with other Ottu users

This glossary is continuously updated as new features and terms are introduced to the Ottu platform.