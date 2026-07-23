import { TabType } from "@/value-objects";
import { Button } from "../ui/button";

export interface SummaryButtonProps {
  loading?: boolean;
  loadingTab?:TabType|null|undefined;
  disabled?: boolean;
  onClick(): void;
}

export function SummaryButton({ loading, loadingTab, disabled, onClick }: SummaryButtonProps) {
  return (
    <div className="summary-button">

      <Button variant="default" type="button" disabled={disabled} onClick={onClick}
        className="cursor-pointer"
      >
        {loading && loadingTab === TabType.Summary ? '要約中...' : '要約実行'}
      </Button>

    </div>
  );
}