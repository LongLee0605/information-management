import accountsData from '@/data/accounts.json';
import usersData from '@/data/users.json';
import type { User } from '@/types';

export interface UserAccount {
  userId: string;
  cif: string;
  accountNumber: string;
  bank: string;
  bankBadgeClass: string;
  fullName: string;
  avatar: string;
}

const accounts = accountsData as Omit<UserAccount, 'fullName' | 'avatar'>[];
const users = usersData as User[];

const userMap = new Map(users.map((user) => [user.id, user]));
const accountByUserId = new Map(accounts.map((account) => [account.userId, account]));
const accountByNumber = new Map(
  accounts.map((account) => [account.accountNumber.replace(/\D/g, ''), account]),
);
const accountByCif = new Map(accounts.map((account) => [account.cif, account]));

function enrichAccount(
  account: Omit<UserAccount, 'fullName' | 'avatar'>,
): UserAccount | null {
  const user = userMap.get(account.userId);
  if (!user) {
    return null;
  }

  return {
    ...account,
    fullName: user.fullName,
    avatar: user.avatar,
  };
}

export function getAccountByUserId(userId: string): UserAccount | null {
  const account = accountByUserId.get(userId);
  return account ? enrichAccount(account) : null;
}

export function getAccountByCif(cif: string): UserAccount | null {
  const account = accountByCif.get(cif.trim().toUpperCase());
  return account ? enrichAccount(account) : null;
}

export function getAccountByNumber(accountNumber: string): UserAccount | null {
  const normalized = accountNumber.replace(/\D/g, '');
  if (!normalized) {
    return null;
  }

  const candidates = [normalized];
  if (normalized.length === 10) {
    candidates.push(`0${normalized}`);
  }

  for (const candidate of candidates) {
    const account = accountByNumber.get(candidate);
    if (account) {
      return enrichAccount(account);
    }
  }

  return null;
}

export function getAllUserAccounts(): UserAccount[] {
  return accounts
    .map((account) => enrichAccount(account))
    .filter((account): account is UserAccount => account !== null);
}

export function getCifFromUserId(userId: string): string {
  return getAccountByUserId(userId)?.cif ?? `CIF${userId.replace(/\D/g, '').padStart(3, '0')}`;
}

export function getUserIdFromCif(cif: string): string | null {
  return getAccountByCif(cif)?.userId ?? null;
}

export function formatAccountNumberDisplay(accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, '');
  if (digits.length <= 4) {
    return digits;
  }

  const head = digits.slice(0, 4);
  const tail = digits.slice(4).replace(/(\d{3})(?=\d)/g, '$1.');
  return tail ? `${head}.${tail}` : head;
}
