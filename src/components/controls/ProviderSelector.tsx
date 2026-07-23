import type { ProviderType } from '@/value-objects';
import type { SelectOption } from './types';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

export interface ProviderSelectorProps {
  value: ProviderType;
  options: SelectOption<ProviderType>[];
  disabled?: boolean;
  onChange(provider: ProviderType): void;
}

export function ProviderSelector({ value, options, disabled, onChange }: ProviderSelectorProps) {
  return (
    <div className="form-row flex gap-3">
      <Label htmlFor="provider" className={cn("w-[90px] text-sm text-gray-700")}>
          Provider
      </Label>

      <Select 
        id="provider"
        value={value}
        items={options}
        disabled={disabled}
        onValueChange={(v:ProviderType|null) => {
          onChange(v as ProviderType);
        }}
      >
        <SelectTrigger size="sm" className="w-[180px]">
          <SelectValue placeholder="Provider Type" />
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