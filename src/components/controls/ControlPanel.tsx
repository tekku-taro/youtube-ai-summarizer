import { ProviderSelector } from './ProviderSelector';
import { ModelSelector } from './ModelSelector';
import { ThinkingSwitch } from './ThinkingSwitch';
import { SummaryTypeSelector } from './SummaryTypeSelector';
import { SummaryButton } from './SummaryButton';
import type { ProviderType, SummaryType } from '@/value-objects';
import type { SelectOption } from './types';

export interface ControlPanelProps {
  provider: ProviderType;
  providers: SelectOption<ProviderType>[];

  model: string;
  models: SelectOption[];

  thinking: boolean;

  summaryType: SummaryType;
  summaryTypes: SelectOption<SummaryType>[];

  loading?: boolean;

  onProviderChange(provider: ProviderType): void;
  onModelChange(model: string): void;
  onThinkingChange(checked: boolean): void;
  onSummaryTypeChange(summaryType: SummaryType): void;

  onSummarize(): void;
}

export function ControlPanel({ provider, providers, model, models, thinking, summaryType, summaryTypes, loading, onProviderChange, onModelChange, onThinkingChange, onSummaryTypeChange, onSummarize }: ControlPanelProps) {
  return (
    <section
      className="
        grid
        grid-cols-2
        gap-x-4
        gap-y-2
        space-y-3
        border-b
        p-4
      "
    >

      <ProviderSelector 
       value={provider}
        options={providers}
        disabled={loading ?? false}
        onChange={onProviderChange}
      />

      <ModelSelector 
        value={model}
        options={models}
        disabled={loading ?? false}
        onChange={onModelChange}
      />

      <SummaryTypeSelector 
        value={summaryType}
        options={summaryTypes}
        disabled={loading ?? false}
        onChange={onSummaryTypeChange}
      />

      <ThinkingSwitch 
        checked={thinking}
        disabled={loading ?? false}
        onChange={onThinkingChange}
      />

      <SummaryButton 
        loading={loading ?? false}
        disabled={loading ?? false}
        onClick={onSummarize}
      />

    </section>
  );
}