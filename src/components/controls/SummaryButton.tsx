export interface SummaryButtonProps {
  loading?: boolean;
  disabled?: boolean;
  onClick(): void;
}

export function SummaryButton({ loading, disabled, onClick }: SummaryButtonProps) {
  return (
    <div className="summary-button">

      <button type="button" disabled={disabled} onClick={onClick}>
        {loading ? '要約中...' : '要約実行'}
      </button>

    </div>
  );
}