import { Link } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import { Skeleton } from '@/components/atoms/Skeleton';
import { Text } from '@/components/atoms/Text';
import { ErrorState } from '@/components/molecules/ErrorState';
import { PageToolbar } from '@/components/molecules/PageToolbar';
import { StatCard } from '@/components/molecules/StatCard';
import { ROUTES } from '@/constants';
import type { User } from '@/types';
import { formatCitizenId, formatGender } from '@/utils';

interface UserPageShellProps {
  user: User | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
  title: string;
  subtitle?: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  summaryPeriodLabel?: string;
  beforeSummary?: React.ReactNode;
  toolbarActions?: React.ReactNode;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function UserPageShell({
  user,
  loading,
  notFound,
  error,
  title,
  subtitle,
  summary,
  summaryPeriodLabel = '2025–2026',
  beforeSummary,
  toolbarActions,
  onRetry,
  children,
}: UserPageShellProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="dashboard-card flex flex-col items-center py-16 text-center">
        <Text as="h1" variant="h1" className="text-primary-600">
          404
        </Text>
        <Text variant="body" className="mt-2">
          Không tìm thấy người dùng.
        </Text>
        <Link to={ROUTES.HOME} className="mt-6">
          <Button variant="primary">Về danh sách</Button>
        </Link>
      </div>
    );
  }

  if (error || !user) {
    return (
      <ErrorState
        message={error ?? 'Không thể tải dữ liệu.'}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageToolbar
        title={title}
        subtitle={subtitle ?? `${formatGender(user.gender)} · CCCD ${formatCitizenId(user.citizenId)}`}
      >
        <Link to={ROUTES.HOME}>
          <Button variant="secondary" type="button">
            ← Danh sách
          </Button>
        </Link>
        {toolbarActions}
      </PageToolbar>

      {beforeSummary}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={`Tổng thu (${summaryPeriodLabel})`} value={summary.totalIncome} variant="income" />
        <StatCard label={`Tổng chi (${summaryPeriodLabel})`} value={summary.totalExpense} variant="expense" />
        <StatCard label="Chênh lệch" value={summary.balance} variant="balance" />
      </div>

      {children}
    </div>
  );
}
