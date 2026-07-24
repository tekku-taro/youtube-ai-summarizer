import type { GenerateRequest } from '@/dto/GenerateRequest';
import type { GenerateResponse } from '@/dto/GenerateResponse';
import type { ModelListResult } from '@/dto/ModelListResult';
import type { ProviderConfig } from '@/models/ProviderConfig';
import type { IAIProvider } from '@/providers/IAIProvider';
import { HttpClient } from '@/utils/HttpClient';
import type { ModelInfo } from '@/value-objects/ModelInfo';
import type { OpenAILanguageModelResponsesOptions } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText, streamText } from 'ai';

export class LMStudioProvider implements IAIProvider {
  private readonly httpClient = new HttpClient();
  private readonly config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  public getProviderModel(request: GenerateRequest) {
    const modelName = request.options.model;

    const lmstudio = createOpenAICompatible({
      name: 'lmstudio',
      baseURL: this.config.baseUrl ?? 'http://localhost:1234/v1',
    });

    return lmstudio(modelName);
  }

  public async generateStream(
    request: GenerateRequest,
    onChunk: (chunk: string) => void
  ): Promise<GenerateResponse> {
    const selectedModel = this.getProviderModel(request);
    const systemMessage = request.messages.filter(m => m.role === 'system')?.reduce((acc, m) => acc + m.content, '') || 'You are a helpful assistant.';
    const chatMessages = request.messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const result = await streamText({
      model: selectedModel,
      instructions : systemMessage,
      messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
        // thinking（Reasoning）の設定がある場合は以下のように渡せます
        ...(request.options.thinking ? { providerOptions: { openai: { 
          reasoningEffort: 'medium'  // 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh'
          }  satisfies OpenAILanguageModelResponsesOptions,
        } } : { providerOptions: { openai: { 
          reasoningEffort: 'none'  // 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh'
          }  satisfies OpenAILanguageModelResponsesOptions,        
        }}
      ),
    });

    let fullText = '';

    // リアルタイムでテキストチャンクを取得してコールバックを実行
    for await (const textChunk of result.textStream) {
      fullText += textChunk;
      onChunk(textChunk);
    }

    const usage = await result.usage;
    const finishReason = await result.finishReason;    

    return {
      content: fullText,
      finishReason,
      usage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      },
    };
  }

  public async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const selectedModel = this.getProviderModel(request);
    const systemMessage = request.messages.filter(m => m.role === 'system')?.reduce((acc, m) => acc + m.content, '') || 'You are a helpful assistant.';
    const chatMessages = request.messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const result = await generateText({
      model: selectedModel,
      instructions : systemMessage,
      messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
        // thinking（Reasoning）の設定がある場合は以下のように渡せます
        ...(request.options.thinking ? { providerOptions: { openai: { 
          reasoningEffort: 'medium'  // 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh'
          }  satisfies OpenAILanguageModelResponsesOptions,
        } } : { providerOptions: { openai: { 
          reasoningEffort: 'none'  // 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh'
          }  satisfies OpenAILanguageModelResponsesOptions,        
        }}
      ),
    });

    return {
      content: result.text,
      finishReason: result.finishReason,
      usage: {
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
      },
    };
  }

  public async getModels(): Promise<ModelListResult> {
    const timeout = this.config.timeout ?? 30000;
    const result = await this.httpClient.get<{ data?: Array<{ id?: string; name?: string }> }>({
      method: 'GET',
      url: `${this.config.baseUrl}/models`,
      headers: {
        Authorization: `Bearer ${this.config.apiKey ?? ''}`,
      },
      timeout: timeout,
    });

    const models: ModelInfo[] = (result.data.data ?? []).map((model) => ({
      id: model.id ?? '',
      name: model.name ?? model.id ?? '',
    }));

    return { models };
  }
}
