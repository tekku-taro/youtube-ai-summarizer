import type { TranscriptData } from '@/models/TranscriptData';

export interface TranscriptResult {
  transcript: TranscriptData;
  fromCache: boolean;
}
