import type { GenerateRequest } from '@/dto/GenerateRequest';
import type { GenerateResponse } from '@/dto/GenerateResponse';
import type { ModelListResult } from '@/dto/ModelListResult';
import type { ProviderConfig } from '@/models/ProviderConfig';
import type { IAIProvider } from '@/providers/IAIProvider';
import { HttpClient } from '@/utils/HttpClient';
import type { ModelInfo } from '@/value-objects/ModelInfo';

export class LMStudioProvider implements IAIProvider {
  private readonly httpClient = new HttpClient();
  private readonly config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  public async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const timeout = this.config.timeout ?? 30000;
    const result = await this.httpClient.post<{
      choices?: Array<{ message?: { content?: string } }>;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
    }>({
      method: 'POST',
      url: `${this.config.baseUrl}/v1/chat/completions`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey ?? ''}`,
      },
      body: {
        model: request.options.model,
        messages: request.messages.map((message) => ({ role: message.role, content: message.content })),
        temperature: request.options.thinking ? 0.2 : 0.7,
      },
      timeout: timeout,
    });

    return {
      content: result.data.choices?.[0]?.message?.content ?? '',
      finishReason: 'stop',
      usage: {
        inputTokens: result.data.usage?.prompt_tokens ?? 0,
        outputTokens: result.data.usage?.completion_tokens ?? 0,
        totalTokens: result.data.usage?.total_tokens ?? 0,
      },
    };
  }

  public async getModels(): Promise<ModelListResult> {
    const timeout = this.config.timeout ?? 30000;
    const result = await this.httpClient.get<{ data?: Array<{ id?: string; name?: string }> }>({
      method: 'GET',
      url: `${this.config.baseUrl}/v1/models`,
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
