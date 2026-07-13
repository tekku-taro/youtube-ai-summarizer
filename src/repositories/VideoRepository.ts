import type { ChatSession } from '@/models/ChatSession';
import type { SummaryData } from '@/models/SummaryData';
import type { TranscriptData } from '@/models/TranscriptData';
import type { VideoData } from '@/models/VideoData';
import { storage } from '@/repositories/storage';

export class VideoRepository {
  private readonly namespace = 'videos';

  public async find(videoId: string): Promise<VideoData | null> {
    const videos = await storage.get<Record<string, VideoData>>(this.namespace);
    return videos?.[videoId] ?? null;
  }

  public async save(video: VideoData): Promise<void> {
    const videos = await storage.get<Record<string, VideoData>>(this.namespace);
    const next = { ...(videos ?? {}), [video.videoId]: video };
    await storage.set(this.namespace, next);
  }

  public async saveTranscript(videoId: string, transcript: TranscriptData): Promise<void> {
    const video = await this.find(videoId);
    if (!video) {
      return;
    }

    const nextVideo: VideoData = {
      ...video,
      transcript,
      updatedAt: new Date().toISOString(),
    };

    await this.save(nextVideo);
  }

  public async saveSummary(videoId: string, summary: SummaryData): Promise<void> {
    const video = await this.find(videoId);
    if (!video) {
      return;
    }

    const nextVideo: VideoData = {
      ...video,
      summaries: [...video.summaries, summary],
      updatedAt: new Date().toISOString(),
    };

    await this.save(nextVideo);
  }

  public async saveChatSession(videoId: string, session: ChatSession): Promise<void> {
    const video = await this.find(videoId);
    if (!video) {
      return;
    }

    const nextVideo: VideoData = {
      ...video,
      chatSessions: [...video.chatSessions.filter((item) => item.id !== session.id), session],
      updatedAt: new Date().toISOString(),
    };

    await this.save(nextVideo);
  }

  public async delete(videoId: string): Promise<void> {
    const videos = await storage.get<Record<string, VideoData>>(this.namespace);
    if (!videos) {
      return;
    }

    const next = { ...videos };
    delete next[videoId];
    await storage.set(this.namespace, next);
  }

  public async findAll(): Promise<VideoData[]> {
    const videos = await storage.get<Record<string, VideoData>>(this.namespace);
    return Object.values(videos ?? {});
  }
}
