import edgesData from '@/data/moneyFlowEdges.json';
import usersData from '@/data/users.json';
import type { User } from '@/types';
import type { MoneyFlowLevel, MoneyFlowNode, MoneyFlowTrace } from '@/types/moneyFlow';
import { getAccountByUserId } from '@/utils/accountRegistry';
import { clampAppDateRange, getDemoToday } from '@/utils/demoDate';
import { notifyMoneyFlowChange } from '@/utils/moneyFlowChange';
import {
  loadRuntimeEdges,
  notifyTransactionChange,
  saveRuntimeEdges,
  type StoredMoneyFlowEdge,
} from '@/utils/transferRuntimeStore';

export type MoneyFlowTraceDepth = 'leaf' | 'tree';

export interface MoneyFlowEdge extends StoredMoneyFlowEdge {
  traceDepth: MoneyFlowTraceDepth;
}

const MAX_TRACE_LEVEL = 3;
const baseEdges: MoneyFlowEdge[] = (edgesData as StoredMoneyFlowEdge[]).map((edge) => ({
  ...edge,
  traceDepth: 'tree' as const,
}));
const activeEdges: MoneyFlowEdge[] = loadRuntimeEdges(baseEdges).map(normalizeEdge);
const users = new Map((usersData as User[]).map((user) => [user.id, user]));
const outgoingByUserId = new Map<string, MoneyFlowEdge[]>();
const edgeIndexByPair = new Map<string, number>();

function edgePairKey(fromUserId: string, toUserId: string): string {
  return `${fromUserId}|${toUserId}`;
}

function rebuildEdgeIndexes(): void {
  outgoingByUserId.clear();
  edgeIndexByPair.clear();

  activeEdges.forEach((edge, index) => {
    edgeIndexByPair.set(edgePairKey(edge.fromUserId, edge.toUserId), index);

    const outgoing = outgoingByUserId.get(edge.fromUserId);
    if (outgoing) {
      outgoing.push(edge);
    } else {
      outgoingByUserId.set(edge.fromUserId, [edge]);
    }
  });
}

rebuildEdgeIndexes();

const ALL_USER_IDS = [
  'u001',
  'u002',
  'u003',
  'u004',
  'u005',
  'u006',
  'u007',
  'u008',
  'u009',
  'u010',
] as const;

let tracesCache: Record<string, MoneyFlowTrace> | null = null;

function normalizeEdge(edge: StoredMoneyFlowEdge): MoneyFlowEdge {
  return {
    ...edge,
    traceDepth: edge.traceDepth ?? 'tree',
  };
}

function invalidateTracesCache(): void {
  tracesCache = null;
}

function findEdgeIndex(fromUserId: string, toUserId: string): number {
  return edgeIndexByPair.get(edgePairKey(fromUserId, toUserId)) ?? -1;
}

function mergeEdgeDates(
  edge: MoneyFlowEdge,
  date: string,
): Pick<MoneyFlowEdge, 'dateFrom' | 'dateTo'> {
  return clampAppDateRange(
    date < edge.dateFrom ? date : edge.dateFrom,
    date > edge.dateTo ? date : edge.dateTo,
  );
}

function formatPeriodLabel(transactionCount: number, dateFrom: string, dateTo: string): string {
  const toPeriod = (value: string) => {
    const [, month, year] = value.split('-');
    return `T${Number(month)}/${year.slice(2)}`;
  };

  return `${transactionCount} GD · ${toPeriod(dateFrom)} – ${toPeriod(dateTo)}`;
}

function getTraceChildEdges(userId: string): MoneyFlowEdge[] {
  return getOutgoingEdges(userId).filter((edge) => edge.traceDepth === 'tree');
}

function distributeDeltaDownstream(
  fromUserId: string,
  delta: number,
  date: string,
  visited = new Set<string>(),
): void {
  if (delta <= 0 || visited.has(fromUserId)) {
    return;
  }

  visited.add(fromUserId);

  const childEdges = getTraceChildEdges(fromUserId).map((edge) => ({
    edge,
    index: findEdgeIndex(edge.fromUserId, edge.toUserId),
  }));

  if (childEdges.length === 0) {
    return;
  }

  const totalWeight = childEdges.reduce((sum, { edge }) => sum + edge.amount, 0);
  let allocated = 0;

  for (let i = 0; i < childEdges.length; i += 1) {
    const { edge, index } = childEdges[i];
    if (index < 0) {
      continue;
    }

    const isLast = i === childEdges.length - 1;
    let share: number;

    if (totalWeight <= 0) {
      share = isLast
        ? delta - allocated
        : Math.floor(delta / childEdges.length);
    } else if (isLast) {
      share = delta - allocated;
    } else {
      share = Math.round((delta * edge.amount) / totalWeight);
    }

    share = Math.max(0, share);
    allocated += share;

    if (share <= 0) {
      continue;
    }

    const range = mergeEdgeDates(edge, date);
    activeEdges[index] = {
      ...edge,
      amount: edge.amount + share,
      transactionCount: edge.transactionCount + 1,
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      traceDepth: 'tree',
    };

    distributeDeltaDownstream(edge.toUserId, share, date, visited);
  }
}

