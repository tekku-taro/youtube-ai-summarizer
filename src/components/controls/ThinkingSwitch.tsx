import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

export interface ThinkingSwitchProps {
  checked: boolean;
  disabled?: boolean;
  onChange(checked: boolean): void;
}

export function ThinkingSwitch({ checked, disabled, onChange }: ThinkingSwitchProps) {
  return (
      <div className="flex items-center gap-2 mb-5">
          <Checkbox
              id="thinking"
              checked={checked}
              disabled={disabled}
              onCheckedChange={(checked) => onChange(checked as boolean)}
          />
          <Label
              htmlFor="thinking"
              className="w-[90px] text-sm text-gray-700 cursor-pointer"
          >
              思考モード
          </Label>
      </div>
  );
}