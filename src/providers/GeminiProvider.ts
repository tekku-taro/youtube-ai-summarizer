import type { GenerateRequest } from '@/dto/GenerateRequest';
import type { GenerateResponse } from '@/dto/GenerateResponse';
import type { ModelListResult } from '@/dto/ModelListResult';
import type { ProviderConfig } from '@/models/ProviderConfig';
import type { IAIProvider } from '@/providers/IAIProvider';
import { HttpClient } from '@/utils/HttpClient';
import type { ModelInfo } from '@/value-objects/ModelInfo';

export class GeminiProvider implements IAIProvider {
  private readonly httpClient = new HttpClient();
  private readonly config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  public async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const result = await this.httpClient.post<{
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    }>({
      method: 'POST',
      url: `${this.config.baseUrl}/${this.config.apiKey ?? ''}:generateContent`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        contents: [
          {
            role: 'user',
            parts: request.messages.map((message) => ({ text: message.content })),
          },
        ],
        generationConfig: {
          temperature: request.options.thinking ? 0.2 : 0.7,
        },
      },
      timeout: this.config.timeout,
    });

    const content = result.data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';

    return {
      content,
      finishReason: 'stop',
      usage: {
        inputTokens: result.data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: result.data.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: result.data.usageMetadata?.totalTokenCount ?? 0,
      },
    };
  }

  public async getModels(): Promise<ModelListResult> {
    const result = await this.httpClient.get<{ models?: Array<{ name?: string }> }>({
      method: 'GET',
      url: `${this.config.baseUrl}/${this.config.apiKey ?? ''}:listModels`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: this.config.timeout,
    });

    const models: ModelInfo[] = (result.data.models ?? []).map((model) => ({
      id: model.name ?? '',
      name: model.name ?? '',
    }));

    return { models };
  }
}
