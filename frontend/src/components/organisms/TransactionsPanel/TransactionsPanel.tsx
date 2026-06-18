import { useMemo, useState } from 'react';
import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms/Button';
import { Select } from '@/components/atoms/Select';
import { DataTable, DataTableSkeleton } from '@/components/molecules/DataTable';
import {
  MethodBadge,
  TransactionTypeBadge,
} from '@/components/molecules/TransactionBadge';
import { TransactionDetailModal } from '@/components/molecules/TransactionDetailModal';
import { getEffectiveAppDateRange } from '@/constants';
import { useSelectedUserContext } from '@/context';
import type { TransactionWithUser, User } from '@/types';
import { formatCurrency, formatDate, getAvatarUrl, getCifFromUserId, isDateInRange } from '@/utils';

export interface DateRangeFilter {
  fromDate: string;
  toDate: string;
}

interface TransactionsPanelProps {
  transactions: TransactionWithUser[];
  loading: boolean;
  users: User[];
  lockedUserId?: string;
  showUserColumn?: boolean;
  userLookup?: Map<string, User>;
  dateRange?: DateRangeFilter;
  onDateRangeChange?: (range: DateRangeFilter) => void;
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function matchesSearch(transaction: TransactionWithUser, query: string): boolean {
  if (!query) return true;

  return [
    transaction.id,
    transaction.description,
    transaction.category,
    transaction.method,
    transaction.userFullName,
    transaction.userId,
  ]
    .join(' ')
    .toLowerCase()
    .includes(query);
}

export function TransactionsPanel({
  transactions,
  loading,
  users,
  lockedUserId,
  showUserColumn = !lockedUserId,
  userLookup,
  dateRange,
  onDateRangeChange,
}: TransactionsPanelProps) {
  const { contextUserId, setContextUserId } = useSelectedUserContext();
  const [search, setSearch] = useState('');
  const effectiveDateRange = getEffectiveAppDateRange();
  const [internalFromDate, setInternalFromDate] = useState<string>(effectiveDateRange.fromDate);
  const [internalToDate, setInternalToDate] = useState<string>(effectiveDateRange.toDate);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithUser | null>(null);

  const fromDate = dateRange?.fromDate ?? internalFromDate;
  const toDate = dateRange?.toDate ?? internalToDate;

  function updateDateRange(nextFromDate: string, nextToDate: string) {
    if (onDateRangeChange) {
      onDateRangeChange({ fromDate: nextFromDate, toDate: nextToDate });
      return;
    }

    setInternalFromDate(nextFromDate);
    setInternalToDate(nextToDate);
  }

  const activeUserFilter = lockedUserId ?? contextUserId ?? 'all';

  const userOptions = useMemo(
    () => [
      { value: 'all', label: 'Tất cả khách hàng' },
      ...users.map((user) => ({
        value: user.id,
        label: user.fullName,
        description: getCifFromUserId(user.id),
      })),
    ],
    [users],
  );

  const filteredTransactions = useMemo(() => {
    const query = normalizeSearch(search);

    return transactions.filter((transaction) => {
      const matchesUser =
        activeUserFilter === 'all' || transaction.userId === activeUserFilter;
      const matchesDate = isDateInRange(transaction.date, fromDate, toDate);

      return matchesUser && matchesSearch(transaction, query) && matchesDate;
    });
  }, [transactions, search, activeUserFilter, fromDate, toDate]);

  const paginationResetKey = `${search}|${activeUserFilter}|${fromDate}|${toDate}`;

  const selectedUser = selectedTransaction
    ? userLookup?.get(selectedTransaction.userId) ?? null
    : null;

  function handleUserFilterChange(value: string) {
    if (lockedUserId) return;
    setContextUserId(value === 'all' ? null : value);
  }

  function handleClearFilters() {
    const range = getEffectiveAppDateRange();
    setSearch('');
    updateDateRange(range.fromDate, range.toDate);
    if (!lockedUserId) {
      setContextUserId(null);
    }
  }

  const columns = [
    {
      key: 'id',
      header: 'Mã GD',
      className: 'w-32',
      render: (tx: TransactionWithUser) => (
        <span className="font-semibold text-foreground">{tx.id}</span>
      ),
    },
    ...(showUserColumn
      ? [
          {
            key: 'customer',
            header: 'Khách Hàng',
            render: (tx: TransactionWithUser) => (
              <div className="flex items-center gap-2">
                <Avatar
                  src={
                    userLookup?.get(tx.userId)?.avatar
                    ?? getAvatarUrl(tx.userId, 'male')
                  }
                  alt={tx.userFullName}
                  size="sm"
                />
                <span>{tx.userFullName}</span>
              </div>
            ),
          },
        ]
      : []),
    {
      key: 'date',
      header: 'Ngày',
      render: (tx: TransactionWithUser) => formatDate(tx.date),
    },
    {
      key: 'category',
      header: 'Danh Mục',
      render: (tx: TransactionWithUser) => tx.category,
    },
    {
      key: 'description',
      header: 'Mô Tả',
      className: 'max-w-xs',
      render: (tx: TransactionWithUser) => (
        <span className="line-clamp-2">{tx.description}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Số Tiền',
      render: (tx: TransactionWithUser) => (
        <span className="font-semibold text-foreground">
          {formatCurrency(tx.amount)}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Loại',
      render: (tx: TransactionWithUser) => <TransactionTypeBadge type={tx.type} />,
    },
    {
      key: 'method',
      header: 'Hình Thức',
      render: (tx: TransactionWithUser) => <MethodBadge method={tx.method} />,
    },
  ];

  return (
    <>
      <div className="dashboard-card mb-4 flex flex-col gap-3 p-4 lg:flex-row lg:flex-wrap lg:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 lg:min-w-[220px]">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Tìm kiếm
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Mã GD, mô tả, danh mục, khách hàng..."
            className="form-input"
          />
        </label>

        <label className="flex w-full flex-col gap-1.5 sm:w-40">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Từ ngày
          </span>
          <input
            type="date"
            value={fromDate}
            min={effectiveDateRange.fromDate}
            max={effectiveDateRange.toDate}
            onChange={(event) => updateDateRange(event.target.value, toDate)}
            className="form-input"
          />
        </label>

        <label className="flex w-full flex-col gap-1.5 sm:w-40">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Đến ngày
          </span>
          <input
            type="date"
            value={toDate}
            min={effectiveDateRange.fromDate}
            max={effectiveDateRange.toDate}
            onChange={(event) => updateDateRange(fromDate, event.target.value)}
            className="form-input"
          />
        </label>

        {!lockedUserId && (
          <div className="flex w-full flex-col gap-1.5 lg:w-72">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Khách hàng
            </span>
            <Select
              value={activeUserFilter}
              onChange={handleUserFilterChange}
              options={userOptions}
              aria-label="Lọc theo khách hàng"
            />
            {activeUserFilter !== 'all' && (
              <p className="text-xs text-primary-600">
                Đang chọn khách hàng — Tổng Quan được kích hoạt trên menu Báo Cáo
              </p>
            )}
          </div>
        )}

        <Button
          variant="secondary"
          type="button"
          className="shrink-0"
          onClick={handleClearFilters}
        >
          Xóa bộ lọc
        </Button>
      </div>

      {loading ? (
        <DataTableSkeleton rows={10} cols={showUserColumn ? 8 : 7} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredTransactions}
          getRowKey={(tx) => tx.id}
          onRowClick={(tx) => setSelectedTransaction(tx)}
          emptyMessage="Không có giao dịch phù hợp."
          paginationResetKey={paginationResetKey}
          itemLabel="giao dịch"
        />
      )}

      <TransactionDetailModal
        transaction={selectedTransaction}
        user={selectedUser}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  );
}
