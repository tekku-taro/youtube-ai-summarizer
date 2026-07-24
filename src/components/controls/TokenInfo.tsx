import { useIsMobile } from "@/hooks/useIsMobile";

export interface TokenInfoProps {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  characterCount: number;
}

export function TokenInfo({ inputTokens, outputTokens, totalTokens, characterCount }: TokenInfoProps) {
  console.log('characterCount', characterCount);
  const isMobile = useIsMobile();
  return (
    <section
      className="
        flex
        justify-between
        border-b
        px-4
        py-2
        text-sm
        text-gray-500
      "    
    >
      {isMobile ? (
        <>
          <span>
            入力: {inputTokens}
          </span>
    
          <span>
            出力: {outputTokens}
          </span>
    
          <span>
            全: {totalTokens}
          </span>    
          {/* <span>
            トランスクリプト文字数 : {characterCount}
          </span> */}        
        </>
      ):(
        <>
          <span>
            入力トークン : {inputTokens}
          </span>
    
          <span>
            出力トークン : {outputTokens}
          </span>
    
          <span>
            全トークン : {totalTokens}
          </span>
    
          {/* <span>
            トランスクリプト文字数 : {characterCount}
          </span> */}
        </>

      )}
      

    </section>
  );
}