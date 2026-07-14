export const SummaryType = {
  Important: 'Important',
  Context: 'Context',
  Detailed: 'Detailed',
} as const;

export type SummaryType = (typeof SummaryType)[keyof typeof SummaryType];


export const summaryTypeOptions = [
  {
    value: SummaryType.Important,
    label: '重要ポイント',
  },
  {
    value: SummaryType.Context,
    label: 'コンテキスト＋主要なポイント',
  },
  {
    value: SummaryType.Detailed,
    label: '詳細',
  },
];