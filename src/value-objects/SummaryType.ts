export const SummaryType = {
  Important: 'Important',
  Context: 'Context',
  Detailed: 'Detailed',
} as const;

export type SummaryType = (typeof SummaryType)[keyof typeof SummaryType];
