import { Header } from './layout/Header';
import { Footer } from './layout/Footer';
import { ControlPanel } from '@/components/controls/ControlPanel';
import { TokenInfo } from '@/components/controls/TokenInfo';

import { Tabs } from '@/components/tabs/Tabs';

import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { useAppStore } from '@/stores';
import { aiFacade } from '@/app/container';
import { useEffect } from 'react';
import { providerOptions, ProviderType, SummaryType, summaryTypeOptions, TabType } from '@/value-objects';
import { toPlainText } from '@/utils';
import type { ChatSession, SummaryData } from '@/models';

export function App() {
  // const initialized = useAppStore(state => state.initialized);
  const isYoutubePage = useAppStore(state => state.isYoutubePage);
  // const loading = useAppStore(s => s.loading);
  const loading = false;
  // const settings = useAppStore(state => state.settings)!;
  // const models = useAppStore(state => state.models);
  // const currentVideo = useAppStore(state => state.currentVideo);
  // const activeTab = useAppStore(state => state.activeTab);
  const activeTab = 'transcript'; // summary" | "transcript" | "chat"

  useEffect(() => {
    async function initialize() {
      const response = await aiFacade.initialize();
      console.log('response', response);
    }
    initialize();
  }, []);

  // if (!initialized || !settings) {
  //   return (
  //     <LoadingOverlay
  //       loading={loading}
  //       message="初期化中..."
  //     />
  //   );
  // }
  const models = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-4-32k', name: 'GPT-4 32K' },
  ];

  const modelOptions = models.map(model => ({
    value: model.id,
    label: model.name,
  }));

  // const summary =
  //   currentVideo?.summaries.at(-1);
const summary: SummaryData = {
      id: crypto.randomUUID(),
      cacheKey: 'key 1',
      summaryType: 'Important',
      provider: 'OpenAI',
      model: 'GPT-4',
      thinking: true,
      content: 'this is content',
      promptVersion: '',
      usage: {
        inputTokens: 10,
        outputTokens: 1000,
        totalTokens : 100
      },
      createdAt: '2026-07-15T00:00:00',
    };
  // const transcript =
  //   currentVideo?.transcript;
  const transcript = {
    language: 'japanese',
    source: 'youtube',
    generatedAt: '2026-07-15T00:00:00',
    segments: [
      {
        startSeconds: 0,
        endSeconds: 10,
        text: 'Hello, world!',
      },
      {
        startSeconds: 10,
        endSeconds: 20,
        text: 'This is a test transcript segment.'
      }
    ]
  }
  // const chatSession =
  //   currentVideo?.chatSessions.at(-1);
  const chatSession:ChatSession = {
      id: crypto.randomUUID(),
      provider: 'OpenAI',
      model: 'GPT-4',
      messages: [
        {
          id: crypto.randomUUID(),
          role: 'user',
          content: 'What is the capital of France?',
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'The capital of France is Paris.',
          createdAt: new Date().toISOString(),
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  
  const settings = {
    provider: ProviderType.OpenAI,
    model: 'gpt-4',
    thinking: false,
    summaryType: SummaryType.Important,
    summaryMarkdown: '# This is summary',
    transcript: transcript,
  };


  const handleProviderChange = async (
      provider: ProviderType,
  ) => {
      // await aiFacade.changeProvider(provider);
  };

  const handleModelChange = (
      model: string,
  ) => {
      // aiFacade.changeModel(model);
  };
  const handleThinkingChange = (
      thinking: boolean,
  ) => {
      // aiFacade.changeThinking(thinking);
  };
  const handleSummaryTypeChange = (
      summaryType: SummaryType,
  ) => {
      // aiFacade.changeSummaryType(summaryType);
  };
  const handleSummarize = async () => {
    window.alert('handleSummarize')
    // if (!currentVideo) {
    //     return;
    // }

    // await aiFacade.summarize({
    //   summaryType: settings.summaryType,
    //   options: {
    //     provider: settings.provider,
    //     model: settings.model,
    //     thinking: settings.thinking,
    //   }
    // });
  };

  const handleTabChange = (
      tab: TabType,
  ) => {
      // aiFacade.setActiveTab(tab);
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

      // if (!currentVideo) {
      //     return;
      // }

      // if (!chatSession) {
      //     return;
      // }

      // await aiFacade.chat({
      //     chatSessionId: chatSession.id,
      //     userMessage: message,
      //     options: {
      //         provider: settings.provider,
      //         model: settings.model,
      //         thinking: settings.thinking,
      //     },
      // });

  };  


  console.log('isYoutubePage', isYoutubePage);  
  
  return (
    <div
      className="     
        min-h-screen
        flex
        flex-col
      "    
    >
      <Header 
        isYoutubePage={isYoutubePage}
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
          <div
            className="
              flex
              grow
              flex-col
              overflow-hidden
            "
          >

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

          </div>
          <Footer />
        </>

      )}

      <LoadingOverlay loading={loading} />
    </div>
  );
}