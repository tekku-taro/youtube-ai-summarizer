import type { ChatMessage } from '@/models/ChatMessage';
import type{ IPromptService } from '@/services/IPromptService';

import { SummaryType } from '@/value-objects/SummaryType';

import {
  buildChatSystemPrompt,
  buildSummarySystemPrompt,
} from '@/prompts';
import type { AIMessage } from '@/value-objects';

export class PromptService implements IPromptService {

  /**
   * 要約生成用メッセージを生成する。
   */
  createSummaryMessages(
    transcript: string,
    summaryType: SummaryType,
  ): AIMessage[] {

    return [
      {
        role: 'system',
        content: buildSummarySystemPrompt(summaryType),
      },
      {
        role: 'user',
        content: transcript,
      },
    ];
  }

  /**
   * AIチャット用メッセージを生成する。
   */
  createChatMessages(
    transcript: string,
    history: ChatMessage[],
    userPrompt: string,
  ): AIMessage[] {

    const messages: AIMessage[] = [];

    messages.push({
      role: 'system',
      content: buildChatSystemPrompt(),
    });

    messages.push({
      role: 'user',
      content: transcript,
    });

    for (const message of history) {
      messages.push({
        role: message.role,
        content: message.content,
      });
    }

    messages.push({
      role: 'user',
      content: userPrompt,
    });

    return messages;
  }

}