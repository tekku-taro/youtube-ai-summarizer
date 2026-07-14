// value-objects/TabType.ts

// export enum TabType {
//   Summary = 'summary',
//   Transcript = 'transcript',
//   Chat = 'chat',
// }
export const TabType = {
  Summary: 'summary',
  Transcript: 'transcript',
  Chat: 'chat',
} as const;

export type TabType = (typeof TabType)[keyof typeof TabType];