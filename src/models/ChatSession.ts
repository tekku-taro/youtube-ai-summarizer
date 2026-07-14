import type { ChatMessage } from '@/models';
import type { ProviderType } from '@/value-objects/ProviderType';

export interface ChatSession {
  id: string;
  provider: ProviderType;
  model: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
