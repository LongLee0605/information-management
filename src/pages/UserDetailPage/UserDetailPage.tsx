import { useCallback, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useUser, useUserFinance } from '@/hooks';
import { UserProfile } from '@/components/organisms/UserProfile';
import { LineChartPanel } from '@/components/organisms/LineChartPanel';
import { PieChartPanel } from '@/components/organisms/PieChartPanel';
import { TabList } from '@/components/molecules/TabList';
import { StatCard } from '@/components/molecules/StatCard';
import { ErrorState } from '@/components/molecules/ErrorState';
import { DetailLayout } from '@/components/templates/DetailLayout';
import { PageHeader } from '@/components/templates/PageHeader';
import { Skeleton } from '@/components/atoms/Skeleton';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { DETAIL_TABS, ROUTES, type DetailTab } from '@/constants';

function isValidTab(tab: string | null): tab is DetailTab {
  return tab === 'info' || tab === 'charts' || tab === 'sources';
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab: DetailTab = isValidTab(tabParam) ? tabParam : 'info';

  const { user, loading: userLoading, error: userError, notFound, refetch: refetchUser } = useUser(id);
  const {
    lineChartData,
    incomePieData,
    expensePieData,
    summary,
    loading: financeLoading,
    error: financeError,
    refetch: refetchFinance,
  } = useUserFinance(id);

  const handleTabChange = useCallback(
    (tab: DetailTab) => {
      if (tab === 'info') {
        setSearchParams({});
      } else {
        setSearchParams({ tab });
      }
    },
    [setSearchParams],
  );

  const loading = userLoading || (activeTab !== 'info' && financeLoading);
  const error = userError ?? (activeTab !== 'info' ? financeError : null);

  const refetch = useCallback(() => {
    refetchUser();
    refetchFinance();
  }, [refetchUser, refetchFinance]);

  const tabContent = useMemo(() => {
    if (!user) return null;

    switch (activeTab) {
      case 'info':
        return <UserProfile user={user} />;
      case 'charts':
        return <LineChartPanel data={lineChartData} />;
      case 'sources':
        return (
          <PieChartPanel
            incomeData={incomePieData}
            expenseData={expensePieData}
          />
        );
      default:
        return null;
    }
  }, [activeTab, user, lineChartData, incomePieData, expensePieData]);

  if (userLoading) {
    return (
      <DetailLayout>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </DetailLayout>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <Text as="h1" variant="h1">
          404
        </Text>
        <Text variant="body" className="mt-2">
          Không tìm thấy người dùng.
        </Text>
        <Link to={ROUTES.HOME} className="mt-6">
          <Button variant="primary">Về trang chủ</Button>
        </Link>
      </div>
    );
  }

  if (error || !user) {
    return (
      <ErrorState
        message={error ?? 'Không thể tải dữ liệu.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <DetailLayout>
      <PageHeader
        title={user.fullName}
        description={`${user.occupation} · CCCD ${user.citizenId}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Tổng thu năm 2025" value={summary.totalIncome} variant="income" />
        <StatCard label="Tổng chi năm 2025" value={summary.totalExpense} variant="expense" />
        <StatCard label="Chênh lệch" value={summary.balance} variant="balance" />
      </div>

      <TabList
        tabs={DETAIL_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {loading && activeTab !== 'info' ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : (
          tabContent
        )}
      </div>
    </DetailLayout>
  );
}
