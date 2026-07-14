import { TabType } from '@/value-objects';
import { SummaryTab } from './SummaryTab';
import { TranscriptTab } from './TranscriptTab';
import { ChatTab } from './ChatTab';
import { TabButton } from './TabButton';
import type { ChatSession, TranscriptData } from '@/models';

export interface TabsProps {
    activeTab: TabType;
    loading:boolean;
    summaryMarkdown: string;
    transcript?: TranscriptData|undefined;
    chatSession?: ChatSession|undefined;
    onTabChange(tab: TabType): void;
    onSeek(seconds: number): void;
    onSendChat(message: string): void;
}



export function Tabs({
  activeTab,
  loading,
  summaryMarkdown,
  transcript,
  chatSession,
  onTabChange,
  onSeek,
  onSendChat  
}: TabsProps) {
  return (
    <section 
      className="
        flex
        h-full
        flex-col
      "    
    >

      <div

        className="
          flex
          border-b
        "      
      >

        <TabButton
          tab={TabType.Summary}
          active={activeTab === TabType.Summary}
          onClick={onTabChange}
        >
          Summary
        </TabButton>

        <TabButton
          tab={TabType.Transcript}
          active={activeTab === TabType.Transcript}
          onClick={onTabChange}
        >
          Transcript
        </TabButton>

        <TabButton
          tab={TabType.Chat}
          active={activeTab === TabType.Chat}
          onClick={onTabChange}
        >
          Chat
        </TabButton>

      </div>

      <div
        className="
          flex-1
          overflow-hidden
        "      
      >

        <div hidden={activeTab !== TabType.Summary}>
          <SummaryTab markdown={summaryMarkdown} />
        </div>

        <div hidden={activeTab !== TabType.Transcript}>
          <TranscriptTab transcript={transcript} onSeek={onSeek} />
        </div>

        <div hidden={activeTab !== TabType.Chat}>
          <ChatTab session={chatSession} onSend={onSendChat} loading={loading}  />
        </div>

      </div>

    </section>
  );
}