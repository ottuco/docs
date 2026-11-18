export type MessageChannel = "sms" | "whatsapp";

/** One entry of static/data/message-providers.json: one company. */
export interface MessageProvider {
  /** The `provider` value of the model in Connect (contrib/communication). */
  slug: string;
  /** Name shown to merchants. */
  name: string;
  /** The channels Ottu sends through this provider. */
  channels: MessageChannel[];
  /** Countries the provider is based in. Empty when not established. */
  countries: string[];
  /** True for providers that sell their service across many countries. */
  international: boolean;
  /** The provider's own website. */
  website?: string;
}
