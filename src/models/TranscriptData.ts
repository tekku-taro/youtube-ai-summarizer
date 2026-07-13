import type { TranscriptSegment } from '@/value-objects/TranscriptSegment';

export interface TranscriptData {
  language: string;
  source: 'youtube';
  generatedAt: string;
  segments: TranscriptSegment[];
}
