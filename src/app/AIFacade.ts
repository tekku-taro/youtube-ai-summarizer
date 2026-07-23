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
import { TabType, type ModelInfo, type ProviderType, type SummaryType } from '@/value-objects';

import type { AppStore } from './AppStore';
import type { ICurrentVideoService } from '@/services/ICurrentVideoService';
import type { VideoPlayerService } from '@/services/VideoPlayerService';
import type { MarkdownService } from '@/services';
import type { DownloadService } from '@/services/DownloadService';
import type { ClipboardService } from '@/services/ClipboardService';

export class AIFacade {
  private readonly settingsRepository;
  private readonly providerRepository;
  private readonly videoRepository;

  private readonly promptService;
  private readonly transcriptService;
  private readonly videoPlayerService;
  private readonly providerFactory;

  private readonly markdownService: MarkdownService;
  private readonly downloadService: DownloadService;
  private readonly clipboardService: ClipboardService;
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
    videoPlayerService: VideoPlayerService,
    markdownService: MarkdownService,
    downloadService: DownloadService,
    clipboardService:ClipboardService,
  ) {
    this.settingsRepository = settingsRepository;
    this.providerRepository = providerRepository;
    this.videoRepository = videoRepository;

    this.promptService = promptService;
    this.transcriptService = transcriptService;
    this.providerFactory = providerFactory;
    this.appStore = appStore;
    this.currentVideoService = currentVideoService;
    this.videoPlayerService = videoPlayerService;
    this.markdownService = markdownService;
    this.downloadService = downloadService;  
    this.clipboardService = clipboardService;  
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
    try{
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

      const newSettings = { 
        ...this.settings,
        provider,
        model:newModels[0]?.id ?? '',
      }
      this.settings = newSettings;
      await this.settingsRepository.save(newSettings)

      await this.appStore.initialize(
          true,
          newSettings,
          newProviderConfig,
          newModels,
          this.currentVideo,
      );

    } catch(error) {
        console.log('changeProvider failed:', error)
        this.appStore.setError(
            error instanceof Error
                ? 'changeProvider failed. ' + error.message
                : 'changeProvider failed.',
        );
    }

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
        this.currentVideo,
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
        this.currentVideo,
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
        this.currentVideo,
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
          this.models,
          this.currentVideo,
      );
    }
    catch(error) {
        console.log('initialization failed:', error)
        this.appStore.setError(
            error instanceof Error
                ? 'Initialization failed. ' + error.message
                : 'Initialization failed.',
        );
    } finally {
      this.appStore.setLoading(false, null);
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

    
    try {
      this.appStore.setLoading(true, TabType.Transcript);
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
        this.appStore.setCurrentVideo(video);
        return {
          transcript: video.transcript,
          fromCache: true,
        };
      }
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
              generatedAt: '',
              segments:[],
          },
          fromCache: false,
        }
    } finally {      
      this.appStore.setLoading(false, null);
    }
  }

  public async seek(
    seconds: number
  ): Promise<void> {

    if(!this.videoId) {
      return;
    }

    try {
      await this.videoPlayerService.seekTo(seconds);     
    } catch (error) {
      console.error('Failed to seek video:', error);

        this.appStore.setError(
            error instanceof Error
                ? error.message
                : 'Video seek failed.',
        );
    }
  }

  /**
   * AI要約を生成する。
   */
  public async summarize(
    request: SummaryRequestDto,
  ): Promise<SummaryResult> {
    
      const summary: SummaryData = {
        id: crypto.randomUUID(),
        cacheKey: '',
        summaryType: request.summaryType,
        provider: this.providerConfig.provider,
        model: request.options.model,
        thinking: request.options.thinking,
        content: '',
        promptVersion: '',
        usage: {
          inputTokens:undefined,
          outputTokens:undefined,
          totalTokens:undefined,
        },
        createdAt: '',
      };

    try {
      this.appStore.setLoading(true, TabType.Summary);
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

      summary.content = result.content;
      summary.usage = result.usage;
      summary.createdAt = result.generatedAt;

      video.summaries.push(summary);
      video.updatedAt = result.generatedAt;

      await this.videoRepository.save(video);
      this.currentVideo = video;
      this.appStore.setCurrentVideo(video);

      return {
        summary,
        fromCache: false,
      };      
    } catch (error) {
        this.appStore.setError(
            error instanceof Error
                ? error.message
                : 'Summarize failed.',
        );
      return {
        summary,
        fromCache: false,
      };       
    } finally {
      this.appStore.setLoading(false, null);
    }
  }


  /**
   * AIチャットセッションを開始する。
   * @param request AIチャットセッションの開始リクエスト
   * @returns AIチャットセッション
   */
  public async startSession(): Promise<ChatSession> {

    if(!this.currentVideo) {
      throw new Error('No current video selected.');
    }

    let session =
      this.currentVideo.chatSessions.at(-1);

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
    this.currentVideo.chatSessions.push(session);
    this.currentVideo.updatedAt = session.updatedAt;

    await this.videoRepository.save(this.currentVideo);
    this.appStore.setCurrentVideo(this.currentVideo);

    return session;
  }

  /**
   * AIチャットを実行する。
   */
  public async chat(
    request: ChatRequestDto,
  ): Promise<ChatResult> {
    try {
      this.appStore.setLoading(true, TabType.Chat);
      const generateService =
        await this.createGenerateService();

      if(!this.currentVideo) {
        throw new Error('No current video selected.');
      }

      if (!this.currentVideo.transcript) {
        throw new Error('Transcript not found.');
      }

      let session =
        this.currentVideo.chatSessions.find(s => s.id === request.chatSessionId);

      if (!session) {
        session = await this.startSession();
      }
      const requestTimeStamp = new Date().toISOString();
      session.messages.push({
        id: crypto.randomUUID(),
        role: 'user',
        content: request.userMessage,
        createdAt: requestTimeStamp,
      });

      const result =
        await generateService.chat(
          toPlainText(this.currentVideo.transcript),
          session.messages,
          request.userMessage,
          request.options,
        );

      console.log('chat video after generateService.chat', this.currentVideo)


      session.messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.content,
        usage: result.usage,
        createdAt: result.generatedAt,
      });

      session.updatedAt = result.generatedAt;
      this.currentVideo.updatedAt = result.generatedAt;

      // console.log('chat video before save', this.currentVideo)
      await this.videoRepository.save(this.currentVideo);
      // console.log('chat video before currentVideo', this.currentVideo)
      // console.log('chat video before setCurrentVideo', this.currentVideo)
      this.appStore.setCurrentVideo(this.currentVideo);
      // console.log('chat video after setCurrentVideo', this.currentVideo)

      console.log('chat session', session)
      return {
        chatSession: session,
      };

    } catch (error) {
        this.appStore.setError(
            error instanceof Error
                ? error.message
                : 'Chat failed.',
        );
        
        return {
          chatSession: {
            id: crypto.randomUUID(),
            provider: this.settings.provider,
            model: this.settings.model,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }
    } finally {
      this.appStore.setLoading(false, null);
    }    
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


  // --- エクスポート用機能メソッドの追加 ---

  public async exportMarkdown(toClipboard = false): Promise<boolean> {
    const activeTab = this.appStore.getActiveTab();

    if(activeTab == TabType.Summary) {
      return await this.exportSummaryMarkdown(toClipboard);
    } else if(activeTab == TabType.Chat) {
      return await this.exportChatMarkdown(toClipboard);
    } else if(activeTab == TabType.Transcript) {
      return await this.exportTranscriptMarkdown(toClipboard);
    }
    return false;    
  }

  /**
   * 現在の要約結果を Markdown ファイルとしてダウンロードする。
   */
  public async exportSummaryMarkdown(toClipboard = false): Promise<boolean> {
    if (!this.currentVideo) {
      this.appStore.setError('Video data not found.');
      return false;
    }

    // 直近（最新）の要約を取得
    const summary = this.currentVideo.summaries.at(-1);
    if (!summary || !summary.content) {
      this.appStore.setError('No summary available to export.');
      return false;
    }

    try {
      const markdown = this.markdownService.exportSummary(this.currentVideo, summary);
      const filename = `${this.sanitizeFilename(this.currentVideo.title || 'youtube')}_summary.md`;

      if(toClipboard) {
        return await this.clipboardService.copyText(markdown);
      }      
      this.downloadService.downloadTextFile(markdown, filename);
      return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error:unknown) {
      console.log('error', error)
      this.appStore.setError('Failed to export summary markdown.');
      return false;
    }
  }

  /**
   * 現在のトランスクリプトを Markdown ファイルとしてダウンロードする。
   */
  public async exportTranscriptMarkdown(toClipboard = false): Promise<boolean> {
    if (!this.currentVideo) {
      this.appStore.setError('Video data not found.');
      return false;
    }

    // 直近（最新）の要約を取得
    const transcript = this.currentVideo.transcript;
    if (!transcript || transcript.segments.length === 0) {
      this.appStore.setError('No transcript available to export.');
      return false;
    }

    try {
      const markdown = this.markdownService.exportTranscript(this.currentVideo, transcript);
      const filename = `${this.sanitizeFilename(this.currentVideo.title || 'youtube')}_transcript.md`;

      if(toClipboard) {
        return await this.clipboardService.copyText(markdown);
      }      
      this.downloadService.downloadTextFile(markdown, filename);
      return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error:unknown) {
      this.appStore.setError('Failed to export transcript markdown.');
      return false;
    }
  }

  /**
   * 現在のチャット履歴を Markdown ファイルとしてダウンロードする。
   */
  public async exportChatMarkdown(toClipboard = false, chatSessionId?: string): Promise<boolean> {
    if (!this.currentVideo) {
      this.appStore.setError('Video data not found.');
      return false;
    }

    // 指定されたセッション、または最新のセッションを取得
    const session = chatSessionId
      ? this.currentVideo.chatSessions.find((s) => s.id === chatSessionId)
      : this.currentVideo.chatSessions.at(-1);

    if (!session || session.messages.length === 0) {
      this.appStore.setError('No chat history available to export.');
      return false;
    }

    try {
      const markdown = this.markdownService.exportChat(this.currentVideo, session);
      const filename = `${this.sanitizeFilename(this.currentVideo.title || 'chat')}_chat.md`;

      if(toClipboard) {
        return await this.clipboardService.copyText(markdown);
      }
      this.downloadService.downloadTextFile(markdown, filename);
      return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error:unknown) {
      this.appStore.setError('Failed to export chat markdown.');
      return false;
    }
  }

  /**
   * ファイル名に使えない特殊文字をサニタイズ（置換）するヘルパー
   */
  private sanitizeFilename(title: string): string {
    return title.replace(/[/\\?%*:|"<>]/g, '_').trim();
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