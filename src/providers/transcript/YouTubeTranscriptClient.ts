import { fetchTranscript } from 'youtube-transcript';

import type { TranscriptData } from '@/models/TranscriptData';
import type { TranscriptSegment } from '@/value-objects';

import { DateUtil } from '@/utils/DateUtil';

import type { ITranscriptClient } from './ITranscriptClient';

// interface YouTubeTranscriptResponse {
//   text: string;
//   offset: number;
//   duration: number;
//   lang: string;
// }

export class YouTubeTranscriptClient implements ITranscriptClient {

  public async getTranscript(
    videoId: string,
  ): Promise<TranscriptData> {

    const response =
      await fetchTranscript(videoId);

    const segments: TranscriptSegment[] =
      response.map(item => ({
        startSeconds: item.offset,
        endSeconds: item.offset + item.duration,
        text: item.text,
      }));

    return {
      language: response[0]?.lang ?? 'unknown',

      source: 'youtube',

      generatedAt: DateUtil.nowIso(),

      segments,
    };
  }

}