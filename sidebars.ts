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
            {
              type: 'category',
              label: 'Checkout API',
              link: {type: 'doc', id: 'developers/payments/checkout-api'},
              items: [
                {
                  type: 'link',
                  label: 'Create a new Payment Transaction',
                  href: '/docs/developers/payments/checkout-api#api-create-a-new-payment-transaction',
                },
                {
                  type: 'link',
                  label: 'Retrieve Payment Transaction',
                  href: '/docs/developers/payments/checkout-api#api-retrieve-payment-transaction',
                },
                {
                  type: 'link',
                  label: 'Update Payment Transaction',
                  href: '/docs/developers/payments/checkout-api#api-update-payment-transaction',
                },
                {type: 'link', label: 'Upload Attachment', href: '/docs/developers/payments/checkout-api#upload-attachment'},
                {type: 'link', label: 'One-Step Checkout', href: '/docs/developers/payments/checkout-api#one-step-checkout'},
                {type: 'link', label: 'FAQ', href: '/docs/developers/payments/checkout-api#faq'},
              ],
            },
            {
              type: 'category',
              label: 'Payment Status (Inquiry)',
              link: {type: 'doc', id: 'developers/payments/inquiry'},
              items: [
                {type: 'link', label: 'When to Use', href: '/docs/developers/payments/inquiry#when-to-use'},
                {type: 'link', label: 'Setup', href: '/docs/developers/payments/inquiry#setup'},
                {type: 'link', label: 'Guide', href: '/docs/developers/payments/inquiry#guide'},
                {type: 'link', label: 'API Reference', href: '/docs/developers/payments/inquiry#api-reference'},
                {type: 'link', label: 'Best Practices', href: '/docs/developers/payments/inquiry#best-practices'},
                {type: 'link', label: 'FAQ', href: '/docs/developers/payments/inquiry#faq'},
              ],
            },
            {
              type: 'category',
              label: 'Payment Methods',
              link: {type: 'doc', id: 'developers/payments/payment-methods'},
              items: [
                {type: 'link', label: 'When to Use', href: '/docs/developers/payments/payment-methods#when-to-use'},
                {type: 'link', label: 'Guide', href: '/docs/developers/payments/payment-methods#guide'},
                {type: 'link', label: 'API Reference', href: '/docs/developers/payments/payment-methods#api-reference'},
                {type: 'link', label: 'Best Practices', href: '/docs/developers/payments/payment-methods#best-practices'},
                {type: 'link', label: 'FAQ', href: '/docs/developers/payments/payment-methods#faq'},
              ],
            },
            {
              type: 'category',
              label: 'Native Payments',
              link: {type: 'doc', id: 'developers/payments/native-payments'},
              items: [
                {type: 'link', label: 'When to Use', href: '/docs/developers/payments/native-payments#when-to-use'},
                {type: 'link', label: 'Setup', href: '/docs/developers/payments/native-payments#setup'},
                {type: 'link', label: 'Guide', href: '/docs/developers/payments/native-payments#guide'},
                {type: 'link', label: 'API Reference', href: '/docs/developers/payments/native-payments#api-reference'},
                {type: 'link', label: 'FAQ', href: '/docs/developers/payments/native-payments#faq'},
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
            {type: 'link', label: 'When to Use', href: '/docs/developers/operations#when-to-use'},
            {type: 'link', label: 'Setup', href: '/docs/developers/operations#setup'},
            {type: 'link', label: 'Guide', href: '/docs/developers/operations#guide'},
            {type: 'link', label: 'API Reference', href: '/docs/developers/operations#api-reference'},
            {type: 'link', label: 'FAQ', href: '/docs/developers/operations#faq'},
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
                {type: 'link', label: 'When to Use', href: '/docs/developers/cards-and-tokens/user-cards#when-to-use'},
                {type: 'link', label: 'Setup', href: '/docs/developers/cards-and-tokens/user-cards#setup'},
                {type: 'link', label: 'Guide', href: '/docs/developers/cards-and-tokens/user-cards#guide'},
                {type: 'link', label: 'API Reference', href: '/docs/developers/cards-and-tokens/user-cards#api-reference'},
                {type: 'link', label: 'FAQ', href: '/docs/developers/cards-and-tokens/user-cards#faq'},
              ],
            },
            {
              type: 'category',
              label: 'Recurring Payments',
              link: {type: 'doc', id: 'developers/cards-and-tokens/recurring-payments'},
              items: [
                {type: 'link', label: 'When to Use', href: '/docs/developers/cards-and-tokens/recurring-payments#when-to-use'},
                {type: 'link', label: 'Setup', href: '/docs/developers/cards-and-tokens/recurring-payments#setup'},
                {type: 'link', label: 'Guide', href: '/docs/developers/cards-and-tokens/recurring-payments#guide'},
                {type: 'link', label: 'API Reference', href: '/docs/developers/cards-and-tokens/recurring-payments#api-reference'},
                {type: 'link', label: 'Best Practices', href: '/docs/developers/cards-and-tokens/recurring-payments#best-practices'},
                {type: 'link', label: 'FAQ', href: '/docs/developers/cards-and-tokens/recurring-payments#faq'},
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Invoices',
          link: {type: 'doc', id: 'developers/invoices'},
          items: [
            {type: 'link', label: 'When to Use', href: '/docs/developers/invoices#when-to-use'},
            {type: 'link', label: 'Setup', href: '/docs/developers/invoices#setup'},
            {type: 'link', label: 'Guide', href: '/docs/developers/invoices#guide'},
            {type: 'link', label: 'API Reference', href: '/docs/developers/invoices#api-reference'},
            {type: 'link', label: 'Best Practices', href: '/docs/developers/invoices#best-practices'},
            {type: 'link', label: 'FAQ', href: '/docs/developers/invoices#faq'},
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
            {type: 'doc', id: 'developers/webhooks/verify-signatures', label: 'Verify Signatures'},
          ],
        },
        {
          type: 'category',
          label: 'Notifications',
          link: {type: 'doc', id: 'developers/notifications'},
          items: [
            {type: 'link', label: 'When to Use', href: '/docs/developers/notifications#when-to-use'},
            {type: 'link', label: 'Setup', href: '/docs/developers/notifications#setup'},
            {type: 'link', label: 'Guide', href: '/docs/developers/notifications#guide'},
            {type: 'link', label: 'API Reference', href: '/docs/developers/notifications#api-reference'},
            {type: 'link', label: 'Best Practices', href: '/docs/developers/notifications#best-practices'},
            {type: 'link', label: 'FAQ', href: '/docs/developers/notifications#faq'},
          ],
        },
        {
          type: 'category',
          label: 'Reports',
          link: {type: 'doc', id: 'developers/reports'},
          items: [
            {type: 'link', label: 'When to Use', href: '/docs/developers/reports#when-to-use'},
            {type: 'link', label: 'Setup', href: '/docs/developers/reports#setup'},
            {type: 'link', label: 'Guide', href: '/docs/developers/reports#guide'},
            {type: 'link', label: 'API Reference', href: '/docs/developers/reports#api-reference'},
            {type: 'link', label: 'Best Practices', href: '/docs/developers/reports#best-practices'},
            {type: 'link', label: 'FAQ', href: '/docs/developers/reports#faq'},
          ],
        },
        {
          type: 'category',
          label: 'Reference',
          link: {type: 'doc', id: 'developers/reference/error-codes'},
          items: [
            {type: 'doc', id: 'developers/reference/error-codes', label: 'Error Codes'},
            {type: 'doc', id: 'developers/reference/payment-states', label: 'Payment States'},
            {type: 'doc', id: 'developers/reference/glossary', label: 'Glossary'},
          ],
        },
      ],
    },
  ],

  // Business user-focused sidebar
  businessSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      link: {type: 'doc', id: 'business/dashboard-tour'},
      items: [
        'business/dashboard-tour',
      ],
    },
  ],

};

export default sidebars;
