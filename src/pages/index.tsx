import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import gatewaysData from "@site/static/data/gateways.json";
import type { Gateway } from "@site/src/types/gateway";

import styles from "./index.module.css";

const gateways = (gatewaysData as Gateway[]).filter(
  (gw) => gw.slug !== "standard" && gw.logo
);

const STATS = [
  { value: "50+", label: "Payment Gateways" },
  { value: "15+", label: "Countries" },
  { value: "1", label: "Unified API" },
  { value: "L1", label: "PCI DSS Certified" },
];

const DEV_LINKS = [
  { label: "Checkout API", to: "/developers/payments/checkout-api" },
  { label: "SDK", to: "/developers/payments/checkout-sdk/" },
  { label: "Webhooks", to: "/developers/webhooks/" },
  { label: "Tokenization", to: "/developers/cards-and-tokens/tokenization" },
  { label: "Apple Pay", to: "/business/payments/services/apple-pay/" },
  { label: "Test Cards", to: "/developers/reference/test-cards" },
];

const BIZ_LINKS = [
  { label: "Routing Rules", to: "/business/payments/routing" },
  { label: "Gateway Management", to: "/business/payments/gateways" },
  { label: "Transactions", to: "/business/payment-management/" },
  { label: "Notifications", to: "/business/notifications/" },
];

const HIGHLIGHTS = [
  {
    title: "Smart Payment Routing",
    desc: "Route every payment to the best gateway based on BIN, country, cost, and real-time success rate. Automatic failover when a provider drops.",
    icon: "↗",
  },
  {
    title: "Multi-Currency",
    desc: "Accept payments in multiple currencies with automatic exchange and configurable markup fees.",
    icon: "◎",
  },
  {
    title: "Notifications",
    desc: "Email, SMS, and WhatsApp notifications at every stage of the payment lifecycle.",
    icon: "◈",
  },
  {
    title: "Industry Solutions",
    desc: "Purpose-built modules for Real Estate property management and Satellite multi-installation control.",
    icon: "▣",
  },
];

const WHY_OTTU = [
  {
    title: "Payment Portability",
    desc: "Switch banks or acquirers without rebuilding your integration. Your payment stack stays intact when your strategy changes.",
    icon: "⇄",
  },
  {
    title: "Multi-Gateway Orchestration",
    desc: "Connect and manage multiple payment providers from one platform. No duplicate integrations, no fragmented operations.",
    icon: "⊞",
  },
  {
    title: "Merchant-Owned Stack",
    desc: "Process through your own merchant relationships and MIDs. Ottu orchestrates — you keep ownership and control.",
    icon: "◉",
  },
  {
    title: "Smart Routing & Failover",
    desc: "Route transactions by BIN, geography, cost, or success rate. Automatic failover keeps payments flowing when a provider drops.",
    icon: "↗",
  },
  {
    title: "PCI-Ready Foundation",
    desc: "L1 PCI DSS and ISO 27001 certified infrastructure. Built for compliance-heavy environments so you don't have to be.",
    icon: "◆",
  },
  {
    title: "Regional Expertise",
    desc: "Built for Middle East payment realities — KNET, mada, Benefit, local acquiring — not generic global assumptions.",
    icon: "◈",
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Integrate Ottu",
    desc: "Connect your application through one API with SDKs, webhooks, and sandbox testing.",
  },
  {
    step: 2,
    title: "Connect Gateways",
    desc: "Add your payment providers and acquirer relationships. Use your own MIDs.",
  },
  {
    step: 3,
    title: "Configure Logic",
    desc: "Set routing rules, failover paths, currency handling, and notification preferences.",
  },
  {
    step: 4,
    title: "Process Payments",
    desc: "Transactions flow through optimized paths. Switch providers anytime without code changes.",
  },
];

function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroLabel}>Documentation</div>
        <Heading as="h1" className={styles.heroTitle}>
          Integrate once. Route anywhere.{" "}
          <span className={styles.heroAccent}>Switch freely.</span>
        </Heading>
        <p className={styles.heroSub}>
          Ottu connects your business to 50+ payment gateways through one API.
          Configure routing, add providers, and change acquirers — without
          rebuilding your integration.
        </p>
        <div className={styles.heroCtas}>
          <Link
            className={styles.ctaPrimary}
            to="/developers/getting-started"
          >
            Start Integrating
          </Link>
          <Link className={styles.ctaSecondary} to="/business/">
            Explore Platform
          </Link>
        </div>
      </div>
    </header>
  );
}

