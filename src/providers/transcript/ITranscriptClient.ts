import type { TranscriptData } from '@/models/TranscriptData';

export interface ITranscriptClient {
  /**
   * YouTube動画の字幕を取得する。
   */
  getTranscript(videoId: string): Promise<TranscriptData>;
}