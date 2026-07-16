import type { TranscriptData } from '@/models';
import { toPlainText } from '@/utils';
import { describe, it, expect } from 'vitest';

describe('toPlainText', () => {
  // テストで使い回す共通のメタデータ（ダミーデータ）
  const dummyMeta = {
    language: 'ja',
    source: 'youtube',
    generatedAt: '2026-07-16T05:00:00.000Z',
  };

  it('複数のセグメントテキストが改行コードで結合されてプレーンテキストになること', () => {
    // 1. テストデータの準備
    const mockTranscript: TranscriptData = {
      ...dummyMeta,
      segments: [
        { startSeconds: 0, endSeconds: 5, text: 'こんにちは、皆さん。' },
        { startSeconds: 5, endSeconds: 10, text: '今日はChrome拡張機能の開発についてです。' },
        { startSeconds: 10, endSeconds: 15, text: 'よろしくお願いします。' },
      ],
    };

    // 2. 実行
    const result = toPlainText(mockTranscript);

    // 3. 検証
    const expected = 'こんにちは、皆さん。\n今日はChrome拡張機能の開発についてです。\nよろしくお願いします。';
    expect(result).toBe(expected);
  });

  it('segmentsが空（0件）の場合、空文字（""）を返すこと', () => {
    const mockTranscript: TranscriptData = {
      ...dummyMeta,
      segments: [],
    };

    const result = toPlainText(mockTranscript);

    expect(result).toBe('');
  });

  it('segmentsが1件だけの場合、末尾に余分な改行が入らずにそのテキストが返ること', () => {
    const mockTranscript: TranscriptData = {
      ...dummyMeta,
      segments: [
        { startSeconds: 0, endSeconds: 5, text: '単一のテキスト' },
      ],
    };

    const result = toPlainText(mockTranscript);

    expect(result).toBe('単一のテキスト');
  });
});