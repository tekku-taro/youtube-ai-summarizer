// @vitest-environment node
import { describe, it, expect, beforeEach, vi, afterAll, type Mocked } from 'vitest';

// 本物のリポジトリとサービス
import { SettingsRepository } from '@/repositories/SettingsRepository';
import { ProviderRepository } from '@/repositories/ProviderRepository';
import { VideoRepository } from '@/repositories/VideoRepository';
import { ProviderConfigRepository } from '@/repositories';

// インターフェース / クラス
import type { IPromptService } from '@/services/IPromptService';
import type { IYouTubeTranscriptService } from '@/services/IYouTubeTranscriptService';
import type { ICurrentVideoService } from '@/services/ICurrentVideoService';
import type { IVideoPlayerService } from '@/services/IVideoPlayerService';
import type { ITranscriptResponse } from '@/providers/transcript/ITranscriptClient';
import { ProviderFactory } from '@/providers/ProviderFactory';

import { ProviderType, SummaryType, TabType } from '@/value-objects';
import type { Settings, ProviderConfig, VideoData, ChatMessage } from '@/models';
import { AIFacade } from '@/app/AIFacade';
import { AppStore } from '@/app/AppStore';
import { useAppStore } from '@/stores';
import { GenerateService } from '@/services';
import type { IAIProvider } from '@/providers';

// --- モック用型定義 ---
interface IMarkdownService {
  exportSummary: ReturnType<typeof vi.fn>;
  exportChat: ReturnType<typeof vi.fn>;
  exportTranscript: ReturnType<typeof vi.fn>;
}

interface IDownloadService {
  downloadTextFile: ReturnType<typeof vi.fn>;
}

interface IClipboardService {
  copyText: ReturnType<typeof vi.fn>;
}

// --- 1. インメモリ Fake Chrome Storage のセットアップ ---
function setupFakeChromeStorage() {
  const store = new Map<string, unknown>();

  const fakeChrome = {
    storage: {
      local: {
        get: vi.fn(async (key?: string | string[] | null) => {
          if (!key) return Object.fromEntries(store);
          if (typeof key === 'string') return { [key]: store.get(key) };
          if (Array.isArray(key)) {
            return key.reduce<Record<string, unknown>>((acc, k) => {
              acc[k] = store.get(k);
              return acc;
            }, {});
          }
          return Object.fromEntries(store);
        }),
        set: vi.fn(async (items: Record<string, unknown>) => {
          Object.entries(items).forEach(([k, v]) => store.set(k, v));
        }),
        remove: vi.fn(async (key: string | string[]) => {
          const keys = Array.isArray(key) ? key : [key];
          keys.forEach((k) => store.delete(k));
        }),
        clear: vi.fn(async () => {
          store.clear();
        }),
      },
    },
  };

  if (typeof window === 'undefined') {
    (globalThis as unknown as { window: typeof globalThis }).window = globalThis;
  }

  const globalWithChrome = globalThis as unknown as { chrome: typeof fakeChrome; window: { chrome: typeof fakeChrome } };
  globalWithChrome.chrome = fakeChrome;
  globalWithChrome.window.chrome = fakeChrome;
}

// --- テストデータ定義ヘルパー ---
function createMockTranscriptResponse(text = 'こんにちは'): ITranscriptResponse {
  return {
    title: 'テスト動画タイトル',
    channelId: 'channel-123',
    duration: 300,
    transcript: {
      language: 'ja',
      source: 'youtube',
      generatedAt: new Date().toISOString(),
      segments: [{ startSeconds: 0, endSeconds: 5, text }],
    },
  };
}

