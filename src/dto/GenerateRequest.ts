import type { AIExecutionOptions } from '@/value-objects/AIExecutionOptions';

export interface GenerateRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  options: AIExecutionOptions;
}
