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
    income: 'border-green-200 bg-income-bg',
    expense: 'border-red-200 bg-expense-bg',
    balance: 'border-blue-200 bg-balance-bg',
};
const valueClasses: Record<StatVariant, string> = {
    default: 'text-foreground',
    income: 'text-income',
    expense: 'text-expense',
    balance: 'text-balance',
};
export function StatCard({ label, value, variant = 'default', className, }: StatCardProps) {
    return (<div className={cn('dashboard-card p-5', variantClasses[variant], className)}>
      <Text variant="label">{label}</Text>
      <Text as="p" variant="h3" className={cn('mt-2 break-words text-xl', valueClasses[variant])}>
        {formatCurrency(value)}
      </Text>
    </div>);
}
