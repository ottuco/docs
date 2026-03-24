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
  { value: "L1", label: "PCI DSS Certified" },
  { value: "ISO", label: "27001 Certified" },
];

const DEV_LINKS = [
  { label: "Checkout API", to: "/docs/developers/payments/checkout-api" },
  { label: "Webhooks", to: "/docs/developers/webhooks/" },
  { label: "SDK", to: "/docs/developers/payments/checkout-sdk/" },
  { label: "Test Cards", to: "/docs/developers/reference/test-cards" },
];

const BIZ_LINKS = [
  { label: "Payment Gateways", to: "/docs/business/payments/gateways" },
  { label: "Payment Management", to: "/docs/business/payment-management/" },
  { label: "Notifications", to: "/docs/business/notifications/" },
  { label: "Settings", to: "/docs/business/settings/" },
];

const HIGHLIGHTS = [
  {
    title: "Smart Payment Routing",
    desc: "Route every payment to the best gateway based on BIN, country, cost, and real-time success rate.",
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

function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroLabel}>Documentation</div>
        <Heading as="h1" className={styles.heroTitle}>
          Build and manage payments{" "}
          <span className={styles.heroAccent}>with Ottu</span>
        </Heading>
        <p className={styles.heroSub}>
          Everything you need to integrate, configure, and manage payments
          across the Middle East and beyond.
        </p>
        <div className={styles.heroCtas}>
          <Link
            className={styles.ctaPrimary}
            to="/docs/developers/getting-started"
          >
            Developer Docs
          </Link>
          <Link className={styles.ctaSecondary} to="/docs/business/">
            Business Guide
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
            Integrate Ottu's payment APIs, SDKs, and webhooks into your
            application.
          </p>
          <div className={styles.quickLinks}>
            {DEV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className={styles.quickLink}>
                {l.label}
              </Link>
            ))}
          </div>
          <Link
            to="/docs/developers/getting-started"
            className={styles.audienceCta}
          >
            Start Integrating →
          </Link>
        </div>

        <div className={styles.audienceCard}>
          <div className={styles.audienceIcon}>☰</div>
          <h2 className={styles.audienceTitle}>For Business Users</h2>
          <p className={styles.audienceDesc}>
            Configure gateways, track transactions, and manage your payment
            operations.
          </p>
          <div className={styles.quickLinks}>
            {BIZ_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className={styles.quickLink}>
                {l.label}
              </Link>
            ))}
          </div>
          <Link to="/docs/business/" className={styles.audienceCta}>
            Explore Business Docs →
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
      description="Integrate, configure, and manage payments with Ottu. 50+ payment gateways, smart routing, multi-currency support. PCI DSS Level 1 certified."
    >
      <main>
        <Hero />
        <StatsBar />
        <AudienceCards />
        <ProductHighlights />
        <GatewayStrip />
      </main>
    </Layout>
  );
}
