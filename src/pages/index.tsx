import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';



const heroImageUrl = '/img/ottu_home_page.png';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <Heading as="h1" className="hero__title">
              {siteConfig.title}
            </Heading>
            <p className="hero__subtitle">{siteConfig.tagline}</p>
            <div className={styles.buttons}>
              <Link
                className="button button--secondary button--lg margin-right--md"
                to="/docs/developers/getting-started">
                Developer Quick Start 🚀
              </Link>
              <Link
                className="button button--outline button--lg"
                to="/docs/business/dashboard-tour">
                Merchant Quick Start 💼
              </Link>
            </div>
          </div>
          <div className={styles.heroImageWrapper}>
            <img
              className={styles.heroImage}
              src={heroImageUrl}
              alt="Illustration of Ottu's payment platform" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Payment Processing Made Simple`}
      description="Accept payments worldwide with Ottu's comprehensive payment processing platform. Integrate multiple payment gateways, handle multi-currency transactions, and manage your payments with ease.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
