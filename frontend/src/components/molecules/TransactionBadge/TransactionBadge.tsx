import { cn } from '@/utils';
import type { TransactionType } from '@/types/transaction';
interface TransactionTypeBadgeProps {
    type: TransactionType;
    className?: string;
}
export function TransactionTypeBadge({ type, className }: TransactionTypeBadgeProps) {
    const isCredit = type === 'credit';
    return (<span className={cn('inline-flex min-w-[72px] justify-center rounded px-2.5 py-1 text-xs font-semibold text-white', isCredit ? 'bg-income' : 'bg-expense', className)}>
      {isCredit ? 'Credit' : 'Debit'}
    </span>);
}
interface MethodBadgeProps {
    method: string;
    className?: string;
}
export function MethodBadge({ method, className }: MethodBadgeProps) {
    return (<span className={cn('inline-flex rounded-full border border-foreground/20 bg-white px-3 py-1 text-xs font-medium text-foreground', className)}>
      {method}
    </span>);
}
