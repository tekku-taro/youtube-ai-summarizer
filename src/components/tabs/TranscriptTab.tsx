import type { TranscriptData } from '@/models';

export interface TranscriptTabProps {
  transcript?: TranscriptData | undefined;

  onSeek?(seconds: number): void;
}

export function TranscriptTab({
  transcript,
  onSeek,
}: TranscriptTabProps) {
  return (
    <section 
      className="
        h-full
        overflow-y-auto
        p-4
        space-y-4
      "    
    >

      {transcript && transcript.segments.map(segment => (
        <article
          key={segment.startSeconds}
          className="segment"
        >
          <button
            type="button"
            onClick={() => onSeek?.(segment.startSeconds)}
          >
            {segment.startSeconds.toFixed(2)}s - {segment.endSeconds.toFixed(2)}s
          </button>

          <p>
            {segment.text}
          </p>

          <hr />
        </article>
      ))}

    </section>
  );
}