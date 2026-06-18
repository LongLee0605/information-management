import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import { PageToolbar } from '@/components/molecules/PageToolbar';
import { AddAccountModal } from '@/components/organisms/AddAccountModal';
import { UserAccountsPanel } from '@/components/organisms/UserAccountsPanel';
import { ROUTES, userAccountPath } from '@/constants';
import { useAllCustomerAccounts } from '@/hooks';
export default function AllAccountsPage() {
    const navigate = useNavigate();
    const { accounts, loading, error, refetch } = useAllCustomerAccounts();
    const [showAddModal, setShowAddModal] = useState(false);
    return (<div className="page-stack">
      <PageToolbar title="Quản Lý Tài Khoản" subtitle="Tất cả tài khoản khách hàng · chọn khách hàng để xem hồ sơ và báo cáo">
        <div className="flex flex-wrap gap-2">
          <Button variant="teal" type="button" onClick={() => setShowAddModal(true)}>
            <span aria-hidden="true">+</span>
            Mở Tài Khoản
          </Button>
          <Link to={ROUTES.HOME}>
            <Button variant="secondary" type="button">
              ← Danh sách
            </Button>
          </Link>
        </div>
      </PageToolbar>

      <UserAccountsPanel accounts={accounts} loading={loading} error={error} onRetry={refetch} showCustomerColumn onRowClick={(account) => navigate(userAccountPath(account.userId))} emptyMessage="Chưa có tài khoản nào."/>

      <AddAccountModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={refetch}/>
    </div>);
}
