import type { ProviderConfig } from '@/models/ProviderConfig';
import type { Settings } from '@/models/Settings';
import type { VideoData } from '@/models/VideoData';
import type { ModelInfo } from '@/value-objects/ModelInfo';

export interface InitialState {
  isYoutubePage: boolean;
  settings: Settings;
  provider: ProviderConfig;
  models: ModelInfo[];
  video?: VideoData;
}
