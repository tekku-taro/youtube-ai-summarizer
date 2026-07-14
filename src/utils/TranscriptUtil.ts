import type { TranscriptData } from "@/models";

export function toPlainText(
  transcript: TranscriptData,
): string {
  return transcript.segments.map(segment => segment.text).join('\n');
}