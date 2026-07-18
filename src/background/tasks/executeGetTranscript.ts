import { fetchTranscript, InMemoryCache, YoutubeTranscriptDisabledError, YoutubeTranscriptInvalidLangError, YoutubeTranscriptNotAvailableError, YoutubeTranscriptNotAvailableLanguageError, YoutubeTranscriptVideoUnavailableError } from 'youtube-transcript-plus';

import { DateUtil } from '@/utils/DateUtil';
import type { TranscriptSegment } from '@/value-objects';
import type { YouTubeTranscriptResponse } from '@/providers/transcript/YouTubeTranscriptClient';

// 通信処理ロジックを background 側に持たせる（元の Client の中身をここに移植、または別クラスとして呼ぶ）
export async function executeGetTranscript(videoId: string, timeout:number = 15000): Promise<YouTubeTranscriptResponse> {
    const controller = new AbortController();
    // Cancel the request after 5 seconds
    setTimeout(() => controller.abort(), timeout);

    try {
      const response =
        await fetchTranscript(videoId, {
          videoDetails: true,
          cache: new InMemoryCache(86400000), // 30 minutes TTL
          signal: controller.signal,
        });
      
  
      const segments: TranscriptSegment[] =
        response.segments.map(item => {
          return {
            startSeconds: item.offset,
            endSeconds: item.offset + item.duration,
            text: item.text,
          }
        });
  
      return {
        transcript: {
          language: response.segments[0]?.lang ?? 'unknown',
          source: 'youtube',
          generatedAt: DateUtil.nowIso(),
          segments,
        },
        title: response.videoDetails?.title ?? 'Unknown video',
        channelId: response.videoDetails?.channelId ?? 'unknown',
        duration: response.videoDetails?.lengthSeconds ?? 0,
      }
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
      if (error instanceof YoutubeTranscriptVideoUnavailableError) {
        console.error('Video is unavailable:', error);
      } else if (error instanceof YoutubeTranscriptDisabledError) {
        console.error('Transcripts are disabled:', error.videoId);
      } else if (error instanceof YoutubeTranscriptNotAvailableError) {
        console.error('No transcript available:', error.videoId);
      } else if (error instanceof YoutubeTranscriptNotAvailableLanguageError) {
        console.error('Language not available:', error.lang, error.availableLangs);
      } else if (error instanceof YoutubeTranscriptInvalidLangError) {
        console.error('Invalid language code:', error.lang);
      } else if (error.name === 'AbortError') {
        console.error('Request was aborted due to timeout');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.error('An unexpected error occurred:', error.message);
      } 

      throw error;
    } 
}