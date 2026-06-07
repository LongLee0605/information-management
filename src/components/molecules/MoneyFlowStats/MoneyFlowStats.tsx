import type { MoneyFlowStats } from '@/types/moneyFlow';
import { formatFlowAmount } from '@/utils/moneyFlowHelpers';
import { cn } from '@/utils';

interface MoneyFlowStatsProps {
  stats: MoneyFlowStats;
  className?: string;
}

const cards = [
  { key: 'accounts', label: 'Tài khoản liên quan', color: 'text-primary-600', bg: 'bg-blue-50' },
  { key: 'transactions', label: 'Tổng giao dịch', color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'flow', label: 'Tổng dòng tiền', color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'levels', label: 'Cấp độ truy vết', color: 'text-foreground', bg: 'bg-table-stripe' },
] as const;

export function MoneyFlowStatsCards({ stats, className }: MoneyFlowStatsProps) {
  const values = [
    String(stats.relatedAccounts),
    `${stats.totalTransactions} GD`,
    formatFlowAmount(stats.totalFlowAmount),
    `${stats.traceLevels} cấp`,
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4', className)}>
      {cards.map((card, index) => (
        <div key={card.key} className={cn('dashboard-card p-5 text-center', card.bg)}>
          <p className={cn('text-2xl font-bold sm:text-3xl', card.color)}>{values[index]}</p>
          <p className="mt-1 text-xs font-medium text-muted sm:text-sm">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
