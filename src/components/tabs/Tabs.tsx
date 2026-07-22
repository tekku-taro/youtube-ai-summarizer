import { TabType } from '@/value-objects';
import { SummaryTab } from './SummaryTab';
import { TranscriptTab } from './TranscriptTab';
import { ChatTab } from './ChatTab';
import type { ChatSession, TranscriptData } from '@/models';
import { Tabs as ShadnuiTabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
        h-full
        py-2
        px-4
      "    
    >
    <ShadnuiTabs defaultValue={activeTab} className="w-full">
      <TabsList>
        <TabsTrigger 
          value={TabType.Summary}
          onClick={() => onTabChange(TabType.Summary)}        
        >要約</TabsTrigger>
        <TabsTrigger 
          value={TabType.Transcript}
          onClick={() => onTabChange(TabType.Transcript)}        
        >トランスクリプト</TabsTrigger>
        <TabsTrigger 
          value={TabType.Chat}
          onClick={() => onTabChange(TabType.Chat)}        
        >チャット</TabsTrigger>
      </TabsList>
      <TabsContent value={TabType.Summary}>
          <SummaryTab markdown={summaryMarkdown} />
      </TabsContent>
      <TabsContent value={TabType.Transcript}>
          <TranscriptTab transcript={transcript} onSeek={onSeek} />
      </TabsContent>
      <TabsContent value={TabType.Chat}>
          <ChatTab session={chatSession} onSend={onSendChat} loading={loading}  />
      </TabsContent>
    </ShadnuiTabs>
    </section>
  );
}