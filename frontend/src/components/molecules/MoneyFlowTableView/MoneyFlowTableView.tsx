import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar } from '@/components/atoms/Avatar';
import { MoneyFlowLevelBadge, getLevelFilterClass } from '@/components/atoms/MoneyFlowLevelBadge';
import type { MoneyFlowNode } from '@/types/moneyFlow';
import { formatAccountNumberDisplay } from '@/utils';
import { formatFlowAmount } from '@/utils/moneyFlowHelpers';
import {
  countNodesByLevel,
  filterFlatMoneyFlowNodes,
  flattenMoneyFlowNodes,
  getLevelLabel,
} from '@/utils/moneyFlowTree';
import { cn } from '@/utils';

interface MoneyFlowTableViewProps {
  root: MoneyFlowNode;
  highlightedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  className?: string;
}

type SortKey = 'level' | 'amount' | 'name';

export function MoneyFlowTableView({
  root,
  highlightedNodeId,
  onSelectNode,
  className,
}: MoneyFlowTableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('level');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());

  const allItems = useMemo(() => flattenMoneyFlowNodes(root), [root]);
  const levelCounts = useMemo(() => countNodesByLevel(allItems), [allItems]);

  const items = useMemo(() => {
    const rows = filterFlatMoneyFlowNodes(allItems, { level: levelFilter });

    return [...rows].sort((left, right) => {
      if (sortKey === 'name') {
        return left.node.fullName.localeCompare(right.node.fullName, 'vi');
      }

      if (sortKey === 'amount') {
        return (right.node.amount ?? 0) - (left.node.amount ?? 0);
      }

      if (left.node.level !== right.node.level) {
        return left.node.level - right.node.level;
      }

      return (right.node.amount ?? 0) - (left.node.amount ?? 0);
    });
  }, [allItems, sortKey, levelFilter]);

  useEffect(() => {
    if (!highlightedNodeId) {
      return;
    }

    rowRefs.current.get(highlightedNodeId)?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [highlightedNodeId, items]);

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="panel-header flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted">Lọc tầng:</span>
        {(['all', 0, 1, 2, 3] as const).map((level) => {
          const count = level === 'all' ? allItems.length : (levelCounts[level] ?? 0);

          return (
          <button
            key={String(level)}
            type="button"
            onClick={() => setLevelFilter(level)}
            className={cn(
              'filter-chip',
              level === 'all'
                ? levelFilter === 'all'
                  ? 'border-slate-600 bg-slate-600 text-white'
                  : 'border-border bg-white text-muted hover:text-foreground'
                : getLevelFilterClass(level, levelFilter === level),
            )}
          >
            {level === 'all' ? 'Tất cả' : getLevelLabel(level)} ({count})
          </button>
          );
        })}

        <label className="ml-auto flex items-center gap-2 text-xs text-muted">
          Sắp xếp
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            className="form-select w-auto py-1 text-xs"
          >
            <option value="level">Theo tầng</option>
            <option value="amount">Số tiền cao nhất</option>
            <option value="name">Tên A-Z</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-table-stripe text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Tầng</th>
              <th className="px-4 py-3 font-semibold">Khách hàng</th>
              <th className="px-4 py-3 font-semibold">CIF</th>
              <th className="px-4 py-3 font-semibold">Số tài khoản</th>
              <th className="px-4 py-3 font-semibold text-right">Dòng tiền</th>
              <th className="px-4 py-3 font-semibold">Giao dịch</th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ node }) => {
              const isHighlighted = highlightedNodeId === node.id;

              return (
                <tr
                  key={node.id}
                  ref={(element) => {
                    if (element) {
                      rowRefs.current.set(node.id, element);
                    } else {
                      rowRefs.current.delete(node.id);
                    }
                  }}
                  className={cn(
                    'cursor-pointer border-t border-border transition-colors',
                    isHighlighted ? 'bg-primary-50' : 'hover:bg-table-stripe/70',
                  )}
                  onClick={() => onSelectNode?.(node.id)}
                >
                  <td className="px-4 py-3">
                    <MoneyFlowLevelBadge level={node.level} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar src={node.avatar} alt={node.fullName} size="sm" />
                      <span className="font-medium text-foreground">{node.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground-soft">{node.cif}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {formatAccountNumberDisplay(node.accountNumber)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-orange-500">
                    {node.amount !== undefined ? formatFlowAmount(node.amount) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{node.periodLabel ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
