// src/components/common/CopyButton.tsx
import { useState } from 'react';
import { Button } from '../ui/button';

interface CopyButtonProps {
  onCopy: () => Promise<boolean>;
  className?: string;
}

export function CopyButton({ onCopy, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const success = await onCopy();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2秒後に元のアイコンに戻す
    }
  };

  return (

    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleClick}
      className={`
        p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white
        rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
        flex items-center gap-1 text-sm cursor-pointer
        ${className}
      `}
    >
      {copied ? (
        <>
          {/* チェックマークアイコン */}
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs text-green-500 font-medium">Copied</span>
        </>
      ) : (
        <>
          {/* コピー（クリップボード）アイコン */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </>
      )}
    </Button>    
  );
}