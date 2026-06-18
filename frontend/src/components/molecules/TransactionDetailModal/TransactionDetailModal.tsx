import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms/Button';
import { MethodBadge, TransactionTypeBadge, } from '@/components/molecules/TransactionBadge';
import { userAccountPath, userTransactionsPath } from '@/constants';
import type { TransactionWithUser, User } from '@/types';
import { formatCurrency, formatDate, getAvatarUrl } from '@/utils';
interface TransactionDetailModalProps {
    transaction: TransactionWithUser | null;
    user?: User | null;
    onClose: () => void;
}
function DetailRow({ label, value }: {
    label: string;
    value: React.ReactNode;
}) {
    return (<div className="flex flex-col gap-1 border-b border-border py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>);
}
export function TransactionDetailModal({ transaction, user, onClose, }: TransactionDetailModalProps) {
    useEffect(() => {
        if (!transaction)
            return undefined;
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [transaction, onClose]);
    if (!transaction)
        return null;
    const displayUser = user ?? {
        id: transaction.userId,
        fullName: transaction.userFullName,
        avatar: getAvatarUrl(transaction.userId, 'male'),
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="transaction-detail-title">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Đóng" onClick={onClose}/>

      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2 id="transaction-detail-title" className="text-lg font-bold text-foreground">
              Chi Tiết Giao Dịch
            </h2>
            <p className="mt-1 text-sm text-muted">{transaction.id}</p>
          </div>
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="px-6 py-2">
          <DetailRow label="Ngày giao dịch" value={formatDate(transaction.date)}/>
          <DetailRow label="Loại" value={<TransactionTypeBadge type={transaction.type}/>}/>
          <DetailRow label="Số tiền" value={<span className="text-base font-bold text-foreground">
                {formatCurrency(transaction.amount)}
              </span>}/>
          <DetailRow label="Danh mục" value={transaction.category}/>
          <DetailRow label="Mô tả" value={transaction.description}/>
          <DetailRow label="Hình thức" value={<MethodBadge method={transaction.method}/>}/>
          <DetailRow label="Khách hàng" value={<span className="flex items-center gap-2">
                <Avatar src={displayUser.avatar} alt={displayUser.fullName} size="sm"/>
                {displayUser.fullName}
              </span>}/>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border px-6 py-4">
          <Link to={userAccountPath(transaction.userId)} onClick={onClose}>
            <Button variant="secondary" type="button">
              Xem tài khoản
            </Button>
          </Link>
          <Link to={userTransactionsPath(transaction.userId)} onClick={onClose}>
            <Button variant="primary" type="button">
              Giao dịch khách hàng
            </Button>
          </Link>
        </div>
      </div>
    </div>);
}
