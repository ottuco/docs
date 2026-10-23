import type { ChangelogEntry } from "@site/src/components/Changelog";

export const changelogEntries: ChangelogEntry[] = [
  {
    date: "2026-09-15",
    category: "api",
    title: "Public key no longer accepted on User Cards, Payment Methods and auto-debit",
    link: "/developers/getting-started/authentication/#public-key",
    description:
      "POST /b/pbl/v2/card/, DELETE /b/pbl/v2/card/{token}/, POST /b/pbl/v2/payment-methods/ and the auto-debit endpoints answer 401 to the public key; call them from your server with the private key. The Checkout SDK now deletes saved cards through a session-scoped route.",
  },
  {
    date: "2026-03-16",
    category: "dashboard",
    title: "Connect Frontend redesign with updated navigation",
    description:
      "Refreshed dashboard interface with improved navigation structure and updated component library.",
  },
  {
    date: "2026-03-12",
    category: "api",
    title: "Disable Change Password option in merchant settings",
    link: "/business/settings/",
  },
  {
    date: "2026-03-12",
    category: "dashboard",
    title: "Reset Password moved to admin user details section",
  },
  {
    date: "2026-03-12",
    category: "payments",
    title: "Al Dar Exchant: qpay, Apple Pay, and Cybersource now supported",
    link: "/business/payments/gateways",
    description:
      "Three new payment gateway integrations available for Al Dar Exchant merchants.",
  },
  {
    date: "2026-03-11",
    category: "sdk",
    title: "Token data available in the pre-payment hook",
    link: "/developers/payments/checkout-sdk/web/#beforepayment-hook",
    description:
      "The beforePayment hook now includes token-related data, enabling card-aware logic before payment submission.",
  },
  {
    date: "2026-03-11",
    category: "sdk",
    title: "Fixed CVV field error translations for English and Arabic",
  },
  {
    date: "2026-03-11",
    category: "sdk",
    title: "Card form name field is now optional",
  },
  {
    date: "2026-03-11",
    category: "api",
    title: "Auto-debit CIT flow updated to use verify instead of pay/authorize",
    link: "/developers/cards-and-tokens/",
    breaking: true,
  },
  {
    date: "2026-03-11",
    category: "security",
    title: "Migrated to IAM Role-Based authentication for AWS services",
    description:
      "Replaced plaintext AWS credentials with IAM role-based authentication across all services.",
  },
  {
    date: "2026-03-11",
    category: "payments",
    title: "Removed payment_processing_day from MPGS implementation",
  },
];
