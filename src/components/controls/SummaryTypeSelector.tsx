import type { SummaryType } from '@/value-objects';
import type { SelectOption } from './types';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

export interface SummaryTypeSelectorProps {
  value: SummaryType;
  options: SelectOption<SummaryType>[];
  disabled?: boolean;
  onChange(summaryType: SummaryType): void;
}
export function SummaryTypeSelector({ value, options, disabled, onChange }: SummaryTypeSelectorProps) {
  return (
    <div className="form-row flex gap-3">
      <Label htmlFor="summary-type" className={cn("w-[90px] text-sm text-gray-700")}>
          要約方法
      </Label>

      <Select 
        id="summary-type"
        value={value}
        items={options}
        disabled={disabled}
        onValueChange={(v:SummaryType|null) => {
          onChange(v as SummaryType);
        }}
      >
        <SelectTrigger size="sm" className="w-[240px]">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

    </div>
  );
}