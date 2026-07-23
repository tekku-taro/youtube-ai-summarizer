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

  isYoutubePage: boolean;

  loading: boolean;

  loadingTab?: TabType|null|undefined;

  error?: string|undefined;

  settings?: Settings|undefined;

  providerConfig?: ProviderConfig|undefined;

  models: ModelInfo[];

  currentVideo?: VideoData|undefined;

  activeTab: TabType;

}

interface AppStoreActions {
  initialize(
    isYoutubePage:boolean,
    settings: Settings,
    providerConfig: ProviderConfig,
    models: ModelInfo[],
    currentVideo?:VideoData,
  ): void;

  setLoading(loading: boolean, loadingTab?: TabType|null): void;

  setError(error?: string): void;

  getError(): string|undefined;

  setCurrentVideo(video: VideoData): void;

  clearCurrentVideo(): void;

  setModels(models: ModelInfo[]): void;

  setActiveTab(tab: TabType): void;

  reset(): void;
}

export const useAppStore =
  create<AppStoreState & AppStoreActions>((set, get) => ({
    initialized: false,
    isYoutubePage:false,
    loading: false,
    activeTab: TabType.Transcript,
    models: [],

    initialize: (
      isYoutubePage,
      settings,
      providerConfig,
      models,
      currentVideo,
    ) =>
      set({
        initialized: true,
        isYoutubePage:isYoutubePage,
        loading: false,
        error: undefined,
        settings,
        providerConfig,
        models,
        currentVideo: currentVideo,
        activeTab: get().activeTab ?? TabType.Transcript,
      }),

    setLoading: (loading, loadingTab?: TabType|null) =>
      set({
        loading,
        loadingTab: loadingTab,
      }),

    setError: (error) =>
      set({
        error,
      }),

    getError: () => get().error,

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
        isYoutubePage:false,
        loading: false,
        loadingTab: null,
        error: undefined,
        settings: undefined,
        currentVideo: undefined,
        providerConfig:undefined,
        models: [],
        activeTab:TabType.Transcript,
      }),
  }));