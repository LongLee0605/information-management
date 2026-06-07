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
        'flex gap-1 overflow-x-auto border-b border-border pb-px scrollbar-thin',
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
              'shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              isActive
                ? 'border-b-2 border-primary-600 bg-white text-primary-700'
                : 'text-muted hover:bg-slate-50 hover:text-slate-900',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
