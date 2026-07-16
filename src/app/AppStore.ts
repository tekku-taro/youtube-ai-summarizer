import { useAppStore } from '@/stores/appStore';

import type {
  ProviderConfig,
  Settings,
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
  ): void {
    useAppStore.getState().initialize(
      isYoutubePage,
      settings,
      providerConfig,
      models,
    );
  }

  public setCurrentVideo(
    video: VideoData,
  ): void {
    useAppStore
      .getState()
      .setCurrentVideo(video);
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
  ): void {
    useAppStore
      .getState()
      .setLoading(loading);
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
}