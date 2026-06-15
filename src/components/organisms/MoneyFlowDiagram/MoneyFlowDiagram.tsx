import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Avatar } from '@/components/atoms/Avatar';
import { MoneyFlowLevelBadge } from '@/components/atoms/MoneyFlowLevelBadge';
import type { MoneyFlowNode } from '@/types/moneyFlow';
import { formatFlowAmount } from '@/utils/moneyFlowHelpers';
import { formatAccountNumberDisplay } from '@/utils/accountRegistry';
import {
  countDescendants,
  filterMoneyFlowTree,
  getNodePath,
  resolveRevealViewDepth,
  resolveViewDepth,
  type MoneyFlowViewDepth,
} from '@/utils/moneyFlowTree';
import { cn, getAvatarUrl } from '@/utils';

interface MoneyFlowDiagramProps {
  root: MoneyFlowNode;
  className?: string;
  highlightedNodeId?: string | null;
  onHighlightNode?: (nodeId: string | null) => void;
  onVisibleRootChange?: (root: MoneyFlowNode) => void;
  embedded?: boolean;
}

const CARD_WIDTH = 176;
const CARD_WIDTH_COMPACT = 152;
const CARD_HEIGHT = 210;
const CARD_HEIGHT_COMPACT = 198;
const COLUMN_GAP = 24;
const CHILD_GAP = 16;
const CONNECTOR_GAP = 8;
const STEM_HEIGHT = 22;
const DROP_HEIGHT = 18;
const CONNECTOR_COLOR = '#cbd5e1';
const CONNECTOR_WIDTH = 1.25;

const DEPTH_OPTIONS: { value: MoneyFlowViewDepth; label: string }[] = [
  { value: 1, label: 'F0→F1' },
  { value: 2, label: 'Đến F2' },
  { value: 3, label: 'Đến F3' },
  { value: 'all', label: 'Tất cả' },
];

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.4;
const ZOOM_STEP = 0.1;

interface ChildLayout {
  node: MoneyFlowNode;
  width: number;
  left: number;
  centerX: number;
}

function getChildrenLayout(
  children: MoneyFlowNode[],
  cardWidth: number,
  gap: number,
): { totalWidth: number; layouts: ChildLayout[] } {
  if (children.length === 0) {
    return { totalWidth: cardWidth, layouts: [] };
  }

  const widths = children.map((child) => getSubtreeWidth(child, cardWidth, gap));
  const totalWidth = widths.reduce((sum, width) => sum + width, 0)
    + Math.max(0, children.length - 1) * gap;

  let offset = 0;
  const layouts = children.map((child, index) => {
    const width = widths[index];
    const layout: ChildLayout = {
      node: child,
      width,
      left: offset,
      centerX: offset + width / 2,
    };
    offset += width + gap;
    return layout;
  });

  return { totalWidth, layouts };
}

function getSubtreeWidth(node: MoneyFlowNode, cardWidth: number, gap: number): number {
  const children = node.children ?? [];
  if (children.length === 0) {
    return cardWidth;
  }

  return getChildrenLayout(children, cardWidth, gap).totalWidth;
}

function buildConnectorPath(
  parentCenterX: number,
  childCenterXs: number[],
  busY: number,
  endY: number,
): string {
  if (childCenterXs.length === 0) {
    return '';
  }

  if (childCenterXs.length === 1) {
    const childX = childCenterXs[0];

    if (Math.abs(parentCenterX - childX) < 0.5) {
      return `M ${parentCenterX} 0 L ${childX} ${endY}`;
    }

    return `M ${parentCenterX} 0 L ${parentCenterX} ${busY} L ${childX} ${busY} L ${childX} ${endY}`;
  }

  const minX = Math.min(...childCenterXs);
  const maxX = Math.max(...childCenterXs);
  const busLeft = Math.min(minX, parentCenterX);
  const busRight = Math.max(maxX, parentCenterX);
  const segments = [
    `M ${parentCenterX} 0 L ${parentCenterX} ${busY}`,
    `M ${busLeft} ${busY} L ${busRight} ${busY}`,
  ];

  for (const childX of childCenterXs) {
    segments.push(`M ${childX} ${busY} L ${childX} ${endY}`);
  }

  return segments.join(' ');
}

