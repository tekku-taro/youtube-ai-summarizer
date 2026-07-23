import { Button } from "../ui/button";

export interface ErrorControlPanelProps {
  onResetSettings(): void;
}

export function ErrorControlPanel({ onResetSettings }: ErrorControlPanelProps) {
  return (
    <section
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        gap-x-2
        gap-y-3
        border-b
        p-3
      "
    >
    <div className="reset-button">

      <Button variant="secondary" type="button" onClick={onResetSettings}
        className="cursor-pointer"
      >
        設定情報をリセットする
      </Button>

    </div>

    </section>
  );
}