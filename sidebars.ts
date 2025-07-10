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
      items: [
        'overview/about',
        'overview/architecture',
        'overview/changelog',
      ],
    },
    {
      type: 'category',
      label: 'Quick Start',
      items: [
        'quick-start/developers',
        'quick-start/merchants',
      ],
    },
    {
      type: 'category',
      label: 'Glossary & Resources',
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
      label: 'Getting Started',
      items: [
        'developers/quick-start',
        'developers/api-fundamentals',
      ],
    },
  ],

  // Business user-focused sidebar
  businessSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'business/dashboard-tour',
      ],
    },
  ],
};

export default sidebars;
