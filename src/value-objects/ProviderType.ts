export const ProviderType = {
  OpenAI: 'OpenAI',
  Gemini: 'Gemini',
  LMStudio: 'LMStudio',
} as const;

export type ProviderType = (typeof ProviderType)[keyof typeof ProviderType];
