import { cn } from '@/utils';

type BadgeVariant = 'default' | 'income' | 'expense' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary-100 text-primary-700',
  income: 'bg-emerald-100 text-emerald-700',
  expense: 'bg-red-100 text-red-700',
  neutral: 'bg-slate-100 text-slate-700',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
