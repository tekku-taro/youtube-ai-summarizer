import type {
  ProviderConfig,
  Settings,
  VideoData,
} from '@/models';
import type { ModelInfo } from '@/value-objects/ModelInfo';
import type { TabType } from '@/value-objects/TabType';

export interface IAppStore {
  initialize(
    settings: Settings,
    providerConfig: ProviderConfig,
    models: ModelInfo[],
  ): void;

  setCurrentVideo(video: VideoData): void;

  setModels(models: ModelInfo[]): void;

  setActiveTab(tab: TabType): void;

  setLoading(loading: boolean): void;

  setError(error?: string): void;

  reset(): void;
}