import type { ChatSession } from '@/models/ChatSession';
import type { SummaryData } from '@/models/SummaryData';
import type { TranscriptData } from '@/models/TranscriptData';

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
