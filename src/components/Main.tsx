import { useMemo } from 'react';
import { Header } from './layout/Header';
import { Footer } from './layout/Footer';
import { ControlPanel } from '@/components/controls/ControlPanel';
import { TokenInfo } from '@/components/controls/TokenInfo';
import { Tabs } from '@/components/tabs/Tabs';
import { aiFacade } from '@/app/container';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { useAppStore } from '@/stores';
import { providerOptions, ProviderType, SummaryType, summaryTypeOptions, TabType, type TokenUsage } from '@/value-objects';
import { toPlainText } from '@/utils';

export function Main() {
  const initialized = useAppStore(state => state.initialized);
  const error = useAppStore(state => state.error);
  const isYoutubePage = useAppStore(state => state.isYoutubePage);
  const loading = useAppStore(s => s.loading);
  const loadingTab = useAppStore(s => s.loadingTab);
  const settings = useAppStore(state => state.settings)!;
  const models = useAppStore(state => state.models);
  const currentVideo = useAppStore(state => state.currentVideo);
  const activeTab = useAppStore(state => state.activeTab);
  // const activeTab = 'transcript'; // summary" | "transcript" | "chat"

  const summary =
    currentVideo?.summaries.at(-1);
  const transcript =
    currentVideo?.transcript;
    console.log('currentVideo', currentVideo);
  const chatSession =
    currentVideo?.chatSessions.at(-1);

  const totalUsage:TokenUsage =  useMemo(() => {
    const total = {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,      
    }
    if(currentVideo && currentVideo.summaries.length > 0) {
      currentVideo.summaries.forEach(summary => {
        total.inputTokens += summary.usage?.inputTokens ?? 0;
        total.outputTokens += summary.usage?.outputTokens ?? 0;
        total.totalTokens += summary.usage?.totalTokens ?? 0;
      });
    }

    if(chatSession && chatSession?.messages.length > 0) {
      chatSession?.messages.forEach(message => {
        if(message.role === 'assistant') {
          total.inputTokens += message.usage?.inputTokens ?? 0;
          total.outputTokens += message.usage?.outputTokens ?? 0;
          total.totalTokens += message.usage?.totalTokens ?? 0;
        }
      });
    }

    return total;
  }, [chatSession, currentVideo])

  if (!initialized || !settings) {
    return (
      <LoadingOverlay
        loading={loading}
        message="初期化中..."
      />
    );
  }

  const modelOptions = models.map(model => ({
    value: model.id,
    label: model.name,
  }));


  const handleProviderChange = async (
      provider: ProviderType,
  ) => {
      await aiFacade.changeProvider(provider);
  };

  const handleModelChange = (
      model: string,
  ) => {
      aiFacade.changeModel(model);
  };
  const handleThinkingChange = (
      thinking: boolean,
  ) => {
      aiFacade.changeThinking(thinking);
  };
  const handleSummaryTypeChange = (
      summaryType: SummaryType,
  ) => {
      aiFacade.changeSummaryType(summaryType);
  };
  const handleSummarize = async () => {
    if (!currentVideo) {
      return;
    }
    // window.alert('handleSummarize')

    await aiFacade.summarize({
      summaryType: settings.summaryType,
      options: {
        provider: settings.provider,
        model: settings.model,
        thinking: settings.thinking,
      }
    });
  };

  const handleTabChange = (
      tab: TabType,
  ) => {
      aiFacade.setActiveTab(tab);
  };
  const handleSeek = (
      seconds: number,
  ) => {
    aiFacade.seek(seconds);
  };

  const handleSendChat = async (
      message: string,
  ) => {
      // console.log('chatSession', chatSession)
      if (!currentVideo) {
          return;
      }

      // if (!chatSession) {
      //     return;
      // }

      const session = await aiFacade.chat({
          chatSessionId: chatSession?.id,
          userMessage: message,
          options: {
              provider: settings.provider,
              model: settings.model,
              thinking: settings.thinking,
          },
      });
      console.log('session', session.chatSession)

  };  

  const handleDownload = () => {
    aiFacade.exportMarkdown();
  };
  const handleCopy = () => {
    return aiFacade.exportMarkdown(true);
  };



  // console.log('isYoutubePage', isYoutubePage);  
  console.log('chatSession', chatSession);  
  
  return (
    <div
      className="
        h-[600px]       /* ポップアップの最大高さを指定 */
        flex
        flex-col
        overflow-hidden /* 外側のスクロールバーを抑止 */
      "    
    >
      <Header 
        isYoutubePage={isYoutubePage}
        error={error}
        currentVideo={currentVideo}
      />
      {isYoutubePage && (
        <>
          <ControlPanel
              provider={settings.provider}
              providers={providerOptions}

              model={settings.model}
              models={modelOptions}

              thinking={settings.thinking}

              summaryType={settings.summaryType}
              summaryTypes={summaryTypeOptions}

              loading={loading}
              loadingTab={loadingTab}

              onProviderChange={handleProviderChange}
              onModelChange={handleModelChange}
              onThinkingChange={handleThinkingChange}
              onSummaryTypeChange={handleSummaryTypeChange}

              onSummarize={handleSummarize}
          />

          <TokenInfo
            inputTokens={
                totalUsage.inputTokens ?? 0
            }
            outputTokens={
                totalUsage.outputTokens ?? 0
            }
            totalTokens={
                totalUsage.totalTokens ?? 0
            }
            characterCount={
                transcript
                    ? toPlainText(transcript).length
                    : 0
            }
          />
          <div
            className="
              grow min-h-0 flex flex-col
            "
          >

            <Tabs
                activeTab={activeTab}
                loading={loading}
                loadingTab={loadingTab}
                summaryMarkdown={
                    summary?.content ?? ''
                }
                transcript={
                    transcript
                }
                chatSession={
                    chatSession
                }
                onTabChange={handleTabChange}
                onSeek={handleSeek}
                onSendChat={handleSendChat}
            />

          </div>
          <Footer 
            handleCopy={handleCopy}
            handleDownload={handleDownload}          
          />
        </>

      )}
    </div>
  );
}