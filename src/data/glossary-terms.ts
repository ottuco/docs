export interface GlossaryTerm {
  term: string;
  id: string;
  definition: string; // May contain simple HTML links (<a href="...">)
  aliases?: string[];
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: "3-D Secure (3DS)",
    id: "3ds",
    definition:
      "An additional layer of security for online credit card transactions that requires customer authentication through their bank.",
    aliases: ["3DS", "Three-D Secure", "3D Secure"],
  },
  {
    term: "ACH (Automated Clearing House)",
    id: "ach",
    definition:
      "An electronic network for financial transactions in the United States.",
    aliases: ["Automated Clearing House"],
  },
  {
    term: "AML (Anti-Money Laundering)",
    id: "aml",
    definition:
      "Regulations and procedures designed to prevent money laundering and terrorist financing.",
    aliases: ["Anti-Money Laundering"],
  },
  {
    term: "API (Application Programming Interface)",
    id: "api",
    definition:
      "A set of protocols and tools for building software applications. Ottu's API allows developers to integrate payment processing.",
    aliases: ["Application Programming Interface"],
  },
  {
    term: "Acquirer",
    id: "acquirer",
    definition:
      "The bank or financial institution that processes credit card transactions for merchants.",
  },
  {
    term: "Authentication Error",
    id: "authentication-error",
    definition:
      "An error that occurs when API credentials are invalid or missing.",
  },
  {
    term: "Authorization",
    id: "authorization",
    definition:
      "The process of verifying that a customer's payment method has sufficient funds for a transaction. Authorization holds the amount but doesn't actually charge the customer until the transaction is captured.",
  },
  {
    term: "Authorization Error",
    id: "authorization-error",
    definition:
      "An error that occurs when the API key doesn't have permission to perform the requested action.",
  },
  {
    term: "Auto-Debit",
    id: "auto-debit",
    definition:
      "Ottu's recurring payment feature that automatically charges customers on a scheduled basis.",
  },
  {
    term: "Average Transaction Value",
    id: "average-transaction-value",
    definition:
      "The average amount of money per transaction over a given period.",
    aliases: ["ATV"],
  },
  {
    term: "Bank Transfer",
    id: "bank-transfer",
    definition:
      "Direct transfer of funds from the customer's bank account to the merchant's account.",
  },
  {
    term: "Base Currency",
    id: "base-currency",
    definition:
      "The primary currency of your Ottu account, used for reporting and settlements.",
  },
  {
    term: "Callback URL",
    id: "callback-url",
    definition:
      "A URL that Ottu calls to notify your application about payment events.",
  },
  {
    term: "Capture",
    id: "capture",
    definition:
      "The process of actually charging the customer's payment method after authorization. This transfers the funds from the customer's account.",
  },
  {
    term: "Chargeback",
    id: "chargeback",
    definition:
      "A dispute initiated by the customer's bank to reverse a transaction. Often occurs when a customer claims they didn't authorize a purchase.",
  },
  {
    term: "Client-Side Integration",
    id: "client-side-integration",
    definition:
      "Integration that processes payments in the customer's browser using Ottu's JavaScript SDK.",
  },
  {
    term: "Compliance",
    id: "compliance",
    definition:
      "Adherence to laws, regulations, and industry standards. In payments, this often refers to PCI DSS compliance.",
  },
  {
    term: "Conversion Rate",
    id: "conversion-rate",
    definition:
      "The percentage of payment attempts that result in successful transactions.",
  },
  {
    term: "Credit Card",
    id: "credit-card",
    definition:
      "A payment method that allows customers to borrow money from a bank to make purchases.",
  },
  {
    term: "Debit Card",
    id: "debit-card",
    definition:
      "A payment method that deducts money directly from the customer's bank account.",
  },
  {
    term: "Digital Wallet",
    id: "digital-wallet",
    definition:
      "Electronic payment systems like Apple Pay, Google Pay, or PayPal that store payment information digitally.",
  },
  {
    term: "Embedded Checkout",
    id: "embedded-checkout",
    definition:
      "A payment form that's integrated directly into your website or application.",
  },
  {
    term: "Encryption",
    id: "encryption",
    definition:
      "The process of converting data into a code to prevent unauthorized access.",
  },
  {
    term: "Escrow",
    id: "escrow",
    definition:
      "A financial arrangement where a third party holds money until certain conditions are met.",
  },
  {
    term: "Exchange Rate",
    id: "exchange-rate",
    definition:
      "The rate at which one currency can be exchanged for another. Ottu handles real-time currency conversion.",
  },
  {
    term: "Gateway Error",
    id: "gateway-error",
    definition:
      "An error that occurs at the payment gateway level, often related to payment processing issues.",
  },
  {
    term: "Gross Revenue",
    id: "gross-revenue",
    definition:
      "The total amount of money received from sales before deducting any fees or costs.",
  },
  {
    term: "Hosted Payment Page",
    id: "hosted-payment-page",
    definition:
      "A payment page hosted by Ottu that handles the entire payment process.",
  },
  {
    term: "Idempotency",
    id: "idempotency",
    definition:
      "The property of operations that can be performed multiple times without changing the result. Ottu uses idempotency keys to prevent duplicate payments.",
  },
  {
    term: "Interchange Fee",
    id: "interchange-fee",
    definition:
      "The fee paid by the merchant's bank to the customer's bank for processing card transactions.",
  },
  {
    term: "Issuer",
    id: "issuer",
    definition: "The bank that issued the credit card to the customer.",
  },
  {
    term: "JSON (JavaScript Object Notation)",
    id: "json",
    definition:
      "A lightweight data-interchange format. Ottu's API uses JSON for all request and response data.",
    aliases: ["JavaScript Object Notation"],
  },
  {
    term: "KYC (Know Your Customer)",
    id: "kyc",
    definition:
      "The process of verifying the identity of customers to prevent fraud and comply with regulations.",
    aliases: ["Know Your Customer"],
  },
  {
    term: "Lifetime Value (LTV)",
    id: "ltv",
    definition:
      "The total amount of money a customer is expected to spend with your business over their lifetime.",
    aliases: ["LTV"],
  },
  {
    term: "MID (Merchant Identification Number)",
    id: "mid",
    definition:
      'A unique identifier assigned to a merchant by the payment gateway or acquiring bank. In Ottu, each payment gateway configuration holds MID credentials provided by your bank. Ottu staff handle gateway configuration and provide you with the <code>pg_codes</code> needed for the API. See <a href="/developers/payments/payment-methods">Payment Methods</a> for details.',
    aliases: ["Merchant Identification Number"],
  },
  {
    term: "Marketplace Payments",
    id: "marketplace-payments",
    definition:
      "Payment processing for platforms that connect multiple sellers with buyers.",
  },
  {
    term: "Merchant",
    id: "merchant",
    definition:
      "A business that accepts payments from customers. In Ottu's context, this is you \u2014 the business using Ottu's services.",
  },
  {
    term: "Merchant Discount Rate (MDR)",
    id: "mdr",
    definition:
      "The fee charged by payment processors for processing transactions, typically a percentage of the transaction amount.",
    aliases: ["MDR"],
  },
  {
    term: "Monthly Recurring Revenue (MRR)",
    id: "mrr",
    definition:
      "The predictable revenue generated from recurring subscriptions each month.",
    aliases: ["MRR"],
  },
  {
    term: "Multi-Currency",
    id: "multi-currency",
    definition:
      "The ability to accept payments in multiple currencies and handle currency conversion.",
  },
  {
    term: "Net Revenue",
    id: "net-revenue",
    definition:
      "The amount of money received after deducting processing fees and other costs.",
  },
  {
    term: "Network Error",
    id: "network-error",
    definition:
      "An error that occurs due to connectivity issues between systems.",
  },
  {
    term: "PCI DSS (Payment Card Industry Data Security Standard)",
    id: "pci-dss",
    definition:
      "A set of security standards designed to ensure that all companies that process credit card information maintain a secure environment.",
    aliases: ["PCI DSS", "PCI"],
  },
  {
    term: "PG Code",
    id: "pg-code",
    definition:
      "Payment Gateway Code \u2014 Ottu's internal identifier for different payment gateways and methods.",
    aliases: ["Payment Gateway Code"],
  },
  {
    term: "Payment Gateway",
    id: "payment-gateway",
    definition:
      "The service that processes credit card transactions. Ottu integrates with multiple gateways like Stripe, PayPal, and others.",
    aliases: ["PG"],
  },
  {
    term: "Payment Request",
    id: "payment-request",
    definition:
      "An Ottu object that represents a customer's intent to pay. Contains all the details needed to process a payment.",
  },
  {
    term: "Processing Fee",
    id: "processing-fee",
    definition:
      "The fee charged by Ottu for processing payments, separate from gateway fees.",
  },
  {
    term: "REST (Representational State Transfer)",
    id: "rest",
    definition:
      "An architectural style for web services. Ottu's API follows REST principles for predictable, easy-to-use endpoints.",
    aliases: ["Representational State Transfer"],
  },
  {
    term: "Rate Limit Error",
    id: "rate-limit-error",
    definition:
      "An error that occurs when too many requests are made in a short time period.",
  },
  {
    term: "Rate Limiting",
    id: "rate-limiting",
    definition:
      "Controlling the number of API requests a client can make in a given time period to ensure fair usage and system stability.",
  },
  {
    term: "Refund",
    id: "refund",
    definition:
      "Returning money to a customer after a transaction has been completed. Can be full or partial.",
  },
  {
    term: "Return URL",
    id: "return-url",
    definition:
      "The URL where customers are redirected after completing or cancelling a payment.",
  },
  {
    term: "SDK (Software Development Kit)",
    id: "sdk",
    definition:
      "A collection of software development tools. Ottu provides SDKs for various programming languages and platforms.",
    aliases: ["Software Development Kit"],
  },
  {
    term: "SEPA (Single Euro Payments Area)",
    id: "sepa",
    definition:
      "A payment integration initiative of the European Union for Euro transactions.",
    aliases: ["Single Euro Payments Area"],
  },
  {
    term: "SSL/TLS (Secure Sockets Layer/Transport Layer Security)",
    id: "ssl-tls",
    definition:
      "Cryptographic protocols that provide communications security over a computer network.",
    aliases: ["SSL", "TLS", "Secure Sockets Layer", "Transport Layer Security"],
  },
  {
    term: "Sandbox",
    id: "sandbox",
    definition:
      "A testing environment that simulates real payment processing without using real money or payment methods.",
  },
  {
    term: "Server-Side Integration",
    id: "server-side-integration",
    definition:
      "Integration that processes payments on your server using Ottu's API.",
  },
  {
    term: "Session Token",
    id: "session-token",
    definition:
      "A temporary identifier used to securely manage payment sessions between your application and Ottu.",
  },
  {
    term: "Settlement",
    id: "settlement",
    definition:
      "The final transfer of funds from the payment processor to the merchant's bank account, typically occurring 1\u20133 business days after capture.",
  },
  {
    term: "Split Payments",
    id: "split-payments",
    definition:
      "Dividing a single payment among multiple recipients, common in marketplace scenarios.",
  },
  {
    term: "Subscription Billing",
    id: "subscription-billing",
    definition:
      "Recurring billing model where customers are charged automatically at regular intervals.",
  },
  {
    term: "Tokenization",
    id: "tokenization",
    definition:
      "The process of replacing sensitive payment data with non-sensitive tokens that have no exploitable value.",
  },
  {
    term: "Transaction States",
    id: "transaction-states",
    definition:
      'The lifecycle states a payment passes through from creation to completion. See <a href="/developers/reference/payment-states/">Payment Transaction States</a> for the full state machine reference.',
  },
  {
    term: "Two-Factor Authentication (2FA)",
    id: "2fa",
    definition:
      "A security process that requires two different authentication factors to verify a user's identity.",
    aliases: ["2FA"],
  },
  {
    term: "Validation Error",
    id: "validation-error",
    definition:
      "An error that occurs when the provided data doesn't meet the required format or constraints.",
  },
  {
    term: "Void",
    id: "void",
    definition:
      "Canceling an authorized transaction before it's captured. This releases the hold on the customer's funds without any money changing hands.",
  },
  {
    term: "Webhook",
    id: "webhook",
    definition:
      "HTTP callbacks that notify your application when events occur in Ottu (like successful payments).",
  },
  {
    term: "Webhook Secret",
    id: "webhook-secret",
    definition:
      "A secret key used to verify that webhook events are genuinely from Ottu and haven't been tampered with.",
  },
  {
    term: "White-label",
    id: "white-label",
    definition:
      "A product or service that can be rebranded and resold by other companies.",
  },
];

export default glossaryTerms;
