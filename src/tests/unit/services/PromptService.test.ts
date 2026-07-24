import { describe, it, expect, beforeEach } from 'vitest';
import { SummaryType } from '@/value-objects/SummaryType';
import type { ChatMessage } from '@/models/ChatMessage';
import { PromptService } from '@/services';

describe('PromptService', () => {
  let service: PromptService;
  const mockTranscript = 'これはテスト用の動画トランスクリプト内容です。';

  beforeEach(() => {
    service = new PromptService();
  });

  describe('createSummaryMessages', () => {
    it('SummaryType.Important の場合、重要ポイント用のシステムプロンプトとトランスクリプトを含むメッセージ配列を生成すること', () => {
      const result = service.createSummaryMessages(mockTranscript, SummaryType.Important);

      expect(result).toHaveLength(2);
      
      // system メッセージの検証
      expect(result[0]?.role).toBe('system');
      expect(result[0]?.content).toContain('あなたは優秀なYouTube動画要約アシスタントです。');
      expect(result[0]?.content).toContain('# 重要ポイント');

      // user メッセージの検証
      expect(result[1]?.role).toBe('user');
      expect(result[1]?.content).toBe(mockTranscript);
    });

    it('SummaryType.Context の場合、コンテキスト付き用のシステムプロンプトが正しくセットされること', () => {
      const result = service.createSummaryMessages(mockTranscript, SummaryType.Context);

      expect(result[0]?.content).toContain('動画で伝えたい「主要ポイント」を5〜10項目に整理する');
      expect(result[1]?.content).toBe(mockTranscript);
    });

    it('SummaryType.Detailed の場合、詳細要約用のシステムプロンプトが正しくセットされること', () => {
      const result = service.createSummaryMessages(mockTranscript, SummaryType.Detailed);

      expect(result[0]?.content).toContain('画全体をできるだけ網羅');
      expect(result[1]?.content).toBe(mockTranscript);
    });
  });

  describe('createChatMessages', () => {
    it('チャット用のシステムプロンプト、トランスクリプト、会話履歴、ユーザーの最新プロンプトが正しい順番で結合されること', () => {
      // 1. テストデータの準備
      const mockHistory: ChatMessage[] = [
        { id: 'c1', role: 'user', content: 'この動画の結論は何ですか？', createdAt: '2023-04-01T12:00:00Z' },
        { id: 'c2', role: 'assistant', content: '結論は〇〇です。',  createdAt: '2023-04-01T12:05:00Z' },
      ];
      const mockUserPrompt = '補足情報を教えてください。';

      // 2. 実行
      const result = service.createChatMessages(mockTranscript, mockHistory, mockUserPrompt);

      // 3. 検証
      // 配列の長さ: system(1) + transcript(1) + history(2) + userPrompt(1) = 5
      expect(result).toHaveLength(5);

      // 1番目: AIアシスタント用のシステムプロンプト
      expect(result[0]?.role).toBe('system');
      expect(result[0]?.content).toContain('あなたはYouTube動画専用AIアシスタントです。');

      // 2番目: トランスクリプト（コンテキスト）
      expect(result[1]?.role).toBe('user');
      expect(result[1]?.content).toBe(mockTranscript);

      // 3・4番目: 過去の会話履歴がそのままマッピングされているか
      expect(result[2]).toEqual({ role: 'user', content: 'この動画の結論は何ですか？' });
      expect(result[3]).toEqual({ role: 'assistant', content: '結論は〇〇です。' });

      // 5番目: ユーザーの最新の質問
      expect(result[4]?.role).toBe('user');
      expect(result[4]?.content).toBe(mockUserPrompt);
    });

    it('会話履歴(history)が空の場合でも、システムプロンプト、トランスクリプト、最新質問の3つのメッセージを正しく生成すること', () => {
      const mockUserPrompt = '最初の質問です。';

      const result = service.createChatMessages(mockTranscript, [], mockUserPrompt);

      expect(result).toHaveLength(3);
      expect(result[0]?.role).toBe('system');
      expect(result[1]?.content).toBe(mockTranscript);
      expect(result[2]?.content).toBe(mockUserPrompt);
    });
  });
});