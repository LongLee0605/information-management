import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAllTransactions, useUsers } from '@/hooks';
import { ErrorState } from '@/components/molecules/ErrorState';
import { PageToolbar } from '@/components/molecules/PageToolbar';
import { TransactionsPanel } from '@/components/organisms/TransactionsPanel';
import { Button } from '@/components/atoms/Button';
import { ROUTES } from '@/constants';
export default function AllTransactionsPage() {
    const { users } = useUsers();
    const { transactions, loading, error, refetch } = useAllTransactions();
    const userLookup = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
    return (<div className="page-stack">
      <PageToolbar title="Quản Lý Giao Dịch" subtitle="Tất cả giao dịch thu chi · chọn khách hàng để xem chi tiết tài khoản và báo cáo">
        <Link to={ROUTES.TRANSFER}>
          <Button variant="primary" type="button">
            + Thêm Giao Dịch
          </Button>
        </Link>
      </PageToolbar>

      {error && !loading && (<ErrorState message={error} onRetry={refetch}/>)}

      {!error && (<TransactionsPanel transactions={transactions} loading={loading} users={users} showUserColumn userLookup={userLookup}/>)}
    </div>);
}