describe('AIFacade (機能テスト / Integration Test)', () => {
  // 実体コンポーネント
  let facade: AIFacade;
  let appStore: AppStore;
  let settingsRepo: SettingsRepository;
  let providerRepo: ProviderRepository;
  let videoRepo: VideoRepository;

  // モック対象コンポーネント
  let mockPromptService: Mocked<IPromptService>;
  let mockTranscriptService: Mocked<IYouTubeTranscriptService>;
  let mockCurrentVideoService: Mocked<ICurrentVideoService>;
  let mockVideoPlayerService: Mocked<IVideoPlayerService>;
  let mockMarkdownService: IMarkdownService;
  let mockDownloadService: IDownloadService;
  let mockClipboardService: IClipboardService;
  let mockProviderFactory: Mocked<ProviderFactory>;
  let mockAIProvider: Mocked<IAIProvider>;

  let getOptionsSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.restoreAllMocks();

    getOptionsSpy = vi.spyOn(ProviderConfigRepository.prototype, 'getProviderOptions');
    
    // Chrome Storage メモリ空間の初期化
    setupFakeChromeStorage();

    // 実体の生成
    settingsRepo = new SettingsRepository();
    providerRepo = new ProviderRepository();
    videoRepo = new VideoRepository();
    appStore = new AppStore();

    // Zustand ストアのリセット
    useAppStore.getState().reset();

    // モックオブジェクトの構築
    mockPromptService = {
      createSummaryMessages: vi.fn((transcript: string, summaryType: SummaryType) => [
        { role: 'system' as const, content: 'あなたは優秀な要約アシスタントです。' },
        { role: 'user' as const, content: `以下の文字起こしを要約してください (${summaryType}):\n${transcript}` },
      ]),
      createChatMessages: vi.fn((transcript: string, history: ChatMessage[], userPrompt: string) => [
        { role: 'system' as const, content: `文字起こし文:\n${transcript}` },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user' as const, content: userPrompt },
      ]),
    };

    mockTranscriptService = {
      getTranscript: vi.fn(),
    };

    mockCurrentVideoService = {
      getCurrentVideoId: vi.fn(),
    };

    mockVideoPlayerService = {
      seekTo: vi.fn().mockResolvedValue(undefined),
    };

    mockMarkdownService = {
      exportSummary: vi.fn().mockReturnValue('要約コンテンツ'),
      exportChat: vi.fn().mockReturnValue('チャット履歴'),
      exportTranscript: vi.fn().mockReturnValue('トランスクリプト'),
    };

    mockDownloadService = {
      downloadTextFile: vi.fn(),
    };

    mockClipboardService = {
      copyText: vi.fn().mockResolvedValue(true),
    };

    mockAIProvider = {
      getModels: vi.fn().mockResolvedValue({
        models: [
          { id: 'gpt-4o', name: 'GPT-4o' },
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
        ],
      }),
      generate: vi.fn().mockResolvedValue({
        content: 'AIからのテスト生成結果です。',
        finishReason: 'stop',
        generatedAt: new Date().toISOString(),
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      }),
    } as unknown as Mocked<IAIProvider>;

    mockProviderFactory = {
      create: vi.fn().mockReturnValue(mockAIProvider),
    } as unknown as Mocked<ProviderFactory>;

    const defaultProviderConfig: ProviderConfig = {
      provider: ProviderType.OpenAI,
      apiKey: 'openai_apikey',
      baseUrl: 'https://api.openai.com/v1',
    };

    vi.spyOn(ProviderConfigRepository.prototype, 'find').mockReturnValue(defaultProviderConfig);
    vi.spyOn(ProviderConfigRepository.prototype, 'getAvailable').mockReturnValue(defaultProviderConfig);

    // AIFacade のインスタンス化
    facade = new AIFacade(
      settingsRepo,
      providerRepo,
      new ProviderConfigRepository(),
      videoRepo,
      mockPromptService,
      mockTranscriptService,
      mockProviderFactory,
      appStore,
      mockCurrentVideoService,
      mockVideoPlayerService,
      mockMarkdownService as never,
      mockDownloadService as never,
      mockClipboardService as never
    );
  });

  afterAll(() => {
    getOptionsSpy.mockRestore();
  });

  describe('initialize 機能テスト', () => {
    it('初期化成功時、ストレージから設定が読み込まれ、AppStore に状態が正しく反映されること', async () => {
      const initialSettings: Settings = {
        provider: ProviderType.OpenAI,
        model: 'gpt-4o',
        thinking: false,
        summaryType: SummaryType.Important,
      };
      await settingsRepo.save(initialSettings);

      const initialProviderConfig: ProviderConfig = {
        provider: ProviderType.OpenAI,
        apiKey: 'test-api-key',
        baseUrl: 'https://api.openai.com/v1',
      };
      await providerRepo.save(initialProviderConfig);

      mockCurrentVideoService.getCurrentVideoId.mockResolvedValue('video-abc-123');

      const result = await facade.initialize();

      // 1. Facade の戻り値検証
      expect(result.isYoutubePage).toBe(true);
      expect(result.settings).toEqual(initialSettings);
      expect(result.provider).toEqual(initialProviderConfig);
      expect(result.models).toHaveLength(2);

      // 2. 実体 AppStore (Zustand) の検証
      const state = useAppStore.getState();
      expect(state.initialized).toBe(true);
      expect(state.settings).toEqual(initialSettings);
      expect(state.providerConfig).toEqual(initialProviderConfig);
      expect(state.models).toHaveLength(2);
      expect(state.loading).toBe(false);
      expect(state.error).toBeUndefined();
    });
  });

  describe('設定テスト', () => {
    it('getProviderOptions が ProviderConfigRepository の結果を返すこと', () => {
      const providerOptions = [{ value: ProviderType.OpenAI, label: 'OpenAI' }];
      getOptionsSpy.mockReturnValue(providerOptions);

      const options = facade.getProviderOptions();
      expect(options).toEqual(providerOptions);
    });

    it('resetSettings を呼ぶとリポジトリがリセットされ再初期化されること', async () => {
      await facade.initialize();
      await facade.changeThinking(true);
      expect((await settingsRepo.find()).thinking).toBe(true);

      await facade.resetSettings();

      const resettedSettings = await settingsRepo.find();
      expect(resettedSettings.thinking).toBe(false);
    });

    it('changeThinking で思考モードが変更・保存されること', async () => {
      await facade.initialize();
      await facade.changeThinking(true);

      const updatedSettings = await settingsRepo.find();
      expect(updatedSettings.thinking).toBe(true);
      expect(facade.getSettings().thinking).toBe(true);
    });

    it('changeSummaryType で要約タイプが変更・保存されること', async () => {
      await facade.initialize();
      await facade.changeSummaryType(SummaryType.Detailed);

      const updatedSettings = await settingsRepo.find();
      expect(updatedSettings.summaryType).toBe(SummaryType.Detailed);
      expect(facade.getSettings().summaryType).toBe(SummaryType.Detailed);
    });

    it('プロバイダー変更時、SettingsRepository が更新され、AppStore も同期されること', async () => {
      const mockOpenAIProvider = {
        getModels: vi.fn().mockResolvedValue({
          models: [{ id: 'gpt-4o', name: 'GPT-4o' }],
        }),
      };

      const mockGeminiProvider = {
        getModels: vi.fn().mockResolvedValue({
          models: [
            { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
            { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
          ],
        }),
      };

      mockProviderFactory.create.mockImplementation((config: ProviderConfig) => {
        if (config.provider === ProviderType.Gemini) {
          return mockGeminiProvider as unknown as IAIProvider;
        }
        return mockOpenAIProvider as unknown as IAIProvider;
      });

      await facade.initialize();
      expect(useAppStore.getState().models).toEqual([{ id: 'gpt-4o', name: 'GPT-4o' }]);

      const newProviderConfig: ProviderConfig = {
        provider: ProviderType.Gemini,
        apiKey: 'gemini-key',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      };
      await providerRepo.save(newProviderConfig);

      await facade.changeProvider(ProviderType.Gemini);

      const savedSettings = await settingsRepo.find();
      expect(savedSettings.provider).toBe(ProviderType.Gemini);

      const state = useAppStore.getState();
      expect(state.settings?.provider).toBe(ProviderType.Gemini);
      expect(state.providerConfig?.provider).toBe(ProviderType.Gemini);
      expect(state.models).toHaveLength(2);
      expect(state.models[0]?.id).toBe('gemini-3.1-flash-lite');
    });
  });

  describe('getTranscript 機能テスト', () => {
    it('キャッシュが無い場合、字幕サービスから取得して Storage に保存し AppStore に反映すること', async () => {
      mockCurrentVideoService.getCurrentVideoId.mockResolvedValue('video-xyz-999');
      await facade.initialize();

      const mockResponse = createMockTranscriptResponse();
      mockTranscriptService.getTranscript.mockResolvedValue(mockResponse);

      const result = await facade.getTranscript();

      expect(result.fromCache).toBe(false);
      expect(result.transcript.segments[0]?.text).toBe('こんにちは');

      const savedVideo = await videoRepo.find('video-xyz-999');
      expect(savedVideo?.title).toBe('テスト動画タイトル');
      expect(savedVideo?.transcript?.segments).toHaveLength(1);

      expect(useAppStore.getState().currentVideo?.videoId).toBe('video-xyz-999');
    });

    it('既に Storage に動画データが存在する場合、サービスを呼ばずにキャッシュから返すこと', async () => {
      const existingVideo: VideoData = {
        videoId: 'video-cached-111',
        title: 'キャッシュ済み動画',
        channelId: 'channel-000',
        duration: 100,
        summaries: [],
        chatSessions: [],
        no_transcript: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transcript: {
          language: 'ja',
          source: 'youtube',
          generatedAt: new Date().toISOString(),
          segments: [{ startSeconds: 0, endSeconds: 10, text: 'キャッシュテキスト' }],
        },
      };
      await videoRepo.save(existingVideo);

      mockCurrentVideoService.getCurrentVideoId.mockResolvedValue('video-cached-111');
      await facade.initialize();

      const result = await facade.getTranscript();

      expect(result.fromCache).toBe(true);
      expect(result.transcript.segments[0]?.text).toBe('キャッシュテキスト');
      expect(mockTranscriptService.getTranscript).not.toHaveBeenCalled();
    });
  });

  describe('summarize 機能テスト', () => {
    it('要約が生成されると、VideoData の summaries に追加されて Storage および AppStore が更新されること', async () => {
      const existingVideo: VideoData = {
        videoId: 'video-for-summary',
        title: '要約対象動画',
        channelId: 'channel-1',
        duration: 200,
        summaries: [],
        chatSessions: [],
        no_transcript: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transcript: {
          language: 'ja',
          source: 'youtube',
          generatedAt: new Date().toISOString(),
          segments: [{ startSeconds: 0, endSeconds: 10, text: '要約用テキストです。' }],
        },
      };
      await videoRepo.save(existingVideo);

      mockCurrentVideoService.getCurrentVideoId.mockResolvedValue('video-for-summary');
      await facade.initialize();

      const result = await facade.summarize({
        summaryType: SummaryType.Important,
        options: {
          provider: ProviderType.OpenAI,
          model: 'gpt-4o',
          thinking: false,
        },
      });

      expect(result.summary.content).toBe('AIからのテスト生成結果です。');

      const updatedVideo = await videoRepo.find('video-for-summary');
      expect(updatedVideo?.summaries).toHaveLength(1);
      expect(updatedVideo?.summaries[0]?.content).toBe('AIからのテスト生成結果です。');

      expect(useAppStore.getState().currentVideo?.summaries).toHaveLength(1);
    });
  });

  describe('startSession 機能テスト', () => {
    it('既存のチャットセッションが存在しない場合、新規セッションを作成して保存すること', async () => {
      const existingVideo: VideoData = {
        videoId: 'video-session-new',
        title: '新規セッションテスト動画',
        channelId: 'channel-1',
        duration: 180,
        summaries: [],
        chatSessions: [],
        no_transcript: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transcript: {
          language: 'ja',
          source: 'youtube',
          generatedAt: new Date().toISOString(),
          segments: [{ startSeconds: 0, endSeconds: 5, text: 'テスト字幕' }],
        },
      };
      await videoRepo.save(existingVideo);

      mockCurrentVideoService.getCurrentVideoId.mockResolvedValue('video-session-new');
      await facade.initialize();
      mockTranscriptService.getTranscript.mockResolvedValue(createMockTranscriptResponse());
      await facade.getTranscript();

      const session = await facade.startSession();

      expect(session).toBeDefined();
      expect(session.id).toBeTypeOf('string');
      expect(session.provider).toBe(ProviderType.OpenAI);
      expect(session.model).toBe('gpt-4o');
      expect(session.messages).toEqual([]);

      const updatedVideo = await videoRepo.find('video-session-new');
      expect(updatedVideo?.chatSessions).toHaveLength(1);
      expect(updatedVideo?.chatSessions[0]?.id).toBe(session.id);

      expect(useAppStore.getState().currentVideo?.chatSessions).toHaveLength(1);
    });

    it('既にチャットセッションが存在する場合、最新の既存セッションを返すこと', async () => {
      const existingSessionId = 'existing-session-123';
      const existingVideo: VideoData = {
        videoId: 'video-session-exists',
        title: '既存セッションテスト動画',
        channelId: 'channel-1',
        duration: 180,
        summaries: [],
        chatSessions: [
          {
            id: '122',
            provider: ProviderType.OpenAI,
            model: 'gpt-4o',
            messages: [{ id: 'm1', role: 'user', content: 'おはよう', createdAt: new Date().toISOString() }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: existingSessionId,
            provider: ProviderType.OpenAI,
            model: 'gpt-4o',
            messages: [{ id: 'm1', role: 'user', content: 'こんにちは', createdAt: new Date().toISOString() }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        no_transcript: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await videoRepo.save(existingVideo);

      mockCurrentVideoService.getCurrentVideoId.mockResolvedValue('video-session-exists');
      await facade.initialize();
      mockTranscriptService.getTranscript.mockResolvedValue(createMockTranscriptResponse());
      await facade.getTranscript();

      const session = await facade.startSession();

      expect(session.id).toBe(existingSessionId);
      expect(session.messages).toHaveLength(1);

      const savedVideo = await videoRepo.find('video-session-exists');
      expect(savedVideo?.chatSessions).toHaveLength(2);
    });

    it('対象の動画データが Storage に存在しない場合、エラーをスローすること', async () => {
      mockCurrentVideoService.getCurrentVideoId.mockResolvedValue('non-existent-video-id');
      await facade.initialize();

      mockTranscriptService.getTranscript.mockRejectedValue(new Error('test error'));
      await facade.getTranscript();

      await expect(facade.startSession()).rejects.toThrow('No current video selected.');
    });
  });

  describe('chat 機能テスト', () => {
    it('チャット実行時、会話履歴が追加・保存され AppStore に反映されること', async () => {
      const existingVideo: VideoData = {
        videoId: 'video-for-chat',
        title: 'チャット対象動画',
        channelId: 'channel-1',
        duration: 200,
        summaries: [],
        chatSessions: [],
        no_transcript: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transcript: {
          language: 'ja',
          source: 'youtube',
          generatedAt: new Date().toISOString(),
          segments: [{ startSeconds: 0, endSeconds: 10, text: '会話用テキスト。' }],
        },
      };
      await videoRepo.save(existingVideo);

      mockCurrentVideoService.getCurrentVideoId.mockResolvedValue('video-for-chat');
      await facade.initialize();
      mockTranscriptService.getTranscript.mockResolvedValue(createMockTranscriptResponse());
      await facade.getTranscript();

      const session = await facade.startSession();

      const chatResult = await facade.chat({
        chatSessionId: session.id,
        userMessage: 'この動画の要点は？',
        options: {
          provider: ProviderType.OpenAI,
          model: 'gpt-4o',
          thinking: false,
        },
      });

      expect(chatResult.chatSession.messages).toHaveLength(2);
      expect(chatResult.chatSession.messages[0]?.role).toBe('user');
      expect(chatResult.chatSession.messages[0]?.content).toBe('この動画の要点は？');
      expect(chatResult.chatSession.messages[1]?.role).toBe('assistant');

      const updatedVideo = await videoRepo.find('video-for-chat');
      expect(updatedVideo?.chatSessions[0]?.messages).toHaveLength(2);

      expect(useAppStore.getState().currentVideo?.chatSessions[0]?.messages).toHaveLength(2);
    });
  });

  describe('動画操作 & シーク', () => {
    it('seek メソッドで VideoPlayerService が呼び出されること', async () => {
      mockCurrentVideoService.getCurrentVideoId.mockResolvedValue('video-abc-123');
      await facade.initialize();
      await facade.seek(120);

      expect(mockVideoPlayerService.seekTo).toHaveBeenCalledWith(120);
    });

    it('videoId が未設定の場合、seek は実行されないこと', async () => {
      await facade.initialize();
      await facade.seek(120);
      expect(mockVideoPlayerService.seekTo).not.toHaveBeenCalled();
    });
  });

  describe('エクスポート機能 (Markdown)', () => {
    beforeEach(async () => {
      mockCurrentVideoService.getCurrentVideoId.mockResolvedValue('video-abc-123');
      mockTranscriptService.getTranscript.mockResolvedValue(createMockTranscriptResponse());

      await facade.initialize();
      await facade.getTranscript();
    });

    describe('exportSummaryMarkdown', () => {
      it('ファイルダウンロードとして正常に出力されること', async () => {
        vi.spyOn(GenerateService.prototype, 'summarize').mockResolvedValue({
          content: '要約内容',
          finishReason: '',
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          provider: ProviderType.Gemini,
          model: '',
          generatedAt: '2023-10-01T12:34:56.789Z',
        });

        await facade.summarize({
          summaryType: SummaryType.Important,
          options: { provider: ProviderType.OpenAI, model: 'gpt-4o', thinking: false },
        });

        const result = await facade.exportSummaryMarkdown(false);

        expect(result).toBe(true);
        expect(mockMarkdownService.exportSummary).toHaveBeenCalled();
        expect(mockDownloadService.downloadTextFile).toHaveBeenCalledWith('要約コンテンツ', 'テスト動画タイトル_summary.md');
      });

      it('toClipboard = true の場合、クリップボードにコピーされること', async () => {
        vi.spyOn(GenerateService.prototype, 'summarize').mockResolvedValue({
          content: '要約内容',
          finishReason: '',
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          provider: ProviderType.Gemini,
          model: '',
          generatedAt: '2023-10-01T12:34:56.789Z',
        });

        await facade.summarize({
          summaryType: SummaryType.Important,
          options: { provider: ProviderType.OpenAI, model: 'gpt-4o', thinking: false },
        });

        const result = await facade.exportSummaryMarkdown(true);

        expect(result).toBe(true);
        expect(mockClipboardService.copyText).toHaveBeenCalledWith('要約コンテンツ');
        expect(mockDownloadService.downloadTextFile).not.toHaveBeenCalled();
      });

      it('要約データが存在しない場合、エラーがセットされ false を返すこと', async () => {
        const current = facade.getCurrentVideo();
        if (current) current.summaries = [];

        const result = await facade.exportSummaryMarkdown(false);

        expect(result).toBe(false);
        expect(appStore.getError()).toBe('No summary available to export.');
      });
    });

    describe('exportTranscriptMarkdown', () => {
      it('ファイルダウンロードとして正常に出力されること', async () => {
        const result = await facade.exportTranscriptMarkdown(false);

        expect(result).toBe(true);
        expect(mockMarkdownService.exportTranscript).toHaveBeenCalled();
        expect(mockDownloadService.downloadTextFile).toHaveBeenCalledWith('トランスクリプト', 'テスト動画タイトル_transcript.md');
      });
    });

    describe('exportChatMarkdown', () => {
      it('ファイルダウンロードとして正常に出力されること', async () => {
        const session = await facade.startSession();

        vi.spyOn(GenerateService.prototype, 'chat').mockResolvedValue({
          content: 'チャット内容',
          finishReason: '',
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          provider: ProviderType.Gemini,
          model: '',
          generatedAt: '2023-10-01T12:34:56.789Z',
        });

        await facade.chat({
          chatSessionId: session.id,
          userMessage: 'この動画の要点は？',
          options: { provider: ProviderType.OpenAI, model: 'gpt-4o', thinking: false },
        });

        const result = await facade.exportChatMarkdown(false, session.id);

        expect(result).toBe(true);
        expect(mockMarkdownService.exportChat).toHaveBeenCalled();
        expect(mockDownloadService.downloadTextFile).toHaveBeenCalledWith('チャット履歴', 'テスト動画タイトル_chat.md');
      });

      it('チャット履歴が存在しない場合、エラーを返すこと', async () => {
        const current = facade.getCurrentVideo();
        if (current) current.chatSessions = [];

        const result = await facade.exportChatMarkdown(false);

        expect(result).toBe(false);
        expect(appStore.getError()).toBe('No chat history available to export.');
      });
    });

    describe('exportMarkdown (アクティブタブ分岐)', () => {
      it('アクティブタブが Summary の場合、exportSummaryMarkdown が呼ばれること', async () => {
        facade.setActiveTab(TabType.Summary);
        const spy = vi.spyOn(facade, 'exportSummaryMarkdown');

        await facade.exportMarkdown();
        expect(spy).toHaveBeenCalled();
      });

      it('アクティブタブが Chat の場合、exportChatMarkdown が呼ばれること', async () => {
        facade.setActiveTab(TabType.Chat);
        const spy = vi.spyOn(facade, 'exportChatMarkdown');

        await facade.exportMarkdown();
        expect(spy).toHaveBeenCalled();
      });

      it('アクティブタブが Transcript の場合、exportTranscriptMarkdown が呼ばれること', async () => {
        facade.setActiveTab(TabType.Transcript);
        const spy = vi.spyOn(facade, 'exportTranscriptMarkdown');

        await facade.exportMarkdown();
        expect(spy).toHaveBeenCalled();
      });
    });
  });
});