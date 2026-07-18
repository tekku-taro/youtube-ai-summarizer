import type { InitialState } from '@/dto/InitialState';
import type { TranscriptResult } from '@/dto/TranscriptResult';

import type { SettingsRepository } from '@/repositories/SettingsRepository';
import type { ProviderRepository } from '@/repositories/ProviderRepository';
import type { VideoRepository } from '@/repositories/VideoRepository';

import type { IPromptService } from '@/services/IPromptService';
import type { IYouTubeTranscriptService } from '@/services/IYouTubeTranscriptService';

import { GenerateService } from '@/services/GenerateService';

import { ProviderFactory } from '@/providers/ProviderFactory';

import type { ChatSession, ProviderConfig, Settings, SummaryData, VideoData } from '@/models';
import type { ChatRequestDto, ChatResult, ModelListResult, SummaryRequestDto, SummaryResult } from '@/dto';
import {toPlainText} from '@/utils/TranscriptUtil';
import type { ModelInfo, ProviderType, SummaryType, TabType } from '@/value-objects';

import type { AppStore } from './AppStore';
import type { ICurrentVideoService } from '@/services/ICurrentVideoService';
import { DateUtil } from '@/utils';

export class AIFacade {
  private readonly settingsRepository;
  private readonly providerRepository;
  private readonly videoRepository;

  private readonly promptService;
  private readonly transcriptService;
  private readonly providerFactory;

  // 状態管理
  private settings!: Settings;
  private providerConfig!: ProviderConfig;
  private models: ModelInfo[] = [];
  private currentVideo?: VideoData;
  private readonly appStore;
  private readonly currentVideoService;
  private videoId: string|undefined;


  constructor(
    settingsRepository: SettingsRepository,
    providerRepository: ProviderRepository,
    videoRepository: VideoRepository,
    promptService: IPromptService,
    transcriptService: IYouTubeTranscriptService,
    providerFactory: ProviderFactory,
    appStore: AppStore,
    currentVideoService: ICurrentVideoService,
  ) {
    this.settingsRepository = settingsRepository;
    this.providerRepository = providerRepository;
    this.videoRepository = videoRepository;

    this.promptService = promptService;
    this.transcriptService = transcriptService;
    this.providerFactory = providerFactory;
    this.appStore = appStore;
    this.currentVideoService = currentVideoService;
  }

  public getSettings(): Settings {
    return this.settings;
  }

  public getProviderConfig(): ProviderConfig {
    return this.providerConfig;
  }

  public getModelsCache(): ModelInfo[] {
    return this.models;
  }

  public getCurrentVideo(): VideoData | undefined {
    return this.currentVideo;
  }

  public async changeProvider(provider:ProviderType): Promise<void> {
    const newSettings = { 
      ...this.settings,
      provider
    }
    this.settings = newSettings;
    await this.settingsRepository.save(newSettings)

    const newProviderConfig = await this.providerRepository.find(
      provider,
    );
    this.providerConfig = newProviderConfig;

    const aiProvider =
      this.providerFactory.create(
        newProviderConfig,
      );

    const modelList =
      await aiProvider.getModels();

    const newModels = modelList.models;
    this.models = newModels;

    await this.appStore.initialize(
        true,
        newSettings,
        newProviderConfig,
        newModels,
    );
  }

  public async changeModel(model:string):Promise<void> {
    const newSettings = { 
      ...this.settings,
      model
    }
    this.settings = newSettings;
    await this.settingsRepository.save(newSettings)
    await this.appStore.initialize(
        true,
        newSettings,
        this.providerConfig,
        this.models,
    );
  }

  public async changeThinking(thinking:boolean):Promise<void> {
    const newSettings = { 
      ...this.settings,
      thinking
    }
    this.settings = newSettings;
    await this.settingsRepository.save(newSettings)
    await this.appStore.initialize(
        true,
        newSettings,
        this.providerConfig,
        this.models,
    );
  }

  public async changeSummaryType(summaryType: SummaryType): Promise<void> {
    const newSettings = { 
      ...this.settings,
      summaryType
    }
    this.settings = newSettings;
    await this.settingsRepository.save(newSettings)
    await this.appStore.initialize(
        true,
        newSettings,
        this.providerConfig,
        this.models,
    );
  }

  public setActiveTab(tab: TabType) {
    this.appStore.setActiveTab(tab);
  }

  /**
   * アプリケーションを初期化する。
   */
  public async initialize(): Promise<InitialState> {
    let isYoutubePage = true;
    try {
      this.appStore.setLoading(true);
      const res =
          await this.currentVideoService
              .getCurrentVideoId();
      if(res === false) {
        //  throw new Error('Current tab URL not found.');
        isYoutubePage = false;
      }
      this.videoId = res as string;
      this.settings = await this.settingsRepository.find();

      this.providerConfig = await this.providerRepository.find(
        this.settings.provider,
      );

      const aiProvider =
        this.providerFactory.create(
          this.providerConfig,
        );

      const modelList =
        await aiProvider.getModels();

      this.models = modelList.models;

      this.appStore.initialize(
          isYoutubePage,
          this.settings,
          this.providerConfig,
          this.models
      );
    }
    catch(error) {
        this.appStore.setError(
            error instanceof Error
                ? error.message
                : 'Initialization failed.',
        );
    } finally {
      this.appStore.setLoading(false);
    }

    return {
      isYoutubePage: isYoutubePage,
      settings: this.settings,
      provider: this.providerConfig,
      models: this.models,
    };
  }

