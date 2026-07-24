import type { GenerateRequest } from '@/dto/GenerateRequest';
import type { GenerateResponse } from '@/dto/GenerateResponse';
import type { ModelListResult } from '@/dto/ModelListResult';
import type { ProviderConfig } from '@/models/ProviderConfig';
import type { IAIProvider } from '@/providers/IAIProvider';
import { HttpClient } from '@/utils/HttpClient';
import type { ModelInfo } from '@/value-objects/ModelInfo';
import { createGoogle, type GoogleLanguageModelOptions } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';

export class GeminiProvider implements IAIProvider {
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

    
    const google = createGoogle({
      apiKey: this.config.apiKey,
    });

    return google(modelName);
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
        ...(request.options.thinking ? { providerOptions: { google: { 
            thinkingConfig :{
              thinkingLevel: "medium", // "minimal" | "low" | "medium" | "high"
            }
          }  satisfies GoogleLanguageModelOptions,
        } } : { providerOptions: { google: { 
            thinkingConfig :{
              thinkingLevel: "low", // "minimal" | "low" | "medium" | "high"
            }
          }  satisfies GoogleLanguageModelOptions,        
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
      instructions: systemMessage,
      messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
        // thinking（Reasoning）の設定がある場合は以下のように渡せます
        ...(request.options.thinking ? { providerOptions: { google: { 
            thinkingConfig :{
              thinkingLevel: "medium", // "minimal" | "low" | "medium" | "high"
            }
          }  satisfies GoogleLanguageModelOptions,
        } } : { providerOptions: { google: { 
            thinkingConfig :{
              thinkingLevel: "low", // "minimal" | "low" | "medium" | "high"
            }
          }  satisfies GoogleLanguageModelOptions,        
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
    if(!this.config.apiKey) {
      throw new Error('API Key is not provided');
    }

    const timeout = this.config.timeout ?? 30000;
    const result = await this.httpClient.get<{ 
      models?: Array<{ 
        name?: string,
        version?: string,
        displayName?: string,
        description?: string,                
      }> 
    }>({
      method: 'GET',
      url: `${this.config.baseUrl}/models`,
      // url: `${this.config.baseUrl}/models?key=${this.config.apiKey}`,
      headers: {
        'x-goog-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: timeout,
    });
    console.log('models[0]', result.data.models?.[0]);

    const models: ModelInfo[] = (result.data.models ?? []).map((model) => {
      // name（例: 'models/gemini-2.5-flash'）から 'models/' を取り除く
      const cleanId = model.name ? model.name.replace(/^models\//, '') : '';

      return {
        id: cleanId, // 'gemini-2.5-flash' が入る
        name: model.displayName ?? cleanId ?? '',
      };
    });

    return { models };
  }
}
