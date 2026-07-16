import { Button } from "../ui/button";

export interface SummaryButtonProps {
  loading?: boolean;
  disabled?: boolean;
  onClick(): void;
}

export function SummaryButton({ loading, disabled, onClick }: SummaryButtonProps) {
  return (
    <div className="summary-button">

      <Button variant="default" type="button" disabled={disabled} onClick={onClick}
        className="cursor-pointer"
      >
        {loading ? '要約中...' : '要約実行'}
      </Button>

    </div>
  );
}