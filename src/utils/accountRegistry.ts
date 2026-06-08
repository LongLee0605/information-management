import customerBankAccountsData from '@/data/customerBankAccounts.json';
import usersData from '@/data/users.json';
import type { CustomerBankAccount, EnrichedBankAccount, User } from '@/types';
import { loadRuntimeCustomerBankAccounts } from '@/utils/customerAccountRuntimeStore';
import { applyRuntimeBalance } from '@/utils/accountRuntimeStore';
import { isAccountDeleted } from '@/utils/deletedAccountsRuntimeStore';
import { isUserDeleted } from '@/utils/deletedUsersRuntimeStore';
import { syncBirthDateFromCitizenId } from '@/utils/userBirthDate';
import { getRuntimeUserById } from '@/utils/userRuntimeStore';

export interface UserAccount {
  userId: string;
  cif: string;
  accountNumber: string;
  bank: string;
  bankBadgeClass: string;
  fullName: string;
  avatar: string;
}

type BankAccountRecord = CustomerBankAccount;

const baseAccounts = customerBankAccountsData as BankAccountRecord[];
const users = usersData as User[];

const userMap = new Map(users.map((user) => [user.id, user]));

let mergedAccountsCache: BankAccountRecord[] | null = null;
let accountsByUserId = new Map<string, BankAccountRecord[]>();
let accountByNumber = new Map<string, BankAccountRecord>();
let cifToUserId = new Map<string, string>();
let primaryByUserId = new Map<string, BankAccountRecord>();
let enrichedAccountsByUserId = new Map<string, EnrichedBankAccount[]>();
let allEnrichedAccountsCache: EnrichedBankAccount[] | null = null;
let historicCifByUserId = new Map<string, string>();

function getUserForAccount(userId: string): User | null {
  if (isUserDeleted(userId)) {
    return null;
  }

  const user = userMap.get(userId) ?? getRuntimeUserById(userId);
  return user ? syncBirthDateFromCitizenId(user) : null;
}

function rebuildEnrichedAccountCaches(accounts: BankAccountRecord[]): void {
  enrichedAccountsByUserId = new Map();
  const enrichedAll: EnrichedBankAccount[] = [];

  for (const account of accounts) {
    const enriched = enrichBankAccount(account);
    if (!enriched) {
      continue;
    }

    enrichedAll.push(enriched);
    const userAccounts = enrichedAccountsByUserId.get(account.userId) ?? [];
    userAccounts.push(enriched);
    enrichedAccountsByUserId.set(account.userId, userAccounts);
  }

  enrichedAll.sort((left, right) => {
    const cifCompare = left.cif.localeCompare(right.cif);
    if (cifCompare !== 0) {
      return cifCompare;
    }

    return left.accountType.localeCompare(right.accountType);
  });

  allEnrichedAccountsCache = enrichedAll;
}

function rebuildHistoricCifIndex(): void {
  historicCifByUserId = new Map();

  for (const account of [...baseAccounts, ...loadRuntimeCustomerBankAccounts()]) {
    if (isUserDeleted(account.userId) || historicCifByUserId.has(account.userId)) {
      continue;
    }

    historicCifByUserId.set(account.userId, account.cif);
  }
}

function rebuildAccountIndexes(accounts: BankAccountRecord[]): void {
  accountsByUserId = new Map();
  accountByNumber = new Map();
  cifToUserId = new Map();
  primaryByUserId = new Map();
  rebuildHistoricCifIndex();

  for (const account of accounts) {
    const userAccounts = accountsByUserId.get(account.userId) ?? [];
    userAccounts.push(account);
    accountsByUserId.set(account.userId, userAccounts);

    accountByNumber.set(account.accountNumber.replace(/\D/g, ''), account);
    cifToUserId.set(account.cif.trim().toUpperCase(), account.userId);

    if (account.isPrimary || (account.accountType === 'payment' && !primaryByUserId.has(account.userId))) {
      primaryByUserId.set(account.userId, account);
    }
  }

  for (const account of [...baseAccounts, ...loadRuntimeCustomerBankAccounts()]) {
    if (isUserDeleted(account.userId)) {
      continue;
    }

    cifToUserId.set(account.cif.trim().toUpperCase(), account.userId);
  }

  rebuildEnrichedAccountCaches(accounts);
}

