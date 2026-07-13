import type { SummaryData } from '@/models/SummaryData';

export interface SummaryResult {
  summary: SummaryData;
  fromCache: boolean;
}