function TreeConnector({
  width,
  parentCenterX,
  childCenterXs,
}: {
  width: number;
  parentCenterX: number;
  childCenterXs: number[];
}) {
  if (childCenterXs.length === 0) {
    return null;
  }

  const height = STEM_HEIGHT + DROP_HEIGHT;
  const busY = STEM_HEIGHT;
  const pathD = buildConnectorPath(parentCenterX, childCenterXs, busY, height);

  return (
    <div className="shrink-0" style={{ width, paddingTop: CONNECTOR_GAP }}>
      <svg
        width={width}
        height={height}
        className="block overflow-visible"
        aria-hidden
      >
        <path
          d={pathD}
          fill="none"
          stroke={CONNECTOR_COLOR}
          strokeWidth={CONNECTOR_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

interface FlowNodeCardProps {
  node: MoneyFlowNode;
  sourceNode: MoneyFlowNode;
  compact: boolean;
  highlighted: boolean;
  selected: boolean;
  hiddenDescendants: number;
  onExpandBranch?: (nodeId: string) => void;
  onSelect?: (nodeId: string) => void;
  cardRef?: (element: HTMLDivElement | null) => void;
}

const FlowNodeCard = memo(function FlowNodeCard({
  node,
  sourceNode,
  compact,
  highlighted,
  selected,
  hiddenDescendants,
  onExpandBranch,
  onSelect,
  cardRef,
}: FlowNodeCardProps) {
  const isRoot = node.level === 0;
  const isF1 = node.level === 1;
  const isF3 = node.level === 3;
  const cardWidth = compact ? CARD_WIDTH_COMPACT : CARD_WIDTH;
  const cardHeight = compact ? CARD_HEIGHT_COMPACT : CARD_HEIGHT;
  const amountLabel = node.amount !== undefined ? `↑ ${formatFlowAmount(node.amount)}` : null;
  const showExpand = hiddenDescendants > 0 && Boolean(onExpandBranch);

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(node.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect?.(node.id);
        }
      }}
      className={cn(
        'box-border flex shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border p-2 text-center shadow-sm transition-shadow duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        isRoot && 'border-primary-600 bg-primary-600 text-white',
        isF1 && 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-md',
        node.level === 2 && 'border-slate-200 bg-white hover:border-primary-200 hover:shadow-md',
        isF3 && 'border-dashed border-amber-400 bg-amber-50/60 hover:bg-amber-50',
        (highlighted || selected) && 'shadow-md ring-2 ring-primary-400',
      )}
      style={{ width: cardWidth, height: cardHeight }}
    >
      <div className="flex h-4 shrink-0 items-center justify-center">
        <MoneyFlowLevelBadge level={node.level} onDark={isRoot} />
      </div>

      <div className="flex h-9 shrink-0 items-center justify-center">
        <Avatar
          src={node.avatar ?? getAvatarUrl(node.id, 'male')}
          alt={node.fullName}
          size="sm"
        />
      </div>

      <p
        className={cn(
          'h-8 shrink-0 overflow-hidden px-0.5 text-[11px] font-bold leading-[1.15]',
          isRoot ? 'text-white' : 'text-primary-700',
        )}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {node.fullName}
      </p>

      <div className="flex h-7 shrink-0 flex-col justify-center overflow-hidden px-0.5">
        <p className={cn('truncate text-[9px] leading-tight', isRoot ? 'text-blue-100' : 'text-slate-500')}>
          {node.cif}
        </p>
        <p className={cn('truncate text-[9px] leading-tight', isRoot ? 'text-blue-100/80' : 'text-slate-400')}>
          {formatAccountNumberDisplay(node.accountNumber)}
        </p>
      </div>

      <p className={cn(
        'flex h-4 shrink-0 items-center justify-center text-[11px] font-bold leading-none',
        amountLabel ? 'text-orange-500' : 'invisible',
      )}
      >
        {amountLabel ?? '—'}
      </p>

      <p className={cn(
        'flex h-3.5 shrink-0 items-center justify-center truncate px-1 text-[8px] leading-none',
        isRoot ? 'text-blue-100/80' : 'text-slate-400',
        !node.periodLabel && 'invisible',
      )}
      >
        {node.periodLabel ?? '—'}
      </p>

      <div className="flex h-4 shrink-0 items-center justify-center">
        <span className={cn('rounded px-1.5 py-px text-[8px] font-bold uppercase leading-none', node.bankBadgeClass)}>
          {node.bank}
        </span>
      </div>

      <div className="mt-auto flex h-5 shrink-0 items-center justify-center">
        {showExpand ? (
          <button
            type="button"
            className="w-full truncate rounded border border-primary-200 bg-primary-50 px-1 py-0.5 text-[8px] font-semibold leading-tight text-primary-700 hover:bg-primary-100"
            onClick={(event) => {
              event.stopPropagation();
              onExpandBranch?.(sourceNode.id);
            }}
          >
            +{hiddenDescendants} nhánh
          </button>
        ) : (
          <span className="invisible text-[8px]">—</span>
        )}
      </div>
    </div>
  );
});

