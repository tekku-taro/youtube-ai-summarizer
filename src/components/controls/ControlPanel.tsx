import { ProviderSelector } from './ProviderSelector';
import { ModelSelector } from './ModelSelector';
import { ThinkingSwitch } from './ThinkingSwitch';
import { SummaryTypeSelector } from './SummaryTypeSelector';
import { SummaryButton } from './SummaryButton';
import type { ProviderType, SummaryType, TabType } from '@/value-objects';
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
  loadingTab?:TabType|null|undefined;

  onProviderChange(provider: ProviderType): void;
  onModelChange(model: string): void;
  onThinkingChange(checked: boolean): void;
  onSummaryTypeChange(summaryType: SummaryType): void;

  onSummarize(): void;
}

export function ControlPanel({ provider, providers, model, models, thinking, summaryType, summaryTypes, loading, loadingTab, onProviderChange, onModelChange, onThinkingChange, onSummaryTypeChange, onSummarize }: ControlPanelProps) {
  return (
    <section
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        gap-x-2
        gap-y-3
        border-b
        p-3
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
        loadingTab={loadingTab}
        disabled={loading ?? false}
        onClick={onSummarize}
      />

    </section>
  );
}