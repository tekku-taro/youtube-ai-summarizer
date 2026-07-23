import type { Settings } from '@/models/Settings';
import { storage } from '@/repositories/storage';
import { ProviderConfigRepository } from './ProviderConfigRepository';

export class SettingsRepository {
  private readonly key = 'settings';

  public async find(): Promise<Settings> {
    const providerConfigRepository = new ProviderConfigRepository();
    
    const stored = await storage.get<Settings>(this.key);
    // console.log('SettingsRepository.find()', stored);

    const availableConfig = providerConfigRepository.getAvailable();

    return (
      stored ?? {
        provider: availableConfig.provider,
        model: '',
        summaryType: 'Important',
        thinking: false,
      }
    );
  }

  public async save(settings: Settings): Promise<void> {
    await storage.set(this.key, settings);
  }

  public async reset(): Promise<void> {
    await storage.remove(this.key);
  }
}
