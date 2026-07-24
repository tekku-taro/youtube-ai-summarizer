import type { ChatMessage, ChatSession } from '@/models';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '../common/markdownComponents';
import { useSmoothedText } from '@/hooks/useSmoothedText';
// import { Button } from '../ui/button';

export interface ChatTabProps {
  session?: ChatSession|undefined;
  messages: ChatMessage[]|undefined;
  loading?: boolean;
  onSend(message: string): void;
}

export function ChatTab({
  session,
  messages,
  loading = false,
  onSend,
}: ChatTabProps) {
  const [message, setMessage] = useState('');
  const targetMessageRef = useRef<HTMLDivElement>(null);
  
  const lastMessage: ChatMessage | undefined = messages?.[messages.length - 1];
  const lastMessageContent = lastMessage?.content;

  const displayedMarkdown = useSmoothedText(lastMessageContent ?? '', loading, {
    charsPerSecond: 40,
  });  

  useEffect(() => {
    if(loading || (lastMessageContent && displayedMarkdown.length < lastMessageContent.length)) {
      targetMessageRef.current?.scrollIntoView({
        behavior: 'smooth', // なめらかにスクロール（即時移動したい場合は 'auto'）
        block: 'start',     // 該当要素の「上端」がコンテナ内に表示される位置へ
      });
    }
  }, [displayedMarkdown.length, lastMessageContent, loading]);


  const handleSend = () => {
    const text = message.trim();

    if (!text || loading) {
      return;
    }

    onSend(text);
    setMessage('');
  };

  console.log('ChatTab session', session);
  return (
    <section 
      className="
        flex 
        h-[253px]
        sm:h-[333px]
        flex-col"
    >
      <div 
        className="flex-1 min-h-0 space-y-4  overflow-y-auto p-4"
      >
        {messages?.map((chat, index) => {
          const isLastMessage = index === messages.length - 1;
          const isAssistantStreaming = loading && isLastMessage && chat.role === 'assistant';
          const displayingStreaming = isLastMessage && chat.role === 'assistant' && (lastMessageContent && displayedMarkdown.length < lastMessageContent.length);


          return (
          <article
            key={chat.id}
            className="rounded border p-3"
          >
            <div className="mb-2 text-sm font-semibold">
              {chat.role === 'user' ? 'あなた' : 'AI'}
            </div>

            {/* アシスタントメッセージで、まだテキストが届いていない最初の数ミリ秒だけタイピングを表示 */}
            {isAssistantStreaming && !chat.content ? (
              <div className="flex gap-1 py-1">
                {[0, 150, 300].map(delay => (
                  <span
                    key={delay}
                    className="h-1 w-1 rounded-full bg-gray-700 animate-typing"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            ) : (
              <div className="relative">
                <ReactMarkdown          
                  components={markdownComponents}
                  remarkPlugins={[remarkGfm]}
                >
                  {(isAssistantStreaming || displayingStreaming) ? displayedMarkdown : chat.content}
                </ReactMarkdown>

                {/* ストリーミング中のカーソルインジケーター */}
                {(isAssistantStreaming || displayingStreaming) && (
                  <span 
                    className="inline-block w-2 h-4 ml-1 mt-0 bg-blue-500 animate-pulse align-middle"                
                  />
                )}
              </div>
            )}
          </article>
          );
        })}
        {/* ストリーミング中、常にここ（最下部・カーソル直下）へスクロールさせるための要素 */}
        <div ref={targetMessageRef} className="h-0 w-0" />
      </div>

      <div className="shrink-0 space-y-1 border-t pt-2">
        <textarea
          className="min-h-10 w-full rounded border p-2"
          placeholder="動画について質問してください"
          value={message}
          disabled={loading}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => {
            if (
              e.key === 'Enter' &&
              !e.shiftKey
            ) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        {/* <div className="flex justify-end">
          <Button
            variant="info"
            size="sm"
            type="button"
            disabled={loading || message.trim() === ''}
            onClick={handleSend}
          >
            {loading ? '送信中...' : '送信'}
          </Button>
        </div> */}
      </div>
    </section>
  );
}