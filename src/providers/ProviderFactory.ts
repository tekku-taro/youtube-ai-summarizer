import { ProviderType } from '@/value-objects/ProviderType';
import { GeminiProvider } from '@/providers';
import { LMStudioProvider } from '@/providers';
import { OpenAIProvider } from '@/providers';
import type { IAIProvider } from '@/providers/IAIProvider';
import type { ProviderConfig } from '@/models/ProviderConfig';

export class ProviderFactory {
  public create(config: ProviderConfig): IAIProvider {
    switch (config.provider) {
      case ProviderType.OpenAI:
        return new OpenAIProvider(config);
      case ProviderType.Gemini:
        return new GeminiProvider(config);
      case ProviderType.LMStudio:
        return new LMStudioProvider(config);
      default:
        return new OpenAIProvider(config);
    }
  }
}