function getMergedAccountRecords(): BankAccountRecord[] {
  if (mergedAccountsCache) {
    return mergedAccountsCache;
  }

  mergedAccountsCache = [...baseAccounts, ...loadRuntimeCustomerBankAccounts()]
    .filter((account) => !isUserDeleted(account.userId) && !isAccountDeleted(account.id));
  rebuildAccountIndexes(mergedAccountsCache);
  return mergedAccountsCache;
}

export function invalidateAccountRegistryCache(): void {
  mergedAccountsCache = null;
  accountsByUserId = new Map();
  accountByNumber = new Map();
  cifToUserId = new Map();
  primaryByUserId = new Map();
  enrichedAccountsByUserId = new Map();
  allEnrichedAccountsCache = null;
  historicCifByUserId = new Map();
}

function getPrimaryAccountRecord(userId: string): BankAccountRecord | undefined {
  const indexed = primaryByUserId.get(userId);
  if (indexed) {
    return indexed;
  }

  const accounts = accountsByUserId.get(userId)
    ?? getMergedAccountRecords().filter((item) => item.userId === userId);

  return accounts.find((item) => item.isPrimary)
    ?? accounts.find((item) => item.accountType === 'payment')
    ?? accounts[0];
}

function resolveAccountBalance(account: BankAccountRecord): number {
  if (account.accountType === 'payment' && account.isPrimary) {
    return applyRuntimeBalance(account.balance, account.userId);
  }

  return account.balance;
}

function enrichAsUserAccount(account: BankAccountRecord): UserAccount | null {
  const user = getUserForAccount(account.userId);
  if (!user) {
    return null;
  }

  return {
    userId: account.userId,
    cif: account.cif,
    accountNumber: account.accountNumber,
    bank: account.bank,
    bankBadgeClass: account.bankBadgeClass,
    fullName: user.fullName,
    avatar: user.avatar,
  };
}

function enrichBankAccount(account: BankAccountRecord): EnrichedBankAccount | null {
  const user = getUserForAccount(account.userId);
  if (!user) {
    return null;
  }

  const balance = resolveAccountBalance(account);
  const frozenBalance = account.frozenBalance;

  return {
    ...account,
    balance,
    fullName: user.fullName,
    avatar: user.avatar,
    availableBalance: Math.max(0, balance - frozenBalance),
  };
}

export function getAccountsByUserId(userId: string): EnrichedBankAccount[] {
  getMergedAccountRecords();
  return enrichedAccountsByUserId.get(userId) ?? [];
}

export function getAllBankAccounts(): EnrichedBankAccount[] {
  getMergedAccountRecords();
  return allEnrichedAccountsCache ?? [];
}

export function getAccountByUserId(userId: string): UserAccount | null {
  const account = getPrimaryAccountRecord(userId);
  return account ? enrichAsUserAccount(account) : null;
}

export function getAccountByCif(cif: string): UserAccount | null {
  const userId = cifToUserId.get(cif.trim().toUpperCase());
  if (!userId) {
    return null;
  }

  return getAccountByUserId(userId);
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
      return enrichAsUserAccount(account);
    }
  }

  return null;
}

export function getAllUserAccounts(): UserAccount[] {
  return getMergedAccountRecords()
    .filter((account) => {
      const primary = getPrimaryAccountRecord(account.userId);
      return primary?.id === account.id && account.status === 'active';
    })
    .map((account) => enrichAsUserAccount(account))
    .filter((account): account is UserAccount => account !== null);
}

export function getCifFromUserId(userId: string): string {
  const primary = getPrimaryAccountRecord(userId);
  return primary?.cif
    ?? historicCifByUserId.get(userId)
    ?? `CIF${userId.replace(/\D/g, '').padStart(3, '0')}`;
}

export function getUserIdFromCif(cif: string): string | null {
  const userId = cifToUserId.get(cif.trim().toUpperCase()) ?? null;
  if (!userId || isUserDeleted(userId)) {
    return null;
  }

  return userId;
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
