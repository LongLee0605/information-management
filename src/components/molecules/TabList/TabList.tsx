import { cn } from '@/utils';
import type { DetailTab } from '@/constants';

interface TabItem {
  key: DetailTab;
  label: string;
}

interface TabListProps {
  tabs: TabItem[];
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  className?: string;
}

export function TabList({ tabs, activeTab, onTabChange, className }: TabListProps) {
  return (
    <div
      className={cn(
        'glass-card inline-flex w-full max-w-full gap-1 overflow-x-auto rounded-2xl p-1.5 sm:w-auto',
        className,
      )}
      role="tablist"
      aria-label="Chi tiết người dùng"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.key}`}
            id={`tab-${tab.key}`}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isActive
                ? 'bg-linear-to-r from-accent/20 to-primary-500/10 text-accent-light shadow-inner ring-1 ring-accent/20'
                : 'text-muted hover:bg-surface-elevated hover:text-foreground-soft',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
