import type { ProviderConfig } from "@/models";
import { ProviderType } from "@/value-objects";

export class ProviderConfigRepository {

  private readonly configs: Record<string, ProviderConfig>;

  constructor() {
    this.configs = {
      [ProviderType.OpenAI]: {
        provider: ProviderType.OpenAI,
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        baseUrl: import.meta.env.VITE_OPENAI_BASE_URL,
      },

      [ProviderType.Gemini]: {
        provider: ProviderType.Gemini,
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
        baseUrl: import.meta.env.VITE_GEMINI_BASE_URL,
      },

      [ProviderType.Anthropic]: {
        provider: ProviderType.Anthropic,
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
        baseUrl: import.meta.env.VITE_ANTHROPIC_BASE_URL,
      },

      [ProviderType.LMStudio]: {
        provider: ProviderType.LMStudio,
        baseUrl: import.meta.env.VITE_LMSTUDIO_BASE_URL,
      },
    };
  }

  /**
   * Provider設定取得
   */
  find(provider: ProviderType): ProviderConfig {
    const config = this.configs[provider];

    if (!config) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    return config;
  }

  /**
   * デフォルトProvider取得
   */
  getDefault(): ProviderConfig {
    return this.find(import.meta.env.VITE_DEFAULT_PROVIDER as ProviderType);
  }

  /**
   * 全Provider取得
   */
  all(): ProviderConfig[] {
    return Object.values(this.configs);
  }
}