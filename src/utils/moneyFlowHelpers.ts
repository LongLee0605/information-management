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

export { getCifFromUserId, getUserIdFromCif } from '@/utils/accountRegistry';

function normalizeAccount(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizeCif(value: string): string {
  return value.trim().toUpperCase();
}

function rangesOverlap(
  nodeFrom: string,
  nodeTo: string,
  filterFrom: string,
  filterTo: string,
): boolean {
  return nodeFrom <= filterTo && filterFrom <= nodeTo;
}

function filterNodeByDate(node: MoneyFlowNode, fromDate: string, toDate: string): MoneyFlowNode | null {
  if (!rangesOverlap(node.dateFrom, node.dateTo, fromDate, toDate)) {
    return null;
  }

  const filteredChildren = (node.children ?? [])
    .map((child) => filterNodeByDate(child, fromDate, toDate))
    .filter((child): child is MoneyFlowNode => child !== null);

  return {
    ...node,
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
