import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useUser, useUserFinance, useTransactions, useUsers } from '@/hooks';
import { useSelectedUserContext } from '@/context';
import { ErrorState } from '@/components/molecules/ErrorState';
import { TransactionsPanel } from '@/components/organisms/TransactionsPanel';
import { UserPageShell } from '@/components/templates/UserPageShell';
import { Button } from '@/components/atoms/Button';
import { userTransferPath } from '@/constants';
import type { TransactionWithUser } from '@/types';

export default function UserTransactionsPage() {
  const { id } = useParams<{ id: string }>();
  const { setContextUserId } = useSelectedUserContext();
  const { user, loading: userLoading, error: userError, notFound, refetch: refetchUser } = useUser(id);
  const { users } = useUsers();
  const { summary } = useUserFinance(id);
  const {
    transactions,
    loading: txLoading,
    error: txError,
    refetch: refetchTx,
  } = useTransactions(id);

  useEffect(() => {
    if (id) {
      setContextUserId(id);
    }
  }, [id, setContextUserId]);

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

  return (
    <UserPageShell
      user={user}
      loading={userLoading}
      notFound={notFound}
      error={userError}
      title="Quản Lý Giao Dịch"
      subtitle={user ? `Giao dịch thu chi · ${user.fullName}` : undefined}
      summary={summary}
      toolbarActions={
        id ? (
          <Link to={userTransferPath(id)}>
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
          lockedUserId={id}
          showUserColumn={false}
          userLookup={userLookup}
        />
      )}
    </UserPageShell>
  );
}
