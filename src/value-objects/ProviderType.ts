export const ProviderType = {
  OpenAI: 'OpenAI',
  Gemini: 'Gemini',
  LMStudio: 'LMStudio',
} as const;

export type ProviderType = (typeof ProviderType)[keyof typeof ProviderType];

export const providerOptions = [
  {
    value: ProviderType.OpenAI,
    label: 'OpenAI',
  },
  {
    value: ProviderType.Gemini,
    label: 'Gemini',
  },
  {
    value: ProviderType.LMStudio,
    label: 'LM Studio',
  },
];