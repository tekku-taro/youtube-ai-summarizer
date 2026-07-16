import type { ReactNode } from 'react';
import type { TabType } from '@/value-objects';
import { Button } from '../ui/button';

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
    <>
      <Button
        type="button"
        className={active ? 'tab active' : 'tab'}
        onClick={() => onClick(tab)}
      >
        {children}
      </Button>
    </>
  );
}