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
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  getRowKey,
  className,
  emptyMessage = 'Không có dữ liệu.',
}: DataTableProps<T>) {
  return (
    <div className={cn('dashboard-card overflow-hidden', className)}>
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
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                  className={cn(
                    index % 2 === 0 ? 'bg-table-stripe' : 'bg-table-stripe-alt',
                    onRowClick && 'cursor-pointer hover:bg-blue-50',
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
