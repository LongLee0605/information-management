import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar } from '@/components/atoms/Avatar';
import {
  MoneyFlowLevelBadge,
  getLevelFilterClass,
  getLevelRowAccentClass,
} from '@/components/atoms/MoneyFlowLevelBadge';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { MoneyFlowNode } from '@/types/moneyFlow';
import { formatFlowAmount } from '@/utils/moneyFlowHelpers';
import { formatAccountNumberDisplay } from '@/utils';
import {
  countNodesByLevel,
  filterFlatMoneyFlowNodes,
  flattenMoneyFlowNodes,
  getLevelLabel,
} from '@/utils/moneyFlowTree';
import { cn } from '@/utils';

interface MoneyFlowNodeListProps {
  root: MoneyFlowNode;
  visibleRoot: MoneyFlowNode;
  highlightedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  className?: string;
}

const LEVEL_FILTERS = ['all', 0, 1, 2, 3] as const;
const INDENT = 18;
const BASE_INDENT = 6;

interface NodeListItemProps {
  node: MoneyFlowNode;
  depth: number;
  isHighlighted: boolean;
  isVisible: boolean;
  onSelect?: (nodeId: string) => void;
  itemRef?: (element: HTMLLIElement | null) => void;
}

const NodeListItem = memo(function NodeListItem({
  node,
  depth,
  isHighlighted,
  isVisible,
  onSelect,
  itemRef,
}: NodeListItemProps) {
  const amountLabel = node.amount !== undefined ? formatFlowAmount(node.amount) : null;

  return (
    <li ref={itemRef}>
      <button
        type="button"
        onClick={() => onSelect?.(node.id)}
        title={`${getLevelLabel(node.level)} · ${node.fullName}`}
        aria-current={isHighlighted ? 'true' : undefined}
        className={cn(
          'flex h-[68px] w-full items-center gap-2 rounded-lg border-l-4 px-2 text-left transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
          getLevelRowAccentClass(node.level),
          isHighlighted
            ? 'bg-primary-50 ring-1 ring-primary-200'
            : 'hover:bg-table-stripe',
          !isVisible && 'opacity-55',
        )}
      >
        <span
          className="shrink-0"
          style={{ width: BASE_INDENT + depth * INDENT }}
          aria-hidden="true"
        />

        <Avatar src={node.avatar} alt={node.fullName} size="sm" className="shrink-0" />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <MoneyFlowLevelBadge level={node.level} />
            <span className="truncate text-xs font-semibold text-foreground">
              {node.fullName}
            </span>
            {!isVisible && (
              <span className="shrink-0 rounded bg-amber-100 px-1 py-px text-[9px] font-semibold text-amber-800">
                ẩn
              </span>
            )}
          </div>
          <p className="truncate text-[10px] leading-tight text-muted">
            {node.cif} · {formatAccountNumberDisplay(node.accountNumber)}
          </p>
          <p
            className={cn(
              'truncate text-xs font-bold leading-tight',
              amountLabel ? 'text-orange-500' : 'invisible',
            )}
          >
            {amountLabel ?? '—'}
          </p>
        </div>
      </button>
    </li>
  );
});

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
  );
}

