import type { ProviderType } from '@/value-objects';
import type { SelectOption } from './types';

export interface ProviderSelectorProps {
  value: ProviderType;
  options: SelectOption<ProviderType>[];
  disabled?: boolean;
  onChange(provider: ProviderType): void;
}

export function ProviderSelector({ value, options, disabled, onChange }: ProviderSelectorProps) {
  return (
    <div className="form-row">

      <label htmlFor="provider">
        Provider
      </label>

      <select
        id="provider"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as ProviderType)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

        {/* <option value="gemini">
          Gemini
        </option>

        <option value="lmstudio">
          LM Studio
        </option>
      </select>

    </div> */}
    </div>
  );
}