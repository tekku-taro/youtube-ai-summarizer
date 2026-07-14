import type { TokenUsage } from '@/value-objects/TokenUsage';
import type { ProviderType } from '@/value-objects/ProviderType';

export interface GenerateResult {

  /**
   * AI生成本文
   */
  content: string;

  /**
   * Provider名
   */
  provider: ProviderType;

  /**
   * 利用モデル名
   */
  model: string;

  /**
   * 終了理由
   */
  finishReason: string;

  /**
   * Token使用量
   */
  usage: TokenUsage;

  /**
   * 生成日時
   */
  generatedAt: string;  

}