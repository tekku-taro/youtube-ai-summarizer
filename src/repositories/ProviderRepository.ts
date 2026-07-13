import type { ProviderConfig } from '@/models/ProviderConfig';
import { storage } from '@/repositories/storage';
import type { ProviderType } from '@/value-objects/ProviderType';

export class ProviderRepository {
  private readonly namespace = 'providers';

  public async find(provider: ProviderType): Promise<ProviderConfig> {
    const stored = await storage.get<Record<string, ProviderConfig>>(this.namespace);
    const config = stored?.[provider];

    return (
      config ?? {
        provider,
        baseUrl: '',
        timeout: 10000,
      }
    );
  }

  public async save(config: ProviderConfig): Promise<void> {
    const stored = await storage.get<Record<string, ProviderConfig>>(this.namespace);
    const next = { ...(stored ?? {}), [config.provider]: config };
    await storage.set(this.namespace, next);
  }
}
