import { formatTime } from '@/lib/utils';
import type { TranscriptData } from '@/models';
import { Button } from '../ui/button';
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
  return (
    <section 
      className="
        h-[220px]
        sm:h-[300px]
        overflow-y-scroll
        p-4
        space-y-4
      "    
    >

      {loading && !transcript ? (
        <Loading message='動画のトランスクリプトを取得中' loading={loading} />       
      ):(
        <>
          {transcript && transcript.segments.map(segment => (
            <article
              key={segment.startSeconds}
              className="segment"
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSeek?.(segment.startSeconds)}
              >
                {formatTime(segment.startSeconds)}
              </Button>
    
              <p>
                {segment.text}
              </p>
    
              <hr />
            </article>
          ))}
        </>
      )}


    </section>
  );
}