import type { TranscriptSegment } from '@/value-objects';

interface MergeOptions {
  /** 最小時間（秒）。この時間を超えるまではできるだけ結合する（デフォルト: 10秒） */
  minGroupDurationSec?: number;
  /** 最大時間（秒）。この時間を超えたら強制的に区切る（デフォルト: 20秒） */
  maxGroupDurationSec?: number;
  /** 最大文字数。これを超えたら区切る（デフォルト: 150文字） */
  maxCharLength?: number;
}

/**
 * 細切れの TranscriptSegment を一定の長さ・区切りにグループ化（結合）する。
 */
export function mergeTranscriptSegments(
  segments: TranscriptSegment[],
  options: MergeOptions = {}
): TranscriptSegment[] {
  if (segments.length === 0) return [];

  const {
    minGroupDurationSec = 10,
    maxGroupDurationSec = 20,
    maxCharLength = 150,
  } = options;

  const mergedSegments: TranscriptSegment[] = [];

  let currentStart = segments[0]!.startSeconds;
  let currentEnd = segments[0]!.endSeconds;
  let currentTextParts: string[] = [segments[0]!.text];

  for (let i = 1; i < segments.length; i++) {
    const item = segments[i];
    if(!item) continue;
    const currentDuration = item.endSeconds - currentStart;
    const combinedText = currentTextParts.join(' ');
    const lastChar = combinedText.trim().slice(-1);

    // 文末の句読点チェック
    const isPunctuationEnd = /[。！？!?.]/.test(lastChar);

    // 区切るべき条件の判定
    const shouldSplit =
      // 条件1: 最大時間または最大文字数を超えた場合（強制区切り）
      currentDuration >= maxGroupDurationSec ||
      combinedText.length >= maxCharLength ||
      // 条件2: 最小時間を超えており、かつ文末っぽい場合
      (currentDuration >= minGroupDurationSec && isPunctuationEnd);

    if (shouldSplit) {
      // 現在のグループを確定
      mergedSegments.push({
        startSeconds: currentStart,
        endSeconds: currentEnd,
        text: combinedText.trim(),
      });

      // 新しいグループを開始
      currentStart = item.startSeconds;
      currentEnd = item.endSeconds;
      currentTextParts = [item.text];
    } else {
      // グループに継続して追加
      currentEnd = item.endSeconds;
      currentTextParts.push(item.text);
    }
  }

  // 残りの要素を確定
  if (currentTextParts.length > 0) {
    mergedSegments.push({
      startSeconds: currentStart,
      endSeconds: currentEnd,
      text: currentTextParts.join(' ').trim(),
    });
  }

  return mergedSegments;
}