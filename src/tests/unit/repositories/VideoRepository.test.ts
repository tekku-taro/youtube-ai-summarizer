import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { storage } from '@/repositories/storage';
import type { VideoData } from '@/models/VideoData';
import type { TranscriptData } from '@/models/TranscriptData';
import type { SummaryData } from '@/models/SummaryData';
import type { ChatSession } from '@/models/ChatSession';
import { VideoRepository } from '@/repositories';

vi.mock('@/repositories/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('VideoRepository', () => {
  let repository: VideoRepository;
  const mockSystemTime = '2026-07-16T06:00:00.000Z';

  // 基本的なビデオデータの雛形
  const createMockVideo = (id: string): VideoData => ({
    videoId: id,
    title: `Video ${id}`,
    channelId: 'RickAstleyVEVO',
    duration: 120,
    summaries: [],
    chatSessions: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  } as VideoData);

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockSystemTime));
    repository = new VideoRepository();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('find', () => {
    it('指定したvideoIdに対応するデータが存在する場合、そのデータを返すこと', async () => {
      const videoMap = {
        v1: createMockVideo('v1'),
        v2: createMockVideo('v2'),
      };
      vi.mocked(storage.get).mockResolvedValue(videoMap);

      const result = await repository.find('v1');
      expect(result).toEqual(videoMap.v1);
    });

    it('指定したvideoIdが存在しない、またはストレージが空の場合、nullを返すこと', async () => {
      vi.mocked(storage.get).mockResolvedValue(null);
      const result = await repository.find('v3');
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('既存のマップ構造を維持しながら、新しいビデオデータを追加・上書きして保存すること', async () => {
      const existingMap = { v1: createMockVideo('v1') };
      vi.mocked(storage.get).mockResolvedValue(existingMap);

      const targetVideo = createMockVideo('v2');
      await repository.save(targetVideo);

      expect(storage.set).toHaveBeenCalledWith('videos', {
        v1: existingMap.v1,
        v2: targetVideo,
      });
    });
  });

  describe('saveTranscript', () => {
    it('対象のビデオが存在しない場合、何も処理を行わず返ること', async () => {
      vi.spyOn(repository, 'find').mockResolvedValue(null);
      const saveSpy = vi.spyOn(repository, 'save');

      await repository.saveTranscript('v1', {} as TranscriptData);

      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('対象のビデオが存在する場合、transcriptをセットし、updatedAtを現在時刻に更新して保存すること', async () => {
      const baseVideo = createMockVideo('v1');
      vi.spyOn(repository, 'find').mockResolvedValue(baseVideo);
      const saveSpy = vi.spyOn(repository, 'save').mockResolvedValue();

      const mockTranscript = {
        language: 'japanese',
        source: 'youtube',
        generatedAt: '2026-07-15T00:00:00',
        segments: [
          {
            startSeconds: 0,
            endSeconds: 10,
            text: 'Hello, world!',
          },
        ]
      } as TranscriptData;
      await repository.saveTranscript('v1', mockTranscript);

      expect(saveSpy).toHaveBeenCalledWith({
        ...baseVideo,
        transcript: mockTranscript,
        updatedAt: mockSystemTime, // フェイクタイムで固定された日時
      });
    });
  });

  describe('saveSummary', () => {
    it('既存のsummaries配列に新しいsummaryを追加し、updatedAtを更新して保存すること', async () => {
      const baseVideo = createMockVideo('v1');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      baseVideo.summaries = [{ id: 's1' } as any];
      vi.spyOn(repository, 'find').mockResolvedValue(baseVideo);
      const saveSpy = vi.spyOn(repository, 'save').mockResolvedValue();

      const newSummary = { id: 's2' } as unknown as SummaryData;
      await repository.saveSummary('v1', newSummary);

      expect(saveSpy).toHaveBeenCalledWith({
        ...baseVideo,
        summaries: [{ id: 's1' }, { id: 's2' }],
        updatedAt: mockSystemTime,
      });
    });
  });

  describe('saveChatSession', () => {
    it('新規のsessionの場合は配列に追加し、同じIDを持つ既存のsessionがある場合は置換して保存すること', async () => {
      const baseVideo = createMockVideo('v1');
      baseVideo.chatSessions = [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { id: 'session-1', messages: [] } as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { id: 'session-2', messages: [] } as any,
      ];
      vi.spyOn(repository, 'find').mockResolvedValue(baseVideo);
      const saveSpy = vi.spyOn(repository, 'save').mockResolvedValue();

      // session-2 を更新するケース
      const updatedSession = { id: 'session-2', messages: [{ content: 'Hello' }] } as unknown as ChatSession;
      await repository.saveChatSession('v1', updatedSession);

      expect(saveSpy).toHaveBeenCalledWith({
        ...baseVideo,
        chatSessions: [
          { id: 'session-1', messages: [] },
          { id: 'session-2', messages: [{ content: 'Hello' }] }, // 置換されている
        ],
        updatedAt: mockSystemTime,
      });
    });
  });

  describe('delete', () => {
    it('指定したvideoIdをマップから削除して保存すること', async () => {
      const existingMap = {
        v1: createMockVideo('v1'),
        v2: createMockVideo('v2'),
      };
      vi.mocked(storage.get).mockResolvedValue(existingMap);

      await repository.delete('v1');

      expect(storage.set).toHaveBeenCalledWith('videos', {
        v2: existingMap.v2, // v1 だけが削除されている
      });
    });

    it('ストレージ自体が空（null）の場合は何もせず処理を終了すること', async () => {
      vi.mocked(storage.get).mockResolvedValue(null);
      await repository.delete('v1');
      expect(storage.set).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('保存されているすべてのビデオデータを配列形式に平坦化して返すこと', async () => {
      const videoMap = {
        v1: createMockVideo('v1'),
        v2: createMockVideo('v2'),
      };
      vi.mocked(storage.get).mockResolvedValue(videoMap);

      const result = await repository.findAll();

      expect(result).toEqual([videoMap.v1, videoMap.v2]);
    });

    it('ストレージが空（null）の場合は空の配列を返すこと', async () => {
      vi.mocked(storage.get).mockResolvedValue(null);
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });
  });
});