export function MoneyFlowNodeList({
  root,
  visibleRoot,
  highlightedNodeId,
  onSelectNode,
  className,
}: MoneyFlowNodeListProps) {
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<(typeof LEVEL_FILTERS)[number]>('all');
  const [keyboardIndex, setKeyboardIndex] = useState(-1);

  const debouncedQuery = useDebouncedValue(query, 200);
  const listViewportRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());

  const allItems = useMemo(() => flattenMoneyFlowNodes(root), [root]);
  const visibleItems = useMemo(() => flattenMoneyFlowNodes(root, visibleRoot), [root, visibleRoot]);
  const visibleIds = useMemo(() => new Set(visibleItems.map((item) => item.node.id)), [visibleItems]);
  const levelCounts = useMemo(() => countNodesByLevel(allItems), [allItems]);

  const items = useMemo(
    () => filterFlatMoneyFlowNodes(allItems, { query: debouncedQuery, level: levelFilter }),
    [allItems, debouncedQuery, levelFilter],
  );

  const shouldPinRoot = levelFilter === 'all' && !debouncedQuery.trim();
  const pinnedRoot = allItems[0]?.node ?? root;

  const navigableItems = useMemo(() => {
    if (!shouldPinRoot) {
      return items;
    }

    return items.filter((item) => item.node.id !== pinnedRoot.id);
  }, [items, shouldPinRoot, pinnedRoot.id]);

  const focusIndex = useMemo(() => {
    if (!highlightedNodeId) {
      return -1;
    }

    return navigableItems.findIndex((item) => item.node.id === highlightedNodeId);
  }, [highlightedNodeId, navigableItems]);

  const activeIndex = keyboardIndex >= 0 ? keyboardIndex : focusIndex;

  const handleSelectNode = useCallback((nodeId: string) => {
    setKeyboardIndex(-1);
    onSelectNode?.(nodeId);
  }, [onSelectNode]);

  const registerItemRef = useCallback((nodeId: string, element: HTMLLIElement | null) => {
    if (element) {
      itemRefs.current.set(nodeId, element);
    } else {
      itemRefs.current.delete(nodeId);
    }
  }, []);

  useEffect(() => {
    if (!highlightedNodeId) {
      return;
    }

    itemRefs.current.get(highlightedNodeId)?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [highlightedNodeId, items]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (event.key === '/' && !isTypingTarget(event.target)) {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = Math.max(
          0,
          Math.min(navigableItems.length - 1, (activeIndex < 0 ? -1 : activeIndex) + delta),
        );

        if (navigableItems[nextIndex]) {
          setKeyboardIndex(nextIndex);
          onSelectNode?.(navigableItems[nextIndex].node.id);
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, navigableItems, onSelectNode]);

  const hasActiveFilters = levelFilter !== 'all' || query.trim().length > 0;

  function clearFilters() {
    setQuery('');
    setLevelFilter('all');
    searchInputRef.current?.focus();
  }

  return (
    <aside className={cn('flex flex-col bg-white', className)}>
      <div className="panel-header space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground">Điều hướng nhanh</h3>
            <p className="mt-0.5 text-xs text-muted">
              {visibleItems.length}/{allItems.length} trên sơ đồ · {items.length} trong danh sách
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="shrink-0 text-[10px] font-semibold text-primary-700 hover:underline"
            >
              Xóa lọc
            </button>
          )}
        </div>

        <div className="relative mt-3">
          <input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tên, CIF, số TK..."
            aria-label="Tìm kiếm nhanh"
            className="form-input pr-8"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 text-xs text-muted hover:text-foreground"
              aria-label="Xóa tìm kiếm"
            >
              ×
            </button>
          )}
        </div>
        <p className="mt-1 text-[10px] text-muted">
          Phím tắt: <kbd className="rounded border px-1">/</kbd> hoặc <kbd className="rounded border px-1">Ctrl+K</kbd> tìm kiếm, <kbd className="rounded border px-1">↑</kbd><kbd className="rounded border px-1">↓</kbd> chọn
        </p>

        <div className="flex flex-wrap gap-2">
          {LEVEL_FILTERS.map((level) => {
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
        </div>
      </div>

      <div
        ref={listViewportRef}
        tabIndex={-1}
        className="panel-scroll px-2 pb-2 focus:outline-none"
      >
        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted">Không tìm thấy tài khoản phù hợp.</p>
        ) : (
          <div>
            {shouldPinRoot && (
              <div className="sticky top-0 z-10 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => handleSelectNode(pinnedRoot.id)}
                  title={`${getLevelLabel(pinnedRoot.level)} · ${pinnedRoot.fullName}`}
                  aria-current={highlightedNodeId === pinnedRoot.id ? 'true' : undefined}
                  className={cn(
                    'flex h-[68px] w-full items-center gap-2 rounded-lg border-l-4 px-2 text-left transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
                    getLevelRowAccentClass(pinnedRoot.level),
                    highlightedNodeId === pinnedRoot.id
                      ? 'bg-primary-50 ring-1 ring-primary-200'
                      : 'hover:bg-table-stripe',
                    !visibleIds.has(pinnedRoot.id) && 'opacity-55',
                  )}
                >
                  <span className="shrink-0" style={{ width: BASE_INDENT }} aria-hidden="true" />
                  <Avatar src={pinnedRoot.avatar} alt={pinnedRoot.fullName} size="sm" className="shrink-0" />
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <MoneyFlowLevelBadge level={pinnedRoot.level} />
                      <span className="truncate text-xs font-semibold text-foreground">
                        {pinnedRoot.fullName}
                      </span>
                    </div>
                    <p className="truncate text-[10px] leading-tight text-muted">
                      {pinnedRoot.cif} · {formatAccountNumberDisplay(pinnedRoot.accountNumber)}
                    </p>
                  </div>
                </button>
                <div className="mx-2 mt-2 border-b border-border" />
              </div>
            )}

            <ul>
              {navigableItems.map(({ node, depth }) => (
                <NodeListItem
                  key={node.id}
                  node={node}
                  depth={depth}
                  isHighlighted={highlightedNodeId === node.id}
                  isVisible={visibleIds.has(node.id)}
                  onSelect={handleSelectNode}
                  itemRef={(element) => registerItemRef(node.id, element)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
