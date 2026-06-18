import { useCallback, useEffect, useMemo, useState } from 'react';
import { MoneyFlowLevelBadge } from '@/components/atoms/MoneyFlowLevelBadge';
import { MoneyFlowDiagram } from '@/components/organisms/MoneyFlowDiagram';
import { MoneyFlowNodeList } from '@/components/molecules/MoneyFlowNodeList';
import { MoneyFlowTableView } from '@/components/molecules/MoneyFlowTableView';
import type { MoneyFlowNode } from '@/types/moneyFlow';
import { formatAccountNumberDisplay } from '@/utils';
import { formatFlowAmount } from '@/utils/moneyFlowHelpers';
import { findMoneyFlowNode, getNodePath, getLevelLabel } from '@/utils/moneyFlowTree';
import { cn } from '@/utils';
type ExplorerView = 'diagram' | 'table';
interface MoneyFlowExplorerProps {
    root: MoneyFlowNode;
    className?: string;
}
function DiagramIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="6" r="2"/>
      <circle cx="6" cy="18" r="2"/>
      <circle cx="18" cy="18" r="2"/>
      <path d="M12 8v4M8.5 16.5L10.5 13M15.5 16.5L13.5 13"/>
    </svg>);
}
function TableIcon({ className }: {
    className?: string;
}) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <path d="M3 10h18M9 4v16"/>
    </svg>);
}
function isTypingTarget(target: EventTarget | null): boolean {
    return (target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target instanceof HTMLSelectElement);
}
export function MoneyFlowExplorer({ root, className }: MoneyFlowExplorerProps) {
    const [view, setView] = useState<ExplorerView>('diagram');
    const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
    const [visibleRoot, setVisibleRoot] = useState<MoneyFlowNode>(root);
    const rootId = root.id;
    const selectedNode = useMemo(() => (highlightedNodeId ? findMoneyFlowNode(root, highlightedNodeId)?.node ?? null : null), [root, highlightedNodeId]);
    const selectedPath = useMemo(() => (highlightedNodeId ? getNodePath(root, highlightedNodeId) : []), [root, highlightedNodeId]);
    const handleSelectNode = useCallback((nodeId: string) => {
        setHighlightedNodeId(nodeId);
        setView((current) => (current === 'table' ? 'diagram' : current));
    }, []);
    const handleClearSelection = useCallback(() => {
        setHighlightedNodeId(null);
    }, []);
    const handleVisibleRootChange = useCallback((nextVisibleRoot: MoneyFlowNode) => {
        setVisibleRoot(nextVisibleRoot);
    }, []);
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== 'Escape' || isTypingTarget(event.target)) {
                return;
            }
            setHighlightedNodeId(null);
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);
    return (<div className={cn('dashboard-card overflow-hidden', className)}>
      <div className="panel-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg border border-border bg-white p-0.5">
          <button type="button" onClick={() => setView('diagram')} className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors', view === 'diagram'
            ? 'bg-primary-600 text-white'
            : 'text-muted hover:bg-table-stripe hover:text-foreground')}>
            <DiagramIcon className="h-4 w-4"/>
            Sơ đồ
          </button>
          <button type="button" onClick={() => setView('table')} className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors', view === 'table'
            ? 'bg-primary-600 text-white'
            : 'text-muted hover:bg-table-stripe hover:text-foreground')}>
            <TableIcon className="h-4 w-4"/>
            Bảng chi tiết
          </button>
        </div>

        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-semibold text-foreground">{root.fullName}</p>
          <p className="text-xs text-muted">
            F0 · {root.cif} · {formatAccountNumberDisplay(root.accountNumber)}
          </p>
        </div>
      </div>

      {selectedNode && (<div className="border-b border-primary-100 bg-primary-50/60 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-primary-600">
                Đang chọn
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <MoneyFlowLevelBadge level={selectedNode.level} size="sm"/>
                <p className="truncate text-sm font-bold text-foreground">{selectedNode.fullName}</p>
              </div>
              {selectedPath.length > 1 && (<p className="mt-1 truncate text-xs text-muted">
                  {selectedPath.map((node) => getLevelLabel(node.level)).join(' → ')}
                </p>)}
            </div>
            <div className="text-right">
              {selectedNode.amount !== undefined && (<p className="text-base font-bold text-orange-500">
                  {formatFlowAmount(selectedNode.amount)}
                </p>)}
              <button type="button" className="mt-1 text-xs font-medium text-primary-700 hover:underline" onClick={handleClearSelection}>
                Bỏ chọn (Esc)
              </button>
            </div>
          </div>
        </div>)}

      {view === 'diagram' ? (<div className="grid items-start gap-0 xl:grid-cols-[minmax(0,1fr)_300px]">
          <MoneyFlowDiagram key={`diagram-${rootId}`} root={root} highlightedNodeId={highlightedNodeId} onHighlightNode={setHighlightedNodeId} onVisibleRootChange={handleVisibleRootChange} embedded/>
          <MoneyFlowNodeList key={`list-${rootId}`} root={root} visibleRoot={visibleRoot} highlightedNodeId={highlightedNodeId} onSelectNode={handleSelectNode} className="border-t border-border xl:border-l xl:border-t-0"/>
        </div>) : (<MoneyFlowTableView key={rootId} root={root} highlightedNodeId={highlightedNodeId} onSelectNode={handleSelectNode}/>)}
    </div>);
}
