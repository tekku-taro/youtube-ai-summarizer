/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';


// 本物のリポジトリとサービス
import { SettingsRepository } from '@/repositories/SettingsRepository';
import { ProviderRepository } from '@/repositories/ProviderRepository';
import { VideoRepository } from '@/repositories/VideoRepository';

// モック化する外部サービスインターフェース
import type { IPromptService } from '@/services/IPromptService';
import type { IYouTubeTranscriptService } from '@/services/IYouTubeTranscriptService';
import type { ICurrentVideoService } from '@/services/ICurrentVideoService';
import { ProviderFactory } from '@/providers/ProviderFactory';

import type { ProviderType, SummaryType } from '@/value-objects';
import type { Settings, ProviderConfig, VideoData, ChatMessage } from '@/models';
import { AIFacade } from '@/app/AIFacade';
import { AppStore } from '@/app/AppStore';
import { useAppStore } from '@/stores';
import type { ITranscriptResponse } from '@/providers/transcript/ITranscriptClient';
import type { IVideoPlayerService } from '@/services/IVideoPlayerService';
import { MarkdownService } from '@/services';
import { DownloadService } from '@/services/DownloadService';
import { ClipboardService } from '@/services/ClipboardService';
import { ProviderConfigRepository } from '@/repositories';

// --- 1. インメモリ Fake Chrome Storage のセットアップ ---
function setupFakeChromeStorage() {
  const store: Record<string, any> = {};

  const fakeChrome = {
    storage: {
      local: {
        get: vi.fn(async (key?: string | string[] | null) => {
          if (!key) return store;
          if (typeof key === 'string') return { [key]: store[key] };
          if (Array.isArray(key)) {
            return key.reduce((acc, k) => ({ ...acc, [k]: store[k] }), {});
          }
          return store;
        }),
        set: vi.fn(async (items: Record<string, any>) => {
          Object.assign(store, items);
        }),
        remove: vi.fn(async (key: string | string[]) => {
          const keys = Array.isArray(key) ? key : [key];
          keys.forEach((k) => delete store[k]);
        }),
        clear: vi.fn(async () => {
          Object.keys(store).forEach((k) => delete store[k]);
        }),
      },
    },
  };

  // Node.js 環境での window オブジェクトの擬似生成と chrome の紐付け
  if (typeof window === 'undefined') {
    (globalThis as any).window = globalThis;
  }
  
  (globalThis as any).chrome = fakeChrome;
  (globalThis as any).window.chrome = fakeChrome;
}