function FlowSubtree({
  node,
  sourceNode,
  compact,
  highlightedNodeId,
  hiddenCounts,
  onExpandBranch,
  onSelect,
  registerNodeRef,
  cardWidth,
  siblingGap,
}: {
  node: MoneyFlowNode;
  sourceNode: MoneyFlowNode;
  compact: boolean;
  highlightedNodeId?: string | null;
  hiddenCounts: Map<string, number>;
  onExpandBranch?: (nodeId: string) => void;
  onSelect?: (nodeId: string) => void;
  registerNodeRef: (nodeId: string, element: HTMLDivElement | null) => void;
  cardWidth: number;
  siblingGap: number;
}) {
  const children = node.children ?? [];
  const childLayout = getChildrenLayout(children, cardWidth, siblingGap);
  const columnWidth = children.length > 0 ? childLayout.totalWidth : cardWidth;

  return (
    <div className="flex flex-col items-center" style={{ width: columnWidth }}>
      <FlowNodeCard
        node={node}
        sourceNode={sourceNode}
        compact={compact}
        highlighted={highlightedNodeId === node.id}
        selected={highlightedNodeId === node.id}
        hiddenDescendants={hiddenCounts.get(sourceNode.id) ?? 0}
        onExpandBranch={onExpandBranch}
        onSelect={onSelect}
        cardRef={(element) => registerNodeRef(node.id, element)}
      />

      {children.length > 0 && (
        <>
          <TreeConnector
            width={childLayout.totalWidth}
            parentCenterX={columnWidth / 2}
            childCenterXs={childLayout.layouts.map((layout) => layout.centerX)}
          />
          <div
            className="flex items-start"
            style={{ width: childLayout.totalWidth }}
          >
            {childLayout.layouts.map((layout, index) => (
              <div
                key={layout.node.id}
                style={{
                  width: layout.width,
                  flexShrink: 0,
                  marginLeft: index > 0 ? siblingGap : 0,
                }}
              >
                <FlowSubtree
                  node={layout.node}
                  sourceNode={layout.node}
                  compact={compact}
                  highlightedNodeId={highlightedNodeId}
                  hiddenCounts={hiddenCounts}
                  onExpandBranch={onExpandBranch}
                  onSelect={onSelect}
                  registerNodeRef={registerNodeRef}
                  cardWidth={cardWidth}
                  siblingGap={siblingGap}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function buildHiddenCounts(visible: MoneyFlowNode, source: MoneyFlowNode): Map<string, number> {
  const counts = new Map<string, number>();

  function walk(visibleNode: MoneyFlowNode, sourceNode: MoneyFlowNode) {
    const visibleChildren = visibleNode.children ?? [];
    const sourceChildren = sourceNode.children ?? [];

    if (sourceChildren.length === 0) {
      return;
    }

    if (visibleChildren.length === 0) {
      counts.set(sourceNode.id, countDescendants(sourceNode));
      return;
    }

    for (const sourceChild of sourceChildren) {
      const visibleChild = visibleChildren.find((child) => child.id === sourceChild.id);
      if (visibleChild) {
        walk(visibleChild, sourceChild);
      }
    }
  }

  walk(visible, source);
  return counts;
}

export function MoneyFlowDiagram({
  root,
  className,
  highlightedNodeId,
  onHighlightNode,
  onVisibleRootChange,
  embedded = false,
}: MoneyFlowDiagramProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());

  const [viewDepth, setViewDepth] = useState<MoneyFlowViewDepth>(2);
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(() => new Set());
  const [compact, setCompact] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const [panMode, setPanMode] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const canPan = panMode || spacePressed;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== 'Space' || event.target instanceof HTMLInputElement) {
        return;
      }

      event.preventDefault();
      setSpacePressed(true);
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.code === 'Space') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const cardWidth = compact ? CARD_WIDTH_COMPACT : CARD_WIDTH;
  const siblingGap = compact ? 12 : CHILD_GAP;
  const columnGap = compact ? 16 : COLUMN_GAP;

  const revealState = useMemo(() => {
    if (!highlightedNodeId) {
      return null;
    }

    const path = getNodePath(root, highlightedNodeId);
    if (path.length <= 1) {
      return null;
    }

    const targetLevel = path[path.length - 1].level;
    const ancestorIds = path.slice(0, -1).map((node) => node.id);
    const neededDepth = viewDepth === 'all' || targetLevel <= resolveViewDepth(viewDepth)
      ? viewDepth
      : resolveRevealViewDepth(targetLevel);

    return { ancestorIds, neededDepth };
  }, [highlightedNodeId, root, viewDepth]);

  const effectiveExpandedBranches = useMemo(() => {
    if (!revealState) {
      return expandedBranches;
    }

    const merged = new Set(expandedBranches);
    for (const ancestorId of revealState.ancestorIds) {
      merged.add(ancestorId);
    }

    return merged;
  }, [expandedBranches, revealState]);

  const effectiveViewDepth = revealState?.neededDepth ?? viewDepth;

  const visibleRoot = useMemo(
    () => filterMoneyFlowTree(root, resolveViewDepth(effectiveViewDepth), effectiveExpandedBranches),
    [root, effectiveViewDepth, effectiveExpandedBranches],
  );

  const hiddenCounts = useMemo(
    () => buildHiddenCounts(visibleRoot, root),
    [visibleRoot, root],
  );

  useEffect(() => {
    onVisibleRootChange?.(visibleRoot);
  }, [visibleRoot, onVisibleRootChange]);

  const f1Layout = useMemo(() => {
    const children = visibleRoot.children ?? [];
    return getChildrenLayout(children, cardWidth, columnGap);
  }, [visibleRoot.children, cardWidth, columnGap]);

  const innerWidth = useMemo(
    () => Math.max(cardWidth, f1Layout.totalWidth),
    [cardWidth, f1Layout.totalWidth],
  );

  useLayoutEffect(() => {
    const tree = treeRef.current;
    if (!tree) {
      return;
    }

    const updateHeight = () => {
      setContentHeight(tree.offsetHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(tree);
    return () => observer.disconnect();
  }, [visibleRoot, compact, f1Layout.totalWidth, effectiveViewDepth, effectiveExpandedBranches]);

  const scaledWidth = innerWidth * zoom;
  const scaledHeight = contentHeight > 0 ? contentHeight * zoom : undefined;

  const registerNodeRef = useCallback((nodeId: string, element: HTMLDivElement | null) => {
    if (element) {
      nodeRefs.current.set(nodeId, element);
    } else {
      nodeRefs.current.delete(nodeId);
    }
  }, []);

  const fitToView = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const viewportWidth = viewport.clientWidth - 48;
    const viewportHeight = viewport.clientHeight - 48;
    if (innerWidth <= 0 || viewportWidth <= 0) {
      return;
    }

    const zoomByWidth = viewportWidth / innerWidth;
    const zoomByHeight = contentHeight > 0 ? viewportHeight / contentHeight : zoomByWidth;
    const nextZoom = Math.min(
      ZOOM_MAX,
      Math.max(ZOOM_MIN, Math.min(zoomByWidth, zoomByHeight)),
    );

    setZoom(Number(nextZoom.toFixed(2)));
    viewport.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  }, [innerWidth, contentHeight]);

  useEffect(() => {
    fitToView();
  }, [root.id, viewDepth, compact, expandedBranches, contentHeight, fitToView]);

  useEffect(() => {
    if (!highlightedNodeId) {
      return;
    }

    const element = nodeRefs.current.get(highlightedNodeId);
    const viewport = viewportRef.current;
    if (!element || !viewport) {
      return;
    }

    const targetLeft = element.offsetLeft * zoom;
    const targetTop = element.offsetTop * zoom;
    viewport.scrollTo({
      left: Math.max(0, targetLeft - viewport.clientWidth / 2 + (element.offsetWidth * zoom) / 2),
      top: Math.max(0, targetTop - viewport.clientHeight / 2 + (element.offsetHeight * zoom) / 2),
      behavior: 'smooth',
    });
  }, [highlightedNodeId, zoom]);

  function handleExpandBranch(nodeId: string) {
    setExpandedBranches((current) => new Set(current).add(nodeId));
    onHighlightNode?.(nodeId);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!canPan || event.button !== 0) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    setIsPanning(true);
    panStart.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
    viewport.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isPanning || !canPan) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollLeft = panStart.current.scrollLeft - (event.clientX - panStart.current.x);
    viewport.scrollTop = panStart.current.scrollTop - (event.clientY - panStart.current.y);
  }

  function endPan(event: React.PointerEvent<HTMLDivElement>) {
    if (!isPanning) {
      return;
    }

    setIsPanning(false);
    viewportRef.current?.releasePointerCapture(event.pointerId);
  }

  const shellClass = embedded
    ? 'w-full self-start overflow-hidden'
    : cn('dashboard-card overflow-hidden', className);

  return (
    <div className={shellClass}>
      <div className="panel-header flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {DEPTH_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setViewDepth(option.value);
                setExpandedBranches(new Set());
              }}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                viewDepth === option.value
                  ? 'border-primary-600 bg-primary-600 text-white'
                  : 'border-border bg-white text-muted hover:border-primary-200',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant={panMode ? 'primary' : 'secondary'}
            size="sm"
            type="button"
            onClick={() => setPanMode((value) => !value)}
          >
            {panMode ? 'Đang di chuyển' : 'Di chuyển'}
          </Button>
          <Button variant="secondary" size="sm" type="button" onClick={() => setCompact((value) => !value)}>
            {compact ? 'Phóng thẻ' : 'Thu thẻ'}
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={viewportRef}
          className={cn(
            'panel-scroll overflow-auto bg-gradient-to-b from-slate-50 to-slate-100/50 p-4 sm:p-6',
            canPan && (isPanning ? 'cursor-grabbing' : 'cursor-grab'),
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPan}
          onPointerLeave={endPan}
        >
          <div
            className="mx-auto"
            style={{ width: scaledWidth, height: scaledHeight }}
          >
            <div
              ref={contentRef}
              className="origin-top-left"
              style={{
                transform: `scale(${zoom})`,
                width: innerWidth,
              }}
            >
              <div
                ref={treeRef}
                className="flex flex-col items-center pb-4"
                style={{ width: innerWidth }}
              >
                <FlowNodeCard
                  node={visibleRoot}
                  sourceNode={root}
                  compact={compact}
                  highlighted={highlightedNodeId === visibleRoot.id}
                  selected={highlightedNodeId === visibleRoot.id}
                  hiddenDescendants={hiddenCounts.get(root.id) ?? 0}
                  onExpandBranch={handleExpandBranch}
                  onSelect={onHighlightNode}
                  cardRef={(element) => registerNodeRef(visibleRoot.id, element)}
                />

                {f1Layout.layouts.length > 0 && (
                  <div className="flex w-full flex-col items-center">
                    <TreeConnector
                      width={f1Layout.totalWidth}
                      parentCenterX={f1Layout.totalWidth / 2}
                      childCenterXs={f1Layout.layouts.map((layout) => layout.centerX)}
                    />
                    <div
                      className="flex items-start"
                      style={{ width: f1Layout.totalWidth }}
                    >
                      {f1Layout.layouts.map((layout, index) => (
                        <div
                          key={layout.node.id}
                          style={{
                            width: layout.width,
                            flexShrink: 0,
                            marginLeft: index > 0 ? columnGap : 0,
                          }}
                        >
                          <FlowSubtree
                            node={layout.node}
                            sourceNode={layout.node}
                            compact={compact}
                            highlightedNodeId={highlightedNodeId}
                            hiddenCounts={hiddenCounts}
                            onExpandBranch={handleExpandBranch}
                            onSelect={onHighlightNode}
                            registerNodeRef={registerNodeRef}
                            cardWidth={cardWidth}
                            siblingGap={siblingGap}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 right-4 flex flex-col gap-2">
          <div className="pointer-events-auto flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-lg">
            <button
              type="button"
              className="px-3 py-2 text-sm font-medium text-foreground hover:bg-table-stripe"
              onClick={() => setZoom((value) => Math.min(ZOOM_MAX, Number((value + ZOOM_STEP).toFixed(2))))}
              aria-label="Phóng to"
            >
              +
            </button>
            <span className="border-y border-border px-3 py-1 text-center text-[10px] font-semibold text-muted">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className="px-3 py-2 text-sm font-medium text-foreground hover:bg-table-stripe"
              onClick={() => setZoom((value) => Math.max(ZOOM_MIN, Number((value - ZOOM_STEP).toFixed(2))))}
              aria-label="Thu nhỏ"
            >
              −
            </button>
          </div>
          <button
            type="button"
            className="pointer-events-auto rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-primary-700 shadow-lg hover:bg-primary-50"
            onClick={fitToView}
          >
            Vừa màn hình
          </button>
        </div>

        <p className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-white/90 px-2 py-1 text-[10px] text-muted shadow-sm">
          Giữ <kbd className="rounded border px-1">Space</kbd> hoặc bật Di chuyển để kéo sơ đồ
        </p>
      </div>
    </div>
  );
}
