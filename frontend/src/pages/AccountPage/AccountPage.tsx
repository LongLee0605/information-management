import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import { AddAccountModal } from '@/components/organisms/AddAccountModal';
import { UserAccountsPanel } from '@/components/organisms/UserAccountsPanel';
import { UserPageShell } from '@/components/templates/UserPageShell';
import { userProfilePath } from '@/constants';
import { useSelectedUserContext } from '@/context';
import { useCanonicalUserRoute, useCustomerAccounts, useUser, useUserFinance } from '@/hooks';

export default function AccountPage() {
  const { id } = useParams<{ id: string }>();
  const { setContextUserId } = useSelectedUserContext();
  useCanonicalUserRoute();
  const { user, userId, loading, error, notFound, refetch } = useUser(id);
  const { summary } = useUserFinance(id);
  const {
    accounts,
    loading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
  } = useCustomerAccounts(id);
  const [showAddModal, setShowAddModal] = useState(false);
  const defaultCif = accounts[0]?.cif ?? '';

  useEffect(() => {
    if (userId) {
      setContextUserId(userId);
    }
  }, [userId, setContextUserId]);

  const refetchAll = () => {
    refetch();
    refetchAccounts();
  };

  return (
    <UserPageShell
      user={user}
      loading={loading}
      notFound={notFound}
      error={error}
      title="Quản Lý Tài Khoản"
      subtitle={user ? `CIF ${accounts[0]?.cif ?? '—'} · ${user.fullName}` : undefined}
      summary={summary}
      onRetry={refetchAll}
      toolbarActions={
        userId ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="teal" type="button" onClick={() => setShowAddModal(true)}>
              <span aria-hidden="true">+</span>
              Mở Tài Khoản
            </Button>
            <Link to={userProfilePath(userId)}>
              <Button variant="secondary" type="button">
                Hồ sơ khách hàng
              </Button>
            </Link>
          </div>
        ) : undefined
      }
    >
      {user && (
        <UserAccountsPanel
          accounts={accounts}
          loading={accountsLoading}
          error={accountsError}
          onRetry={refetchAccounts}
        />
      )}

      <AddAccountModal
        open={showAddModal}
        defaultCif={defaultCif}
        onClose={() => setShowAddModal(false)}
        onSuccess={refetchAccounts}
      />
    </UserPageShell>
  );
}
