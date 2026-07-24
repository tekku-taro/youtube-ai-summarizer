import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '../common/markdownComponents';
import { Loading } from '../common/Loading';
import { useEffect, useRef } from 'react';
import { useSmoothedText } from '@/hooks/useSmoothedText';

export interface SummaryTabProps {
  markdown: string;
  loading: boolean;
}

export function SummaryTab({
  markdown,
  loading,
}: SummaryTabProps) {
  const isInitialLoading = loading && !markdown;
  const displayedMarkdown = useSmoothedText(markdown, loading, {
    charsPerSecond: 40,
  });

  const cursorAnchorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (loading || displayedMarkdown.length < markdown.length) {
      cursorAnchorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [displayedMarkdown, loading, markdown.length]);

  return (
    <article
      className="
        h-[253px]
        sm:h-[333px]
        overflow-y-auto
        p-4
        max-w-full
      "
    >

      {isInitialLoading ? (        
        <Loading message='AIが要約を生成中...' loading={loading} />  
      ):(
        <div className="relative">
          <ReactMarkdown
            components={markdownComponents}
            remarkPlugins={[remarkGfm]}
          >
            {(loading || displayedMarkdown.length < markdown.length) ? displayedMarkdown : markdown}
          </ReactMarkdown>

          {/* テキスト生成中（ストリーミング中）であることを示すカーソル/インジケーター */}
          {(loading || displayedMarkdown.length < markdown.length) && (
            <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse align-middle" />
          )}
        </div>
      )}
      <div ref={cursorAnchorRef} className="h-0 w-0" />

    </article>
  );
}