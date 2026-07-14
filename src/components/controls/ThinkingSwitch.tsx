export interface ThinkingSwitchProps {
  checked: boolean;
  disabled?: boolean;
  onChange(checked: boolean): void;
}

export function ThinkingSwitch({ checked, disabled, onChange }: ThinkingSwitchProps) {
  return (
    <div className="form-row">

      <label htmlFor="thinking">
        思考モード
      </label>

      <input
        id="thinking"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />

    </div>
  );
}