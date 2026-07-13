import type { GenerateRequest } from '@/dto/GenerateRequest';
import type { GenerateResponse } from '@/dto/GenerateResponse';
import type { ModelListResult } from '@/dto/ModelListResult';
import type { ProviderConfig } from '@/models/ProviderConfig';
import type { IAIProvider } from '@/providers/IAIProvider';
import { HttpClient } from '@/utils/HttpClient';
import type { ModelInfo } from '@/value-objects/ModelInfo';

export class OpenAIProvider implements IAIProvider {
  private readonly httpClient = new HttpClient();
  private readonly config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  public async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const result = await this.httpClient.post<{
      output_text?: string;
      usage?: {
        input_tokens?: number;
        output_tokens?: number;
        total_tokens?: number;
      };
    }>({
      method: 'POST',
      url: `${this.config.baseUrl}/responses`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey ?? ''}`,
      },
      body: {
        model: request.options.model,
        input: request.messages.map((message) => ({ role: message.role, content: message.content })),
        reasoning: request.options.thinking ? { effort: 'medium' } : undefined,
      },
      timeout: this.config.timeout,
    });

    return {
      content: result.data.output_text ?? '',
      finishReason: 'stop',
      usage: {
        inputTokens: result.data.usage?.input_tokens ?? 0,
        outputTokens: result.data.usage?.output_tokens ?? 0,
        totalTokens: result.data.usage?.total_tokens ?? 0,
      },
    };
  }

  public async getModels(): Promise<ModelListResult> {
    const result = await this.httpClient.get<{ data?: Array<{ id?: string; name?: string }> }>({
      method: 'GET',
      url: `${this.config.baseUrl}/models`,
      headers: {
        Authorization: `Bearer ${this.config.apiKey ?? ''}`,
      },
      timeout: this.config.timeout,
    });

    const models: ModelInfo[] = (result.data.data ?? []).map((model) => ({
      id: model.id ?? '',
      name: model.name ?? model.id ?? '',
    }));

    return { models };
  }
}
