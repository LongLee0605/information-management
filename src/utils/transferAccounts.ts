import financeData from '@/data/finance.json';
import type { UserFinance } from '@/types';
import {
  formatAccountNumberDisplay,
  getAccountByNumber,
  getAllUserAccounts,
} from '@/utils/accountRegistry';
import { applyRuntimeBalance } from '@/utils/accountRuntimeStore';
import { calculateFinanceSummary } from '@/utils/chartTransformers';
import { expandMonthlyToAppYears } from '@/utils/financeSync';

const finances = financeData as UserFinance[];
const financeByUserId = new Map(finances.map((item) => [item.userId, item]));

export interface SourceAccount {
  userId: string;
  fullName: string;
  accountNumber: string;
  balance: number;
}

export function getBaseAccountBalance(userId: string): number {
  const finance = financeByUserId.get(userId);
  const summary = calculateFinanceSummary(expandMonthlyToAppYears(finance?.monthly ?? []));
  return Math.max(summary.balance, 10_000_000);
}

export function getAccountAvailableBalance(userId: string): number {
  return applyRuntimeBalance(getBaseAccountBalance(userId), userId);
}

export function getSourceAccounts(): SourceAccount[] {
  return getAllUserAccounts().map((account) => ({
    userId: account.userId,
    fullName: account.fullName,
    accountNumber: formatAccountNumberDisplay(account.accountNumber),
    balance: getAccountAvailableBalance(account.userId),
  }));
}

export function getRecipientNameByAccount(accountNumber: string): string {
  return getAccountByNumber(accountNumber)?.fullName ?? '';
}

export function generateTransferId(): string {
  const random = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, '0');
  return `FT${random}`;
}

export interface TransferDraft {
  sourceUserId: string;
  sourceAccountNumber: string;
  sourceUserName: string;
  availableBalance: number;
  bankId: string;
  bankName: string;
  bankFullName: string;
  recipientAccount: string;
  recipientUserId: string;
  recipientName: string;
  amount: number;
  content: string;
  transactionId: string;
}
