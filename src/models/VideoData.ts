import type { ChatSession } from '@/models';
import type { SummaryData } from '@/models';
import type { TranscriptData } from '@/models';

export interface VideoData {
  videoId: string;
  title: string;
  channelTitle: string;
  duration: number;
  transcript?: TranscriptData;
  summaries: SummaryData[];
  chatSessions: ChatSession[];
  createdAt: string;
  updatedAt: string;
}
