// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import type { ProviderConfig } from '@/models/ProviderConfig';
import type { GenerateRequest } from '@/dto/GenerateRequest';
import type { ProviderType } from '@/value-objects/ProviderType';
import { GeminiProvider } from '@/providers';

describe('GeminiProvider (実通信テスト)', () => {
  let validConfig: ProviderConfig;
  let invalidConfig: ProviderConfig;
  let provider: GeminiProvider;

  // 環境変数から情報を取得（Viteの環境変数をNode.js上でマッピングしている想定）
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const baseUrl = import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
  const targetModel = 'gemini-3.1-flash-lite';

  beforeEach(() => {
    // 正常系：有効なAPIキーがある設定
    validConfig = {
      provider: 'Gemini' as ProviderType,
      baseUrl: baseUrl,
      apiKey: apiKey,
      timeout: 30000,
    };

    // 異常系：APIキーがない（空文字）設定
    invalidConfig = {
      provider: 'Gemini' as ProviderType,
      baseUrl: baseUrl,
      apiKey: '',
      timeout: 30000,
    };
  });

  describe('APIキーが欠落しているケースの検証 (必須要件)', () => {
    it('APIキーがない場合、generateメソッドは即座に「API Key is not provided」エラーをスローすること', async () => {
      provider = new GeminiProvider(invalidConfig);

      const request: GenerateRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        options: { 
          provider: 'Gemini',
          model: targetModel, 
          thinking: false 

        },
      };

      // 内部の getProviderModel でガード句が機能することを確認
      await expect(provider.generate(request)).rejects.toThrow('API Key is not provided');
    });

    it('APIキーがない場合、getModelsメソッドも即座に「API Key is not provided」エラーをスローすること', async () => {
      provider = new GeminiProvider(invalidConfig);

      await expect(provider.getModels()).rejects.toThrow('API Key is not provided');
    });
  });

  describe('実通信による正常系の検証（APIキーがある場合）', () => {
    // APIキーがない環境（CI環境など）でのクラッシュを防ぐためのスキップ処理
    const runIfKeyExists = apiKey ? it : it.skip;

    runIfKeyExists('getModels からGoogle API経由でモデル一覧を取得・マッピングできること', async () => {
      provider = new GeminiProvider(validConfig);
      
      const result = await provider.getModels();

      expect(result).toBeDefined();
      expect(Array.isArray(result.models)).toBe(true);
      expect(result.models.length).toBeGreaterThan(0);

      // マッピング後のオブジェクト構造チェック
      const firstModel = result.models[0];
      expect(firstModel?.id).toBeTypeOf('string');
      expect(firstModel?.name).toBeTypeOf('string');

      console.log('Gemini Available Models:', result.models);
      const targetModelInfo = result.models.find(m => m.id == targetModel);
      
      expect(targetModelInfo).toBeDefined();
      expect(targetModelInfo!.id).toBe('gemini-3.1-flash-lite');
      expect(targetModelInfo!.id).not.toContain('models/');
      expect(targetModelInfo!.name).toBe('Gemini 3.1 Flash Lite');


      if (!targetModelInfo) {
        console.warn(`警告: テスト対象モデル「${targetModel}」が Gemini 側に存在していません。`);
      }

    }, 15000);

    runIfKeyExists('generate でシステムプロンプトの指示（instructions）に従ったテキストが生成され、トークン消費量が返ること', async () => {
      provider = new GeminiProvider(validConfig);

      const request: GenerateRequest = {
        messages: [
          { role: 'system', content: '必ず一言、英語ではなく日本語で回答してください。' },
          { role: 'user', content: 'What is the capital of Japan?' },
        ],
        options: {
          provider: 'Gemini',
          model: targetModel,
          thinking: false,
        },
      };

      const response = await provider.generate(request);

      console.log('Gemini Response:', response.content);
      console.log('Gemini Usage:', response.usage);

      // 生成されたコンテンツの検証（日本語で返っているか確認）
      expect(response.content).toBeTypeOf('string');
      expect(response.content.length).toBeGreaterThan(0);
      expect(response.content).toContain('東京');

      // 終了理由とトークン数の整合性
      expect(response.finishReason).toBeTypeOf('string');
      expect(response.usage.inputTokens).toBeGreaterThan(0);
      expect(response.usage.outputTokens).toBeGreaterThan(0);
      expect(response.usage.totalTokens).toEqual(
        (response.usage.inputTokens ?? 0) + (response.usage.outputTokens ?? 0)
      );
    }, 30000);

    runIfKeyExists('thinking（思考モード）をONにした場合（thinkingConfigが適用された状態）でも、正常に生成が完了すること', async () => {
      provider = new GeminiProvider(validConfig);

      const request: GenerateRequest = {
        messages: [{ role: 'user', content: '3桁の素数を1つ挙げてください。' }],
        options: {
          provider: 'Gemini',
          model: targetModel,
          thinking: true, // 思考オプションを有効化（thinkingLevel: "medium" が適用されるケース）
        },
      };

      const response = await provider.generate(request);

      console.log('Gemini Response:', response.content);

      expect(response.content).toBeTypeOf('string');
      expect(response.content.length).toBeGreaterThan(0);
      expect(response.usage.totalTokens).toBeGreaterThan(0);
    }, 30000);
  });
});