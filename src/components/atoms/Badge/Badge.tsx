import { cn } from '@/utils';

type BadgeVariant = 'default' | 'income' | 'expense' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border border-primary-500/20 bg-balance-bg text-primary-700',
  income: 'border border-green-200 bg-income-bg text-income',
  expense: 'border border-red-200 bg-expense-bg text-expense',
  neutral: 'border border-border bg-table-stripe text-foreground-soft',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
