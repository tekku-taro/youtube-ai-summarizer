import type { ProviderType } from '@/value-objects/ProviderType';
import type { SummaryType } from '@/value-objects/SummaryType';

export interface Settings {
  provider: ProviderType;
  model: string;
  summaryType: SummaryType;
  thinking: boolean;
}
