import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/atoms/Avatar';
import { GenderBadge } from '@/components/atoms/GenderBadge';
import { Button } from '@/components/atoms/Button';
import { CustomerFilter } from '@/components/molecules/CustomerFilter';
import { DataTable, DataTableSkeleton } from '@/components/molecules/DataTable';
import { ErrorState } from '@/components/molecules/ErrorState';
import { PageToolbar } from '@/components/molecules/PageToolbar';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { AddCustomerModal } from '@/components/organisms/AddCustomerModal';
import { useSelectedUserContext } from '@/context';
import { useUsers } from '@/hooks';
import { deleteUser } from '@/services/userService';
import { userAccountPath } from '@/constants';
import type { User } from '@/types';
import { EMPTY_CUSTOMER_FILTER, filterCustomers, formatBirthDate, formatCitizenId, getCifFromUserId, } from '@/utils';
import type { CustomerFilterValues } from '@/utils';
function buildFilterResetKey(filters: CustomerFilterValues): string {
    return `${filters.cif}|${filters.citizenId}|${filters.fullName}|${filters.birthYear}`;
}
export default function HomePage() {
    const navigate = useNavigate();
    const { setContextUserId } = useSelectedUserContext();
    const { users, loading, error, refetch } = useUsers();
    const [draftFilters, setDraftFilters] = useState<CustomerFilterValues>(EMPTY_CUSTOMER_FILTER);
    const [appliedFilters, setAppliedFilters] = useState<CustomerFilterValues>(EMPTY_CUSTOMER_FILTER);
    const [filterResetKey, setFilterResetKey] = useState(() => buildFilterResetKey(EMPTY_CUSTOMER_FILTER));
    const [showAddModal, setShowAddModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    useEffect(() => {
        setContextUserId(null);
    }, [setContextUserId]);
    const filteredUsers = useMemo(() => filterCustomers(users, appliedFilters), [users, appliedFilters]);
    const columns = [
        {
            key: 'id',
            header: 'Mã CIF',
            className: 'w-24',
            render: (user: User) => (<span className="font-medium text-foreground">{getCifFromUserId(user.id)}</span>),
        },
        {
            key: 'name',
            header: 'Họ và Tên',
            render: (user: User) => (<div className="flex items-center gap-3">
          <Avatar src={user.avatar} alt={user.fullName} size="sm" gender={user.gender}/>
          <span className="font-medium text-foreground">{user.fullName}</span>
        </div>),
        },
        {
            key: 'citizenId',
            header: 'Số CCCD',
            render: (user: User) => formatCitizenId(user.citizenId),
        },
        {
            key: 'dob',
            header: 'Ngày Sinh',
            render: (user: User) => formatBirthDate(user.dateOfBirth),
        },
        {
            key: 'gender',
            header: 'Giới Tính',
            render: (user: User) => <GenderBadge gender={user.gender}/>,
        },
        {
            key: 'address',
            header: 'Địa Chỉ',
            className: 'max-w-xs',
            render: (user: User) => (<span className="line-clamp-2">{user.address}</span>),
        },
        {
            key: 'actions',
            header: '',
            className: 'w-16 text-right',
            render: (user: User) => (<button type="button" className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-50" aria-label={`Xóa ${user.fullName}`} onClick={(event) => {
                    event.stopPropagation();
                    setDeleteError(null);
                    setUserToDelete(user);
                }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M3 6h18"/>
            <path d="M8 6V4h8v2"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
          </svg>
        </button>),
        },
    ];
    async function handleConfirmDelete() {
        if (!userToDelete || deleting) {
            return;
        }
        setDeleting(true);
        setDeleteError(null);
        try {
            await deleteUser(userToDelete.id);
            setUserToDelete(null);
            refetch();
        }
        catch (error) {
            setDeleteError(error instanceof Error
                ? error.message
                : 'Không thể xóa khách hàng. Vui lòng thử lại.');
        }
        finally {
            setDeleting(false);
        }
    }
    function handleSearch() {
        setAppliedFilters({ ...draftFilters });
        setFilterResetKey(buildFilterResetKey(draftFilters));
    }
    return (<div className="page-stack">
      <PageToolbar title="Quản Lý Khách Hàng" subtitle="Danh sách thông tin khách hàng">
        <Button variant="teal" type="button" onClick={() => setShowAddModal(true)}>
          <span aria-hidden="true">+</span>
          Thêm Mới
        </Button>
      </PageToolbar>

      {!loading && !error && (<CustomerFilter values={draftFilters} onChange={setDraftFilters} onSearch={handleSearch}/>)}

      {loading && <DataTableSkeleton rows={8} cols={7}/>}

      {error && !loading && (<ErrorState message={error} onRetry={refetch}/>)}

      {!loading && !error && (<DataTable columns={columns} data={filteredUsers} getRowKey={(user) => user.id} onRowClick={(user) => navigate(userAccountPath(user.id))} emptyMessage="Không có khách hàng phù hợp." paginationResetKey={filterResetKey} itemLabel="khách hàng"/>)}

      <AddCustomerModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={refetch}/>

      <ConfirmDialog open={Boolean(userToDelete)} title="Xóa khách hàng" message={userToDelete
            ? `Bạn có chắc muốn xóa khách hàng ${userToDelete.fullName} (CIF ${getCifFromUserId(userToDelete.id)})? Tất cả tài khoản liên quan cũng sẽ bị ẩn.`
            : ''} confirmLabel="Xóa" loading={deleting} onCancel={() => {
            if (!deleting) {
                setUserToDelete(null);
                setDeleteError(null);
            }
        }} onConfirm={handleConfirmDelete}/>

      {deleteError && (<p className="fixed bottom-6 right-6 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-600 shadow-lg">
          {deleteError}
        </p>)}
    </div>);
}
