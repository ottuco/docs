import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Ottu Documentation",
  tagline: "Payment processing made simple",
  favicon: "img/ottu_logo.avif",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Production URL (docs.ottu.net)
  url: "https://docs.ottu.net",
  baseUrl: "/",

  trailingSlash: true,

  clientModules: ["./src/clientModules/sidebarHashActiveLink.ts"],

  onBrokenLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          docItemComponent: "@theme/ApiItem",
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "",
      logo: {
        alt: "Ottu Logo",
        src: "img/ottu_logo.webp",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "mainSidebar",
          position: "left",
          label: "Overview",
        },
        {
          type: "docSidebar",
          sidebarId: "developerSidebar",
          position: "left",
          label: "Developers",
        },
        {
          type: "docSidebar",
          sidebarId: "businessSidebar",
          position: "left",
          label: "Business",
        },
        {
          type: "custom-mcpButton" as any,
          position: "right",
        },
        {
          href: "https://github.com/ottuco",
          label: "GitHub",
          position: "right",
        },
        {
          href: "https://ottu.com",
          label: "Ottu.com",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Overview",
              to: "/overview/about",
            },
            {
              label: "Developer Docs",
              to: "/developers/getting-started",
            },
            {
              label: "Business Guide",
              to: "/business/",
            },
          ],
        },
        {
          title: "Developers",
          items: [
            {
              label: "API Reference",
              to: "/developers/getting-started/api-fundamentals",
            },
            {
              label: "Quick Start",
              to: "/developers/getting-started",
            },
            {
              label: "Developer Guide",
              to: "/developers/",
            },
          ],
        },
        {
          title: "Business",
          items: [
            {
              label: "Getting Started",
              to: "/business/",
            },
            {
              label: "Payment Gateways",
              to: "/business/payments/gateways",
            },
            {
              label: "Compliance & Security",
              to: "/business/compliance",
            },
          ],
        },
        {
          title: "Resources",
          items: [
            {
              label: "Support",
              href: "https://ottu.com/support",
            },
            {
              label: "Status",
              href: "https://status.ottu.com",
            },
            {
              label: "GitHub",
              href: "https://github.com/ottuco",
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
    languageTabs: [
      { language: "javascript" },
      { language: "curl" },
      { language: "python" },
      { language: "nodejs" },
      { language: "php" },
      { language: "java" },
      { language: "csharp" },
      { language: "go" },
      { language: "ruby" },
      { language: "swift" },
      { language: "kotlin" },
      { language: "dart" },
      { language: "rust" },
      { language: "shell" },
      { language: "powershell" },
      { language: "http" },
      { language: "c" },
      { language: "objective-c" },
      { language: "ocaml" },
      { language: "r" },
      { language: "postman-cli" },
    ],
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "api",
        docsPluginId: "classic",
        config: {
          ottuApi: {
            specPath: "static/Ottu_API_enriched.yaml",
            outputDir: "docs/developers/apis",
            sidebarOptions: {
              groupPathsBy: "tag",
            },
            downloadUrl: "https://example.com/ottu_api.yaml",
          },
        },
      },
    ],
    [
      "docusaurus-plugin-mcp-server",
      {
        server: { name: "ottu-docs", version: "1.0.0" },
        excludeRoutes: [
          "/404*",
          "/search*",
          "/business/*",
          "/developers/reference/*",
        ],
      },
    ],
    ["docusaurus-markdown-source-plugin", { docsPath: "/" }],
  ],

  themes: [
    "docusaurus-theme-openapi-docs",
    "@docusaurus/theme-mermaid",
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        language: ["en"],
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: "/",
      },
    ],
  ],
};

export default config;
