import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Ottu Documentation',
  tagline: 'Payment processing made simple',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://ottuco.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docs/',

  // GitHub pages deployment config.
  organizationName: 'ottuco', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.
  
  // GitHub Pages adds a trailing slash by default that I don't want
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/ottu/public-docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Ottu',
      logo: {
        alt: 'Ottu Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Overview',
        },
        {
          type: 'docSidebar',
          sidebarId: 'developerSidebar',
          position: 'left',
          label: 'Developers',
        },
        {
          type: 'docSidebar',
          sidebarId: 'businessSidebar',
          position: 'left',
          label: 'Business',
        },
        {
          href: 'https://github.com/ottu',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://ottu.com',
          label: 'Ottu.com',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Overview',
              to: '/overview/about',
            },
            {
              label: 'Developer Quick Start',
              to: '/quick-start/developers',
            },
            {
              label: 'Merchant Quick Start',
              to: '/quick-start/merchants',
            },
          ],
        },
        {
          title: 'Developers',
          items: [
            {
              label: 'API Reference',
              to: '/developers/api-fundamentals',
            },
            {
              label: 'Quick Start',
              to: '/developers/quick-start',
            },
            {
              label: 'Developer Guide',
              to: '/quick-start/developers',
            },
          ],
        },
        {
          title: 'Business',
          items: [
            {
              label: 'Dashboard Tour',
              to: '/business/dashboard-tour',
            },
            {
              label: 'Merchant Guide',
              to: '/quick-start/merchants',
            },
            {
              label: 'Getting Started',
              to: '/overview/about',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Support',
              href: 'https://ottu.com/support',
            },
            {
              label: 'Status',
              href: 'https://status.ottu.com',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/ottu',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Ottu. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
