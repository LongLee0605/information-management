import { cn } from '@/utils';

interface DetailLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DetailLayout({ children, className }: DetailLayoutProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  );
}
