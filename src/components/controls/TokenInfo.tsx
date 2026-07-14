export interface TokenInfoProps {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  characterCount: number;
}

export function TokenInfo({ inputTokens, outputTokens, totalTokens, characterCount }: TokenInfoProps) {
  return (
    <section
      className="
        token-info
        flex
        justify-between
        border-b
        px-4
        py-2
        text-sm
        text-gray-500
      "    
    >

      <span>
        入力トークン : {inputTokens}
      </span>

      <span>
        出力トークン : {outputTokens}
      </span>

      <span>
        全トークン : {totalTokens}
      </span>

      <span>
        文字数 : {characterCount}
      </span>

    </section>
  );
}