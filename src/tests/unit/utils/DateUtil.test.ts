import { DateUtil } from '@/utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('DateUtil', () => {
  
  describe('nowIso', () => {
    beforeEach(() => {
      // 基準となる日時（UTC）を固定します
      const mockDate = new Date('2026-07-16T05:00:00.000Z');
      vi.setSystemTime(mockDate);
    });

    afterEach(() => {
      // テストが終わったらシステムの時計を元に戻します
      vi.useRealTimers();
    });

    it('現在の時刻がISO 8601形式の文字列で取得できること', () => {
      const result = DateUtil.nowIso();
      expect(result).toBe('2026-07-16T05:00:00.000Z');
    });
  });

  describe('formatDisplay', () => {
    // 💡 注意: 実行環境（PCやCIサーバー）のタイムゾーンに依存するため、
    // 期待する出力は環境（JST: UTC+9 など）に合わせて想定する必要があります。
    
    it('ISO文字列を「YYYY/MM/DD HH:mm」の形式に正しく変換できること', () => {
      // タイムゾーンがJST（日本標準時）の場合、2026-07-16 14:00 になります
      const inputIso = '2026-07-16T05:00:00.000Z';
      const result = DateUtil.formatDisplay(inputIso);

      // 実行環境が日本の場合はこちら
      expect(result).toBe('2026/07/16 14:00');
    });

    it('月や日、時分が1桁の場合に「0」で埋められること（パディングのテスト）', () => {
      // 日本時間で 2026/01/02 03:04 になるUTC時刻
      const inputIso = '2026-01-01T18:04:00.000Z'; 
      const result = DateUtil.formatDisplay(inputIso);

      expect(result).toBe('2026/01/02 03:04');
    });
  });
});

describe('formatDisplay', () => {
    // （中略：正常系のテスト）

    it('不正な形式の文字列が渡された場合、エラーをスローすること', () => {
      const invalidInput = 'this-is-not-a-date';
      
      // 💡 例外（エラー）が発生することを検証する場合、expectの中にアロー関数を渡します
      expect(() => {
        DateUtil.formatDisplay(invalidInput);
      }).toThrow(Error);

      // エラーメッセージまで厳密にチェックしたい場合
      expect(() => {
        DateUtil.formatDisplay(invalidInput);
      }).toThrow('Invalid Date');
    });

    it('空文字が渡された場合、エラーをスローすること', () => {
      expect(() => {
        DateUtil.formatDisplay('');
      }).toThrow('Invalid Date');
    });
  });