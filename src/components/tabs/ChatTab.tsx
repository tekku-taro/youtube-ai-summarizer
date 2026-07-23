import type { ChatSession } from '@/models';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '../common/markdownComponents';
// import { Button } from '../ui/button';

export interface ChatTabProps {
  session?: ChatSession|undefined;
  loading?: boolean;
  onSend(message: string): void;
}

export function ChatTab({
  session,
  loading = false,
  onSend,
}: ChatTabProps) {
  const [message, setMessage] = useState('');
  const [userTempMessage, setUserTempMessage] = useState('');
  const targetMessageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    targetMessageRef.current?.scrollIntoView({
      behavior: 'smooth', // なめらかにスクロール（即時移動したい場合は 'auto'）
      block: 'start',     // 該当要素の「上端」がコンテナ内に表示される位置へ
    });
  }, [session?.messages, loading]);

  const messages = session?.messages ?? [];

  const handleSend = () => {
    const text = message.trim();

    if (!text || loading) {
      return;
    }

    onSend(text);
    setUserTempMessage(text);
    setMessage('');
  };

  console.log('ChatTab session', session);
  return (
    <section className="flex h-[220px] sm:h-[300px] flex-col">
      <div 
        className="grow space-y-4  overflow-y-auto p-4"
      >
        {messages.map((chat, index) => {
          // loading 中ではなく、かつ「最後のメッセージ」である場合に Ref を付与
          const isLastMessage = !loading && index === messages.length - 1;

          return (
          <article
            key={chat.id}
            ref={isLastMessage ? targetMessageRef : null}
            className="rounded border p-3"
          >
            <div className="mb-2 text-sm font-semibold">
              {chat.role === 'user' ? 'あなた' : 'AI'}
            </div>

            <ReactMarkdown            
              components={markdownComponents}
              remarkPlugins={[remarkGfm]}
            >
              {chat.content}
            </ReactMarkdown>
          </article>
          );
        })}
        {loading && (
          <>
            <article
              ref={targetMessageRef}
              className="rounded border p-3"
            >
              <div className="mb-2 text-sm font-semibold">
                あなた
              </div>

              <ReactMarkdown            
                components={markdownComponents}
                remarkPlugins={[remarkGfm]}
              >
                {userTempMessage}
              </ReactMarkdown>
            </article>

            <article
              className="rounded border p-3"
            >
              <div className="mb-2 text-sm font-semibold">
                AI
              </div>
              <div className="flex gap-1">
                {[0, 150, 300].map(delay => (
                  <span
                    key={delay}
                    className="h-1 w-1 rounded-full bg-gray-700 animate-typing"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </article>
          </>
        )}
      </div>

      <div className="flex-1 space-y-1 border-t pt-2">
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