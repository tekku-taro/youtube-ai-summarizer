import { useAppStore } from '@/stores/appStore';

import type {
  ChatMessage,
  ProviderConfig,
  Settings,
  SummaryData,
  VideoData,
} from '@/models';

import type { ModelInfo } from '@/value-objects/ModelInfo';
import type { TabType } from '@/value-objects/TabType';

import type { IAppStore } from './IAppStore';

export class AppStore implements IAppStore {
  public initialize(
    isYoutubePage:boolean,
    settings: Settings,
    providerConfig: ProviderConfig,
    models: ModelInfo[],
    currentVideo?: VideoData,
  ): void {
    useAppStore.getState().initialize(
      isYoutubePage,
      settings,
      providerConfig,
      models,
      currentVideo,
    );
  }

  public setCurrentVideo(
    video: VideoData,
  ): void {
    useAppStore
      .getState()
      .setCurrentVideo(video);
  }

  // ストリーミング更新メソッドの追加
  public updateStreamingSummary(
    summary: SummaryData,
  ): void {
    useAppStore
      .getState()
      .updateStreamingSummary(summary);
  }

  public updateStreamingChatMessage(
    chatSessionId: string, 
    message: ChatMessage
  ): void {
    useAppStore
      .getState()
      .updateStreamingChatMessage(chatSessionId, message);
  }

  public setModels(
    models: ModelInfo[],
  ): void {
    useAppStore
      .getState()
      .setModels(models);
  }

  public setActiveTab(
    tab: TabType,
  ): void {
    useAppStore
      .getState()
      .setActiveTab(tab);
  }

  public setLoading(
    loading: boolean,
    loadingTab?: TabType|null,
  ): void {
    useAppStore
      .getState()
      .setLoading(loading, loadingTab);
  }

  public setError(
    error?: string,
  ): void {
    useAppStore
      .getState()
      .setError(error);
  }

  public getError(): string | undefined {
    return useAppStore.getState().error;
  }


  public reset(): void {
    useAppStore
      .getState()
      .reset();
  }


  public getActiveTab(): TabType {
    return useAppStore.getState().activeTab;
  }
}