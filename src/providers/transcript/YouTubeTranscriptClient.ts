import type { TranscriptData } from '@/models/TranscriptData';
import type { ITranscriptClient } from './ITranscriptClient';

export interface YouTubeTranscriptResponse {
  transcript: TranscriptData; 
  title: string;
  channelId:string;
  duration: number;
}

export class YouTubeTranscriptClient implements ITranscriptClient {

  public async getTranscript(
    videoId: string,
    timeout: number = 15000
  ): Promise<YouTubeTranscriptResponse> {
    // 直接 fetch せず、バックグラウンド（Service Worker）にメッセージを送る
    const response = await chrome.runtime.sendMessage({
      action: 'FETCH_YOUTUBE_TRANSCRIPT',
      videoId,
      timeout,
    });

    // バックグラウンド側でエラーが発生した場合は例外をスロー
    if (response?.error) {
      throw new Error(response.error);
    }

    return response;
  }

}