function buildFlowNode(
  edge: MoneyFlowEdge,
  level: MoneyFlowLevel,
  visitedUserIds: Set<string>,
): MoneyFlowNode | null {
  if (level > MAX_TRACE_LEVEL || visitedUserIds.has(edge.toUserId)) {
    return null;
  }

  const account = getAccountByUserId(edge.toUserId);
  const user = users.get(edge.toUserId);

  if (!account || !user) {
    return null;
  }

  const nextVisited = new Set(visitedUserIds);
  nextVisited.add(edge.toUserId);

  const children =
    edge.traceDepth === 'leaf'
      ? []
      : getTraceChildEdges(edge.toUserId)
          .map((childEdge) =>
            buildFlowNode(childEdge, (level + 1) as MoneyFlowLevel, nextVisited),
          )
          .filter((node): node is MoneyFlowNode => node !== null);

  return {
    id: `f${level}-${edge.toUserId}`,
    level,
    userId: edge.toUserId,
    cif: account.cif,
    accountNumber: account.accountNumber,
    fullName: user.fullName,
    bank: account.bank,
    bankBadgeClass: account.bankBadgeClass,
    avatar: user.avatar,
    amount: edge.amount,
    transactionCount: edge.transactionCount,
    periodLabel: formatPeriodLabel(edge.transactionCount, edge.dateFrom, edge.dateTo),
    dateFrom: edge.dateFrom,
    dateTo: edge.dateTo,
    children: children.length > 0 ? children : undefined,
  };
}

export function getMoneyFlowEdges(): MoneyFlowEdge[] {
  return activeEdges.map((edge) => ({ ...edge }));
}

export function getOutgoingEdges(userId: string): MoneyFlowEdge[] {
  return outgoingByUserId.get(userId) ?? [];
}

export function getIncomingEdges(userId: string): MoneyFlowEdge[] {
  return activeEdges.filter((edge) => edge.toUserId === userId);
}

export function recordTransferEdge(
  fromUserId: string,
  toUserId: string,
  amount: number,
  date: string,
): void {
  if (fromUserId === toUserId || amount <= 0) {
    return;
  }

  const existingIndex = findEdgeIndex(fromUserId, toUserId);

  if (existingIndex >= 0) {
    const existing = activeEdges[existingIndex];
    const range = mergeEdgeDates(existing, date);

    activeEdges[existingIndex] = {
      ...existing,
      amount: existing.amount + amount,
      transactionCount: existing.transactionCount + 1,
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      traceDepth: 'tree',
    };

    distributeDeltaDownstream(toUserId, amount, date);
    notifyTransactionChange();
  } else {
    const range = clampAppDateRange(date, date);
    activeEdges.push({
      fromUserId,
      toUserId,
      amount,
      transactionCount: 1,
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
      traceDepth: 'leaf',
    });
  }

  invalidateTracesCache();
  rebuildEdgeIndexes();
  saveRuntimeEdges(activeEdges);
  notifyMoneyFlowChange();
}

export function buildMoneyFlowTrace(rootUserId: string): MoneyFlowTrace | null {
  const account = getAccountByUserId(rootUserId);
  const user = users.get(rootUserId);

  if (!account || !user) {
    return null;
  }

  const visited = new Set<string>([rootUserId]);
  const f1Nodes = getOutgoingEdges(rootUserId)
    .map((edge) => buildFlowNode(edge, 1, visited))
    .filter((node): node is MoneyFlowNode => node !== null);

  return {
    rootUserId,
    root: {
      id: `f0-${rootUserId}`,
      level: 0,
      userId: rootUserId,
      cif: account.cif,
      accountNumber: account.accountNumber,
      fullName: user.fullName,
      bank: account.bank,
      bankBadgeClass: account.bankBadgeClass,
      avatar: user.avatar,
      dateFrom: '2025-01-01',
      dateTo: getDemoToday(),
      children: f1Nodes.length > 0 ? f1Nodes : undefined,
    },
  };
}

export function getAllMoneyFlowTraces(): Record<string, MoneyFlowTrace> {
  if (tracesCache) {
    return tracesCache;
  }

  tracesCache = {};

  for (const userId of ALL_USER_IDS) {
    const trace = buildMoneyFlowTrace(userId);
    if (trace) {
      tracesCache[userId] = trace;
    }
  }

  return tracesCache;
}

export function getTraceUserIds(): string[] {
  return [...ALL_USER_IDS];
}

export function reloadMoneyFlowEdgesFromBase(): void {
  activeEdges.splice(
    0,
    activeEdges.length,
    ...baseEdges.map((edge) => ({ ...edge, traceDepth: 'tree' as const })),
  );
  invalidateTracesCache();
  rebuildEdgeIndexes();
}
