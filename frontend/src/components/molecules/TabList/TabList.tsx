import { cn } from '@/utils';
interface TabItem<T extends string> {
    key: T;
    label: string;
}
interface TabListProps<T extends string> {
    tabs: TabItem<T>[];
    activeTab: T;
    onTabChange: (tab: T) => void;
    className?: string;
}
export function TabList<T extends string>({ tabs, activeTab, onTabChange, className, }: TabListProps<T>) {
    return (<div className={cn('dashboard-card flex overflow-x-auto', className)} role="tablist" aria-label="Điều hướng tab">
      {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (<button key={tab.key} type="button" role="tab" aria-selected={isActive} aria-controls={`panel-${tab.key}`} id={`tab-${tab.key}`} onClick={() => onTabChange(tab.key)} className={cn('shrink-0 border-b-2 px-5 py-3 text-sm font-semibold transition-colors', 'outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0', isActive
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-muted hover:border-border-strong hover:text-foreground')}>
            {tab.label}
          </button>);
        })}
    </div>);
}
