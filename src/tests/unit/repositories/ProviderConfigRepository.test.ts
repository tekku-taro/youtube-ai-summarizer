import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProviderType } from '@/value-objects';
import { ProviderConfigRepository } from '@/repositories';

describe('ProviderConfigRepository', () => {
  beforeEach(() => {
    // 各テスト前に環境変数を初期化（すべてのプロバイダー設定をクリア）
    vi.stubEnv('VITE_OPENAI_API_KEY', undefined);
    vi.stubEnv('VITE_OPENAI_BASE_URL', undefined);
    vi.stubEnv('VITE_GEMINI_API_KEY', undefined);
    vi.stubEnv('VITE_GEMINI_BASE_URL', undefined);
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', undefined);
    vi.stubEnv('VITE_ANTHROPIC_BASE_URL', undefined);
    vi.stubEnv('VITE_LMSTUDIO_BASE_URL', undefined);
    vi.stubEnv('VITE_DEFAULT_PROVIDER', undefined);
  });

  // 各テストの終了時に、vi.stubEnv で変更した環境変数をすべて元の状態に自動復元する
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('find', () => {
    it('指定したプロバイダーの設定を取得できること', () => {
      vi.stubEnv('VITE_OPENAI_API_KEY', 'test-openai-key');
      vi.stubEnv('VITE_OPENAI_BASE_URL', 'https://api.openai.com/v1');

      const repository = new ProviderConfigRepository();
      const config = repository.find(ProviderType.OpenAI);

      expect(config).toEqual({
        provider: ProviderType.OpenAI,
        apiKey: 'test-openai-key',
        baseUrl: 'https://api.openai.com/v1',
        label: 'OpenAI',
      });
    });
  });

  describe('getDefault', () => {
    it('VITE_DEFAULT_PROVIDER で指定されたプロバイダーの設定を返すこと', () => {
      vi.stubEnv('VITE_DEFAULT_PROVIDER', ProviderType.Gemini);
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-gemini-key');

      const repository = new ProviderConfigRepository();
      const config = repository.getDefault();

      expect(config.provider).toBe(ProviderType.Gemini);
    });
  });

  describe('getAvailable', () => {
    it('利用可能なプロバイダーが存在しない場合、エラーをスローすること', () => {
      // すべての環境変数が未設定
      const repository = new ProviderConfigRepository();

      expect(() => repository.getAvailable()).toThrow(
        'No provider configurations found',
      );
    });

    it('OpenAI の apiKey と baseUrl が揃っている場合、利用可能として取得できること', () => {
      vi.stubEnv('VITE_OPENAI_API_KEY', 'key');
      vi.stubEnv('VITE_OPENAI_BASE_URL', 'http://openai');

      const repository = new ProviderConfigRepository();
      const available = repository.getAvailable();

      expect(available.provider).toBe(ProviderType.OpenAI);
    });

    it('OpenAI の apiKey のみ設定されて baseUrl が欠けている場合、取得できないこと', () => {
      vi.stubEnv('VITE_OPENAI_API_KEY', 'key');
      // baseUrl なし

      const repository = new ProviderConfigRepository();

      expect(() => repository.getAvailable()).toThrow(
        'No provider configurations found',
      );
    });

    it('LM Studio は apiKey が不要で baseUrl のみで利用可能になること', () => {
      vi.stubEnv('VITE_LMSTUDIO_BASE_URL', 'http://localhost:1234/v1');

      const repository = new ProviderConfigRepository();
      const available = repository.getAvailable();

      expect(available.provider).toBe(ProviderType.LMStudio);
    });

    it('複数のプロバイダーが利用可能な場合、最初に条件を満たしたプロバイダーを返すこと', () => {
      // OpenAI と Gemini の両方が有効
      vi.stubEnv('VITE_OPENAI_API_KEY', 'openai-key');
      vi.stubEnv('VITE_OPENAI_BASE_URL', 'http://openai');
      vi.stubEnv('VITE_GEMINI_API_KEY', 'gemini-key');
      vi.stubEnv('VITE_GEMINI_BASE_URL', 'http://gemini');

      const repository = new ProviderConfigRepository();
      const available = repository.getAvailable();

      // configs の登録順（OpenAIが先頭）に従って選択されること
      expect(available.provider).toBe(ProviderType.OpenAI);
    });
  });

  describe('getProviderOptions', () => {
    it('利用可能なプロバイダーが存在しない場合、空配列を返すこと', () => {
      const repository = new ProviderConfigRepository();
      const options = repository.getProviderOptions();

      expect(options).toEqual([]);
    });

    it('条件（apiKey & baseUrl または LMStudio の baseUrl）を満たすプロバイダーのみオプションとして抽出されること', () => {
      // 1. OpenAI: 完全（有効）
      vi.stubEnv('VITE_OPENAI_API_KEY', 'openai-key');
      vi.stubEnv('VITE_OPENAI_BASE_URL', 'http://openai');

      // 2. Gemini: apiKeyのみ（無効）
      vi.stubEnv('VITE_GEMINI_API_KEY', 'gemini-key');

      // 3. Anthropic: 無効（環境変数なし）

      // 4. LMStudio: baseUrlのみ（有効）
      vi.stubEnv('VITE_LMSTUDIO_BASE_URL', 'http://localhost:1234/v1');

      const repository = new ProviderConfigRepository();
      const options = repository.getProviderOptions();

      expect(options).toEqual([
        { value: ProviderType.OpenAI, label: 'OpenAI' },
        { value: ProviderType.LMStudio, label: 'LM Studio' },
      ]);
    });

    it('すべてのプロバイダーの設定が有効な場合、すべてのオプションが取得できること', () => {
      vi.stubEnv('VITE_OPENAI_API_KEY', 'key');
      vi.stubEnv('VITE_OPENAI_BASE_URL', 'http://openai');
      vi.stubEnv('VITE_GEMINI_API_KEY', 'key');
      vi.stubEnv('VITE_GEMINI_BASE_URL', 'http://gemini');
      vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'key');
      vi.stubEnv('VITE_ANTHROPIC_BASE_URL', 'http://anthropic');
      vi.stubEnv('VITE_LMSTUDIO_BASE_URL', 'http://lmstudio');

      const repository = new ProviderConfigRepository();
      const options = repository.getProviderOptions();

      expect(options).toHaveLength(4);
      expect(options.map((o) => o.value)).toEqual([
        ProviderType.OpenAI,
        ProviderType.Gemini,
        ProviderType.Anthropic,
        ProviderType.LMStudio,
      ]);
    });
  });

  describe('all', () => {
    it('環境変数の設定状況に関わらず、すべての定義済みプロバイダー設定（4種）を返すこと', () => {
      const repository = new ProviderConfigRepository();
      const allConfigs = repository.all();

      expect(allConfigs).toHaveLength(4);
    });
  });
});