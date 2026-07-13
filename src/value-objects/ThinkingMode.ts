export const ThinkingMode = {
  Off: 'Off',
  On: 'On',
} as const;

export type ThinkingMode = (typeof ThinkingMode)[keyof typeof ThinkingMode];
