import { DownloadIcon } from "lucide-react";
import { CopyButton } from "../common/CopyButton";
import { Button } from "../ui/button";

export function Footer({
  handleCopy,
  handleDownload  
}:{
  handleCopy: () => Promise<boolean>;
  handleDownload:() => void;
}) {
  return (
    <footer
      className="
        bg-white
        z-30
        flex
        justify-between
        border-t
        px-4
        py-2
        sticky
      "    
    >
      {/* コピーボタン */}
      <CopyButton onCopy={handleCopy} />

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="cursor-pointer"
        title="Markdownファイルをダウンロード"
        onClick={handleDownload}
      >
        <DownloadIcon className="w-4 h-4" />
      </Button>

    </footer>
  );
}