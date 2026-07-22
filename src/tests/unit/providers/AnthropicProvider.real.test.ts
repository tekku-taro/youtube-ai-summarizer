// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import type { ProviderConfig } from '@/models/ProviderConfig';
import type { GenerateRequest } from '@/dto/GenerateRequest';
import type { ProviderType } from '@/value-objects/ProviderType';
import { AnthropicProvider } from '@/providers/AnthropicProvider';

describe('AnthropicProvider (実通信テスト)', () => {
  let validConfig: ProviderConfig;
  let invalidConfig: ProviderConfig;
  let provider: AnthropicProvider;

  // 環境変数から情報を取得（Viteの環境変数をNode.js上でマッピングしている想定）
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
  const baseUrl = import.meta.env.VITE_ANTHROPIC_BASE_URL  || 'https://api.anthropic.com/v1';
  const targetModel = 'claude-haiku-4-5-20251001';

  beforeEach(() => {
    // 正常系：有効なAPIキーがある設定
    validConfig = {
      provider: 'Anthropic' as ProviderType,
      baseUrl: baseUrl,
      apiKey: apiKey,
      timeout: 30000,
    };

    // 異常系：APIキーがない（空文字）設定
    invalidConfig = {
      provider: 'Anthropic' as ProviderType,
      baseUrl: baseUrl,
      apiKey: '',
      timeout: 30000,
    };
  });

  describe('APIキーが欠落しているケースの検証 (必須要件)', () => {
    it('APIキーがない場合、generateメソッドは即座に「API Key is not provided」エラーをスローすること', async () => {
      provider = new AnthropicProvider(invalidConfig);

      const request: GenerateRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        options: { 
          provider: 'Anthropic',
          model: targetModel, 
          thinking: false 

        },
      };

      // 内部の getProviderModel でガード句が機能することを確認
      await expect(provider.generate(request)).rejects.toThrow('API Key is not provided');
    });

    it('APIキーがない場合、getModelsメソッドも即座に「API Key is not provided」エラーをスローすること', async () => {
      provider = new AnthropicProvider(invalidConfig);

      await expect(provider.getModels()).rejects.toThrow('API Key is not provided');
    });
  });

  describe('実通信による正常系の検証（APIキーがある場合）', () => {
    // APIキーがない環境（CI環境など）でのクラッシュを防ぐためのスキップ処理
    const runIfKeyExists = apiKey ? it : it.skip;

    runIfKeyExists('getModels からAnthropic API経由でモデル一覧を取得できること', async () => {
      provider = new AnthropicProvider(validConfig);
      
      const result = await provider.getModels();

      expect(result).toBeDefined();
      expect(Array.isArray(result.models)).toBe(true);
      expect(result.models.length).toBeGreaterThan(0);

      // モデル情報の構造チェック
      const firstModel = result.models[0];
      expect(firstModel?.id).toBeTypeOf('string');
      expect(firstModel?.name).toBeTypeOf('string');
    }, 15000);

    runIfKeyExists('generate でシステムプロンプトの指示（instructions）に従ったテキストが生成され、トークン消費量が返ること', async () => {
      provider = new AnthropicProvider(validConfig);

      const request: GenerateRequest = {
        messages: [
          { role: 'system', content: '必ず一言、日本語で短く回答してください。' },
          { role: 'user', content: 'フランスの首都はどこですか？' },
        ],
        options: {
          provider: 'Anthropic',
          model: targetModel,
          thinking: false,
        },
      };

      const response = await provider.generate(request);

      console.log('Anthropic Response:', response.content);
      console.log('Anthropic Usage:', response.usage);

      // 生成されたコンテンツの検証
      expect(response.content).toBeTypeOf('string');
      expect(response.content.length).toBeGreaterThan(0);
      expect(response.content).toContain('パリ');

      // 終了理由とトークン数の整合性
      expect(response.finishReason).toBeTypeOf('string');
      expect(response.usage.inputTokens).toBeGreaterThan(0);
      expect(response.usage.outputTokens).toBeGreaterThan(0);
      expect(response.usage.totalTokens).toEqual(
        (response.usage.inputTokens ?? 0) + (response.usage.outputTokens ?? 0)
      );
    }, 30000);

    runIfKeyExists('thinking（思考モード）をONにした場合でも、正常に生成が完了すること', async () => {
      provider = new AnthropicProvider(validConfig);

      const request: GenerateRequest = {
        messages: [{ role: 'user', content: '15 × 15 の計算結果を教えてください。' }],
        options: {
          provider: 'Anthropic',
          model: targetModel,
          thinking: true,
        },
      };

      const response = await provider.generate(request);
      
      console.log('Gemini Response:', response.content);

      expect(response.content).toBeTypeOf('string');
      expect(response.content).toContain('225');
      expect(response.usage.totalTokens).toBeGreaterThan(0);
    }, 30000);
  });
});