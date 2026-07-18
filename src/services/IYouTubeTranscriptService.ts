import type { ITranscriptResponse } from '@/providers/transcript/ITranscriptClient';

export interface IYouTubeTranscriptService {
  /**
   * YouTube動画の字幕を取得する。
   *
   * @param videoId YouTube動画ID
   */
  getTranscript(videoId: string): Promise<ITranscriptResponse>;
}