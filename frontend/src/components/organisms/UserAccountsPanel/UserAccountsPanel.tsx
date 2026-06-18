import { useMemo, useState } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Skeleton } from '@/components/atoms/Skeleton';
import { Text } from '@/components/atoms/Text';
import { AccountFilter } from '@/components/molecules/AccountFilter';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { DataTable } from '@/components/molecules/DataTable';
import { ErrorState } from '@/components/molecules/ErrorState';
import { deleteBankAccount } from '@/services/accountService';
import type { EnrichedBankAccount } from '@/types';
import { buildAccountFilterResetKey, cn, EMPTY_ACCOUNT_FILTER, filterBankAccounts, formatAccountNumberDisplay, formatCurrency, } from '@/utils';
import type { AccountFilterValues } from '@/utils';
interface UserAccountsPanelProps {
    accounts: EnrichedBankAccount[];
    loading: boolean;
    error: string | null;
    onRetry?: () => void;
    showCustomerColumn?: boolean;
    onRowClick?: (account: EnrichedBankAccount) => void;
    emptyMessage?: string;
    enableFilter?: boolean;
    enableDelete?: boolean;
}
const ACCOUNT_TYPE_COLORS: Record<string, string> = {
    payment: 'border-blue-200 bg-blue-50 text-blue-700',
    savings: 'border-green-200 bg-green-50 text-green-700',
    debit: 'border-amber-200 bg-amber-50 text-amber-800',
    overdraft: 'border-red-200 bg-red-50 text-red-700',
};
function AccountTypeBadge({ account }: {
    account: EnrichedBankAccount;
}) {
    return (<span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', ACCOUNT_TYPE_COLORS[account.accountType] ?? 'border-border bg-table-stripe text-foreground-soft')}>
      {account.accountTypeLabel}
    </span>);
}
function StatusBadge({ status }: {
    status: EnrichedBankAccount['status'];
}) {
    if (status === 'active') {
        return (<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700">
        <span className="h-2 w-2 rounded-full bg-green-500"/>
        Hoạt động
      </span>);
    }
    return (<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
      <span className="h-2 w-2 rounded-full bg-slate-400"/>
      Ngưng hoạt động
    </span>);
}
export function UserAccountsPanel({ accounts, loading, error, onRetry, showCustomerColumn = false, onRowClick, emptyMessage = 'Khách hàng chưa có tài khoản nào.', enableFilter = true, enableDelete = true, }: UserAccountsPanelProps) {
    const [draftFilters, setDraftFilters] = useState<AccountFilterValues>(EMPTY_ACCOUNT_FILTER);
    const [appliedFilters, setAppliedFilters] = useState<AccountFilterValues>(EMPTY_ACCOUNT_FILTER);
    const [filterResetKey, setFilterResetKey] = useState(() => buildAccountFilterResetKey(EMPTY_ACCOUNT_FILTER));
    const [accountToDelete, setAccountToDelete] = useState<EnrichedBankAccount | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const filteredAccounts = useMemo(() => (enableFilter ? filterBankAccounts(accounts, appliedFilters) : accounts), [accounts, appliedFilters, enableFilter]);
    const handleSearch = () => {
        setAppliedFilters(draftFilters);
        setFilterResetKey(buildAccountFilterResetKey(draftFilters));
    };
    const handleClearFilters = () => {
        setDraftFilters(EMPTY_ACCOUNT_FILTER);
        setAppliedFilters(EMPTY_ACCOUNT_FILTER);
        setFilterResetKey(buildAccountFilterResetKey(EMPTY_ACCOUNT_FILTER));
    };
    async function handleConfirmDelete() {
        if (!accountToDelete || deleting) {
            return;
        }
        setDeleting(true);
        setDeleteError(null);
        try {
            await deleteBankAccount(accountToDelete.id);
            setAccountToDelete(null);
            onRetry?.();
        }
        catch (error) {
            setDeleteError(error instanceof Error
                ? error.message
                : 'Không thể xóa tài khoản. Vui lòng thử lại.');
        }
        finally {
            setDeleting(false);
        }
    }
    if (loading) {
        return (<div className="dashboard-card space-y-4 p-6">
        <Skeleton className="h-6 w-48"/>
        <Skeleton className="h-64 w-full"/>
      </div>);
    }
    if (error) {
        return <ErrorState message={error} onRetry={onRetry}/>;
    }
    const activeCount = filteredAccounts.filter((item) => item.status === 'active').length;
    const totalBalance = filteredAccounts
        .filter((item) => item.status === 'active')
        .reduce((sum, item) => sum + item.balance, 0);
    const totalFrozen = filteredAccounts
        .filter((item) => item.status === 'active')
        .reduce((sum, item) => sum + item.frozenBalance, 0);
    const hasActiveFilters = buildAccountFilterResetKey(appliedFilters) !== buildAccountFilterResetKey(EMPTY_ACCOUNT_FILTER);
    const tableEmptyMessage = hasActiveFilters
        ? 'Không tìm thấy tài khoản phù hợp với bộ lọc.'
        : emptyMessage;
    return (<div className="dashboard-card overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Text as="h2" variant="h3">
            Danh sách tài khoản
          </Text>
          <Text variant="caption" className="mt-1 text-foreground-soft">
            {filteredAccounts.length} tài khoản · {activeCount} đang hoạt động
            {hasActiveFilters && accounts.length !== filteredAccounts.length
            ? ` · lọc từ ${accounts.length}`
            : ''}
          </Text>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">Tổng số dư: {formatCurrency(totalBalance)}</Badge>
          <Badge variant="expense">Phong tỏa: {formatCurrency(totalFrozen)}</Badge>
        </div>
      </div>

      {enableFilter && (<AccountFilter values={draftFilters} onChange={setDraftFilters} onSearch={handleSearch} onClear={handleClearFilters}/>)}

      <DataTable columns={[
            ...(showCustomerColumn
                ? [
                    {
                        key: 'customer',
                        header: 'Khách hàng',
                        render: (row: EnrichedBankAccount) => (<span className="font-medium text-foreground">{row.fullName}</span>),
                    },
                ]
                : []),
            {
                key: 'cif',
                header: 'CIF',
                className: 'whitespace-nowrap',
                render: (row) => (<span className="font-mono text-xs font-semibold text-primary-700">{row.cif}</span>),
            },
            {
                key: 'type',
                header: 'Loại tài khoản',
                render: (row) => <AccountTypeBadge account={row}/>,
            },
            {
                key: 'number',
                header: 'Số tài khoản',
                className: 'whitespace-nowrap',
                render: (row) => (<span className="font-mono text-xs">{formatAccountNumberDisplay(row.accountNumber)}</span>),
            },
            {
                key: 'bank',
                header: 'Ngân hàng',
                render: (row) => (<span className={cn('inline-flex rounded px-2 py-0.5 text-xs font-bold', row.bankBadgeClass)}>
                {row.bank}
              </span>),
            },
            {
                key: 'balance',
                header: 'Số dư',
                className: 'text-right whitespace-nowrap',
                render: (row) => (<span className="font-semibold text-foreground">{formatCurrency(row.balance)}</span>),
            },
            {
                key: 'frozen',
                header: 'Phong tỏa',
                className: 'text-right whitespace-nowrap',
                render: (row) => (<span className={row.frozenBalance > 0 ? 'text-expense' : 'text-foreground-soft'}>
                {formatCurrency(row.frozenBalance)}
              </span>),
            },
            {
                key: 'available',
                header: 'Khả dụng',
                className: 'text-right whitespace-nowrap',
                render: (row) => (<span className="font-medium text-income">{formatCurrency(row.availableBalance)}</span>),
            },
            {
                key: 'status',
                header: 'Trạng thái',
                render: (row) => <StatusBadge status={row.status}/>,
            },
            ...(enableDelete
                ? [
                    {
                        key: 'actions',
                        header: '',
                        className: 'w-16 text-right',
                        render: (row: EnrichedBankAccount) => (<button type="button" className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-50" aria-label={`Xóa tài khoản ${formatAccountNumberDisplay(row.accountNumber)}`} onClick={(event) => {
                                event.stopPropagation();
                                setDeleteError(null);
                                setAccountToDelete(row);
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
                ]
                : []),
        ]} data={filteredAccounts} getRowKey={(row) => row.id} onRowClick={onRowClick} emptyMessage={tableEmptyMessage} paginate={filteredAccounts.length > 10} paginationResetKey={filterResetKey} className="border-0 shadow-none"/>

      <ConfirmDialog open={Boolean(accountToDelete)} title="Xóa tài khoản" message={accountToDelete
            ? `Bạn có chắc muốn xóa ${accountToDelete.accountTypeLabel} ${formatAccountNumberDisplay(accountToDelete.accountNumber)} (CIF ${accountToDelete.cif})?`
            : ''} confirmLabel="Xóa" loading={deleting} onCancel={() => {
            if (!deleting) {
                setAccountToDelete(null);
                setDeleteError(null);
            }
        }} onConfirm={handleConfirmDelete}/>

      {deleteError && (<p className="border-t border-border px-6 py-3 text-sm text-red-600">{deleteError}</p>)}
    </div>);
}
