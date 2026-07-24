import type { AIMessage } from '@/value-objects/AIMessage';
import type { AIExecutionOptions } from '@/value-objects/AIExecutionOptions';

import type { ChatMessage } from '@/models/ChatMessage';
import type { GenerateResult } from '@/models';
import type { ProviderConfig } from '@/models/ProviderConfig';

import { SummaryType } from '@/value-objects/SummaryType';

import { ProviderFactory } from '@/providers/ProviderFactory';
import type { IPromptService } from './IPromptService';
import type { GenerateRequest } from '@/dto/GenerateRequest';
import type { GenerateResponse } from '@/dto/GenerateResponse';
import { DateUtil } from '@/utils';

export class GenerateService {
  private readonly providerFactory;
  private readonly promptService;
  private readonly providerConfig;

  constructor(
    providerFactory: ProviderFactory,
    promptService: IPromptService,
    providerConfig: ProviderConfig,
  ) {
    this.providerFactory = providerFactory;
    this.promptService = promptService;
    this.providerConfig = providerConfig;
  }

/**
   * 動画要約をストリーミングで実行する
   */
  public async summarizeStream(
    transcript: string,
    summaryType: SummaryType,
    options: AIExecutionOptions,
    onChunk: (chunk: string) => void,
  ): Promise<GenerateResult> {
    const messages = this.promptService.createSummaryMessages(
      transcript,
      summaryType,
    );

    return this.stream(messages, options, onChunk);
  }

  /**
   * 動画を要約する。
   */
  public async summarize(
    transcript: string,
    summaryType: SummaryType,
    options: AIExecutionOptions,
  ): Promise<GenerateResult> {
    const messages = this.promptService.createSummaryMessages(
      transcript,
      summaryType,
    );

    return this.generate(messages, options);
  }

  /**
   * AIチャットを実行する。
   */
  public async chatStream(
    transcript: string,
    history: ChatMessage[],
    prompt: string,
    options: AIExecutionOptions,
    onChunk: (chunk: string) => void,
  ): Promise<GenerateResult> {
    const messages = this.promptService.createChatMessages(
      transcript,
      history,
      prompt,
    );

    return this.stream(messages, options, onChunk);
  }

  /**
   * AIチャットを実行する。
   */
  public async chat(
    transcript: string,
    history: ChatMessage[],
    prompt: string,
    options: AIExecutionOptions,
  ): Promise<GenerateResult> {
    const messages = this.promptService.createChatMessages(
      transcript,
      history,
      prompt,
    );

    return this.generate(messages, options);
  }

  /**
   * AI生成共通処理
   */
  private async generate(
    messages: AIMessage[],
    options: AIExecutionOptions,
  ): Promise<GenerateResult> {
    const provider = this.providerFactory.create(this.providerConfig);

    const request: GenerateRequest = {
      messages,
      options,
    };

    const response = await provider.generate(request);

    return this.buildGenerateResult(response, options);
  }

  private async stream(
    messages: AIMessage[],
    options: AIExecutionOptions,
    onChunk: (chunk: string) => void,
  ): Promise<GenerateResult> {
    const provider = this.providerFactory.create(this.providerConfig);

    const request: GenerateRequest = {
      messages,
      options,
    };

    const response = await provider.generateStream(request, onChunk);

    return this.buildGenerateResult(response, options);
  }


  /**
   * Providerのレスポンスをアプリケーションモデルへ変換する。
   */
  private buildGenerateResult(
    response: GenerateResponse,
    options: AIExecutionOptions,
  ): GenerateResult {
    return {
      content: response.content,

      finishReason: response.finishReason,

      usage: response.usage,

      provider: this.providerConfig.provider,

      model: options.model,

      generatedAt: DateUtil.nowIso(),
    };
  }  
}