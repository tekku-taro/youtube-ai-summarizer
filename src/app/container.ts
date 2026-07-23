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
import { VideoPlayerService } from '@/services/VideoPlayerService';
import { MarkdownService } from '@/services';
import { DownloadService } from '@/services/DownloadService';
import { ClipboardService } from '@/services/ClipboardService';
import { ProviderConfigRepository } from '@/repositories';

const appStore = new AppStore();
const client = new YouTubeTranscriptClient();

export const aiFacade = new AIFacade(
  new SettingsRepository(),
  new ProviderRepository(),
  new ProviderConfigRepository(),
  new VideoRepository(),
  new PromptService(),
  new YouTubeTranscriptService(client),
  new ProviderFactory(),
  appStore,
  new CurrentVideoService(),
  new VideoPlayerService(),
  new MarkdownService(),
  new DownloadService(),
  new ClipboardService(),
);