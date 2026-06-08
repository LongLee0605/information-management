import type { CustomerBankAccount } from '@/types';
import { invalidateAccountRegistryCache } from '@/utils/accountRegistry';

const RUNTIME_CUSTOMER_ACCOUNTS_KEY = 'ufm:v6:runtime-customer-bank-accounts';

type AccountChangeListener = () => void;

const accountChangeListeners = new Set<AccountChangeListener>();
let runtimeAccountsCache: CustomerBankAccount[] | null = null;

export function subscribeAccountChange(listener: AccountChangeListener): () => void {
  accountChangeListeners.add(listener);
  return () => {
    accountChangeListeners.delete(listener);
  };
}

export function notifyAccountChange(): void {
  for (const listener of accountChangeListeners) {
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

function invalidateRuntimeAccountsCache(): void {
  runtimeAccountsCache = null;
}

export function loadRuntimeCustomerBankAccounts(): CustomerBankAccount[] {
  if (runtimeAccountsCache) {
    return runtimeAccountsCache;
  }

  runtimeAccountsCache = readJson<CustomerBankAccount[]>(
    RUNTIME_CUSTOMER_ACCOUNTS_KEY,
    [],
  );
  return runtimeAccountsCache;
}

export function appendRuntimeCustomerBankAccounts(accounts: CustomerBankAccount[]): void {
  const existing = loadRuntimeCustomerBankAccounts();
  writeJson(RUNTIME_CUSTOMER_ACCOUNTS_KEY, [...existing, ...accounts]);
  invalidateRuntimeAccountsCache();
  invalidateAccountRegistryCache();
  notifyAccountChange();
}

export function removeRuntimeAccountsByUserId(userId: string): void {
  const accounts = loadRuntimeCustomerBankAccounts().filter((account) => account.userId !== userId);
  writeJson(RUNTIME_CUSTOMER_ACCOUNTS_KEY, accounts);
  invalidateRuntimeAccountsCache();
  invalidateAccountRegistryCache();
  notifyAccountChange();
}

export function removeRuntimeAccountById(accountId: string): void {
  const accounts = loadRuntimeCustomerBankAccounts().filter((account) => account.id !== accountId);
  writeJson(RUNTIME_CUSTOMER_ACCOUNTS_KEY, accounts);
  invalidateRuntimeAccountsCache();
  invalidateAccountRegistryCache();
  notifyAccountChange();
}

export function clearRuntimeCustomerAccounts(): void {
  sessionStorage.removeItem(RUNTIME_CUSTOMER_ACCOUNTS_KEY);
  invalidateRuntimeAccountsCache();
  invalidateAccountRegistryCache();
}