function StatsBar() {
  return (
    <section className={styles.stats}>
      <div className={styles.statsInner}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function AudienceCards() {
  return (
    <section className={styles.audience}>
      <div className={styles.audienceInner}>
        <div className={styles.audienceCard}>
          <div className={styles.audienceIcon}>{"</>"}</div>
          <h2 className={styles.audienceTitle}>For Developers</h2>
          <p className={styles.audienceDesc}>
            Build against one API for cards, wallets, and gateways. Add
            providers and payment methods without changing your code.
          </p>
          <div className={styles.quickLinks}>
            {DEV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className={styles.quickLink}>
                {l.label}
              </Link>
            ))}
          </div>
          <Link
            to="/developers/getting-started"
            className={styles.audienceCta}
          >
            Start Integrating →
          </Link>
        </div>

        <div className={styles.audienceCard}>
          <div className={styles.audienceIcon}>☰</div>
          <h2 className={styles.audienceTitle}>For Business Users</h2>
          <p className={styles.audienceDesc}>
            Control your payment stack from one dashboard — routing rules,
            gateway connections, transaction monitoring, and provider switching
            on your terms.
          </p>
          <div className={styles.quickLinks}>
            {BIZ_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className={styles.quickLink}>
                {l.label}
              </Link>
            ))}
          </div>
          <Link to="/business/" className={styles.audienceCta}>
            Explore Platform →
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductHighlights() {
  return (
    <section className={styles.highlights}>
      <div className={styles.highlightsInner}>
        <h2 className={styles.sectionTitle}>Platform Capabilities</h2>
        <div className={styles.highlightGrid}>
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className={styles.highlightCard}>
              <span className={styles.highlightIcon}>{h.icon}</span>
              <h3 className={styles.highlightTitle}>{h.title}</h3>
              <p className={styles.highlightDesc}>{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyOttu() {
  return (
    <section className={styles.whyOttu}>
      <div className={styles.whyOttuInner}>
        <h2 className={styles.sectionTitle}>Why Ottu</h2>
        <p className={styles.whyOttuIntro}>
          A unified payment layer that keeps merchants independent from
          single-provider lock-in.
        </p>
        <div className={styles.whyOttuGrid}>
          {WHY_OTTU.map((item) => (
            <div key={item.title} className={styles.whyOttuCard}>
              <span className={styles.whyOttuIcon}>{item.icon}</span>
              <h3 className={styles.whyOttuTitle}>{item.title}</h3>
              <p className={styles.whyOttuDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className={styles.howItWorks}>
      <div className={styles.howItWorksInner}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.howItWorksGrid}>
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className={styles.howItWorksStep}>
              <span className={styles.stepNumber}>{item.step}</span>
              <h3 className={styles.stepTitle}>{item.title}</h3>
              <p className={styles.stepDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GatewayStrip() {
  return (
    <section className={styles.gatewayStrip}>
      <div className={styles.gatewayStripInner}>
        <div className={styles.gatewayLabel}>Supported Gateways</div>
        <div className={styles.gatewayLogos}>
          {gateways.map((gw) => (
            <GatewayLogo key={gw.slug} gateway={gw} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GatewayLogo({ gateway }: { gateway: Gateway }) {
  const src = useBaseUrl(`/img/gateways/${gateway.logo}`);
  return (
    <div className={styles.gatewayLogoWrap} title={gateway.name}>
      <img
        src={src}
        alt={gateway.name}
        className={styles.gatewayLogo}
        loading="lazy"
      />
    </div>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Payment Processing Documentation"
      description="Own your payment stack with Ottu. One API, 50+ gateways, smart routing, zero lock-in. PCI DSS Level 1 certified."
    >
      <main>
        <Hero />
        <StatsBar />
        <AudienceCards />
        <WhyOttu />
        <HowItWorks />
        <ProductHighlights />
        <GatewayStrip />
      </main>
    </Layout>
  );
}
