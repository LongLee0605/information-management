import { Avatar } from '@/components/atoms/Avatar';
import type { MoneyFlowNode } from '@/types/moneyFlow';
import { formatFlowAmount } from '@/utils/moneyFlowHelpers';
import { cn } from '@/utils';

interface MoneyFlowDiagramProps {
  root: MoneyFlowNode;
  className?: string;
}

const CARD_WIDTH = 220;
const COLUMN_GAP = 40;
const CHILD_GAP = 24;
const STEM_HEIGHT = 28;
const DROP_HEIGHT = 24;
const CONNECTOR_COLOR = '#94a3b8';

function formatAccountNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  const head = digits.slice(0, 4);
  const tail = digits.slice(4).replace(/(\d{3})(?=\d)/g, '$1.');
  return tail ? `${head}.${tail}` : head;
}

function getSubtreeWidth(node: MoneyFlowNode): number {
  const children = node.children ?? [];
  if (children.length === 0) {
    return CARD_WIDTH;
  }

  return children.reduce(
    (total, child, index) => total + getSubtreeWidth(child) + (index > 0 ? CHILD_GAP : 0),
    0,
  );
}

function getChildCenterXs(children: MoneyFlowNode[], gap: number): number[] {
  const widths = children.map(getSubtreeWidth);
  let offset = 0;

  return widths.map((width, index) => {
    const center = offset + width / 2;
    offset += width + (index < widths.length - 1 ? gap : 0);
    return center;
  });
}

interface TreeConnectorProps {
  width: number;
  parentCenterX: number;
  childCenterXs: number[];
  stemHeight?: number;
  dropHeight?: number;
}

function TreeConnector({
  width,
  parentCenterX,
  childCenterXs,
  stemHeight = STEM_HEIGHT,
  dropHeight = DROP_HEIGHT,
}: TreeConnectorProps) {
  if (childCenterXs.length === 0) {
    return null;
  }

  const height = stemHeight + dropHeight;
  const busY = stemHeight;
  const segments: string[] = [`M ${parentCenterX} 0 V ${busY}`];

  if (childCenterXs.length === 1) {
    const childX = childCenterXs[0];
    if (Math.abs(parentCenterX - childX) < 0.5) {
      segments.push(`M ${parentCenterX} ${busY} V ${height}`);
    } else {
      segments.push(`M ${parentCenterX} ${busY} H ${childX} V ${height}`);
    }
  } else {
    const minX = Math.min(...childCenterXs);
    const maxX = Math.max(...childCenterXs);
    const busStart = Math.min(parentCenterX, minX);
    const busEnd = Math.max(parentCenterX, maxX);

    segments.push(`M ${busStart} ${busY} H ${busEnd}`);
    for (const childX of childCenterXs) {
      segments.push(`M ${childX} ${busY} V ${height}`);
    }
  }

  return (
    <svg width={width} height={height} className="block shrink-0 overflow-visible" aria-hidden>
      <path
        d={segments.join(' ')}
        fill="none"
        stroke={CONNECTOR_COLOR}
        strokeWidth={1}
        strokeLinecap="square"
      />
    </svg>
  );
}

function getLevelLabel(level: number): string {
  return `F${level}`;
}

