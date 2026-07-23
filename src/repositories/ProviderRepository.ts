import type { ProviderConfig } from '@/models/ProviderConfig';
import { storage } from '@/repositories/storage';
import type { ProviderType } from '@/value-objects/ProviderType';
import { ProviderConfigRepository } from './ProviderConfigRepository';

export class ProviderRepository {
  private readonly namespace = 'providers';

  public async find(provider: ProviderType): Promise<ProviderConfig> {
    const stored = await storage.get<Record<string, ProviderConfig>>(this.namespace);
    const config = stored?.[provider];

    return config ?? this.createAndGet(provider);
  }

  public async createAndGet(provider: ProviderType): Promise<ProviderConfig> {
      const providerConfigRepository = new ProviderConfigRepository();
    
    const providerConfig = providerConfigRepository.find(provider);
    const next = { [provider]: providerConfig};
    await storage.set(this.namespace, next);

    return providerConfig;
  }

  public async save(config: ProviderConfig): Promise<void> {
    const stored = await storage.get<Record<string, ProviderConfig>>(this.namespace);
    const next = { ...(stored ?? {}), [config.provider]: config };
    await storage.set(this.namespace, next);
  }

  public async reset() {
    storage.remove(this.namespace);
  }
}
