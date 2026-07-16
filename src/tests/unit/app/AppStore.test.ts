import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/stores/appStore';
import { ProviderType, SummaryType, TabType } from '@/value-objects';
import type { Settings, ProviderConfig, VideoData } from '@/models';
import type { ModelInfo } from '@/value-objects/ModelInfo';
import { AppStore } from '@/app/AppStore';

// 今後、状態管理を Signals や Redux Toolkit などに移行する場合、
// このテストコード側の useAppStore.getState() の検証部分を新しいライブラリの覗き方に変える

describe('AppStore', () => {
  let appStore: AppStore;

  // ダミーデータの準備
  const mockSettings = { 
    provider:ProviderType.OpenAI,
    model:'gpt-4',
    summaryType: SummaryType.Important,
    thinking: false,
  } as Settings;
  const mockProviderConfig = { baseUrl: 'https://api.example.com' } as ProviderConfig;
  const mockModels: ModelInfo[] = [{ id: 'gpt-4', name: 'GPT-4' } as ModelInfo];
  const mockVideo: VideoData = { 
    videoId: 'videoId123', 
    title: 'Test Video',      
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as VideoData;

  beforeEach(() => {
    appStore = new AppStore();
    // 💡 重要: テストごとにZustandの内部状態を初期状態にリセットする
    useAppStore.getState().reset();
  });

  it('initializeメソッドで初期状態が正しくセットされ、initializedがtrueになること', () => {
    // 実行
    appStore.initialize(true, mockSettings, mockProviderConfig, mockModels);

    // Zustandの生のStateを取得して検証
    const state = useAppStore.getState();
    expect(state.initialized).toBe(true);
    expect(state.isYoutubePage).toBe(true);
    expect(state.settings).toEqual(mockSettings);
    expect(state.providerConfig).toEqual(mockProviderConfig);
    expect(state.models).toEqual(mockModels);
    expect(state.activeTab).toBe(TabType.Transcript);
  });

  it('setCurrentVideoメソッドで現在のビデオ情報が更新されること', () => {
    appStore.setCurrentVideo(mockVideo);

    const state = useAppStore.getState();
    expect(state.currentVideo).toEqual(mockVideo);
  });

  it('setModelsメソッドでモデル一覧が更新されること', () => {
    const newModels: ModelInfo[] = [{ id: 'claude-3', name: 'Claude 3' } as ModelInfo];
    
    appStore.setModels(newModels);

    const state = useAppStore.getState();
    expect(state.models).toEqual(newModels);
  });

  it('setActiveTabメソッドでアクティブなタブが切り替わること', () => {
    // 初期値がTranscriptだと仮定し、Summaryに切り替えるテスト
    appStore.setActiveTab(TabType.Summary);

    const state = useAppStore.getState();
    expect(state.activeTab).toBe(TabType.Summary);
  });

  it('setLoadingメソッドでローディング状態が切り替わること', () => {
    appStore.setLoading(true);
    expect(useAppStore.getState().loading).toBe(true);

    appStore.setLoading(false);
    expect(useAppStore.getState().loading).toBe(false);
  });

  describe('エラーハンドリング', () => {
    it('setErrorでエラーを保持し、getErrorでそのメッセージを取得できること', () => {
      const errorMessage = '何か不具合が発生しました。';
      
      appStore.setError(errorMessage);

      // クラスのゲッターメソッド経由の検証
      expect(appStore.getError()).toBe(errorMessage);
      // ストアの生Stateの検証
      expect(useAppStore.getState().error).toBe(errorMessage);
    });

    it('setErrorにundefinedを渡すとエラーがクリアされること', () => {
      appStore.setError('エラー');
      appStore.setError(undefined);

      expect(appStore.getError()).toBeUndefined();
    });
  });

  it('resetメソッドを呼ぶと、すべてのステートが初期状態にクリアされること', () => {
    // 一度データを詰め込む
    appStore.initialize(true, mockSettings, mockProviderConfig, mockModels);
    appStore.setCurrentVideo(mockVideo);
    appStore.setError('error');

    // リセット実行
    appStore.reset();

    const state = useAppStore.getState();
    expect(state.initialized).toBe(false);
    expect(state.isYoutubePage).toBe(false);
    expect(state.error).toBeUndefined();
    expect(state.settings).toBeUndefined();
    expect(state.currentVideo).toBeUndefined();
    expect(state.models).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.providerConfig).toBe(undefined);
    expect(state.activeTab).toBe(TabType.Transcript);
  });
});