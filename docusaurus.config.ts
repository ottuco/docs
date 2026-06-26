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
    faster: true,
  },

  // Production URL (docs.ottu.com)
  url: "https://docs.ottu.com",
  baseUrl: "/",

  trailingSlash: true,

  clientModules: ["./src/clientModules/sidebarHashActiveLink.ts"],

  // Synchronous head injection so the initial-hash loader is visible from
  // the very first paint. The loader visuals live in
  // src/css/initial-loader.css (imported by custom.css). Because
  // <link rel="stylesheet"> in <head> is render-blocking, the browser
  // doesn't paint <body> until those rules are parsed — so the overlay
  // is on screen from the first frame. The client module
  // (src/clientModules/sidebarHashActiveLink.ts) flips the attribute to
  // "fading" once content has hydrated and the page has scrolled to the
  // target, then removes it once the CSS opacity transition completes.
  headTags: [
    {
      tagName: "script",
      attributes: {},
      innerHTML:
        "(function(){try{if(window.location.hash){document.documentElement.setAttribute('data-initial-hash-loading','true');}}catch(e){}})();",
    },
  ],

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
    mdx1Compat: {
      headingIds: true, // Allow {#custom-id} syntax in headings (required until v4 migration)
      admonitions: true, // Convert :::type Title → :::type[Title] for MDX v3 compatibility
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
          exclude: ["superpowers/**"],
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/ottu-social-card.png",
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
          "/developers/reference/*",
          "/overview/changelog*",
        ],
        // FlexSearch index tuning (replaces the former patch-package patch,
        // which was version-pinned to 0.11.0 and silently broke on upgrade).
        // The plugin's defaults — tokenize "forward", resolution 9, and a
        // depth-2 bidirectional context — balloon the generated search-index
        // export to ~290MB over full page content, which OOM'd the mcp
        // service on deploy. "strict" (whole stemmed words, no prefix
        // expansion) + resolution 3 + no context keeps it to a few MB. The
        // plugin's default encode() still lowercases + stems, so queries
        // match normalized words. Keep this in sync with mcp-server/server.mjs.
        flexsearch: {
          tokenize: "strict",
          resolution: 3,
          context: false,
        },
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
