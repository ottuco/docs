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
              label: 'Payment Methods',
              link: {type: 'doc', id: 'developers/payments/payment-methods'},
              items: [
                {type: 'link', label: 'Setup', href: '/docs/developers/payments/payment-methods#setup'},
                {type: 'link', label: 'Authentication', href: '/docs/developers/payments/payment-methods#authentication'},
                {type: 'link', label: 'Permissions', href: '/docs/developers/payments/payment-methods#permissions'},
                {type: 'link', label: 'How it Works', href: '/docs/developers/payments/payment-methods#how-it-works'},
                {
                  type: 'link',
                  label: 'Retrieve a list of payment methods based on filter values.',
                  href: '/docs/developers/payments/payment-methods#api-retrieve-a-list-of-payment-methods-based-on-filter-values',
                },
                {type: 'link', label: 'Guide', href: '/docs/developers/payments/payment-methods#guide'},
                {type: 'link', label: 'Best Practices', href: '/docs/developers/payments/payment-methods#best-practices'},
                {type: 'link', label: 'FAQ', href: '/docs/developers/payments/payment-methods#faq'},
              ],
            },
            {
              type: 'category',
              label: 'Native Payments',
              link: {type: 'doc', id: 'developers/payments/native-payments'},
              items: [
                {type: 'link', label: 'Quick Start', href: '/docs/developers/payments/native-payments#quick-start'},
                {type: 'link', label: 'Authentication', href: '/docs/developers/payments/native-payments#authentication'},
                {type: 'link', label: 'Integration Flows', href: '/docs/developers/payments/native-payments#integration-flows'},
                {type: 'link', label: 'Setup', href: '/docs/developers/payments/native-payments#setup'},
                {
                  type: 'category',
                  label: 'Apple Pay',
                  collapsible: true,
                  collapsed: true,
                  customProps: {
                    targetHref: '/docs/developers/payments/native-payments#apple-pay',
                  },
                  items: [
                    {
                      type: 'link',
                      label: 'Native Payment API(Apple Pay)',
                      href: '/docs/developers/payments/native-payments#api-native-payment-apiapple-pay',
                    },
                  ],
                },
                {
                  type: 'category',
                  label: 'Google Pay',
                  collapsible: true,
                  collapsed: true,
                  customProps: {
                    targetHref: '/docs/developers/payments/native-payments#google-pay',
                  },
                  items: [
                    {
                      type: 'link',
                      label: 'Native Payment API(Google Pay)',
                      href: '/docs/developers/payments/native-payments#api-native-payment-apigoogle-pay',
                    },
                  ],
                },
                {
                  type: 'category',
                  label: 'Auto-Debit (Tokenized Payments)',
                  collapsible: true,
                  collapsed: true,
                  customProps: {
                    targetHref: '/docs/developers/payments/native-payments#auto-debit-tokenized-payments',
                  },
                  items: [
                    {
                      type: 'link',
                      label: 'Native Payment API(Auto Debit)',
                      href: '/docs/developers/payments/native-payments#api-native-payment-apiauto-debit',
                    },
                  ],
                },
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
            {
              type: 'category',
              label: 'Setup',
              collapsible: true,
                  collapsed: true,
              customProps: {
                targetHref: '/docs/developers/operations#setup',
              },
              items: [
                {
                  type: 'link',
                  label: 'Boost Your Integration',
                  href: '/docs/developers/operations#boost-your-integration',
                },
              ],
            },
            {type: 'link', label: 'Authentication', href: '/docs/developers/operations#authentication'},
            {type: 'link', label: 'Permissions', href: '/docs/developers/operations#permissions'},
            {
              type: 'category',
              label: 'Internal Operations',
              customProps: {
                targetHref: '/docs/developers/operations#internal-operations',
              },
              items: [
                {type: 'link', label: 'Cancel', href: '/docs/developers/operations#cancel'},
                {type: 'link', label: 'Expire', href: '/docs/developers/operations#expire'},
                {type: 'link', label: 'Delete', href: '/docs/developers/operations#delete'},
              ],
            },
            {
              type: 'category',
              label: 'External Operations',
              customProps: {
                targetHref: '/docs/developers/operations#external-operations',
              },
              items: [
                {type: 'link', label: 'Capture', href: '/docs/developers/operations#capture'},
                {type: 'link', label: 'Refund', href: '/docs/developers/operations#refund'},
                {type: 'link', label: 'Void', href: '/docs/developers/operations#void'},
              ],
            },
            {
              type: 'category',
              label: 'Tracking-Key Header',
              customProps: {
                targetHref: '/docs/developers/operations#tracking-key-header',
              },
              items: [
                {type: 'link', label: 'Overview', href: '/docs/developers/operations#overview'},
                {type: 'link', label: 'Purpose of Tracking Key', href: '/docs/developers/operations#purpose-of-tracking-key'},
                {type: 'link', label: 'Guide: Step by Step', href: '/docs/developers/operations#guide-step-by-step'},
              ],
            },
            {
              type: 'link',
              label: 'Operations',
              href: '/docs/developers/operations#api-operations',
            },
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
                {
                  type: 'category',
                  label: 'Setup',
                  collapsible: true,
                  collapsed: true,
                  customProps: {
                    targetHref: '/docs/developers/cards-and-tokens/user-cards#setup',
                  },
                  items: [
                    {
                      type: 'link',
                      label: 'Boost Your Integration',
                      href: '/docs/developers/cards-and-tokens/user-cards#boost-your-integration',
                    },
                  ],
                },
                {type: 'link', label: 'Authentication', href: '/docs/developers/cards-and-tokens/user-cards#authentication'},
                {
                  type: 'link',
                  label: 'Retrieve a list of saved cards for the customer.',
                  href: '/docs/developers/cards-and-tokens/user-cards#api-retrieve-a-list-of-saved-cards-for-the-customer',
                },
                {
                  type: 'link',
                  label: 'Delete a saved card for the customer.',
                  href: '/docs/developers/cards-and-tokens/user-cards#api-delete-a-saved-card-for-the-customer',
                },
                {type: 'link', label: 'FAQ', href: '/docs/developers/cards-and-tokens/user-cards#faq'},
                {type: 'link', label: 'What’s Next?', href: '/docs/developers/cards-and-tokens/user-cards#whats-next'},
              ],
            },
            {type: 'doc', id: 'developers/cards-and-tokens/recurring-payments', label: 'Recurring Payments'},
          ],
        },
        {
          type: 'category',
          label: 'Invoices',
          link: {type: 'doc', id: 'developers/invoices'},
          items: [
            {
              type: 'category',
              label: 'Setup',
              collapsible: true,
                  collapsed: true,
              customProps: {
                targetHref: '/docs/developers/invoices#setup',
              },
              items: [
                {
                  type: 'link',
                  label: 'Boost Your Integration',
                  href: '/docs/developers/invoices#boost-your-integration',
                },
              ],
            },
            {type: 'link', label: 'Authentication', href: '/docs/developers/invoices#authentication'},
            {type: 'link', label: 'Permissions', href: '/docs/developers/invoices#permissions'},
            {
              type: 'category',
              label: 'How it Works',
              collapsible: true,
                  collapsed: true,
              customProps: {
                targetHref: '/docs/developers/invoices#how-it-works',
              },
              items: [
                {
                  type: 'link',
                  label: 'Invoice Information',
                  href: '/docs/developers/invoices#invoice-information',
                },
                {
                  type: 'link',
                  label: 'Invoice API Parameters Specification',
                  href: '/docs/developers/invoices#invoice-api-parameters-specification',
                },
              ],
            },
            {
              type: 'link',
              label: 'Create a new Invoice',
              href: '/docs/developers/invoices#api-create-a-new-invoice',
            },
            {type: 'link', label: 'Guide: Step by Step', href: '/docs/developers/invoices#guide-step-by-step'},
            {type: 'link', label: 'Best Practices', href: '/docs/developers/invoices#best-practices'},
            {
              type: 'category',
              label: 'Invoice Generation Logic',
              collapsible: true,
                  collapsed: true,
              customProps: {
                targetHref: '/docs/developers/invoices#invoice-generation-logic',
              },
              items: [
                {
                  type: 'link',
                  label: 'Key Steps in Invoice Generation',
                  href: '/docs/developers/invoices#key-steps-in-invoice-generation',
                },
              ],
            },
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
            {type: 'link', label: 'Message Notifications', href: '/docs/developers/notifications#message-notifications'},
            {type: 'link', label: 'Setup', href: '/docs/developers/notifications#setup'},
            {type: 'link', label: 'Authentication', href: '/docs/developers/notifications#authentication'},
            {type: 'link', label: 'How It Works', href: '/docs/developers/notifications#how-it-works'},
            {
              type: 'link',
              label: 'Message Notifications',
              href: '/docs/developers/notifications#api-message-notifications',
            },
            {type: 'link', label: 'Guide', href: '/docs/developers/notifications#guide'},
            {type: 'link', label: 'Best Practices', href: '/docs/developers/notifications#best-practices'},
            {type: 'link', label: 'FAQ', href: '/docs/developers/notifications#faq'},
          ],
        },
        {
          type: 'category',
          label: 'Reports',
          link: {type: 'doc', id: 'developers/reports'},
          items: [
            {type: 'link', label: 'Quick Start', href: '/docs/developers/reports#quick-start'},
            {type: 'link', label: 'Setup', href: '/docs/developers/reports#setup'},
            {type: 'link', label: 'Authentication', href: '/docs/developers/reports#authentication'},
            {type: 'link', label: 'Permissions', href: '/docs/developers/reports#permissions'},
            {type: 'link', label: 'How it works', href: '/docs/developers/reports#how-it-works'},
            {
              type: 'link',
              label: 'List Transaction Reports',
              href: '/docs/developers/reports#api-list-transaction-reports',
            },
            {
              type: 'link',
              label: 'Download Transaction Report File',
              href: '/docs/developers/reports#api-download-transaction-report-file',
            },
            {type: 'link', label: 'Guide', href: '/docs/developers/reports#guide'},
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
