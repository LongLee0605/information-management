import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCanonicalUserRoute, useUser, useTransactions, useUsers } from '@/hooks';
import { useSelectedUserContext } from '@/context';
import { ErrorState } from '@/components/molecules/ErrorState';
import {
  TransactionsPanel,
  type DateRangeFilter,
} from '@/components/organisms/TransactionsPanel';
import { UserPageShell } from '@/components/templates/UserPageShell';
import { Button } from '@/components/atoms/Button';
import { getEffectiveAppDateRange, userTransferPath } from '@/constants';
import type { TransactionWithUser } from '@/types';
import {
  calculateTransactionSummary,
  formatDateRangeLabel,
} from '@/utils/chartTransformers';
import { isDateInRange } from '@/utils';

export default function UserTransactionsPage() {
  const { id } = useParams<{ id: string }>();
  const { setContextUserId } = useSelectedUserContext();
  useCanonicalUserRoute();
  const { user, userId, loading: userLoading, error: userError, notFound, refetch: refetchUser } = useUser(id);
  const { users } = useUsers();
  const {
    transactions,
    loading: txLoading,
    error: txError,
    refetch: refetchTx,
  } = useTransactions(id);
  const [dateRange, setDateRange] = useState<DateRangeFilter>(() => getEffectiveAppDateRange());

  useEffect(() => {
    if (userId) {
      setContextUserId(userId);
    }
  }, [userId, setContextUserId]);

  const transactionsWithUser = useMemo<TransactionWithUser[]>(
    () =>
      transactions.map((transaction) => ({
        ...transaction,
        userFullName: user?.fullName ?? transaction.userId,
      })),
    [transactions, user],
  );

  const userLookup = useMemo(
    () => (user ? new Map([[user.id, user]]) : new Map()),
    [user],
  );

  const filteredTransactions = useMemo(
    () =>
      transactionsWithUser.filter((transaction) =>
        isDateInRange(transaction.date, dateRange.fromDate, dateRange.toDate),
      ),
    [transactionsWithUser, dateRange.fromDate, dateRange.toDate],
  );

  const summary = useMemo(
    () => calculateTransactionSummary(filteredTransactions),
    [filteredTransactions],
  );

  const summaryPeriodLabel = useMemo(
    () => formatDateRangeLabel(dateRange.fromDate, dateRange.toDate),
    [dateRange.fromDate, dateRange.toDate],
  );

  return (
    <UserPageShell
      user={user}
      loading={userLoading}
      notFound={notFound}
      error={userError}
      title="Quản Lý Giao Dịch"
      subtitle={user ? `Giao dịch thu chi · ${user.fullName}` : undefined}
      summary={summary}
      summaryPeriodLabel={summaryPeriodLabel}
      toolbarActions={
        userId ? (
          <Link to={userTransferPath(userId)}>
            <Button variant="primary" type="button">
              + Thêm Giao Dịch
            </Button>
          </Link>
        ) : undefined
      }
      onRetry={refetchUser}
    >
      {txError && !txLoading && (
        <ErrorState message={txError} onRetry={refetchTx} />
      )}

      {!txError && user && (
        <TransactionsPanel
          transactions={transactionsWithUser}
          loading={txLoading}
          users={users}
          lockedUserId={userId}
          showUserColumn={false}
          userLookup={userLookup}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      )}
    </UserPageShell>
  );
}
