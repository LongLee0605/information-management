import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser, useUserFinance } from '@/hooks';
import { useSelectedUserContext } from '@/context';
import { UserProfile } from '@/components/organisms/UserProfile';
import { UserPageShell } from '@/components/templates/UserPageShell';

export default function AccountPage() {
  const { id } = useParams<{ id: string }>();
  const { setContextUserId } = useSelectedUserContext();
  const { user, loading, error, notFound, refetch } = useUser(id);
  const { summary } = useUserFinance(id);

  useEffect(() => {
    if (id) {
      setContextUserId(id);
    }
  }, [id, setContextUserId]);

  const refetchAll = () => {
    refetch();
  };

  return (
    <UserPageShell
      user={user}
      loading={loading}
      notFound={notFound}
      error={error}
      title="Quản Lý Tài Khoản"
      subtitle={user ? `Chi tiết tài khoản · ${user.fullName}` : undefined}
      summary={summary}
      onRetry={refetchAll}
    >
      {user && <UserProfile user={user} />}
    </UserPageShell>
  );
}
