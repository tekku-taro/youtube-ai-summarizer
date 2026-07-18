// @vitest-environment node
// 💡 クライアントではなく、本物の通信ロジックを直接インポートしてテストする
import { executeGetTranscript } from '@/background/tasks/executeGetTranscript';
import { describe, it, expect } from 'vitest';

describe('executeGetTranscript (実通信テスト)', () => {
  
  it('日本語自動字幕がある動画の場合、日本語の字幕情報と正しいメタデータを取得できること', async () => {
    const videoId = 'f4Mz2MiA24c';

    // 💡 関数を直接実行
    const result = await executeGetTranscript(videoId, 30000);

      // 1. 全体構造・メタデータの存在確認
      expect(result).toBeDefined();
      expect(result.title).toBeTypeOf('string');
      expect(result.title.length).toBeGreaterThan(0);
      expect(result.channelId).toBeTypeOf('string');
      expect(result.duration).toBeTypeOf('number');
      expect(result.duration).toBeGreaterThan(0);

      // 2. 字幕データ(transcript)構造の確認
      expect(result.transcript).toBeDefined();
      expect(result.transcript.source).toBe('youtube');
      expect(result.transcript.language).toMatch(/ja|unknown/); // 日本語またはフォールバック
      expect(typeof result.transcript.generatedAt).toBe('string');

      // 3. セグメント（字幕テキスト情報）の存在と型確認
      expect(Array.isArray(result.transcript.segments)).toBe(true);
      expect(result.transcript.segments.length).toBeGreaterThan(0);

      const firstSegment = result.transcript.segments[0];
      expect(firstSegment?.startSeconds).toBeTypeOf('number');
      expect(firstSegment?.endSeconds).toBeTypeOf('number');
      expect(firstSegment?.text).toBeTypeOf('string');
      expect(firstSegment?.text.length).toBeGreaterThan(0);
  }, 30000);

  it('英語字幕がある動画の場合、英語の字幕情報と正しいメタデータを取得できること', async () => {
    const videoId = 'AhBL2MYlQj0';
    const result = await executeGetTranscript(videoId, 30000);
      // 構造の検証
      expect(result).toBeDefined();
      expect(result.title).toBeTypeOf('string');
      expect(result.duration).toBeGreaterThan(0);

      // 言語コードが英語系であることを確認
      expect(result.transcript.language).toMatch(/en|unknown/);
      expect(result.transcript.segments.length).toBeGreaterThan(0);
      
      // テキスト内容が英字であることを簡易検証
      const combinedText = result.transcript.segments.map(s => s.text).join(' ');
      expect(combinedText).toMatch(/[a-zA-Z]/);
  }, 30000);

  it('字幕がない動画の場合、エラーがスローされること', async () => {
    const videoId = 'l58wzBFl5x0';
    
    // エラーがそのままスローされるかを検証
    await expect(executeGetTranscript(videoId, 30000)).rejects.toThrow();
  }, 30000);

});