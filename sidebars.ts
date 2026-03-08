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
                  type: 'category',
                  label: 'Best Practices and Guidelines',
                  collapsible: true,
                  collapsed: true,
                  customProps: {
                    targetHref:
                      '/docs/developers/payments/checkout-api#best-practices-and-guidelines',
                  },
                  items: [
                    {type: 'link', label: 'API Key', href: '/docs/developers/payments/checkout-api#api-key'},
                    {
                      type: 'link',
                      label: 'Basic Authentication',
                      href: '/docs/developers/payments/checkout-api#basic-authentication',
                    },
                  ],
                },
                {
                  type: 'link',
                  label: 'Create a new Payment Transaction',
                  href: '/docs/developers/payments/checkout-api#api-create-a-new-payment-transaction',
                  customProps: {method: 'POST'},
                },
                {
                  type: 'link',
                  label: 'Retrieve Payment Transaction',
                  href: '/docs/developers/payments/checkout-api#api-retrieve-payment-transaction',
                  customProps: {method: 'GET'},
                },
                {
                  type: 'link',
                  label: 'Update Payment Transaction',
                  href: '/docs/developers/payments/checkout-api#api-update-payment-transaction',
                  customProps: {method: 'PATCH'},
                },
                {
                  type: 'category',
                  label: 'One-Step Checkout',
                  collapsible: true,
                  collapsed: true,
                  customProps: {
                    targetHref: '/docs/developers/payments/checkout-api#one-step-checkout',
                  },
                  items: [
                    {type: 'link', label: 'When to Use', href: '/docs/developers/payments/checkout-api#when-to-use'},
                    {
                      type: 'link',
                      label: 'Supported Instruments',
                      href: '/docs/developers/payments/checkout-api#supported-instruments',
                    },
                    {
                      type: 'link',
                      label: 'Rules & Restrictions',
                      href: '/docs/developers/payments/checkout-api#rules--restrictions',
                    },
                    {type: 'link', label: 'How to Use it', href: '/docs/developers/payments/checkout-api#how-to-use-it'},
                    {
                      type: 'link',
                      label: 'Request Example: Apple Pay',
                      href: '/docs/developers/payments/checkout-api#request-example-apple-pay',
                    },
                    {
                      type: 'link',
                      label: 'Response Behavior',
                      href: '/docs/developers/payments/checkout-api#response-behavior-when-payment_instrument-is-used',
                    },
                  ],
                },
                {type: 'link', label: 'FAQ', href: '/docs/developers/payments/checkout-api#faq'},
                {
                  type: 'category',
                  label: 'Upload Attachment',
                  collapsible: true,
                  collapsed: true,
                  customProps: {
                    targetHref: '/docs/developers/payments/checkout-api#use-cases',
                  },
                  items: [
                    {type: 'link', label: 'Use Cases', href: '/docs/developers/payments/checkout-api#use-cases'},
                    {type: 'link', label: 'Specifications', href: '/docs/developers/payments/checkout-api#specifications'},
                    {
                      type: 'category',
                      label: 'Setup',
                      collapsible: true,
                  collapsed: true,
                      customProps: {
                        targetHref: '/docs/developers/payments/checkout-api#setup',
                      },
                      items: [
                        {
                          type: 'link',
                          label: 'Upload Before session_id Generation',
                          href: '/docs/developers/payments/checkout-api#upload-before-session_id-generation',
                        },
                        {
                          type: 'link',
                          label: 'Upload After session_id Generation',
                          href: '/docs/developers/payments/checkout-api#upload-after-session_id-generation',
                        },
                      ],
                    },
                    {type: 'link', label: 'Authentication', href: '/docs/developers/payments/checkout-api#authentication'},
                    {
                      type: 'category',
                      label: 'How It Works',
                      collapsible: true,
                  collapsed: true,
                      customProps: {
                        targetHref: '/docs/developers/payments/checkout-api#how-it-works',
                      },
                      items: [
                        {
                          type: 'link',
                          label: 'Upload Before session_id Generation',
                          href: '/docs/developers/payments/checkout-api#upload-before-session_id-generation-1',
                        },
                        {
                          type: 'link',
                          label: 'Upload After session_id Generation',
                          href: '/docs/developers/payments/checkout-api#upload-after-session_id-generation-1',
                        },
                        {
                          type: 'link',
                          label: 'Attachment Upload',
                          href: '/docs/developers/payments/checkout-api#api-attachment-upload',
                          customProps: {method: 'POST'},
                        },
                      ],
                    },
                    {
                      type: 'category',
                      label: 'Guide',
                      collapsible: true,
                  collapsed: true,
                      customProps: {
                        targetHref: '/docs/developers/payments/checkout-api#guide',
                      },
                      items: [
                        {
                          type: 'link',
                          label: 'Upload Before session_id Generation',
                          href: '/docs/developers/payments/checkout-api#upload-before-session_id-generation-2',
                        },
                        {
                          type: 'link',
                          label: 'Upload After session_id Generation',
                          href: '/docs/developers/payments/checkout-api#upload-after-session_id-generation-2',
                        },
                      ],
                    },
                    {type: 'link', label: 'Best Practices', href: '/docs/developers/payments/checkout-api#best-practices'},
                    {
                      type: 'link',
                      label: 'Different Way to Upload Attachment',
                      href: '/docs/developers/payments/checkout-api#different-way-to-upload-attachment',
                    },
                    {type: 'link', label: 'FAQ', href: '/docs/developers/payments/checkout-api#faq-1'},
                  ],
                },
              ],
            },
            {
              type: 'category',
              label: 'Payment Methods',
              link: {type: 'doc', id: 'developers/payments/payment-methods'},
              items: [
                {
                  type: 'category',
                  label: 'Setup',
                  collapsible: true,
                  collapsed: true,
                  customProps: {
                    targetHref: '/docs/developers/payments/payment-methods#setup',
                  },
                  items: [
                    {
                      type: 'link',
                      label: 'Boost Your Integration',
                      href: '/docs/developers/payments/payment-methods#boost-your-integration',
                    },
                  ],
                },
                {type: 'link', label: 'Authentication', href: '/docs/developers/payments/payment-methods#authentication'},
                {type: 'link', label: 'Permissions', href: '/docs/developers/payments/payment-methods#permissions'},
                {
                  type: 'category',
                  label: 'How it Works',
                  collapsible: true,
                  collapsed: true,
                  customProps: {
                    targetHref: '/docs/developers/payments/payment-methods#how-it-works',
                  },
                  items: [
                    {
                      type: 'link',
                      label: 'Purpose of the Payment Methods API',
                      href: '/docs/developers/payments/payment-methods#purpose-of-the-payment-methods-api',
                    },
                    {
                      type: 'link',
                      label: 'Usage Scenarios',
                      href: '/docs/developers/payments/payment-methods#usage-scenarios',
                    },
                  ],
                },
                {
                  type: 'link',
                  label: 'Retrieve a list of payment methods based on filter values.',
                  href: '/docs/developers/payments/payment-methods#api-retrieve-a-list-of-payment-methods-based-on-filter-values',
                  customProps: {method: 'POST'},
                },
                {
                  type: 'category',
                  label: 'Guide',
                  collapsible: true,
                  collapsed: true,
                  customProps: {
                    targetHref: '/docs/developers/payments/payment-methods#guide',
                  },
                  items: [
                    {
                      type: 'link',
                      label: 'Streamlining Checkout Process',
                      href: '/docs/developers/payments/payment-methods#streamlining-checkout-process-by-payment-methods-api',
                    },
                    {
                      type: 'link',
                      label: 'Workflow Diagram',
                      href: '/docs/developers/payments/payment-methods#payment-methods-api-workflow-diagram',
                    },
                    {
                      type: 'link',
                      label: 'Use Cases Examples',
                      href: '/docs/developers/payments/payment-methods#use-cases-examples',
                    },
                  ],
                },
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
                      customProps: {method: 'POST'},
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
                      customProps: {method: 'POST'},
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
                      customProps: {method: 'POST'},
                    },
                  ],
                },
                {type: 'link', label: 'FAQ', href: '/docs/developers/payments/native-payments#faq'},
              ],
            },
            {type: 'doc', id: 'developers/payments/checkout-sdk', label: 'Checkout SDK'},
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
              customProps: {method: 'POST'},
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
                  customProps: {method: 'POST'},
                },
                {
                  type: 'link',
                  label: 'Delete a saved card for the customer.',
                  href: '/docs/developers/cards-and-tokens/user-cards#api-delete-a-saved-card-for-the-customer',
                  customProps: {method: 'DELETE'},
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
              customProps: {method: 'POST'},
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
              customProps: {method: 'POST'},
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
              customProps: {method: 'GET'},
            },
            {
              type: 'link',
              label: 'Download Transaction Report File',
              href: '/docs/developers/reports#api-download-transaction-report-file',
              customProps: {method: 'GET'},
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
