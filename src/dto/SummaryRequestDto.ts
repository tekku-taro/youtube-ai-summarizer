import type { AIExecutionOptions } from '@/value-objects/AIExecutionOptions';
import type { SummaryType } from '@/value-objects/SummaryType';

export interface SummaryRequestDto {
  summaryType: SummaryType;
  options: AIExecutionOptions;
}
