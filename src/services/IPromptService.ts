import type { ChatMessage } from "@/models";
import type { AIMessage, SummaryType } from "@/value-objects";

export interface IPromptService {
  createSummaryMessages(
    transcript: string,
    summaryType: SummaryType,    
  ): AIMessage[];
  createChatMessages(
    transcript: string,
    history: ChatMessage[],
    userPrompt: string
  ): AIMessage[];
}