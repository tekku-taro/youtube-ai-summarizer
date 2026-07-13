import type { AIExecutionOptions } from '@/value-objects/AIExecutionOptions';

export interface ChatRequestDto {
  videoId: string;
  chatSessionId: string;
  userMessage: string;
  options: AIExecutionOptions;
}
