// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import type { ProviderConfig } from '@/models/ProviderConfig';
import type { GenerateRequest } from '@/dto/GenerateRequest';
import type { ProviderType } from '@/value-objects/ProviderType';
import { OpenAIProvider } from '@/providers';

describe('OpenAIProvider (実通信テスト)', () => {
  let validConfig: ProviderConfig;
  let invalidConfig: ProviderConfig;
  let provider: OpenAIProvider;

  // 環境変数から情報を取得（Viteの環境変数をNode.js上でマッピングしている想定）
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  const baseUrl = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const targetModel = 'gpt-5.4-mini';

  beforeEach(() => {
    // 正常系：有効なAPIキーがある設定
    validConfig = {
      provider: 'OpenAI' as ProviderType,
      baseUrl: baseUrl,
      apiKey: apiKey,
      timeout: 30000,
    };

    // 異常系：APIキーがない（空文字またはundefined）設定
    invalidConfig = {
      provider: 'OpenAI' as ProviderType,
      baseUrl: baseUrl,
      apiKey: '', // APIキーなし
      timeout: 30000,
    };
  });

  describe('APIキーが欠落しているケースの検証 (必須要件)', () => {
    it('APIキーがない場合、generateメソッドは即座に「API Key is not provided」エラーをスローすること', async () => {
      provider = new OpenAIProvider(invalidConfig);

      const request: GenerateRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        options: { 
          provider: 'OpenAI',
          model: targetModel, 
          thinking: false 

        },
      };

      // 内部の getProviderModel で同期的に投げられるエラーをキャッチ
      await expect(provider.generate(request)).rejects.toThrow('API Key is not provided');
    });

    it('APIキーがない場合、getModelsメソッドも即座に「API Key is not provided」エラーをスローすること', async () => {
      provider = new OpenAIProvider(invalidConfig);

      await expect(provider.getModels()).rejects.toThrow('API Key is not provided');
    });
  });

  describe('実通信による正常系の検証（APIキーがある場合）', () => {
    // APIキーがない環境（CI環境など）でテスト全体がクラッシュするのを防ぐため、スキップ処理を噛ませます
    const runIfKeyExists = apiKey ? it : it.skip;

    runIfKeyExists('getModels からOpenAIのモデル一覧を取得できること', async () => {
      provider = new OpenAIProvider(validConfig);
      
      const result = await provider.getModels();

      expect(result).toBeDefined();
      expect(Array.isArray(result.models)).toBe(true);
      expect(result.models.length).toBeGreaterThan(0);

      // モデル情報の構造チェック
      const firstModel = result.models[0];
      expect(firstModel?.id).toBeTypeOf('string');
      expect(firstModel?.name).toBeTypeOf('string');

      console.log('Open AI Available Models:', result.models);
      const hasTargetModel = result.models.some(m => m.id.includes(targetModel));
      if (!hasTargetModel) {
        console.warn(`警告: テスト対象モデル「${targetModel}」が Open AI 側に存在していません。`);
      }

    }, 15000);

    runIfKeyExists('generate でシステムプロンプトの指示に従ったテキストが生成され、トークン消費量が返ること', async () => {
      provider = new OpenAIProvider(validConfig);

      const request: GenerateRequest = {
        messages: [
          { role: 'system', content: 'あなたは関西弁で話す親切なアシスタントです。一言で答えて。' },
          { role: 'user', content: '今日の天気を教えて' },
        ],
        options: {
          provider: 'OpenAI',
          model: targetModel,
          thinking: false,
        },
      };

      const response = await provider.generate(request);

      console.log('OpenAI Response:', response.content);
      console.log('OpenAI Usage:', response.usage);

      // 1. 生成コンテンツの検証
      expect(response.content).toBeTypeOf('string');
      expect(response.content.length).toBeGreaterThan(0);

      // 2. 終了理由とトークン数の整合性
      expect(response.finishReason).toBeTypeOf('string');
      expect(response.usage.inputTokens).toBeGreaterThan(0);
      expect(response.usage.outputTokens).toBeGreaterThan(0);
      expect(response.usage.totalTokens).toEqual(
        (response.usage.inputTokens ?? 0) + (response.usage.outputTokens ?? 0)
      );
    }, 30000);

    runIfKeyExists('thinking（思考モード）をONにした場合でも、正常に生成が完了すること', async () => {
      provider = new OpenAIProvider(validConfig);

      const request: GenerateRequest = {
        messages: [{ role: 'user', content: '複雑な推論を試すための質問です。13x14は？' }],
        options: {
          provider: 'OpenAI',
          model: targetModel,
          thinking: true, // 思考モードON
        },
      };

      const response = await provider.generate(request);
      
      console.log('Gemini Response:', response.content);

      expect(response.content).toBeTypeOf('string');
      expect(response.content).toContain('182');
      expect(response.usage.totalTokens).toBeGreaterThan(0);
    }, 30000);
  });
});