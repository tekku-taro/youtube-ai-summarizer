import { ProviderType } from '@/value-objects/ProviderType';
import { GeminiProvider } from '@/providers/GeminiProvider';
import { LMStudioProvider } from '@/providers/LMStudioProvider';
import { OpenAIProvider } from '@/providers/OpenAIProvider';
import type { IAIProvider } from '@/providers/IAIProvider';
import type { ProviderConfig } from '@/models/ProviderConfig';

export class ProviderFactory {
  public create(provider: ProviderType, config: ProviderConfig): IAIProvider {
    switch (provider) {
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
