import { useUsers } from '@/hooks';
import { UserGrid } from '@/components/organisms/UserGrid';
import { UserGridSkeleton } from '@/components/organisms/UserGridSkeleton';
import { ErrorState } from '@/components/molecules/ErrorState';
import { PageHeader } from '@/components/templates/PageHeader';
import { Text } from '@/components/atoms/Text';

export default function HomePage() {
  const { users, loading, error, refetch } = useUsers();

  return (
    <>
      <PageHeader
        title="Danh sách người dùng"
        description="Quản lý thông tin và nguồn thu chi của người dùng. Nhấn vào thẻ để xem chi tiết."
      />

      {loading && <UserGridSkeleton />}

      {error && !loading && (
        <ErrorState message={error} onRetry={refetch} />
      )}

      {!loading && !error && users.length === 0 && (
        <div className="rounded-2xl border border-border bg-white p-12 text-center">
          <Text variant="body">Không có người dùng nào.</Text>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <>
          <Text variant="caption" className="mb-4 block">
            Tổng cộng {users.length} người dùng
          </Text>
          <UserGrid users={users} />
        </>
      )}
    </>
  );
}
