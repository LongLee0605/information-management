import { getAllCustomerBankAccounts, lookupAccountByNumber } from '@/services/accountService';
import { formatAccountNumberDisplay } from '@/utils/accountNumber';

export interface SourceAccount {
  userId: string;
  fullName: string;
  accountNumber: string;
  balance: number;
}

export async function fetchSourceAccounts(): Promise<SourceAccount[]> {
  const accounts = await getAllCustomerBankAccounts();
  const byUser = new Map<string, (typeof accounts)[number]>();

  for (const account of accounts) {
    if (account.status !== 'active') continue;
    const existing = byUser.get(account.userId);
    if (!existing || account.accountType === 'payment') {
      byUser.set(account.userId, account);
    }
  }

  return Array.from(byUser.values()).map((account) => ({
    userId: account.userId,
    fullName: account.fullName,
    accountNumber: formatAccountNumberDisplay(account.accountNumber),
    balance: account.availableBalance ?? account.balance,
  }));
}

export async function lookupRecipientByAccount(accountNumber: string) {
  return lookupAccountByNumber(accountNumber);
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
