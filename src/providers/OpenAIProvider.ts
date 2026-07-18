import type { GenerateRequest } from '@/dto/GenerateRequest';
import type { GenerateResponse } from '@/dto/GenerateResponse';
import type { ModelListResult } from '@/dto/ModelListResult';
import type { ProviderConfig } from '@/models/ProviderConfig';
import type { IAIProvider } from '@/providers/IAIProvider';
import { HttpClient } from '@/utils/HttpClient';
import type { ModelInfo } from '@/value-objects/ModelInfo';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export class OpenAIProvider implements IAIProvider {
  private readonly httpClient = new HttpClient();
  private readonly config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  public getProviderModel(request: GenerateRequest) {
    const modelName = request.options.model;

    if(!this.config.apiKey) {
      throw new Error('API Key is not provided');
    }

    const openai = createOpenAI({
      apiKey: this.config.apiKey,
    });

    return openai(modelName);
  }

  public async generate(request: GenerateRequest): Promise<GenerateResponse> {

    const selectedModel = this.getProviderModel(request);

    const result = await generateText({
      model: selectedModel,
      messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      // thinking（Reasoning）の設定がある場合は以下のように渡せます
      ...(request.options.thinking ? { providerOptions: { openai: { reasoningEffort: 'medium' } } } : {}),
    });

    // const result = await this.httpClient.post<{
    //   output_text?: string;
    //   usage?: {
    //     input_tokens?: number;
    //     output_tokens?: number;
    //     total_tokens?: number;
    //   };
    // }>({
    //   method: 'POST',
    //   url: `${this.config.baseUrl}/responses`,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${this.config.apiKey ?? ''}`,
    //   },
    //   body: {
    //     model: request.options.model,
    //     input: request.messages.map((message) => ({ role: message.role, content: message.content })),
    //     reasoning: request.options.thinking ? { effort: 'medium' } : undefined,
    //   },
    //   timeout: this.config.timeout,
    // });


    return {
      content: result.text,
      finishReason: result.finishReason,
      usage: {
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
      },
    };


    // return {
    //   content: result.data.output_text ?? '',
    //   finishReason: 'stop',
    //   usage: {
    //     inputTokens: result.data.usage?.input_tokens ?? 0,
    //     outputTokens: result.data.usage?.output_tokens ?? 0,
    //     totalTokens: result.data.usage?.total_tokens ?? 0,
    //   },
    // };
  }

  public async getModels(): Promise<ModelListResult> {
    if(!this.config.apiKey) {
      throw new Error('API Key is not provided');
    }

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
