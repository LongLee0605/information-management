import type {
  MoneyFlowFilterParams,
  MoneyFlowNode,
  MoneyFlowSearchResult,
  MoneyFlowStats,
  MoneyFlowTrace,
} from '@/types/moneyFlow';
import {
  getAccountByCif,
  getAccountByNumber,
} from '@/utils/accountRegistry';
import { formatDemoDateLabel } from '@/utils/demoDate';

export { getCifFromUserId, getUserIdFromCif } from '@/utils/accountRegistry';

function normalizeAccount(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizeCif(value: string): string {
  return value.trim().toUpperCase();
}

function toDayIndex(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function getInclusiveDayCount(fromDate: string, toDate: string): number {
  return toDayIndex(toDate) - toDayIndex(fromDate) + 1;
}

function getDateRangeRatio(
  nodeFrom: string,
  nodeTo: string,
  filterFrom: string,
  filterTo: string,
): number {
  if (!rangesOverlap(nodeFrom, nodeTo, filterFrom, filterTo)) {
    return 0;
  }

  const overlapFrom = nodeFrom > filterFrom ? nodeFrom : filterFrom;
  const overlapTo = nodeTo < filterTo ? nodeTo : filterTo;
  const nodeDays = getInclusiveDayCount(nodeFrom, nodeTo);
  const overlapDays = getInclusiveDayCount(overlapFrom, overlapTo);

  if (nodeDays <= 0) {
    return overlapDays > 0 ? 1 : 0;
  }

  return overlapDays / nodeDays;
}

function rangesOverlap(
  nodeFrom: string,
  nodeTo: string,
  filterFrom: string,
  filterTo: string,
): boolean {
  return nodeFrom <= filterTo && filterFrom <= nodeTo;
}

function formatNodePeriodLabel(
  transactionCount: number,
  dateFrom: string,
  dateTo: string,
): string {
  const toPeriod = (value: string) => {
    const [, month, year] = value.split('-');
    return `T${Number(month)}/${year.slice(2)}`;
  };

  if (dateFrom === dateTo) {
    return `${transactionCount} GD · ${formatDemoDateLabel(dateFrom)}`;
  }

  return `${transactionCount} GD · ${toPeriod(dateFrom)} – ${toPeriod(dateTo)}`;
}

function scaleNodeForDateRange(
  node: MoneyFlowNode,
  fromDate: string,
  toDate: string,
): Pick<MoneyFlowNode, 'amount' | 'transactionCount' | 'dateFrom' | 'dateTo' | 'periodLabel'> {
  const overlapFrom = node.dateFrom > fromDate ? node.dateFrom : fromDate;
  const overlapTo = node.dateTo < toDate ? node.dateTo : toDate;
  const ratio = getDateRangeRatio(node.dateFrom, node.dateTo, fromDate, toDate);
  const baseAmount = node.amount ?? 0;
  const baseCount = node.transactionCount ?? 0;
  const scaledAmount = Math.max(0, Math.round(baseAmount * ratio));
  const scaledCount =
    baseCount > 0 && scaledAmount > 0
      ? Math.max(1, Math.round(baseCount * ratio))
      : 0;

  return {
    amount: scaledAmount,
    transactionCount: scaledCount,
    dateFrom: overlapFrom,
    dateTo: overlapTo,
    periodLabel: formatNodePeriodLabel(scaledCount, overlapFrom, overlapTo),
  };
}

function filterNodeByDate(node: MoneyFlowNode, fromDate: string, toDate: string): MoneyFlowNode | null {
  if (!rangesOverlap(node.dateFrom, node.dateTo, fromDate, toDate)) {
    return null;
  }

  const filteredChildren = (node.children ?? [])
    .map((child) => filterNodeByDate(child, fromDate, toDate))
    .filter((child): child is MoneyFlowNode => child !== null);

  if (node.level === 0) {
    return {
      ...node,
      dateFrom: fromDate,
      dateTo: toDate,
      children: filteredChildren.length > 0 ? filteredChildren : undefined,
    };
  }

  const scaled = scaleNodeForDateRange(node, fromDate, toDate);

  if ((scaled.amount ?? 0) <= 0 && filteredChildren.length === 0) {
    return null;
  }

  return {
    ...node,
    ...scaled,
    children: filteredChildren.length > 0 ? filteredChildren : undefined,
  };
}

function countRelatedAccounts(node: MoneyFlowNode): number {
  return (node.children ?? []).reduce(
    (sum, child) => sum + 1 + countRelatedAccounts(child),
    0,
  );
}

function maxLevel(node: MoneyFlowNode): number {
  if (!node.children?.length) return node.level;
  return Math.max(...node.children.map((child) => maxLevel(child)));
}

function sumTransactions(node: MoneyFlowNode): number {
  const selfCount = node.level > 0 ? (node.transactionCount ?? 0) : 0;
  return selfCount + (node.children ?? []).reduce((sum, child) => sum + sumTransactions(child), 0);
}

function sumFlowAmount(node: MoneyFlowNode): number {
  const selfAmount = node.level > 0 ? (node.amount ?? 0) : 0;
  return selfAmount + (node.children ?? []).reduce((sum, child) => sum + sumFlowAmount(child), 0);
}

export function calculateMoneyFlowStats(root: MoneyFlowNode): MoneyFlowStats {
  return {
    relatedAccounts: countRelatedAccounts(root),
    totalTransactions: sumTransactions(root),
    totalFlowAmount: sumFlowAmount(root),
    traceLevels: maxLevel(root),
  };
}

export function resolveTraceUserId(
  traces: Record<string, MoneyFlowTrace>,
  filters: MoneyFlowFilterParams,
): string | null {
  const normalizedCif = normalizeCif(filters.cif);
  const normalizedAccount = normalizeAccount(filters.accountNumber);

  if (normalizedCif) {
    const account = getAccountByCif(normalizedCif);
    if (account && traces[account.userId]) {
      return account.userId;
    }
  }

  if (normalizedAccount) {
    const account = getAccountByNumber(normalizedAccount);
    if (account && traces[account.userId]) {
      return account.userId;
    }
  }

  return null;
}

export function searchMoneyFlowTrace(
  sourceTrace: MoneyFlowTrace,
  filters: MoneyFlowFilterParams,
): MoneyFlowSearchResult {
  const normalizedCif = normalizeCif(filters.cif);
  const normalizedAccount = normalizeAccount(filters.accountNumber);
  const rootAccount = normalizeAccount(sourceTrace.root.accountNumber);

  if (normalizedCif && normalizedCif !== normalizeCif(sourceTrace.root.cif)) {
    return {
      trace: null,
      stats: { relatedAccounts: 0, totalTransactions: 0, totalFlowAmount: 0, traceLevels: 0 },
      error: 'Số CIF không khớp với tài khoản gốc F0.',
    };
  }

  if (normalizedAccount && !rootAccount.includes(normalizedAccount) && !normalizedAccount.includes(rootAccount)) {
    return {
      trace: null,
      stats: { relatedAccounts: 0, totalTransactions: 0, totalFlowAmount: 0, traceLevels: 0 },
      error: 'Số tài khoản không khớp với tài khoản gốc F0.',
    };
  }

  if (filters.fromDate > filters.toDate) {
    return {
      trace: null,
      stats: { relatedAccounts: 0, totalTransactions: 0, totalFlowAmount: 0, traceLevels: 0 },
      error: 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.',
    };
  }

  const traceRoot = filterNodeByDate(sourceTrace.root, filters.fromDate, filters.toDate);

  if (!traceRoot?.children?.length) {
    return {
      trace: null,
      stats: { relatedAccounts: 1, totalTransactions: 0, totalFlowAmount: 0, traceLevels: 0 },
      error: 'Không có chuyển tiền F0 → F1 trong khoảng thời gian đã chọn.',
    };
  }

  return {
    trace: { rootUserId: sourceTrace.rootUserId, root: traceRoot },
    stats: calculateMoneyFlowStats(traceRoot),
    error: null,
  };
}

export function formatFlowAmount(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} Tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${Math.round(amount / 1_000_000)} Triệu`;
  }
  return new Intl.NumberFormat('vi-VN').format(amount);
}

export function formatMoneyFlowPeriodLabel(fromDate: string, toDate: string): string {
  return `${formatDemoDateLabel(fromDate)} – ${formatDemoDateLabel(toDate)}`;
}
