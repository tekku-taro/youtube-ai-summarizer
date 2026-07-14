import type { ReactNode } from 'react';
import type { TabType } from '@/value-objects';

export interface TabButtonProps {
  tab: TabType;

  active: boolean;

  children: ReactNode;

  onClick(tab: TabType): void;
}

export function TabButton({
  tab,
  active,
  children,
  onClick,
}: TabButtonProps) {
  return (
    <button
      type="button"
      className={active ? 'tab active' : 'tab'}
      onClick={() => onClick(tab)}
    >
      {children}
    </button>
  );
}