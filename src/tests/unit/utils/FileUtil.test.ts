import { FileUtil } from '@/utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('FileUtil', () => {

  describe('createMarkdownFileName', () => {
    // 💡 環境（JSTなど）によって結果がブレないよう、環境変数を意識するか、JST基準で検証します
    it('ビデオIDと日時（ISO）から正しいMarkdownファイル名を生成すること', () => {
      const videoId = 'dQw4w9WgXcQ';
      // 日本時間（JST）で 2026/07/16 14:05:01 になるUTC時刻
      const isoString = '2026-07-16T05:05:01.000Z'; 

      const fileName = FileUtil.createMarkdownFileName(videoId, isoString);

      // 日本時間環境（TZ=Asia/Tokyo）での期待値
      expect(fileName).toBe('youtube-summary-dQw4w9WgXcQ-20260716-140501.md');
    });
  });

  describe('downloadText', () => {
    beforeEach(() => {
      // 💡 ブラウザ特有のグローバルAPIをスパイ（モック）します
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:chrome-extension://dummy-url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('正しくDOM要素（aタグ）が生成され、クリックされてダウンロードがシミュレートされること', () => {
      // 1. spyの準備（aタグの挙動を追跡するため、createElementを差し替える）
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(), // クリックされたか監視
        remove: vi.fn(), // 削除されたか監視
      } as unknown as HTMLAnchorElement;

      const createElementSpy = vi.spyOn(document, 'createElement')
        // @ts-ignore（特殊なモックのため一時的に型チェックを無視）
        .mockReturnValue(mockAnchor);
        
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);

      // 2. 実行
      const fileName = 'test.txt';
      const content = 'Hello World';
      FileUtil.downloadText(fileName, content);

      // 3. 検証
      // aタグが正しく作られ、プロパティがセットされたか
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockAnchor.href).toBe('blob:chrome-extension://dummy-url');
      expect(mockAnchor.download).toBe(fileName);

      // DOMへの追加、クリック、削除が一連の流れで行われたか
      expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.remove).toHaveBeenCalled();

      // メモリ解放（revoke）が呼ばれたか
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:chrome-extension://dummy-url');
    });
  });
});