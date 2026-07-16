import { CurrentVideoService } from '@/services';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('CurrentVideoService', () => {
  let service: CurrentVideoService;

  beforeEach(() => {
    service = new CurrentVideoService();
    // コンソールログ出力をテスト結果から非表示（クリーンアップ）にしたい場合はスパイを設定
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // グローバルに注入した chrome モックをクリーンアップ
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete globalThis.chrome;
  });

  it('アクティブタブがYouTube動画ページの場合、URLから動画ID(v)を正しく抽出して返すこと', async () => {
    // 1. chrome.tabs.query がダミーのYouTubeタブを返すようにモック化
    const mockTab = {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=45s',
      active: true,
      currentWindow: true,
    };
    
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: テスト用に部分的なモックを作成するため
    globalThis.chrome = {
      tabs: {
        query: vi.fn().mockResolvedValue([mockTab]),
      } as unknown as typeof chrome.tabs,
    };

    // 2. 実行
    const result = await service.getCurrentVideoId();

    // 3. 検証
    expect(chrome.tabs.query).toHaveBeenCalledWith({
      active: true,
      currentWindow: true,
    });
    expect(result).toBe('dQw4w9WgXcQ');
  });

  it('アクティブなタブが見つからない（またはURLプロパティが欠落している）場合、falseを返すこと', async () => {
    // タブが取得できなかったケース（空配列が返る、またはundefined）
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.chrome = {
      tabs: {
        query: vi.fn().mockResolvedValue([]),
      }as unknown as typeof chrome.tabs,
    };

    const result = await service.getCurrentVideoId();
    expect(result).toBe(false);
  });

  it('URLがYouTubeであっても動画IDパラメータ(v)が存在しない場合、falseを返すこと', async () => {
    // 検索パラメータに 'v' が含まれないURL（YouTubeのトップページなど）
    const mockTab = {
      url: 'https://www.youtube.com/feed/subscriptions',
    };
    
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.chrome = {
      tabs: {
        query: vi.fn().mockResolvedValue([mockTab]),
      }as unknown as typeof chrome.tabs,
    };

    const result = await service.getCurrentVideoId();
    expect(result).toBe(false);
  });

  it('YouTube以外の全く異なるWebページにいる場合、falseを返すこと', async () => {
    const mockTab = {
      url: 'https://github.com/vitest-dev/vitest',
    };
    
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.chrome = {
      tabs: {
        query: vi.fn().mockResolvedValue([mockTab]),
      }as unknown as typeof chrome.tabs,
    };

    const result = await service.getCurrentVideoId();
    expect(result).toBe(false);
  });
});