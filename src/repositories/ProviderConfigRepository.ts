import type { SelectOption } from "@/components/controls/types";
import type { ProviderConfig } from "@/models";
import { ProviderType } from "@/value-objects";

export class ProviderConfigRepository {

  private readonly configs: Record<ProviderType, ProviderConfig & {label:string}>;

  constructor() {
    this.configs = {
      [ProviderType.OpenAI]: {
        provider: ProviderType.OpenAI,
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        baseUrl: import.meta.env.VITE_OPENAI_BASE_URL,
        label: 'OpenAI',
      },

      [ProviderType.Gemini]: {
        provider: ProviderType.Gemini,
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
        baseUrl: import.meta.env.VITE_GEMINI_BASE_URL,
        label: 'Gemini',
      },

      [ProviderType.Anthropic]: {
        provider: ProviderType.Anthropic,
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
        baseUrl: import.meta.env.VITE_ANTHROPIC_BASE_URL,
        label: 'Anthropic',
      },

      [ProviderType.LMStudio]: {
        provider: ProviderType.LMStudio,
        baseUrl: import.meta.env.VITE_LMSTUDIO_BASE_URL,
        label: 'LM Studio',
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

  getAvailable(): ProviderConfig {
    if (!this.configs) {
      throw new Error('No provider configurations found');
    }

    const availableKey:ProviderType|undefined = Object.entries(this.configs).find(
      ([key, config]) =>
        (key === ProviderType.LMStudio && config?.baseUrl) ||
        (!config?.apiKey && config?.baseUrl),
    )?.[0] as ProviderType;

    if (!availableKey) {
      throw new Error('No provider configurations found');
    }

    return this.configs[availableKey]!;
  }

  getProviderOptions():SelectOption<ProviderType>[] {
    if (!this.configs) {
      throw new Error('No provider configurations found');
    }

    const options:SelectOption<ProviderType>[]  = [];
    Object.entries(this.configs).filter(
      ([key, config]) =>
        (key === ProviderType.LMStudio && config?.baseUrl) ||
        (config?.apiKey && config?.baseUrl),
    ).forEach(entry => {
      const [key, config] = entry;
      if (config) {
        options.push({ value: key as ProviderType, label: config.label });
      }
    });
    // console.log('getProviderOptions', options)
    return options;
  }

  /**
   * 全Provider取得
   */
  all(): ProviderConfig[] {
    return Object.values(this.configs);
  }
}