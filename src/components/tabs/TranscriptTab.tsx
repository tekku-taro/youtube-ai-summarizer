import { useState, useEffect, useMemo } from 'react';
import { formatTime } from '@/lib/utils';
import type { TranscriptData } from '@/models';
import { Button } from '../ui/button';
import { Input } from '../ui/input'; // shadcn/ui の Input コンポーネントを想定
import { Loading } from '../common/Loading';

export interface TranscriptTabProps {
  transcript?: TranscriptData | undefined;
  loading: boolean;
  onSeek?(seconds: number): void;
}

export function TranscriptTab({
  transcript,
  loading,
  onSeek,
}: TranscriptTabProps) {
  // 入力フォーム用の即時反映 State
  const [searchQuery, setSearchQuery] = useState('');
  // フィルタリングに使用する Debounce 後の State
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 300ms の debounce 処理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // debouncedQuery に基づいてセグメントを抽出（大文字小文字を区別しない）
  const filteredSegments = useMemo(() => {
    if (!transcript) return [];
    if (!debouncedQuery.trim()) return transcript.segments;

    const query = debouncedQuery.toLowerCase();
    return transcript.segments.filter((segment) =>
      segment.text.toLowerCase().includes(query)
    );
  }, [transcript, debouncedQuery]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* 検索入力欄（上部に固定） */}
      <div className="px-4 pt-2">
        <Input
          type="search"
          placeholder="トランスクリプトを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-7 py-1 text-sm"
        />
      </div>

      {/* リスト表示エリア（スクロール可能） */}
      <section className="h-[205px] sm:h-[285px] overflow-y-scroll p-4 space-y-4">
        {loading && !transcript ? (
          <Loading message="動画のトランスクリプトを取得中" loading={loading} />
        ) : filteredSegments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {searchQuery ? '該当するテキストが見つかりません' : 'データがありません'}
          </p>
        ) : (
          filteredSegments.map((segment) => (
            <article key={segment.startSeconds} className="segment">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSeek?.(segment.startSeconds)}
              >
                {formatTime(segment.startSeconds)}
              </Button>

              <p className="mt-1">{segment.text}</p>

              <hr className="my-2" />
            </article>
          ))
        )}
      </section>
    </div>
  );
}