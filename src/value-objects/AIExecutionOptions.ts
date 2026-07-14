import type { ProviderType } from "./ProviderType";

export interface AIExecutionOptions {
  provider: ProviderType;
  model: string;
  thinking: boolean;
}
