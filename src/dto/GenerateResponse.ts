import type { TokenUsage } from '@/value-objects/TokenUsage';

export interface GenerateResponse {
  content: string;
  finishReason: string;
  usage: TokenUsage;
}
