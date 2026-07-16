import { storage } from '@/repositories';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('storage repository', () => {

  // 1. 各テストケース実行前に chrome.storage.local のモックを設定
  beforeEach(() => {
    // グローバル(window)オブジェクトに偽のchrome APIを定義
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockStorage: Record<string, any> = {};

    globalThis.window = {
      chrome: {
        storage: {
          local: {
            // chrome.storage.local.get はオブジェクトを返す仕様を再現
            get: vi.fn().mockImplementation(async (key: string) => {
              return { [key]: mockStorage[key] };
            }),
            // set はオブジェクトを受け取って内部ストレージに保存
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            set: vi.fn().mockImplementation(async (obj: Record<string, any>) => {
              Object.assign(mockStorage, obj);
            }),
            // remove は内部ストレージからキーを削除
            remove: vi.fn().mockImplementation(async (key: string) => {
              delete mockStorage[key];
            }),
          },
        },
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  });

  // 2. テスト終了後にモック（グローバル汚染）をキレイに掃除
  afterEach(() => {
    vi.restoreAllMocks();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete globalThis.window.chrome;
  });

  describe('set と get', () => {
    it('setで保存したデータをgetで正しく型を維持して取得できること', async () => {
      type UserData = { id: number; name: string };
      const user: UserData = { id: 1, name: 'Saitama' };

      // 保存
      await storage.set('user_profile', user);

      // 取得
      const result = await storage.get<UserData>('user_profile');

      // 検証
      expect(result).toEqual(user);
    });

    it('存在しないキーを指定してgetを呼んだ場合、nullが返ること', async () => {
      const result = await storage.get('non_existent_key');
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('保存されているデータをremoveで削除できること（削除後はnullになる）', async () => {
      await storage.set('temp_data', 'secret');

      // 削除前チェック
      expect(await storage.get('temp_data')).toBe('secret');

      // 削除実行
      await storage.remove('temp_data');

      // 削除後チェック
      expect(await storage.get('temp_data')).toBeNull();
    });
  });

  describe('環境チェック（ガード句のテスト）', () => {
    it('window.chromeが存在しない特殊な環境（SSRなど）では、getはnullを返し、エラーを投げないこと', async () => {
      // 一時的にchromeオブジェクトを完全に消去
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete globalThis.window.chrome;

      const result = await storage.get('any_key');
      expect(result).toBeNull();
    });
  });
});