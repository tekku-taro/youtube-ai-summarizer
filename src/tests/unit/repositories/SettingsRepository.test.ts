import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from '@/repositories/storage';
import type { Settings } from '@/models/Settings';
import { ProviderConfigRepository, SettingsRepository } from '@/repositories';
import { ProviderType } from '@/value-objects';

vi.mock('@/repositories/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('SettingsRepository', () => {
  let repository: SettingsRepository;

  beforeEach(() => {
    vi.resetAllMocks();
    repository = new SettingsRepository();
  });

  describe('find', () => {
    it('ストレージに設定が保存されている場合、その設定を返すこと', async () => {
      const mockSettings: Settings = {
        provider: 'Anthropic',
        model: 'claude-3-5-sonnet',
        summaryType: 'Detailed',
        thinking: true,
      } as Settings;
      vi.mocked(storage.get).mockResolvedValue(mockSettings);

      const result = await repository.find();

      expect(storage.get).toHaveBeenCalledWith('settings');
      expect(result).toEqual(mockSettings);
    });

    it('ストレージに設定がない場合、既定のデフォルト値を返すこと', async () => {
      vi.mocked(storage.get).mockResolvedValue(null);
      const providerConfig = {
        provider: ProviderType.OpenAI,
        apiKey: 'openai_apikey',
        baseUrl: 'https://api.openai.com/v1',
      }      
      vi.spyOn(
        ProviderConfigRepository.prototype,
        'getAvailable'
      ).mockReturnValue(providerConfig);      
      const result = await repository.find();

      expect(result).toEqual({
        provider: providerConfig.provider,
        model: '',
        summaryType: 'Important',
        thinking: false,
      });
    });
  });

  describe('save', () => {
    it('渡された設定オブジェクトをそのままストレージに保存すること', async () => {
      const newSettings: Settings = {
        provider: 'LMStudio',
        model: 'custom-model',
        summaryType: 'Context',
        thinking: false,
      } as Settings;

      await repository.save(newSettings);

      expect(storage.set).toHaveBeenCalledWith('settings', newSettings);
    });
  });

  describe('reset', () => {
    it('ストレージから設定キーを削除（remove）すること', async () => {
      await repository.reset();

      expect(storage.remove).toHaveBeenCalledWith('settings');
    });
  });
});