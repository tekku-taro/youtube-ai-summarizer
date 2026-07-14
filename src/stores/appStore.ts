import { create } from 'zustand';

import type {
  ProviderConfig,
  Settings,
  VideoData,
} from '@/models';
import type { ModelInfo } from '@/value-objects/ModelInfo';
import { TabType } from '@/value-objects';

interface AppStoreState {

  initialized: boolean;

  loading: boolean;

  error?: string|undefined;

  settings?: Settings|undefined;

  providerConfig?: ProviderConfig;

  models: ModelInfo[];

  currentVideo?: VideoData|undefined;

  activeTab: TabType;

}

interface AppStoreActions {
  initialize(
    settings: Settings,
    providerConfig: ProviderConfig,
    models: ModelInfo[],
  ): void;

  setLoading(loading: boolean): void;

  setError(error?: string): void;

  setCurrentVideo(video: VideoData): void;

  clearCurrentVideo(): void;

  setModels(models: ModelInfo[]): void;

  setActiveTab(tab: TabType): void;

  reset(): void;
}

export const useAppStore =
  create<AppStoreState & AppStoreActions>((set) => ({
    initialized: false,
    loading: false,
    activeTab: TabType.Transcript,
    models: [],

    initialize: (
      settings,
      providerConfig,
      models,
    ) =>
      set({
        initialized: true,
        loading: false,
        error: undefined,
        settings,
        providerConfig,
        models,
        currentVideo: undefined,
        activeTab: TabType.Transcript,
      }),

    setLoading: (loading) =>
      set({
        loading,
      }),

    setError: (error) =>
      set({
        error,
      }),


    setCurrentVideo: (video) =>
      set({
        currentVideo: video,
      }),

    clearCurrentVideo: () =>
      set({
        currentVideo: undefined,
      }),

    setModels: (models) =>
      set({
        models,
      }),

    setActiveTab: (tab: TabType) => set({
        activeTab: tab,
      }),

    reset: () =>
      set({
        initialized: false,
        loading: false,
        error: undefined,
        settings: undefined,
        currentVideo: undefined,
        models: [],
      }),
  }));