import { Text } from '@/components/atoms/Text';
import { cn, formatCurrency } from '@/utils';

type StatVariant = 'default' | 'income' | 'expense' | 'balance';

interface StatCardProps {
  label: string;
  value: number;
  variant?: StatVariant;
  className?: string;
}

const variantStyles: Record<
  StatVariant,
  { card: string; value: string; glow: string }
> = {
  default: {
    card: 'border-border',
    value: 'text-foreground',
    glow: '',
  },
  income: {
    card: 'border-income/20 bg-income-muted',
    value: 'text-income',
    glow: 'from-income/10',
  },
  expense: {
    card: 'border-expense/20 bg-expense-muted',
    value: 'text-expense',
    glow: 'from-expense/10',
  },
  balance: {
    card: 'border-balance/20 bg-balance-muted',
    value: 'text-balance',
    glow: 'from-balance/10',
  },
};

export function StatCard({
  label,
  value,
  variant = 'default',
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'glass-card relative overflow-hidden rounded-2xl p-5 sm:p-6',
        styles.card,
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-linear-to-br to-transparent opacity-60',
          styles.glow,
        )}
      />
      <div className="relative">
        <Text variant="label">{label}</Text>
        <Text
          as="p"
          variant="h2"
          className={cn('mt-3 break-words text-xl sm:text-2xl', styles.value)}
        >
          {formatCurrency(value)}
        </Text>
      </div>
    </div>
  );
}
