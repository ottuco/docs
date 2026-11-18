export type MessageChannel = "sms" | "whatsapp";

/** One entry of static/data/message-providers.json. */
export interface MessageProvider {
  /** The `provider` value of the model in Connect (contrib/communication). */
  slug: string;
  /** Name shown to merchants. */
  name: string;
  channel: MessageChannel;
  /** Countries the provider is based in. Empty when not established. */
  countries: string[];
  /** True for providers that sell their service across many countries. */
  international: boolean;
  /** The provider's own website. */
  website?: string;
  /** What the merchant gets from the provider and hands to Ottu support. */
  credentials: string[];
}