describe('AIFacade (機能テスト / Integration Test)', () => {
  // 実体コンポーネント
  let facade: AIFacade;
  let appStore: AppStore;
  let settingsRepo: SettingsRepository;
  let providerRepo: ProviderRepository;
  let videoRepo: VideoRepository;

  // モック対象コンポーネント（外部通信・ブラウザタブ制御）
  let mockPromptService: IPromptService;
  let mockTranscriptService: IYouTubeTranscriptService;
  let mockCurrentVideoService: ICurrentVideoService;
  let mockVideoPlayerService: IVideoPlayerService;
  let mockProviderFactory: ProviderFactory;
  let mockAIProvider: any;

  beforeEach(() => {
    // Chrome Storage メモリ空間の初期化
    setupFakeChromeStorage();

    // 実体の生成
    settingsRepo = new SettingsRepository();
    providerRepo = new ProviderRepository();
    videoRepo = new VideoRepository();
    appStore = new AppStore(); // Zustand の実体ストアインスタンス
    // 💡 重要: テストごとにZustandの内部状態を初期状態にリセットする
    useAppStore.getState().reset();

    // 外部サービスのモック生成
    // IPromptService のモック生成部分の修正
    mockPromptService = {
      createSummaryMessages: vi.fn((transcript: string, summaryType: SummaryType) => [
        { role: 'system' as 'user' | 'assistant' | 'system', content: 'あなたは優秀な要約アシスタントです。' },
        { role: 'user' as 'user' | 'assistant' | 'system', content: `以下の文字起こしを要約してください (${summaryType}):\n${transcript}` },
      ]),
      createChatMessages: vi.fn((transcript: string, history: ChatMessage[], userPrompt: string) => [
        { role: 'system' as 'user' | 'assistant' | 'system', content: `文字起こし文:\n${transcript}` },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user' as 'user' | 'assistant' | 'system', content: userPrompt },
      ]),
    };

    mockTranscriptService = {
      getTranscript: vi.fn(),
    };

    mockCurrentVideoService = {
      getCurrentVideoId: vi.fn(),
    };
    mockVideoPlayerService = {
      seekTo: vi.fn(),
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
    };

    mockProviderFactory = {
      create: vi.fn().mockReturnValue(mockAIProvider),
    } as any;

    // AIFacade のインスタンス化
    facade = new AIFacade(
      settingsRepo,
      providerRepo,
      new ProviderConfigRepository,
      videoRepo,
      mockPromptService,
      mockTranscriptService,
      mockProviderFactory,
      appStore,
      mockCurrentVideoService,
      mockVideoPlayerService,
      new MarkdownService(),
      new DownloadService(),
      new ClipboardService(),
    );
  });

  describe('initialize 機能テスト', () => {
    it('初期化成功時、ストレージから設定が読み込まれ、AppStore に状態が正しく反映されること', async () => {
      // 事前に Chrome Storage へデフォルト設定を保存しておく
      const initialSettings: Settings = {
        provider: 'OpenAI' as ProviderType,
        model: 'gpt-4o',
        thinking: false,
        summaryType: 'Important' as SummaryType,
      };
      await settingsRepo.save(initialSettings);

      const initialProviderConfig: ProviderConfig = {
        provider: 'OpenAI' as ProviderType,
        apiKey: 'test-api-key',
        baseUrl: 'https://api.openai.com/v1',
      };
      await providerRepo.save(initialProviderConfig);

      // YouTube ページのタブIDを返すようモック
      vi.mocked(mockCurrentVideoService.getCurrentVideoId).mockResolvedValue('video-abc-123');

      // 実行
      const result = await facade.initialize();

      // 1. Facade の戻り値検証
      expect(result.isYoutubePage).toBe(true);
      expect(result.settings).toEqual(initialSettings);
      expect(result.provider).toEqual(initialProviderConfig);
      expect(result.models).toHaveLength(2);

      // 2. 実体 AppStore (Zustand) に状態が正常反映されたか検証
      const state = useAppStore.getState();
      expect(state.initialized).toBe(true);
      expect(state.settings).toEqual(initialSettings);
      expect(state.providerConfig).toEqual(initialProviderConfig);
      expect(state.models).toHaveLength(2);
      expect(state.loading).toBe(false);
      expect(state.error).toBeUndefined();
    });
  });

  describe('changeProvider 機能テスト', () => {
    it('プロバイダー変更時、SettingsRepository (Chrome Storage) が更新され、AppStore も同期されること', async () => {
      // プロバイダーごとに異なるモデル一覧を返すように ProviderFactory のモックを設定
      const mockOpenAIProvider = {
        getModels: vi.fn().mockResolvedValue({
          models: [{ id: 'gpt-4o', name: 'GPT-4o' }],
        }),
      };

      const mockAnthropicProvider = {
        getModels: vi.fn().mockResolvedValue({
          models: [
            { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
            { id: 'claude-sonnet-3-5-20241022', name: 'Claude Sonnet 3.5' },
          ],
        }),
      };

      // ProviderConfig の provider 名によって返す AIProvider を切り替える
      vi.mocked(mockProviderFactory.create).mockImplementation((config: ProviderConfig) => {
        if (config.provider === 'Anthropic') {
          return mockAnthropicProvider as any;
        }
        return mockOpenAIProvider as any;
      });

      // 初期状態のセットアップ
      await facade.initialize();
      let state = useAppStore.getState();
      expect(state.models).toEqual([{ id: 'gpt-4o', name: 'GPT-4o' }]);

      const newProviderConfig: ProviderConfig = {
        provider: 'Anthropic' as ProviderType,
        apiKey: 'anthropic-key',
        baseUrl: 'https://api.anthropic.com',
      };
      await providerRepo.save(newProviderConfig);

      // 実行：プロバイダーを Anthropic に変更
      await facade.changeProvider('Anthropic' as ProviderType);

      // 1. Chrome Storage に変更後の Settings が永続化されているか検証
      const savedSettings = await settingsRepo.find();
      expect(savedSettings.provider).toBe('Anthropic');

      // 2. 実体 AppStore の状態が切り替わっているか検証
      state = useAppStore.getState();
      expect(state.settings?.provider).toBe('Anthropic');
      expect(state.providerConfig?.provider).toBe('Anthropic');

      // 検証：AppStore の models が Anthropic のモデル一覧（2件）に正しく更新されたこと
      const updatedModels = state.models;
      expect(updatedModels).toHaveLength(2);
      expect(updatedModels[0]?.id).toBe('claude-haiku-4-5-20251001');
      expect(updatedModels[1]?.id).toBe('claude-sonnet-3-5-20241022');

    });
  });

  describe('getTranscript 機能テスト', () => {
    it('キャッシュが無い場合、字幕サービスから取得して VideoRepository (Chrome Storage) に保存し AppStore に反映すること', async () => {
      // initialize で videoId をセット
      vi.mocked(mockCurrentVideoService.getCurrentVideoId).mockResolvedValue('video-xyz-999');
      await facade.initialize();

      // 字幕サービスのモック戻り値
      const mockResponse:ITranscriptResponse = {
        title: 'テスト動画タイトル',
        channelId: 'channel-123',
        duration: 300,
        transcript: {
          language: 'ja',
          source: 'youtube',
          generatedAt: new Date().toISOString(),
          segments: [{ startSeconds: 0, endSeconds: 5, text: 'こんにちは' }],
        },
      };
      vi.mocked(mockTranscriptService.getTranscript).mockResolvedValue(mockResponse as ITranscriptResponse);

      // 実行：字幕の取得
      const result = await facade.getTranscript();

      // 1. レスポンスの検証（初回取得のため fromCache: false）
      expect(result.fromCache).toBe(false);
      expect(result.transcript.segments[0]?.text).toBe('こんにちは');

      // 2. Chrome Storage に VideoData が保存されているか検証
      const savedVideo = await videoRepo.find('video-xyz-999');
      expect(savedVideo).toBeDefined();
      expect(savedVideo?.title).toBe('テスト動画タイトル');
      expect(savedVideo?.transcript?.segments).toHaveLength(1);

      // 3. AppStore の currentVideo が更新されているか検証
      const state = useAppStore.getState();
      expect(state.currentVideo?.videoId).toBe('video-xyz-999');
    });

    it('既に Chrome Storage に動画データが存在する場合、サービスを呼ばずにキャッシュから返すこと', async () => {
      // 事前に Chrome Storage にキャッシュを読み込ませておく
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

      vi.mocked(mockCurrentVideoService.getCurrentVideoId).mockResolvedValue('video-cached-111');
      await facade.initialize();

      // 実行
      const result = await facade.getTranscript();

      // 1. キャッシュから読み込まれたことを検証
      expect(result.fromCache).toBe(true);
      expect(result.transcript.segments[0]?.text).toBe('キャッシュテキスト');

      // 2. 外部通信サービスが一度も呼ばれていないことを検証
      expect(mockTranscriptService.getTranscript).not.toHaveBeenCalled();
    });
  });

  describe('summarize 機能テスト', () => {
    it('要約が生成されると、VideoData の summaries に追加されて Storage および AppStore が更新されること', async () => {
      // 事前に字幕付き動画を保存
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

      vi.mocked(mockCurrentVideoService.getCurrentVideoId).mockResolvedValue('video-for-summary');
      await facade.initialize();

      // 実行：要約の要求
      const result = await facade.summarize({
        summaryType: 'Important' as SummaryType,
        options: { 
          provider: 'OpenAI',
          model: 'gpt-4o', 
          thinking: false
        },
      });

      // 1. 要約結果の構造検証
      expect(result.summary.content).toBe('AIからのテスト生成結果です。');

      // 2. Chrome Storage 上の VideoData に要約履歴が永続化されたか検証
      const updatedVideo = await videoRepo.find('video-for-summary');
      expect(updatedVideo?.summaries).toHaveLength(1);
      expect(updatedVideo?.summaries[0]?.content).toBe('AIからのテスト生成結果です。');

      // 3. AppStore 側の currentVideo にも反映されているか検証
      const state = useAppStore.getState();
      expect(state.currentVideo?.summaries).toHaveLength(1);
    });
  });

  describe('startSession 機能テスト', () => {
    it('既存のチャットセッションが存在しない場合、新規セッションを作成して Storage および AppStore に保存すること', async () => {
      // 1. 準備：チャットセッションが空（chatSessions: []）の動画データを事前保存
      const existingVideo: VideoData = {
        videoId: 'video-session-new',
        title: '新規セッションテスト動画',
        channelId: 'channel-1',
        duration: 180,
        summaries: [],
        chatSessions: [], // セッションなし
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

      vi.mocked(mockCurrentVideoService.getCurrentVideoId).mockResolvedValue('video-session-new');
      await facade.initialize();

      // 2. 実行：セッションの開始
      const session = await facade.startSession();

      // 3. 検証：返却されたセッションの初期構造
      expect(session).toBeDefined();
      expect(session.id).toBeTypeOf('string');
      expect(session.provider).toBe('OpenAI'); // 初期設定のProvider
      expect(session.model).toBe('gpt-4o-mini');  // 初期設定のModel
      expect(session.messages).toEqual([]);   // 初期メッセージは空

      // 4. 検証：Chrome Storage 上の VideoData にセッションが追加されたこと
      const updatedVideo = await videoRepo.find('video-session-new');
      expect(updatedVideo?.chatSessions).toHaveLength(1);
      expect(updatedVideo?.chatSessions[0]?.id).toBe(session.id);

      // 5. 検証：AppStore の currentVideo にもセッションが同期・反映されたこと
      const state = useAppStore.getState();
      const storeVideo = state.currentVideo;
      expect(storeVideo?.chatSessions).toHaveLength(1);
      expect(storeVideo?.chatSessions[0]?.id).toBe(session.id);
    });

    it('既にチャットセッションが存在する場合、新規作成せず末尾（最新）の既存セッションを返すこと', async () => {
      // 1. 準備：既存セッションを1つ持っている動画データを事前保存
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
            provider: 'OpenAI',
            model: 'gpt-4o',
            messages: [{ id: 'm1', role: 'user', content: 'おはよう', createdAt: new Date().toISOString() }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: existingSessionId,
            provider: 'OpenAI',
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

      vi.mocked(mockCurrentVideoService.getCurrentVideoId).mockResolvedValue('video-session-exists');
      await facade.initialize();

      // 2. 実行：セッションの開始
      const session = await facade.startSession();

      // 3. 検証：新しく作られず、既存のセッションIDと同じものが返されること
      expect(session.id).toBe(existingSessionId);
      expect(session.messages).toHaveLength(1);

      // 4. 検証：Storage 内のセッション数が増えていないこと（2個のまま）
      const savedVideo = await videoRepo.find('video-session-exists');
      expect(savedVideo?.chatSessions).toHaveLength(2);
    });

    it('対象の動画データが Storage に存在しない場合、エラー「Video Data not found.」をスローすること', async () => {
      // 1. 準備：Storage に動画データを保存せず、存在しない videoId で initialize
      vi.mocked(mockCurrentVideoService.getCurrentVideoId).mockResolvedValue('non-existent-video-id');
      await facade.initialize();

      // 2. 実行＆検証：例外が投げられることをアサーション
      await expect(facade.startSession()).rejects.toThrow('Video Data not found.');
    });
  });

  describe('chat 機能テスト', () => {
    it('チャット実行時、会話履歴 (user / assistant) が追加・保存され AppStore に反映されること', async () => {
      // 動画と初期チャットセッションを用意
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

      vi.mocked(mockCurrentVideoService.getCurrentVideoId).mockResolvedValue('video-for-chat');
      await facade.initialize();

      // セッションの開始
      const session = await facade.startSession();

      // 実行：チャットメッセージの送信
      const chatResult = await facade.chat({
        chatSessionId: session.id,
        userMessage: 'この動画の要点は？',
        options: { 
          provider: 'OpenAI',
          model: 'gpt-4o', 
          thinking: false 
        },
      });

      // 1. セッションメッセージに user と assistant の2つが入っているか検証
      expect(chatResult.chatSession.messages).toHaveLength(2);
      expect(chatResult.chatSession.messages[0]?.role).toBe('user');
      expect(chatResult.chatSession.messages[0]?.content).toBe('この動画の要点は？');
      expect(chatResult.chatSession.messages[1]?.role).toBe('assistant');
      expect(chatResult.chatSession.messages[1]?.content).toBe('AIからのテスト生成結果です。');

      // 2. Chrome Storage に会話データが永続化されているか検証
      const updatedVideo = await videoRepo.find('video-for-chat');
      expect(updatedVideo?.chatSessions[0]?.messages).toHaveLength(2);

      // 3. AppStore のデータが同期されているか検証
      const state = useAppStore.getState();
      expect(state.currentVideo?.chatSessions[0]?.messages).toHaveLength(2);
    });
  });
});