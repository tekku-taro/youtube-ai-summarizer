import type { ProviderType } from '@/value-objects/ProviderType';

export interface ProviderConfig {
  provider: ProviderType;
  apiKey?: string;
  baseUrl: string;
  timeout: number;
}
