import type { ProviderType } from '@/value-objects/ProviderType';
import type { SummaryType } from '@/value-objects/SummaryType';
import type { TokenUsage } from '@/value-objects/TokenUsage';

export interface SummaryData {
  id: string;
  cacheKey: string;
  summaryType: SummaryType;
  provider: ProviderType;
  model: string;
  thinking: boolean;
  content: string;
  promptVersion: string;
  usage: TokenUsage;
  createdAt: string;
}
