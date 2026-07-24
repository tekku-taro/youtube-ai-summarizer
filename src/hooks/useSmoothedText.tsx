// hooks/useSmoothedText.ts
import { useEffect, useRef, useState } from 'react';

interface UseSmoothedTextOptions {
  /** 1秒あたりに表示する文字数（デフォルト: 30文字/秒） */
  charsPerSecond?: number;
}

export function useSmoothedText(
  rawText: string,
  isStreaming: boolean,
  options: UseSmoothedTextOptions = {},
) {
  const { charsPerSecond = 30 } = options;
  const [displayedText, setDisplayedText] = useState('');

  // 最新の送られてきた全体テキストを保持する Ref
  const targetTextRef = useRef(rawText);
  useEffect(() => {
    targetTextRef.current = rawText;
  }, [rawText]);


  // タイマーの参照
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // タイマーの間隔を計算 (例: 30文字/秒 ＝ 約 33.3ms ごとに 1 文字表示)
    const intervalMs = Math.max(10, Math.floor(1000 / charsPerSecond));

    if(isStreaming) {
      timerRef.current = setInterval(() => {
        setDisplayedText((currentDisplayed) => {
          const targetText = targetTextRef.current;
  
          // すでに目標の文字数に追いついている場合
          if (currentDisplayed.length >= targetText.length) {
            // ストリーミングが完全に終了していたらタイマーをクリア
            if (!isStreaming && timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return currentDisplayed;
          }
  
          // 追従遅延（ラグ）対策：
          // 通信が大きく遅れてターゲットテキストが極端に溜まりすぎている場合は、
          // 追いつくために1回あたりの取り出し文字数を一時的に増やす（動的スピード調整）
          // const lag = targetText.length - currentDisplayed.length;
          // const step = lag > 50 ? 3 : 1; // 50文字以上遅れていたら3文字ずつ進める
  
          return targetText.slice(0, currentDisplayed.length + 1);
        });
      }, intervalMs);
    } else{
      setTimeout(() => {
        setDisplayedText((currentDisplayed) => {
          const targetText = targetTextRef.current;
          if(targetText.length > 0 && currentDisplayed.length === 0) {
            return targetText;
          }
          return currentDisplayed;
        });
      }, intervalMs)
    }

    return () => {
      if (timerRef.current && !rawText) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charsPerSecond, isStreaming]);

  // ストリーミングがリセットされた場合や初期化時のハンドリング
  useEffect(() => {
    if (!rawText) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayedText('');
    }
  }, [rawText]);

  return displayedText;
}