import { cn } from '@/utils';
interface PageToolbarProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
    className?: string;
}
export function PageToolbar({ title, subtitle, children, className }: PageToolbarProps) {
    return (<div className={cn('dashboard-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5', className)}>
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
        {subtitle && (<p className="mt-1 text-sm text-muted">{subtitle}</p>)}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>);
}