function FlowNodeCard({ node }: { node: MoneyFlowNode }) {
  const isRoot = node.level === 0;
  const isF1 = node.level === 1;
  const isF3 = node.level === 3;

  return (
    <div
      className={cn(
        'shrink-0 rounded-xl border-2 p-4 text-center shadow-sm',
        isRoot && 'border-primary-600 bg-primary-600 text-white',
        isF1 && 'border-primary-400 bg-white',
        node.level === 2 && 'border-border bg-white',
        isF3 && 'border-dashed border-amber-500 bg-amber-50/40',
      )}
      style={{ width: CARD_WIDTH }}
    >
      {!isRoot && (
        <span
          className={cn(
            'mb-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide',
            isF3 ? 'bg-amber-100 text-amber-800' : 'bg-table-stripe text-muted',
          )}
        >
          {getLevelLabel(node.level)}
        </span>
      )}

      <div className="mx-auto mb-2 flex justify-center">
        <Avatar
          src={node.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${node.id}`}
          alt={node.fullName}
          size={node.level >= 2 ? 'sm' : 'md'}
        />
      </div>

      <p className={cn('text-sm font-bold leading-snug', isRoot ? 'text-white' : 'text-primary-600')}>
        {node.fullName}
      </p>
      <p className={cn('mt-1 text-[11px] leading-relaxed', isRoot ? 'text-blue-100' : 'text-muted')}>
        {node.cif} · {formatAccountNumber(node.accountNumber)}
      </p>

      {node.amount !== undefined && (
        <p className="mt-2 text-base font-bold text-orange-500">
          <span aria-hidden="true">↑ </span>
          {formatFlowAmount(node.amount)}
        </p>
      )}

      {node.periodLabel && (
        <p className={cn('mt-1 text-[10px]', isRoot ? 'text-blue-100/90' : 'text-muted')}>
          {node.periodLabel}
        </p>
      )}

      <div className="mt-3 flex justify-center">
        <span className={cn('rounded px-2 py-0.5 text-[10px] font-bold uppercase', node.bankBadgeClass)}>
          {node.bank}
        </span>
      </div>
    </div>
  );
}

function FlowSubtree({ node }: { node: MoneyFlowNode }) {
  const children = node.children ?? [];
  const subtreeWidth = getSubtreeWidth(node);
  const childCenters = getChildCenterXs(children, CHILD_GAP);

  return (
    <div className="flex flex-col items-center" style={{ width: subtreeWidth }}>
      <FlowNodeCard node={node} />

      {children.length > 0 && (
        <>
          <TreeConnector
            width={subtreeWidth}
            parentCenterX={subtreeWidth / 2}
            childCenterXs={childCenters}
          />
          <div className="flex items-start" style={{ gap: CHILD_GAP }}>
            {children.map((child) => (
              <FlowSubtree key={child.id} node={child} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function MoneyFlowDiagram({ root, className }: MoneyFlowDiagramProps) {
  const f1Nodes = root.children ?? [];
  const f1Widths = f1Nodes.map(getSubtreeWidth);
  const diagramWidth =
    f1Widths.reduce((total, width) => total + width, 0)
    + Math.max(0, f1Nodes.length - 1) * COLUMN_GAP;

  const f1Centers: number[] = [];
  let offsetX = 0;

  for (let index = 0; index < f1Widths.length; index += 1) {
    f1Centers.push(offsetX + f1Widths[index] / 2);
    offsetX += f1Widths[index] + COLUMN_GAP;
  }

  return (
    <div className={cn('dashboard-card overflow-x-auto p-6 sm:p-8', className)}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-foreground">Sơ Đồ Dòng Tiền</h3>
        <div className="flex flex-wrap gap-3 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-primary-600" />
            F0 · Tài khoản gốc
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border-2 border-primary-400 bg-white" />
            F1 · Nhận trực tiếp
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border-2 border-border bg-white" />
            F2 · Tầng gián tiếp
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border-2 border-dashed border-amber-500 bg-amber-50" />
            F3 · Tầng sâu / khó truy
          </span>
        </div>
      </div>

      <div
        className="mx-auto flex flex-col items-center"
        style={{ width: Math.max(diagramWidth, CARD_WIDTH) }}
      >
        <FlowNodeCard node={root} />

        {f1Nodes.length > 0 && (
          <>
            <TreeConnector
              width={diagramWidth}
              parentCenterX={diagramWidth / 2}
              childCenterXs={f1Centers}
            />
            <div className="flex w-full items-start" style={{ gap: COLUMN_GAP }}>
              {f1Nodes.map((node) => (
                <FlowSubtree key={node.id} node={node} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
