import type { Settings } from '@/models/Settings';
import { storage } from '@/repositories/storage';

export class SettingsRepository {
  private readonly key = 'settings';

  public async find(): Promise<Settings> {
    const stored = await storage.get<Settings>(this.key);
    // console.log('SettingsRepository.find()', stored);

    return (
      stored ?? {
        provider: 'OpenAI',
        model: 'gpt-4o-mini',
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
