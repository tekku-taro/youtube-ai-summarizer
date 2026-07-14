import { AIFacade } from '@/app/AIFacade';
import { AppStore } from '@/app/AppStore';

import { SettingsRepository } from '@/repositories/SettingsRepository';
import { ProviderRepository } from '@/repositories/ProviderRepository';
import { VideoRepository } from '@/repositories/VideoRepository';

import { PromptService } from '@/services/PromptService';
import { YouTubeTranscriptService } from '@/services/YouTubeTranscriptService';

import { ProviderFactory } from '@/providers/ProviderFactory';
import { YouTubeTranscriptClient } from '@/providers/transcript/YouTubeTranscriptClient';
import { CurrentVideoService } from '@/services/CurrentVideoService';

const appStore = new AppStore();
const client = new YouTubeTranscriptClient();

export const aiFacade = new AIFacade(
  new SettingsRepository(),
  new ProviderRepository(),
  new VideoRepository(),
  new PromptService(),
  new YouTubeTranscriptService(client),
  new ProviderFactory(),
  appStore,
  new CurrentVideoService(),
);