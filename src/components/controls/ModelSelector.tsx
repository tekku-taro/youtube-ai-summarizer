import type { SelectOption } from './types';

export interface ModelSelectorProps {
  value: string;
  options: SelectOption[];
  disabled?: boolean;
  onChange(model: string): void;
}

export function ModelSelector({ value, options, disabled, onChange }: ModelSelectorProps) {
  return (
    <div className="form-row">

      <label htmlFor="model">
        Model
      </label>

      <select
        id="model"
        defaultValue=""
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {/* <option value="">
          GPT-5
        </option> */}
      </select>

    </div>
  );
}