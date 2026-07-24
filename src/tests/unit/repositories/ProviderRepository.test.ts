import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from '@/repositories/storage';
import type { ProviderConfig } from '@/models/ProviderConfig';
import { ProviderType } from '@/value-objects/ProviderType';
import { ProviderConfigRepository, ProviderRepository } from '@/repositories';

// storage モジュールをモック化
vi.mock('@/repositories/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));



describe('ProviderRepository', () => {
  let repository: ProviderRepository;

  beforeEach(() => {
    vi.resetAllMocks();
    repository = new ProviderRepository();
  });

  describe('find', () => {
    it('ストレージにデータが存在する場合、該当するプロバイダーの設定を返すこと', async () => {
      const mockStoredData: Record<string, ProviderConfig> = {
        OpenAI: { provider: 'OpenAI' as ProviderType, baseUrl: 'https://api.openai.com', timeout: 5000 },
        Anthropic: { provider: 'Anthropic' as ProviderType, baseUrl: 'https://api.anthropic.com', timeout: 8000 },
      };
      vi.mocked(storage.get).mockResolvedValue(mockStoredData);

      const result = await repository.find('OpenAI' as ProviderType);

      expect(storage.get).toHaveBeenCalledWith('providers');
      expect(result).toEqual(mockStoredData.OpenAI);
    });

    it('ストレージにデータがない、または該当するプロバイダーがない場合、デフォルト値を返すこと', async () => {
      vi.mocked(storage.get).mockResolvedValue(null);
      const providerConfig = {
        provider: ProviderType.OpenAI,
        apiKey: 'openai_apikey',
        baseUrl: 'https://api.openai.com/v1',
      }
      vi.spyOn(
        ProviderConfigRepository.prototype,
        'find'
      ).mockReturnValue(providerConfig);      
      const result = await repository.find('OpenAI' as ProviderType);

      expect(result).toEqual(providerConfig);


      expect(storage.set).toHaveBeenCalledWith('providers', {
        OpenAI: providerConfig,
      });      
    });
  });

  describe('save', () => {
    it('既存のデータがない場合、新しいプロバイダー設定のみを新規保存すること', async () => {
      vi.mocked(storage.get).mockResolvedValue(null);
      const newConfig: ProviderConfig = { provider: 'OpenAI' as ProviderType, baseUrl: 'https://api.openai.com', timeout: 5000 };

      await repository.save(newConfig);

      expect(storage.set).toHaveBeenCalledWith('providers', {
        OpenAI: newConfig,
      });
    });

    it('既に既存のデータがある場合、他の設定を壊さずに指定の設定のみを上書き・追加保存すること', async () => {
      const existingData: Record<string, ProviderConfig> = {
        Anthropic: { provider: 'Anthropic' as ProviderType, baseUrl: 'https://api.anthropic.com', timeout: 8000 },
      };
      vi.mocked(storage.get).mockResolvedValue(existingData);

      const newConfig: ProviderConfig = { provider: 'OpenAI' as ProviderType, baseUrl: 'https://api.openai.com', timeout: 5000 };

      await repository.save(newConfig);

      expect(storage.set).toHaveBeenCalledWith('providers', {
        Anthropic: existingData.Anthropic,
        OpenAI: newConfig,
      });
    });
  });
});