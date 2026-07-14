export interface SummaryTabProps {
  markdown: string;
}

export function SummaryTab({
  markdown,
}: SummaryTabProps) {
  return (
    <article

      className="
        h-full
        overflow-y-auto
        whitespace-pre-wrap
        p-4
      "    
    >

      <pre>
        {markdown}
      </pre>

    </article>
  );
}