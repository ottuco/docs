import siteConfig from "@generated/docusaurus.config";

export interface WalletDemoConfig {
  envName: string;
  merchantId: string;
  connectBaseUrl: string;
  currency: string;
  seedAmount: string;
  sessionAmount: string;
  pgFilter: {
    plugin: string;
    type?: string;
    tags?: string[];
    payment_services?: string[];
  };
  apiKey: string;
}

export const WALLET_DEMO = (siteConfig.customFields as { walletDemo: WalletDemoConfig })
  .walletDemo;
