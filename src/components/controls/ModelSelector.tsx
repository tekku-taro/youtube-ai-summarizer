import { cn } from '@/lib/utils';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { SelectOption } from './types';

export interface ModelSelectorProps {
  value: string;
  options: SelectOption[];
  disabled?: boolean;
  onChange(model: string): void;
}

export function ModelSelector({ value, options, disabled, onChange }: ModelSelectorProps) {
  return (
    <div className="form-row flex gap-3">
      <Label htmlFor="model" className={cn("w-[90px] text-sm text-gray-700")}>
          Model
      </Label>

      <Select 
        id="model"
        value={value}
        items={options}
        disabled={disabled}
        onValueChange={(v:string|null) => {
          onChange(v as string);
        }}
      >
        <SelectTrigger className="w-[180px]">
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