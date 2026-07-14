import { ControlPanel } from '@/components/controls/ControlPanel';
import { TokenInfo } from '@/components/controls/TokenInfo';

import { Tabs } from '@/components/tabs/Tabs';

import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { Header } from './layout/Header';
import { Footer } from './layout/Footer';
import { useAppStore } from '@/stores';
import { aiFacade } from '@/app/container';
import { useEffect } from 'react';
import { providerOptions, ProviderType, SummaryType, summaryTypeOptions, TabType } from '@/value-objects';
import { toPlainText } from '@/utils';

export function App() {
  const initialized = useAppStore(state => state.initialized);
  const loading = useAppStore(s => s.loading);
  const settings = useAppStore(state => state.settings)!;
  const models = useAppStore(state => state.models);
  const currentVideo = useAppStore(state => state.currentVideo);
  const activeTab = useAppStore(state => state.activeTab);

  useEffect(() => {
    aiFacade.initialize();
  }, []);

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

  const summary =
    currentVideo?.summaries.at(-1);

  const transcript =
    currentVideo?.transcript;

  const chatSession =
    currentVideo?.chatSessions.at(-1);




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
      const url =
          new URL(window.location.href);

      url.searchParams.set(
          't',
          String(seconds),
      );

      window.location.href =
          url.toString();
  };

  const handleSendChat = async (
      message: string,
  ) => {

      if (!currentVideo) {
          return;
      }

      if (!chatSession) {
          return;
      }

      await aiFacade.chat({
          chatSessionId: chatSession.id,
          userMessage: message,
          options: {
              provider: settings.provider,
              model: settings.model,
              thinking: settings.thinking,
          },
      });

  };  
  return (
    <div
      className="
        app 
        flex
        h-screen
        flex-col
      "    
    >
      <Header />

      <div
        className="
          flex
          flex-1
          flex-col
          overflow-hidden
        "
      >
        <ControlPanel
            provider={settings.provider}
            providers={providerOptions}

            model={settings.model}
            models={modelOptions}

            thinking={settings.thinking}

            summaryType={settings.summaryType}
            summaryTypes={summaryTypeOptions}

            loading={loading}

            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
            onThinkingChange={handleThinkingChange}
            onSummaryTypeChange={handleSummaryTypeChange}

            onSummarize={handleSummarize}
        />

        <TokenInfo
          inputTokens={
              summary?.usage.inputTokens ?? 0
          }
          outputTokens={
              summary?.usage.outputTokens ?? 0
          }
          totalTokens={
              summary?.usage.totalTokens ?? 0
          }
          characterCount={
              transcript
                  ? toPlainText(transcript).length
                  : 0
          }
        />

        <div className="flex-1 overflow-hidden">
          <Tabs
              activeTab={activeTab}
              loading={loading}
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

        <Footer />
      </div>

      <LoadingOverlay loading={loading} />
    </div>
  );
}