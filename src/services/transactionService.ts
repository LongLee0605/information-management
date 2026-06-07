import financeData from '@/data/finance.json';
import usersData from '@/data/users.json';
import type { Transaction, TransactionWithUser, User, UserFinance } from '@/types';
import type { TransferDraft } from '@/utils/transferAccounts';
import { MOCK_DELAY_MS } from '@/constants';
import { getDemoToday } from '@/utils/demoDate';
import { applyTransferBalance } from '@/utils/accountRuntimeStore';
import { getCifFromUserId } from '@/utils/accountRegistry';
import { delay } from '@/utils';
import { subscribeMoneyFlowChange } from '@/utils/moneyFlowChange';
import { recordTransferEdge } from '@/utils/moneyFlowTraceBuilder';
import {
  appendRuntimeTransactions,
  groupRuntimeTransactionsByUserId,
  subscribeTransactionChange,
} from '@/utils/transferRuntimeStore';
import { generateTransactionsFromFinance } from '@/utils/transactionGenerator';

const finances = financeData as UserFinance[];
const users = usersData as User[];
const financeByUserId = new Map(finances.map((item) => [item.userId, item]));
const userNames = new Map(users.map((user) => [user.id, user.fullName]));

let allTransactionsCache: TransactionWithUser[] | null = null;
let generatedTransactionsCache: Map<string, Transaction[]> | null = null;

function invalidateTransactionCaches(): void {
  allTransactionsCache = null;
  generatedTransactionsCache = null;
}

subscribeTransactionChange(invalidateTransactionCaches);
subscribeMoneyFlowChange(invalidateTransactionCaches);

function getGeneratedTransactions(userId: string): Transaction[] {
  if (!generatedTransactionsCache) {
    generatedTransactionsCache = new Map();
  }

  const cached = generatedTransactionsCache.get(userId);
  if (cached) {
    return cached;
  }

  const finance = financeByUserId.get(userId);
  const generated = finance ? generateTransactionsFromFinance(userId, finance) : [];
  generatedTransactionsCache.set(userId, generated);
  return generated;
}

function mergeUserTransactions(
  userId: string,
  runtimeByUserId: Map<string, Transaction[]>,
): Transaction[] {
  const today = getDemoToday();
  const runtime = runtimeByUserId.get(userId) ?? [];
  const generated = getGeneratedTransactions(userId);
  const seen = new Set<string>();

  return [...runtime, ...generated]
    .filter((transaction) => {
      if (transaction.date > today || seen.has(transaction.id)) {
        return false;
      }

      seen.add(transaction.id);
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

function buildAllTransactions(): TransactionWithUser[] {
  const runtimeByUserId = groupRuntimeTransactionsByUserId();
  const userIds = new Set<string>([
    ...finances.map((item) => item.userId),
    ...runtimeByUserId.keys(),
  ]);

  return [...userIds]
    .flatMap((userId) =>
      mergeUserTransactions(userId, runtimeByUserId).map((transaction) => ({
        ...transaction,
        userFullName: userNames.get(transaction.userId) ?? transaction.userId,
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

function nextTransferId(userId: string, runtimeByUserId: Map<string, Transaction[]>): string {
  const cif = getCifFromUserId(userId);
  const prefix = `${cif}-TR`;
  const runtime = runtimeByUserId.get(userId) ?? [];
  const generated = getGeneratedTransactions(userId);
  const existingIds = new Set<string>();

  for (const transaction of runtime) {
    if (transaction.id.startsWith(prefix)) {
      existingIds.add(transaction.id);
    }
  }

  for (const transaction of generated) {
    if (transaction.id.startsWith(prefix)) {
      existingIds.add(transaction.id);
    }
  }

  return `${prefix}${String(existingIds.size + 1).padStart(4, '0')}`;
}

export async function getTransactionsByUserId(userId: string): Promise<Transaction[]> {
  await delay(MOCK_DELAY_MS);
  return mergeUserTransactions(userId, groupRuntimeTransactionsByUserId());
}

export async function getAllTransactions(): Promise<TransactionWithUser[]> {
  await delay(MOCK_DELAY_MS);

  if (!allTransactionsCache) {
    allTransactionsCache = buildAllTransactions();
  }

  return allTransactionsCache;
}

export async function getTransactionById(
  transactionId: string,
): Promise<TransactionWithUser | null> {
  await delay(MOCK_DELAY_MS);

  if (!allTransactionsCache) {
    allTransactionsCache = buildAllTransactions();
  }

  return allTransactionsCache.find((transaction) => transaction.id === transactionId) ?? null;
}

export async function createTransferTransaction(
  draft: TransferDraft,
): Promise<TransactionWithUser> {
  await delay(MOCK_DELAY_MS);

  const transferDate = getDemoToday();
  const runtimeByUserId = groupRuntimeTransactionsByUserId();

  const debitTransaction: Transaction = {
    id: nextTransferId(draft.sourceUserId, runtimeByUserId),
    userId: draft.sourceUserId,
    date: transferDate,
    type: 'debit',
    amount: draft.amount,
    description: `${draft.content} — Chuyển đến ${draft.recipientName} (${draft.bankName} ${draft.recipientAccount})`,
    category: 'Chuyển khoản',
    method: 'Chuyển khoản',
  };

  const creditTransaction: Transaction = {
    id: nextTransferId(draft.recipientUserId, runtimeByUserId),
    userId: draft.recipientUserId,
    date: transferDate,
    type: 'credit',
    amount: draft.amount,
    description: `Nhận chuyển khoản từ ${draft.sourceUserName} (${draft.sourceAccountNumber})`,
    category: 'Chuyển khoản',
    method: 'Chuyển khoản',
  };

  appendRuntimeTransactions([debitTransaction, creditTransaction]);
  applyTransferBalance(draft.sourceUserId, draft.recipientUserId, draft.amount);
  recordTransferEdge(draft.sourceUserId, draft.recipientUserId, draft.amount, transferDate);
  invalidateTransactionCaches();

  return {
    ...debitTransaction,
    userFullName: userNames.get(draft.sourceUserId) ?? draft.sourceUserName,
  };
}
