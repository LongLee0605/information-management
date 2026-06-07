import { Text } from '@/components/atoms/Text';
import { cn, formatCurrency } from '@/utils';

type StatVariant = 'default' | 'income' | 'expense' | 'balance';

interface StatCardProps {
  label: string;
  value: number;
  variant?: StatVariant;
  className?: string;
}

const variantClasses: Record<StatVariant, string> = {
  default: 'border-border',
  income: 'border-emerald-200 bg-emerald-50',
  expense: 'border-red-200 bg-red-50',
  balance: 'border-blue-200 bg-blue-50',
};

const valueClasses: Record<StatVariant, string> = {
  default: 'text-slate-900',
  income: 'text-emerald-700',
  expense: 'text-red-700',
  balance: 'text-blue-700',
};

export function StatCard({
  label,
  value,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-4 sm:p-5',
        variantClasses[variant],
        className,
      )}
    >
      <Text variant="label">{label}</Text>
      <Text
        as="p"
        variant="h3"
        className={cn('mt-2 break-words', valueClasses[variant])}
      >
        {formatCurrency(value)}
      </Text>
    </div>
  );
}
