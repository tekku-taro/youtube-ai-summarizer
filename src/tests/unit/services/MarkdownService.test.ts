import { describe, it, expect, beforeEach } from 'vitest';
import type { VideoData } from '@/models/VideoData';
import type { SummaryData } from '@/models/SummaryData';
import type { ChatSession } from '@/models/ChatSession';
import { MarkdownService } from '@/services';

describe('MarkdownService', () => {
  let service: MarkdownService;

  // 共通のテスト用ビデオデータ
  const mockVideo = {
    videoId: 'dQw4w9WgXcQ',
    title: 'リック・アストリーのダンス講座',
    channelId: 'RickAstleyVEVO',
    duration: 212,
  } as unknown as VideoData;

  beforeEach(() => {
    service = new MarkdownService();
  });

  describe('exportSummary', () => {
    // 最小限の正常系要約データ
    const baseSummary = {
      provider: 'OpenAI',
      model: 'gpt-4o-mini',
      summaryType: 'Important',
      thinking: false,
      promptVersion: 'v1.0.0',
      createdAt: '2026-07-16T06:00:00.000Z',
      usage: {
        inputTokens: 100,
        outputTokens: 200,
        totalTokens: 300,
      },
      content: '# 結論\n絶対に諦めないことです。',
    } as SummaryData;

    it('要約データが指定されたMarkdownテンプレート形式に正しく変換されること', () => {
      const result = service.exportSummary(mockVideo, baseSummary);

      // 行ごとに分解して部分検証、または全体の構成を検証
      expect(result).toContain('# リック・アストリーのダンス講座');
      expect(result).toContain('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result).toContain('- Channel: RickAstleyVEVO');
      expect(result).toContain('- Duration: 212 sec');
      expect(result).toContain('- Provider: OpenAI');
      expect(result).toContain('- Model: gpt-4o-mini');
      expect(result).toContain('- Summary Type: Important');
      expect(result).toContain('- Thinking: OFF');
      expect(result).toContain('- Prompt Version: v1.0.0');
      expect(result).toContain('- Generated At: 2026-07-16T06:00:00.000Z');
      expect(result).toContain('- Input: 100');
      expect(result).toContain('- Output: 200');
      expect(result).toContain('- Total: 300');
      expect(result).toContain('# 結論\n絶対に諦めないことです。');
    });

    it('thinkingがtrueの場合、Thinkingの項目が ON と出力されること', () => {
      const summaryWithThinking = {
        ...baseSummary,
        thinking: true,
      } as unknown as SummaryData;

      const result = service.exportSummary(mockVideo, summaryWithThinking);
      
      expect(result).toContain('- Thinking: ON');
    });
  });

  describe('exportChat', () => {
    it('チャットセッションとメッセージ、トークン使用量が正しくMarkdownに変換されること', () => {
      const mockSession = {
        provider: 'Anthropic',
        model: 'claude-3-5-sonnet',
        createdAt: '2026-07-16T06:30:00.000Z',
        messages: [
          {
            role: 'user',
            content: 'この動画の要点を教えて。',
          },
          {
            role: 'assistant',
            content: '要点は3つあります。',
            usage: { totalTokens: 150 }, // usage があるケース
          },
          {
            role: 'system',
            content: 'システム補正ログ',
          }
        ],
      } as ChatSession;

      const result = service.exportChat(mockVideo, mockSession);

      // 基本情報の検証
      expect(result).toContain('# リック・アストリーのダンス講座');
      expect(result).toContain('- Provider: Anthropic');
      expect(result).toContain('- Model: claude-3-5-sonnet');
      expect(result).toContain('- Created At: 2026-07-16T06:30:00.000Z');

      // チャット部分の検証（ロールタイトルのマッピング検証を兼ねる）
      expect(result).toContain('### User\n\nこの動画の要点を教えて。');
      expect(result).toContain('### Assistant\n\n要点は3つあります。');
      expect(result).toContain('### System\n\nシステム補正ログ');

      // Tokensの出力検証
      expect(result).toContain('- Tokens: 150'); // assistant の usage
    });

    it('メッセージにusageが含まれない場合、- Tokensの行が出力されないこと', () => {
      const mockSessionWithoutUsage = {
        provider: 'OpenAI',
        model: 'gpt-4o',
        createdAt: '2026-07-16T06:30:00.000Z',
        messages: [
          {
            role: 'user',
            content: 'こんにちは',
            // usage は undefined
          },
        ],
      } as unknown as ChatSession;

      const result = service.exportChat(mockVideo, mockSessionWithoutUsage);

      expect(result).toContain('### User\n\nこんにちは');
      expect(result).not.toContain('- Tokens:');
    });

    it('未知のroleが渡された場合、fallbackとしてrole文字列がそのまま見出しに使われること', () => {
      const mockSessionWithCustomRole = {
        provider: 'OpenAI',
        createdAt: '2026-07-16T06:30:00.000Z',
        messages: [
          {
            role: 'custom-agent', // 未知のロール
            content: 'エージェントの応答',
          },
        ],
      } as unknown as ChatSession;

      const result = service.exportChat(mockVideo, mockSessionWithCustomRole);

      expect(result).toContain('### custom-agent\n\nエージェントの応答');
    });
  });
});