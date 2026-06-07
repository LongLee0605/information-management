import { cn } from '@/utils';

type BadgeVariant = 'default' | 'income' | 'expense' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-primary-500/20 bg-primary-50 text-primary-500',
  income: 'border-income/20 bg-income-muted text-income',
  expense: 'border-expense/20 bg-expense-muted text-expense',
  neutral: 'border-border-strong bg-surface-elevated text-foreground-soft',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
