import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface SummaryTabProps {
  markdown: string;
}

export function SummaryTab({
  markdown,
}: SummaryTabProps) {
  return (
    <article
      className="
        h-[230px]
        overflow-y-auto
        p-4
        max-w-full
      "
    >

      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdown}
      </ReactMarkdown>

    </article>
  );
}