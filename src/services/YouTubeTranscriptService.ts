import type { TranscriptData } from '@/models/TranscriptData';

import type { ITranscriptClient } from '@/providers/transcript/ITranscriptClient';

import type { IYouTubeTranscriptService } from './IYouTubeTranscriptService';

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
  ): Promise<TranscriptData> {
    return this.transcriptClient.getTranscript(videoId);
  }
}