import type { AIExecutionOptions } from '@/value-objects/AIExecutionOptions';

export interface ChatRequestDto {
  chatSessionId: string;
  userMessage: string;
  options: AIExecutionOptions;
}
