import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '../common/markdownComponents';
import { Loading } from '../common/Loading';

export interface SummaryTabProps {
  markdown: string;
  loading: boolean;
}

export function SummaryTab({
  markdown,
  loading,
}: SummaryTabProps) {
  return (
    <article
      className="
        h-[220px]
        sm:h-[300px]
        overflow-y-auto
        p-4
        max-w-full
      "
    >

      {loading ? (        
        <Loading message='AIが要約を生成中...' loading={loading} />  
      ):(
        <ReactMarkdown
          components={markdownComponents}
          remarkPlugins={[remarkGfm]}
        >
          {markdown}
        </ReactMarkdown>
      )}

    </article>
  );
}