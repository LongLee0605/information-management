import { useMemo, useState } from 'react';
import { Pagination } from '@/components/molecules/Pagination';
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import { cn } from '@/utils';

interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  onRowClick?: (row: T, index: number) => void;
  getRowKey: (row: T, index: number) => string;
  className?: string;
  emptyMessage?: string;
  pageSize?: number;
  paginate?: boolean;
  paginationResetKey?: string | number;
  itemLabel?: string;
}

interface DataTableBodyProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  onRowClick?: (row: T, index: number) => void;
  getRowKey: (row: T, index: number) => string;
  emptyMessage: string;
  pageSize: number;
  paginate: boolean;
  itemLabel: string;
}

function DataTableBody<T>({
  columns,
  data,
  onRowClick,
  getRowKey,
  emptyMessage,
  pageSize,
  paginate,
  itemLabel,
}: DataTableBodyProps<T>) {
  const [page, setPage] = useState(1);
  const shouldPaginate = paginate && data.length > pageSize;
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleData = useMemo(() => {
    if (!shouldPaginate) {
      return data;
    }

    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, shouldPaginate, currentPage, pageSize]);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-table-head text-left text-white">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide', col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleData.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                  className={cn(
                    index % 2 === 0 ? 'bg-table-stripe' : 'bg-table-stripe-alt',
                    onRowClick && 'customer-table-row cursor-pointer',
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('border-t border-border px-4 py-3 text-foreground-soft', col.className)}
                    >
                      {col.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {shouldPaginate && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={data.length}
          pageSize={pageSize}
          itemLabel={itemLabel}
          onPageChange={setPage}
        />
      )}
    </>
  );
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  getRowKey,
  className,
  emptyMessage = 'Không có dữ liệu.',
  pageSize = DEFAULT_PAGE_SIZE,
  paginate = true,
  paginationResetKey = '',
  itemLabel = 'mục',
}: DataTableProps<T>) {
  return (
    <div className={cn('dashboard-card overflow-hidden', className)}>
      <DataTableBody
        key={paginationResetKey}
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        getRowKey={getRowKey}
        emptyMessage={emptyMessage}
        pageSize={pageSize}
        paginate={paginate}
        itemLabel={itemLabel}
      />
    </div>
  );
}

export function DataTableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="dashboard-card overflow-hidden">
      <div className="bg-table-head px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 flex-1 rounded bg-white/20" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className={cn(
            'flex gap-4 border-t border-border px-4 py-3',
            rowIndex % 2 === 0 ? 'bg-table-stripe' : 'bg-table-stripe-alt',
          )}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 flex-1 shimmer rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
