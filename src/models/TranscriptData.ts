import type { TranscriptSegment } from '@/value-objects/TranscriptSegment';

export interface TranscriptData {
  language: string;
  source: string;
  generatedAt: string;
  segments: TranscriptSegment[];
}
