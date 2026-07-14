import type { AIMessage } from '@/value-objects/AIMessage';
import type { AIExecutionOptions } from '@/value-objects/AIExecutionOptions';

export interface GenerateRequest {
  messages: AIMessage[];
  options: AIExecutionOptions;
}