  /**
   * YouTube字幕を取得する。
   */
  public async getTranscript(
  ): Promise<TranscriptResult> {

    if(!this.videoId) {
      return { transcript: {
          language: '',
          source: '',
          generatedAt: '',
          segments: []
        }, 
        fromCache: false 
      };
    }

    let video =
      await this.videoRepository.find(this.videoId!);

    if(video?.transcript) {
      this.currentVideo = video;
      return {
        transcript: video.transcript,
        fromCache: true,
      };
    }

    try {
      const response =
        await this.transcriptService.getTranscript(this.videoId!);

      if (!video) {
        video = {
            videoId:this.videoId!,
            title: '',
            channelId: '',
            duration: 0,
            summaries: [],
            chatSessions: [],
            no_transcript:false,
            createdAt: response.transcript.generatedAt,
            updatedAt: response.transcript.generatedAt,
        };      
      }
      video.title = response.title;
      video.channelId = response.channelId;
      video.duration = response.duration;
      video.transcript = response.transcript;
      video.updatedAt = response.transcript.generatedAt;
      video.no_transcript = (response.transcript.segments.length === 0) ? true: false;

      await this.videoRepository.save(video);
      this.currentVideo = video;

      this.appStore.setCurrentVideo(video);
      
      return {
        transcript:response.transcript,
        fromCache: false,
      };      
    } catch (error) {
        this.appStore.setError(
            error instanceof Error
                ? error.message
                : 'getTranscript failed.',
        );

        return {
          transcript: {
              language: 'unknown',
              source: 'youtube',
              generatedAt: DateUtil.nowIso(),
              segments:[],
          },
          fromCache: false,
        }
    }


  }

  /**
   * AI要約を生成する。
   */
  public async summarize(
    request: SummaryRequestDto,
  ): Promise<SummaryResult> {
    const generateService =
      await this.createGenerateService();

    const video =
      await this.videoRepository.find(this.videoId!);

    if (!video?.transcript) {
      throw new Error('Transcript not found.');
    }

    const result =
      await generateService.summarize(
        toPlainText(video.transcript),
        request.summaryType,
        request.options,
      );

    const summary: SummaryData = {
      id: crypto.randomUUID(),
      cacheKey: '',
      summaryType: request.summaryType,
      provider: this.providerConfig.provider,
      model: request.options.model,
      thinking: request.options.thinking,
      content: result.content,
      promptVersion: '',
      usage: result.usage,
      createdAt: result.generatedAt,
    };

    video.summaries.push(summary);
    video.updatedAt = result.generatedAt;

    await this.videoRepository.save(video);
    this.currentVideo = video;
    this.appStore.setCurrentVideo(video);

    return {
      summary,
      fromCache: false,
    };
  }


  /**
   * AIチャットセッションを開始する。
   * @param request AIチャットセッションの開始リクエスト
   * @returns AIチャットセッション
   */
  public async startSession(): Promise<ChatSession> {

    const video =
      await this.videoRepository.find(this.videoId!);

    if (!video) {
      throw new Error('Video Data not found.');
    }

    let session =
      video.chatSessions.at(-1);

    if (session) {
      return session;
    }

    session = {
      id: crypto.randomUUID(),
      provider: this.settings.provider,
      model: this.settings.model,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    video.chatSessions.push(session);
    video.updatedAt = session.updatedAt;

    await this.videoRepository.save(video);
    this.currentVideo = video;
    this.appStore.setCurrentVideo(video);

    return session;
  }

  /**
   * AIチャットを実行する。
   */
  public async chat(
    request: ChatRequestDto,
  ): Promise<ChatResult> {

    const generateService =
      await this.createGenerateService();

    const video =
      await this.videoRepository.find(this.videoId!);

    if (!video?.transcript) {
      throw new Error('Transcript not found.');
    }

    let session =
      video.chatSessions.find(s => s.id === request.chatSessionId);

    if (!session) {
      session = await this.startSession();
    }

    const result =
      await generateService.chat(
        toPlainText(video.transcript),
        session.messages,
        request.userMessage,
        request.options,
      );

    session.messages.push({
      id: crypto.randomUUID(),
      role: 'user',
      content: request.userMessage,
      createdAt: result.generatedAt,
    });

    session.messages.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: result.content,
      usage: result.usage,
      createdAt: result.generatedAt,
    });

    session.updatedAt = result.generatedAt;
    video.updatedAt = result.generatedAt;

    await this.videoRepository.save(video);
    this.currentVideo = video;
    this.appStore.setCurrentVideo(video);

    return {
      chatSession: session,
    };
  }

  /**
   * 利用可能なモデル一覧を取得する。
   */
  public async getModels(): Promise<ModelListResult> {
    const aiProvider =
      this.providerFactory.create(this.providerConfig);

    return await aiProvider.getModels();
  }

  public getError(): string | undefined {
    const error = this.appStore.getError();
    if ( error ){
      return error;
    }
    return undefined;
  }



  /**
   * GenerateServiceを生成する。
   */
  private createGenerateService(
  ): GenerateService {
    return new GenerateService(
      this.providerFactory,
      this.promptService,
      this.providerConfig,
    );
  } 
}