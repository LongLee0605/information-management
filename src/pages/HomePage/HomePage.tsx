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
        badge="Quản lý tài chính"
        title="Danh sách người dùng"
        description="Theo dõi thông tin cá nhân và nguồn thu chi của từng thành viên. Chọn một hồ sơ để xem phân tích chi tiết."
      />

      {!loading && !error && users.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-income animate-pulse" />
            <Text as="span" variant="caption" className="text-foreground-soft">
              <span className="font-bold text-accent-light">{users.length}</span> hồ sơ đang hoạt động
            </Text>
          </span>
        </div>
      )}

      {loading && <UserGridSkeleton />}

      {error && !loading && (
        <ErrorState message={error} onRetry={refetch} />
      )}

      {!loading && !error && users.length === 0 && (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Text variant="body">Không có người dùng nào.</Text>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <UserGrid users={users} />
      )}
    </>
  );
}
