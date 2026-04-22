import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main sidebar for overview and quick start
  mainSidebar: [
    {
      type: 'category',
      label: 'Overview',
      link: {type: 'doc', id: 'overview/about'},
      items: [
        'overview/about',
        'overview/architecture',
        'overview/changelog',
      ],
    },
    {
      type: 'category',
      label: 'Glossary & Resources',
      link: {type: 'doc', id: 'glossary/index'},
      items: [
        'glossary/index',
        'resources/index',
      ],
    },
  ],

  // Developer-focused sidebar
  developerSidebar: [
    {
      type: 'category',
      label: 'Developers',
      link: {type: 'doc', id: 'developers/index'},
      items: [
        {
          type: 'category',
          label: 'Getting Started',
          link: {type: 'doc', id: 'developers/getting-started/index'},
          items: [
            {type: 'doc', id: 'developers/getting-started/index', label: 'Quickstart'},
            {type: 'doc', id: 'developers/getting-started/authentication', label: 'Authentication'},
            {type: 'doc', id: 'developers/getting-started/api-fundamentals', label: 'API Fundamentals'},
          ],
        },
        {
          type: 'category',
          label: 'Payments',
          link: {type: 'doc', id: 'developers/payments/index'},
          items: [
            {type: 'doc', id: 'developers/payments/index', label: 'Overview'},
            {type: 'doc', id: 'developers/payments/payment-journey', label: 'Payment Journey'},
            {
              type: 'category',
              label: 'Checkout API',
              link: {type: 'doc', id: 'developers/payments/checkout-api'},
              items: [
                {
                  type: 'link',
                  label: 'Create a new Payment Transaction',
                  href: '/developers/payments/checkout-api#api-create-a-new-payment-transaction',
                },
                {
                  type: 'link',
                  label: 'Retrieve Payment Transaction',
                  href: '/developers/payments/checkout-api#api-retrieve-payment-transaction',
                },
                {
                  type: 'link',
                  label: 'Update Payment Transaction',
                  href: '/developers/payments/checkout-api#api-update-payment-transaction',
                },
                {type: 'link', label: 'Upload Attachment', href: '/developers/payments/checkout-api#upload-attachment'},
                {type: 'link', label: 'One-Step Checkout', href: '/developers/payments/checkout-api#one-step-checkout'},
                {type: 'link', label: 'FAQ', href: '/developers/payments/checkout-api#faq'},
              ],
            },
            {
              type: 'category',
              label: 'Payment Status Query',
              link: {type: 'doc', id: 'developers/payments/psq'},
              items: [
                {type: 'link', label: 'When to Use', href: '/developers/payments/psq#when-to-use'},
                {type: 'link', label: 'Setup', href: '/developers/payments/psq#setup'},
                {type: 'link', label: 'Guide', href: '/developers/payments/psq#guide'},
                {type: 'link', label: 'API Reference', href: '/developers/payments/psq#api-reference'},
                {type: 'link', label: 'Best Practices', href: '/developers/payments/psq#best-practices'},
                {type: 'link', label: 'FAQ', href: '/developers/payments/psq#faq'},
              ],
            },
            {
              type: 'category',
              label: 'Payment Methods',
              link: {type: 'doc', id: 'developers/payments/payment-methods'},
              items: [
                {type: 'link', label: 'When to Use', href: '/developers/payments/payment-methods#when-to-use'},
                {type: 'link', label: 'Guide', href: '/developers/payments/payment-methods#guide'},
                {type: 'link', label: 'API Reference', href: '/developers/payments/payment-methods#api-reference'},
                {type: 'link', label: 'Best Practices', href: '/developers/payments/payment-methods#best-practices'},
                {type: 'link', label: 'FAQ', href: '/developers/payments/payment-methods#faq'},
              ],
            },
            {
              type: 'category',
              label: 'Native Payments',
              link: {type: 'doc', id: 'developers/payments/native-payments'},
              items: [
                {type: 'link', label: 'When to Use', href: '/developers/payments/native-payments#when-to-use'},
                {type: 'link', label: 'Setup', href: '/developers/payments/native-payments#setup'},
                {type: 'link', label: 'Guide', href: '/developers/payments/native-payments#guide'},
                {type: 'link', label: 'API Reference', href: '/developers/payments/native-payments#api-reference'},
                {type: 'link', label: 'FAQ', href: '/developers/payments/native-payments#faq'},
              ],
            },
            {
              type: 'category',
              label: 'Checkout SDK',
              link: {type: 'doc', id: 'developers/payments/checkout-sdk/index'},
              items: [
                {type: 'doc', id: 'developers/payments/checkout-sdk/web', label: 'Web'},
                {type: 'doc', id: 'developers/payments/checkout-sdk/ios', label: 'iOS'},
                {type: 'doc', id: 'developers/payments/checkout-sdk/android', label: 'Android'},
                {type: 'doc', id: 'developers/payments/checkout-sdk/flutter', label: 'Flutter'},
              ],
            },
            {type: 'doc', id: 'developers/payments/sandbox', label: 'Sandbox & Test Cards'},
          ],
        },
        {
          type: 'category',
          label: 'Operations',
          link: {type: 'doc', id: 'developers/operations'},
          items: [
            {type: 'link', label: 'When to Use', href: '/developers/operations#when-to-use'},
            {type: 'link', label: 'Setup', href: '/developers/operations#setup'},
            {type: 'link', label: 'Guide', href: '/developers/operations#guide'},
            {type: 'link', label: 'API Reference', href: '/developers/operations#api-reference'},
            {type: 'link', label: 'FAQ', href: '/developers/operations#faq'},
          ],
        },
        {
          type: 'category',
          label: 'Cards & Tokenization',
          link: {type: 'doc', id: 'developers/cards-and-tokens/index'},
          items: [
            {type: 'doc', id: 'developers/cards-and-tokens/index', label: 'Overview'},
            {type: 'doc', id: 'developers/cards-and-tokens/tokenization', label: 'Tokenization'},
            {
              type: 'category',
              label: 'User Cards',
              link: {type: 'doc', id: 'developers/cards-and-tokens/user-cards'},
              items: [
                {type: 'link', label: 'When to Use', href: '/developers/cards-and-tokens/user-cards#when-to-use'},
                {type: 'link', label: 'Setup', href: '/developers/cards-and-tokens/user-cards#setup'},
                {type: 'link', label: 'Guide', href: '/developers/cards-and-tokens/user-cards#guide'},
                {type: 'link', label: 'API Reference', href: '/developers/cards-and-tokens/user-cards#api-reference'},
                {type: 'link', label: 'FAQ', href: '/developers/cards-and-tokens/user-cards#faq'},
              ],
            },
            {
              type: 'category',
              label: 'Recurring Payments',
              link: {type: 'doc', id: 'developers/cards-and-tokens/recurring-payments'},
              items: [
                {type: 'link', label: 'When to Use', href: '/developers/cards-and-tokens/recurring-payments#when-to-use'},
                {type: 'link', label: 'Setup', href: '/developers/cards-and-tokens/recurring-payments#setup'},
                {type: 'link', label: 'Guide', href: '/developers/cards-and-tokens/recurring-payments#guide'},
                {type: 'link', label: 'API Reference', href: '/developers/cards-and-tokens/recurring-payments#api-reference'},
                {type: 'link', label: 'Best Practices', href: '/developers/cards-and-tokens/recurring-payments#best-practices'},
                {type: 'link', label: 'FAQ', href: '/developers/cards-and-tokens/recurring-payments#faq'},
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Invoices',
          link: {type: 'doc', id: 'developers/invoices'},
          items: [
            {type: 'link', label: 'When to Use', href: '/developers/invoices#when-to-use'},
            {type: 'link', label: 'Setup', href: '/developers/invoices#setup'},
            {type: 'link', label: 'Guide', href: '/developers/invoices#guide'},
            {type: 'link', label: 'API Reference', href: '/developers/invoices#api-reference'},
            {type: 'link', label: 'Best Practices', href: '/developers/invoices#best-practices'},
            {type: 'link', label: 'FAQ', href: '/developers/invoices#faq'},
          ],
        },
        {
          type: 'category',
          label: 'Webhooks & Events',
          link: {type: 'doc', id: 'developers/webhooks/index'},
          items: [
            {type: 'doc', id: 'developers/webhooks/index', label: 'Overview & Setup'},
            {type: 'doc', id: 'developers/webhooks/payment-events', label: 'Payment Events'},
            {type: 'doc', id: 'developers/webhooks/operation-events', label: 'Operation Events'},
            {type: 'doc', id: 'developers/webhooks/pg-params', label: 'PG Params'},
            {type: 'doc', id: 'developers/webhooks/verify-signatures', label: 'Verify Signatures'},
          ],
        },
        {
          type: 'category',
          label: 'Notifications',
          link: {type: 'doc', id: 'developers/notifications'},
          items: [
            {type: 'link', label: 'When to Use', href: '/developers/notifications#when-to-use'},
            {type: 'link', label: 'Setup', href: '/developers/notifications#setup'},
            {type: 'link', label: 'Guide', href: '/developers/notifications#guide'},
            {type: 'link', label: 'API Reference', href: '/developers/notifications#api-reference'},
            {type: 'link', label: 'Best Practices', href: '/developers/notifications#best-practices'},
            {type: 'link', label: 'FAQ', href: '/developers/notifications#faq'},
          ],
        },
        {
          type: 'category',
          label: 'Reports',
          link: {type: 'doc', id: 'developers/reports'},
          items: [
            {type: 'link', label: 'When to Use', href: '/developers/reports#when-to-use'},
            {type: 'link', label: 'Setup', href: '/developers/reports#setup'},
            {type: 'link', label: 'Guide', href: '/developers/reports#guide'},
            {type: 'link', label: 'API Reference', href: '/developers/reports#api-reference'},
            {type: 'link', label: 'Best Practices', href: '/developers/reports#best-practices'},
            {type: 'link', label: 'FAQ', href: '/developers/reports#faq'},
          ],
        },
        {
          type: 'category',
          label: 'Reference',
          link: {type: 'doc', id: 'developers/reference/error-codes'},
          items: [
            {type: 'doc', id: 'developers/reference/error-codes', label: 'Error Codes'},
            {type: 'doc', id: 'developers/reference/payment-states', label: 'Payment States'},
          ],
        },
      ],
    },
  ],

  // Business user-focused sidebar
  businessSidebar: [
    {
      type: 'doc',
      id: 'business/index',
      label: 'Getting Started',
    },
    {
      type: 'category',
      label: 'Payments',
      collapsible: true,
      collapsed: false,
      items: [
        'business/payments/gateways',
        'business/payments/routing',
        'business/payments/currencies',
        {
          type: 'category',
          label: 'Payment Services',
          link: {type: 'doc', id: 'business/payments/services/index'},
          items: [
            {
              type: 'category',
              label: 'Apple Pay',
              link: {type: 'doc', id: 'business/payments/services/apple-pay/index'},
              items: [
                'business/payments/services/apple-pay/setup-mpgs',
                'business/payments/services/apple-pay/setup-cybersource',
              ],
            },
            'business/payments/services/samsung-wallet',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Payment Management',
      link: {type: 'doc', id: 'business/payment-management/index'},
      items: [
        'business/payment-management/search-and-filter',
        'business/payment-management/transaction-insights',
        'business/payment-management/transaction-states',
        'business/payment-management/notifications-timing',
      ],
    },
    {
      type: 'category',
      label: 'Plugins',
      link: {type: 'doc', id: 'business/plugins/index'},
      items: [
        'business/plugins/payment-request',
        'business/plugins/e-commerce',
        'business/plugins/bulk-payment-request',
      ],
    },
    {
      type: 'category',
      label: 'Operations & Controls',
      link: {type: 'doc', id: 'business/operations/index'},
      items: [
        'business/operations/refund-void-access-control',
        'business/operations/two-step-authorization',
      ],
    },
    'business/integrations',
    {
      type: 'category',
      label: 'Notifications',
      link: {type: 'doc', id: 'business/notifications/index'},
      items: [
        'business/notifications/email',
        'business/notifications/sms',
        {
          type: 'category',
          label: 'WhatsApp',
          link: {type: 'doc', id: 'business/notifications/whatsapp/index'},
          items: [
            'business/notifications/whatsapp/integrated',
            'business/notifications/whatsapp/manual',
          ],
        },
        'business/notifications/templates',
        'business/notifications/delivery-process',
      ],
    },
    {
      type: 'category',
      label: 'Settings',
      link: {type: 'doc', id: 'business/settings/index'},
      items: [
        'business/settings/global',
        'business/settings/webhooks',
        'business/settings/transaction-reports',
        'business/settings/api-keys',
        'business/settings/url-shortener',
      ],
    },
    {
      type: 'category',
      label: 'Industry Solutions',
      collapsible: true,
      collapsed: true,
      items: [
        'business/industry/satellite',
        {
          type: 'category',
          label: 'Real Estate',
          link: {type: 'doc', id: 'business/industry/real-estate/index'},
          items: [
            'business/industry/real-estate/getting-started',
            'business/industry/real-estate/properties',
            {
              type: 'category',
              label: 'Tenants & Contracts',
              link: {type: 'doc', id: 'business/industry/real-estate/tenant-contract/index'},
              items: [
                'business/industry/real-estate/tenant-contract/dashboard',
                'business/industry/real-estate/tenant-contract/tenant-management',
                'business/industry/real-estate/tenant-contract/contract-management',
                'business/industry/real-estate/tenant-contract/add-contract',
                'business/industry/real-estate/tenant-contract/renew-contract',
                'business/industry/real-estate/tenant-contract/terminate-contract',
                'business/industry/real-estate/tenant-contract/suspend-contract',
                'business/industry/real-estate/tenant-contract/resume-contract',
                'business/industry/real-estate/tenant-contract/manual-payment',
                'business/industry/real-estate/tenant-contract/advance-payment',
              ],
            },
            'business/industry/real-estate/generate-invoice',
            'business/industry/real-estate/invoices-management',
            'business/industry/real-estate/maintenance',
            'business/industry/real-estate/transactions',
            'business/industry/real-estate/auditing',
          ],
        },
      ],
    },
    'business/compliance',
  ],

};

export default sidebars;
