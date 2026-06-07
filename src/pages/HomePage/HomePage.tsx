import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms/Button';
import { DataTable, DataTableSkeleton } from '@/components/molecules/DataTable';
import { ErrorState } from '@/components/molecules/ErrorState';
import { PageToolbar } from '@/components/molecules/PageToolbar';
import { useSelectedUserContext } from '@/context';
import { useUsers } from '@/hooks';
import { userAccountPath } from '@/constants';
import type { User } from '@/types';
import { formatCitizenId, formatDate, getCifFromUserId } from '@/utils';

export default function HomePage() {
  const navigate = useNavigate();
  const { setContextUserId } = useSelectedUserContext();
  const { users, loading, error, refetch } = useUsers();

  useEffect(() => {
    setContextUserId(null);
  }, [setContextUserId]);
  const columns = [
    {
      key: 'id',
      header: 'Mã CIF',
      className: 'w-24',
      render: (user: User) => (
        <span className="font-medium text-foreground">{getCifFromUserId(user.id)}</span>
      ),
    },
    {
      key: 'name',
      header: 'Họ và Tên',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar src={user.avatar} alt={user.fullName} size="sm" />
          <span className="font-medium text-foreground">{user.fullName}</span>
        </div>
      ),
    },
    {
      key: 'citizenId',
      header: 'Số CCCD',
      render: (user: User) => formatCitizenId(user.citizenId),
    },
    {
      key: 'dob',
      header: 'Ngày Sinh',
      render: (user: User) => formatDate(user.dateOfBirth),
    },
    {
      key: 'occupation',
      header: 'Nghề Nghiệp',
      render: (user: User) => user.occupation,
    },
    {
      key: 'address',
      header: 'Địa Chỉ',
      className: 'max-w-xs',
      render: (user: User) => (
        <span className="line-clamp-2">{user.address}</span>
      ),
    },
  ];

  return (
    <>
      <PageToolbar
        title="Quản Lý Khách Hàng"
        subtitle="Danh sách thông tin khách hàng"
      >
        <Button variant="teal" type="button">
          <span aria-hidden="true">+</span>
          Thêm Mới
        </Button>
        <Button variant="green" type="button">
          Lưu
        </Button>
      </PageToolbar>

      {loading && <DataTableSkeleton rows={8} cols={6} />}

      {error && !loading && (
        <ErrorState message={error} onRetry={refetch} />
      )}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={users}
          getRowKey={(user) => user.id}
          onRowClick={(user) => navigate(userAccountPath(user.id))}
          emptyMessage="Không có người dùng nào."
        />
      )}
    </>
  );
}
