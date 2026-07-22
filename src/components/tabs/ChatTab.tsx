import type { ChatSession } from '@/models';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
    <section className="flex max-h-[230px] flex-col">
      <div className="grow space-y-4  overflow-y-auto p-4">
        {session?.messages.map(chat => (
          <article
            key={chat.id}
            className="rounded border p-3"
          >
            <div className="mb-2 text-sm font-semibold">
              {chat.role === 'user' ? 'あなた' : 'AI'}
            </div>

            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {chat.content}
            </ReactMarkdown>
          </article>
        ))}
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