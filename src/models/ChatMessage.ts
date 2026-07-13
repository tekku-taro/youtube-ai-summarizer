import type { TokenUsage } from '@/value-objects/TokenUsage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  usage?: TokenUsage;
  createdAt: string;
}
