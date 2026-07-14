import type { ChatSession } from '@/models';
import { useState } from 'react';

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

  return (
    <section className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {session?.messages.map(chat => (
          <article
            key={chat.id}
            className="rounded border p-3"
          >
            <div className="mb-2 text-sm font-semibold">
              {chat.role === 'user' ? 'あなた' : 'AI'}
            </div>

            <div className="whitespace-pre-wrap">
              {chat.content}
            </div>
          </article>
        ))}
      </div>

      <div className="space-y-2 border-t p-4">
        <textarea
          className="min-h-24 w-full rounded border p-2"
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

        <div className="flex justify-end">
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={loading || message.trim() === ''}
            onClick={handleSend}
          >
            {loading ? '送信中...' : '送信'}
          </button>
        </div>
      </div>
    </section>
  );
}