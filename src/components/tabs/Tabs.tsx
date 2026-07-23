import { TabType } from '@/value-objects';
import { SummaryTab } from './SummaryTab';
import { TranscriptTab } from './TranscriptTab';
import { ChatTab } from './ChatTab';
import type { ChatSession, TranscriptData } from '@/models';
import { Tabs as ShadnuiTabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface TabsProps {
    activeTab: TabType;
    loading:boolean;
    loadingTab: TabType|null|undefined;
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
  loadingTab,
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
    <ShadnuiTabs 
      value={activeTab} 
      onValueChange={(val) => onTabChange(val as TabType)}
      className="w-full"
    >
      <TabsList>
        <TabsTrigger 
          value={TabType.Summary}      
        >要約</TabsTrigger>
        <TabsTrigger 
          value={TabType.Transcript}        
        >トランスクリプト</TabsTrigger>
        <TabsTrigger 
          value={TabType.Chat}    
        >チャット</TabsTrigger>
      </TabsList>
      <TabsContent value={TabType.Summary}>
          <SummaryTab markdown={summaryMarkdown} loading={loading && loadingTab === TabType.Summary} />
      </TabsContent>
      <TabsContent value={TabType.Transcript}>
          <TranscriptTab transcript={transcript} onSeek={onSeek} loading={loading && loadingTab === TabType.Transcript} />
      </TabsContent>
      <TabsContent value={TabType.Chat}>
          <ChatTab session={chatSession} onSend={onSendChat} loading={loading && loadingTab === TabType.Chat}  />
      </TabsContent>
    </ShadnuiTabs>
    </section>
  );
}