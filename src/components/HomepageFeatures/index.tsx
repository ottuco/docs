import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Developer-Friendly APIs',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        RESTful APIs, comprehensive SDKs, and detailed documentation make integration
        simple. Get started in minutes with our quick start guides and sample code.
      </>
    ),
  },
  {
    title: 'Multi-Gateway Support',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Connect to multiple payment gateways through a single integration. 
        Smart routing, failover, and real-time monitoring ensure maximum success rates.
      </>
    ),
  },
  {
    title: 'Global Scale',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Accept payments in 100+ currencies with local payment methods worldwide.
        PCI DSS Level 1 compliant with enterprise-grade security and reliability.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
