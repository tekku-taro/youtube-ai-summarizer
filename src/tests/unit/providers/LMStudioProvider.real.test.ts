// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import type { ProviderConfig } from '@/models/ProviderConfig';
import type { GenerateRequest } from '@/dto/GenerateRequest';
import type { ProviderType } from '@/value-objects/ProviderType';
import { LMStudioProvider } from '@/providers';

describe('LMStudioProvider (実通信テスト)', () => {
  let provider: LMStudioProvider;
  let config: ProviderConfig;
  
  // テストで使用するロード済みのモデル名
  const targetModel = 'ornith-1.0-9b';

  beforeEach(() => {
    // ローカルの LM Studio サーバーへの接続設定
    config = {
      provider: 'LMStudio' as ProviderType,
      baseUrl: 'http://localhost:1234/v1', // 環境に合わせてポート等を調整してください
      apiKey: '', // LM Studio は通常不要ですが、必要な場合は記述
      timeout: 30000, // クラス内部の HttpClient 用タイムアウト (30秒)
    };

    provider = new LMStudioProvider(config);
  });

  describe('getModels', () => {
    it('LM Studio に接続し、現在ロードまたは利用可能なモデル一覧を正しく取得できること', async () => {
      const result = await provider.getModels();

      // 1. レスポンス全体の構造検証
      expect(result).toBeDefined();
      expect(Array.isArray(result.models)).toBe(true);
      expect(result.models.length).toBeGreaterThan(0);

      // 2. 各モデルオブジェクトのデータ構造検証
      const firstModel = result.models[0];
      expect(firstModel?.id).toBeTypeOf('string');
      expect(firstModel?.id.length).toBeGreaterThan(0);
      expect(firstModel?.name).toBeTypeOf('string');

      // 3. 指定のモデルがリストに含まれているかログ出力（デバッグ用）
      console.log('LM Studio Available Models:', result.models);
      const hasTargetModel = result.models.some(m => m.id.includes(targetModel));
      if (!hasTargetModel) {
        console.warn(`警告: テスト対象モデル「${targetModel}」が LM Studio 側でロードされていない可能性があります。`);
      }
    }, 10000); // 接続確認のため10秒タイムアウト
  });

  describe('generate', () => {
    it('ローカルLLMにプロンプトを送信し、テキストの生成とトークン使用量が取得できること', async () => {
      const request: GenerateRequest = {
        messages: [
          { role: 'system', content: '必ず一言で、簡潔に日本語で答えてください。' },
          { role: 'user', content: '日本の首都はどこですか？' },
        ],
        options: {
          provider: 'LMStudio',
          model: targetModel,
          thinking: false,
        },
      };

      // ローカルLLMの生成には時間がかかるため、テストタイムアウトを60秒に延長
      const response = await provider.generate(request);

      console.log('LM Studio Response Content:', response.content);
      console.log('LM Studio Token Usage:', response.usage);

      // 1. 生成されたコンテンツの検証
      expect(response.content).toBeTypeOf('string');
      expect(response.content.length).toBeGreaterThan(0);
      expect(response.content).toContain('東京'); // 期待される回答が含まれているか

      // 2. 終了理由の検証
      expect(response.finishReason).toBeTypeOf('string');
      expect(['stop', 'length', 'content-filter']).toContain(response.finishReason);

      // 3. トークン使用量の構造・数値検証
      expect(response.usage).toBeDefined();
      expect(response.usage.inputTokens).toBeTypeOf('number');
      expect(response.usage.inputTokens).toBeGreaterThan(0);
      
      expect(response.usage.outputTokens).toBeTypeOf('number');
      expect(response.usage.outputTokens).toBeGreaterThan(0);

      expect(response.usage.totalTokens).toBeTypeOf('number');
      expect(response.usage.totalTokens).toEqual(
        (response.usage.inputTokens ?? 0) + (response.usage.outputTokens ?? 0)
      );
    }, 60000); // ローカル生成を考慮し60秒に設定

    it('thinking（思考モード）をONにした場合でも、エラーを出さずにテキスト生成が完了すること', async () => {
      const request: GenerateRequest = {
        messages: [
          { role: 'user', content: '50 * (1 + 9) / 5 は？' },
        ],
        options: {
          provider: 'LMStudio',
          model: targetModel,
          thinking: true, // 思考オプションを有効化
        },
      };

      const response = await provider.generate(request);

      console.log('LM Studio Response Content:', response.content);

      expect(response.content).toBeTypeOf('string');
      expect(response.content.length).toBeGreaterThan(0);
      expect(response.usage.totalTokens).toBeGreaterThan(0);
    }, 60000);
  });
});