import { notifyAccountChange } from '@/utils/customerAccountRuntimeStore';

const DELETED_ACCOUNTS_KEY = 'ufm:v6:deleted-bank-accounts';

let deletedAccountIdsCache: Set<string> | null = null;

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

function loadDeletedAccountIdsFromStorage(): Set<string> {
  if (deletedAccountIdsCache) {
    return deletedAccountIdsCache;
  }

  deletedAccountIdsCache = new Set(readJson<string[]>(DELETED_ACCOUNTS_KEY, []));
  return deletedAccountIdsCache;
}

function invalidateDeletedAccountsCache(): void {
  deletedAccountIdsCache = null;
}

export function isAccountDeleted(accountId: string): boolean {
  return loadDeletedAccountIdsFromStorage().has(accountId);
}

export function markAccountDeleted(accountId: string): void {
  const deleted = loadDeletedAccountIdsFromStorage();
  if (deleted.has(accountId)) {
    return;
  }

  deleted.add(accountId);
  writeJson(DELETED_ACCOUNTS_KEY, [...deleted]);
  invalidateDeletedAccountsCache();
  notifyAccountChange();
}

export function clearDeletedAccounts(): void {
  sessionStorage.removeItem(DELETED_ACCOUNTS_KEY);
  invalidateDeletedAccountsCache();
  notifyAccountChange();
}
