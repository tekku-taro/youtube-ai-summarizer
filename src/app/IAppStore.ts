import type {
  ProviderConfig,
  Settings,
  SummaryData,
  VideoData,
} from '@/models';
import type { ModelInfo } from '@/value-objects/ModelInfo';
import type { TabType } from '@/value-objects/TabType';

export interface IAppStore {
  initialize(
    isYoutubePage:boolean,
    settings: Settings,
    providerConfig: ProviderConfig,
    models: ModelInfo[],
  ): void;

  setCurrentVideo(video: VideoData): void;

  setModels(models: ModelInfo[]): void;

  setActiveTab(tab: TabType): void;

  setLoading(loading: boolean, loadingTab?: TabType|null): void;

  setError(error?: string): void;

  reset(): void;

  updateStreamingSummary(summary: SummaryData): void;
}