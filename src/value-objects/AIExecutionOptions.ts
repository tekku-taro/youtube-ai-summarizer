import { ProviderType } from '@/value-objects/ProviderType';

export interface AIExecutionOptions {
  provider: ProviderType;
  model: string;
  thinking: boolean;
}
