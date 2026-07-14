// declare global {
//   interface Window {
//     chrome?: {
//       storage?: {
//         local?: {
//           get: (key: string | string[]) => Promise<Record<string, unknown>>;
//           set: (items: Record<string, unknown>) => Promise<void>;
//           remove: (keys: string | string[]) => Promise<void>;
//         };
//       };
//     };
//   }
// }

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined' || !window.chrome?.storage?.local) {
      return null;
    }

    const result = await window.chrome.storage.local.get(key);
    return (result[key] as T | undefined) ?? null;
  },

  async set<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined' || !window.chrome?.storage?.local) {
      return;
    }

    await window.chrome.storage.local.set({ [key]: value });
  },

  async remove(key: string): Promise<void> {
    if (typeof window === 'undefined' || !window.chrome?.storage?.local) {
      return;
    }

    await window.chrome.storage.local.remove(key);
  },
};
