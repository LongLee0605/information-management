import { cn } from '@/utils';

interface PageToolbarProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageToolbar({ title, subtitle, children, className }: PageToolbarProps) {
  return (
    <div
      className={cn(
        'dashboard-card mb-6 flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
