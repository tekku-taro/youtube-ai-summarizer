import type { ITranscriptClient } from '@/providers/transcript/ITranscriptClient';

import type { IYouTubeTranscriptService } from './IYouTubeTranscriptService';
import type { YouTubeTranscriptResponse } from '@/providers/transcript/YouTubeTranscriptClient';

export class YouTubeTranscriptService implements IYouTubeTranscriptService {
  private readonly transcriptClient;

  constructor(transcriptClient: ITranscriptClient) {
    this.transcriptClient = transcriptClient;
  }

  /**
   * YouTube字幕を取得する。
   */
  public async getTranscript(
    videoId: string,
  ): Promise<YouTubeTranscriptResponse> {
    return this.transcriptClient.getTranscript(videoId);
  }
}