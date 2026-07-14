import type { SummaryType } from '@/value-objects';
import type { SelectOption } from './types';

export interface SummaryTypeSelectorProps {
  value: SummaryType;
  options: SelectOption<SummaryType>[];
  disabled?: boolean;
  onChange(summaryType: SummaryType): void;
}
export function SummaryTypeSelector({ value, options, disabled, onChange }: SummaryTypeSelectorProps) {
  return (
    <div className="form-row">

      <label htmlFor="summary-type">
        要約方法
      </label>

      <select
        id="summary-type"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as SummaryType)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}

        {/* <option value="simple">
          簡潔な要約
        </option>

        <option value="detail">
          詳細な要約
        </option>

        <option value="bullet">
          箇条書き
        </option> */}
      </select>

    </div>
  );
}