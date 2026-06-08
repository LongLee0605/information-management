import type { Transaction } from '@/types/transaction';
import { clearRuntimeBalances } from '@/utils/accountRuntimeStore';
import { clearRuntimeCustomerAccounts } from '@/utils/customerAccountRuntimeStore';
import { clearDeletedAccounts } from '@/utils/deletedAccountsRuntimeStore';
import { clearDeletedUsers } from '@/utils/deletedUsersRuntimeStore';
import { clearRuntimeUsers } from '@/utils/userRuntimeStore';
import { clampAppDate, clampAppDateRange, getDemoToday, isAppYearDate } from '@/utils/demoDate';

export interface StoredMoneyFlowEdge {
  fromUserId: string;
  toUserId: string;
  amount: number;
  transactionCount: number;
  dateFrom: string;
  dateTo: string;
  traceDepth?: 'leaf' | 'tree';
}

const RUNTIME_TRANSACTIONS_KEY = 'ufm:v5:runtime-transactions';
const RUNTIME_EDGES_KEY = 'ufm:v5:runtime-edges';
const LEGACY_TRANSACTIONS_KEY = 'ufm:v2:runtime-transactions';
const LEGACY_EDGES_KEY = 'ufm:v2:runtime-edges';
const LEGACY_V3_TRANSACTIONS_KEY = 'ufm:v3:runtime-transactions';
const LEGACY_V3_EDGES_KEY = 'ufm:v3:runtime-edges';
const LEGACY_V4_EDGES_KEY = 'ufm:v4:runtime-edges';
const LEGACY_V3_BALANCES_KEY = 'ufm:v3:runtime-balances';
const LEGACY_V1_TRANSACTIONS_KEY = 'ufm:runtime-transactions';
const LEGACY_V1_EDGES_KEY = 'ufm:runtime-edges';

type TransactionChangeListener = () => void;

const transactionListeners = new Set<TransactionChangeListener>();
let runtimeTransactionsCache: Transaction[] | null = null;
let legacyStorageCleared = false;

export function subscribeTransactionChange(listener: TransactionChangeListener): () => void {
  transactionListeners.add(listener);
  return () => {
    transactionListeners.delete(listener);
  };
}

export function notifyTransactionChange(): void {
  for (const listener of transactionListeners) {
    listener();
  }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function sanitizeTransaction(transaction: Transaction): Transaction | null {
  if (!isAppYearDate(transaction.date)) {
    return null;
  }

  const date = clampAppDate(transaction.date);
  if (date > getDemoToday()) {
    return null;
  }

  return {
    ...transaction,
    date,
  };
}

function sanitizeEdge(edge: StoredMoneyFlowEdge): StoredMoneyFlowEdge {
  const today = getDemoToday();
  const range = clampAppDateRange(edge.dateFrom, edge.dateTo);
  const dateFrom = range.dateFrom > today ? today : range.dateFrom;
  const dateTo = range.dateTo > today ? today : range.dateTo;

  return {
    ...edge,
    dateFrom,
    dateTo: dateFrom > dateTo ? dateFrom : dateTo,
    traceDepth: edge.traceDepth ?? 'tree',
  };
}

function clearLegacyRuntimeStorage(): void {
  sessionStorage.removeItem(LEGACY_TRANSACTIONS_KEY);
  sessionStorage.removeItem(LEGACY_EDGES_KEY);
  sessionStorage.removeItem(LEGACY_V3_TRANSACTIONS_KEY);
  sessionStorage.removeItem(LEGACY_V3_EDGES_KEY);
  sessionStorage.removeItem(LEGACY_V4_EDGES_KEY);
  sessionStorage.removeItem(LEGACY_V3_BALANCES_KEY);
  sessionStorage.removeItem(LEGACY_V1_TRANSACTIONS_KEY);
  sessionStorage.removeItem(LEGACY_V1_EDGES_KEY);
}

function ensureLegacyStorageCleared(): void {
  if (legacyStorageCleared) {
    return;
  }

  clearLegacyRuntimeStorage();
  legacyStorageCleared = true;
}

function invalidateRuntimeTransactionsCache(): void {
  runtimeTransactionsCache = null;
}

function readRuntimeTransactionsFromStorage(): Transaction[] {
  return readJson<Transaction[]>(RUNTIME_TRANSACTIONS_KEY, [])
    .map((transaction) => sanitizeTransaction(transaction))
    .filter((transaction): transaction is Transaction => transaction !== null);
}

export function loadRuntimeTransactions(): Transaction[] {
  ensureLegacyStorageCleared();

  if (!runtimeTransactionsCache) {
    runtimeTransactionsCache = readRuntimeTransactionsFromStorage();
  }

  return runtimeTransactionsCache;
}

export function appendRuntimeTransaction(transaction: Transaction): void {
  appendRuntimeTransactions([transaction]);
}

export function appendRuntimeTransactions(transactions: Transaction[]): void {
  if (transactions.length === 0) {
    return;
  }

  const sanitized = transactions
    .map((transaction) =>
      sanitizeTransaction({
        ...transaction,
        date: clampAppDate(transaction.date),
      }),
    )
    .filter((transaction): transaction is Transaction => transaction !== null);

  if (sanitized.length === 0) {
    return;
  }

  const existing = loadRuntimeTransactions();
  runtimeTransactionsCache = [...sanitized, ...existing];
  writeJson(RUNTIME_TRANSACTIONS_KEY, runtimeTransactionsCache);
  notifyTransactionChange();
}

export function loadRuntimeEdges(baseEdges: StoredMoneyFlowEdge[]): StoredMoneyFlowEdge[] {
  ensureLegacyStorageCleared();

  const stored = readJson<StoredMoneyFlowEdge[] | null>(RUNTIME_EDGES_KEY, null);
  if (!stored) {
    return baseEdges.map((edge) => sanitizeEdge(edge));
  }

  return stored.map((edge) => sanitizeEdge(edge));
}

export function saveRuntimeEdges(edges: StoredMoneyFlowEdge[]): void {
  writeJson(
    RUNTIME_EDGES_KEY,
    edges.map((edge) => sanitizeEdge(edge)),
  );
}

export function clearRuntimeStore(): void {
  sessionStorage.removeItem(RUNTIME_TRANSACTIONS_KEY);
  sessionStorage.removeItem(RUNTIME_EDGES_KEY);
  invalidateRuntimeTransactionsCache();
  clearRuntimeBalances();
  clearRuntimeUsers();
  clearRuntimeCustomerAccounts();
  clearDeletedUsers();
  clearDeletedAccounts();
  clearLegacyRuntimeStorage();
  legacyStorageCleared = true;
  notifyTransactionChange();
}

export function groupRuntimeTransactionsByUserId(
  transactions = loadRuntimeTransactions(),
): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    const bucket = grouped.get(transaction.userId);
    if (bucket) {
      bucket.push(transaction);
    } else {
      grouped.set(transaction.userId, [transaction]);
    }
  }

  return grouped;
}
