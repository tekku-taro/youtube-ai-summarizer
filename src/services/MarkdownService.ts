import type { ChatSession } from '@/models/ChatSession';
import type { SummaryData } from '@/models/SummaryData';
import type { VideoData } from '@/models/VideoData';

export class MarkdownService {
  /**
   * 要約をMarkdownへ変換する。
   */
  public exportSummary(
    video: VideoData,
    summary: SummaryData,
  ): string {
    const lines: string[] = [];

    lines.push(`# ${video.title}`);
    lines.push('');

    lines.push(`https://www.youtube.com/watch?v=${video.videoId}`);
    lines.push('');

    lines.push('---');
    lines.push('');

    lines.push('## 動画情報');
    lines.push('');
    lines.push(`- Channel: ${video.channelTitle}`);
    lines.push(`- Duration: ${video.duration} sec`);
    lines.push('');

    lines.push('## AI生成情報');
    lines.push('');
    lines.push(`- Provider: ${summary.provider}`);
    lines.push(`- Model: ${summary.model}`);
    lines.push(`- Summary Type: ${summary.summaryType}`);
    lines.push(`- Thinking: ${summary.thinking ? 'ON' : 'OFF'}`);
    lines.push(`- Prompt Version: ${summary.promptVersion}`);
    lines.push(`- Generated At: ${summary.createdAt}`);
    lines.push('');

    lines.push('### Token Usage');
    lines.push('');
    lines.push(`- Input: ${summary.usage.inputTokens}`);
    lines.push(`- Output: ${summary.usage.outputTokens}`);
    lines.push(`- Total: ${summary.usage.totalTokens}`);
    lines.push('');

    lines.push('---');
    lines.push('');

    lines.push('## 要約');
    lines.push('');

    lines.push(summary.content);

    lines.push('');

    return lines.join('\n');
  }

  /**
   * チャット履歴をMarkdownへ変換する。
   */
  public exportChat(
    video: VideoData,
    session: ChatSession,
  ): string {
    const lines: string[] = [];

    lines.push(`# ${video.title}`);
    lines.push('');

    lines.push(`https://www.youtube.com/watch?v=${video.videoId}`);
    lines.push('');

    lines.push('---');
    lines.push('');

    lines.push('## 動画情報');
    lines.push('');
    lines.push(`- Channel: ${video.channelTitle}`);
    lines.push(`- Duration: ${video.duration} sec`);
    lines.push('');

    lines.push('## AI生成情報');
    lines.push('');
    lines.push(`- Provider: ${session.provider}`);
    lines.push(`- Model: ${session.model}`);
    lines.push(`- Created At: ${session.createdAt}`);
    lines.push('');

    lines.push('---');
    lines.push('');

    lines.push('## Chat');
    lines.push('');

    for (const message of session.messages) {
      lines.push(`### ${this.getRoleTitle(message.role)}`);
      lines.push('');

      lines.push(message.content);
      lines.push('');

      if (message.usage) {
        lines.push(`- Tokens: ${message.usage.totalTokens}`);
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  private getRoleTitle(role: ChatSession['messages'][number]['role']): string {
    switch (role) {
      case 'user':
        return 'User';

      case 'assistant':
        return 'Assistant';

      case 'system':
        return 'System';

      default:
        return role;
    }
  }
}