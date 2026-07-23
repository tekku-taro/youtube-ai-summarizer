import { cn } from '@/lib/utils';
import { Label } from '../ui/label';
import type { SelectOption } from './types';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

export interface ModelSelectorProps {
  value: string;
  options: SelectOption[];
  disabled?: boolean;
  onChange(model: string): void;
}

export function ModelSelector({ value, options, disabled, onChange }: ModelSelectorProps) {
  console.log('modelselector', value);
    // const selectedOption = options.find(option => option.value == value) ?? options[0];
  return (
    <div className="form-row flex gap-3">
      <Label htmlFor="model" className={cn("w-[90px] text-sm text-gray-700")}>
          Model
      </Label>

      <Combobox 
        id="model"
        value={value}
        items={options}
        disabled={disabled} 
        onValueChange={(v:string|null) => {
          console.log('onValueChange', v);
          onChange(v as string);
        }}
      >
        <ComboboxInput placeholder="Select a model"  className="w-[180px]" />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(option:SelectOption) => (
              <ComboboxItem key={option.value} value={option.value}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}