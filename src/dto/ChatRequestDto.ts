import type { AIExecutionOptions } from '@/value-objects/AIExecutionOptions';

export interface ChatRequestDto {
  chatSessionId: string|null|undefined;
  userMessage: string;
  options: AIExecutionOptions;
}
