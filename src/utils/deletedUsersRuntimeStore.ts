import { notifyUserChange } from '@/utils/userRuntimeStore';

const DELETED_USERS_KEY = 'ufm:v6:deleted-users';

let deletedUserIdsCache: Set<string> | null = null;

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

function loadDeletedUserIdsFromStorage(): Set<string> {
  if (deletedUserIdsCache) {
    return deletedUserIdsCache;
  }

  deletedUserIdsCache = new Set(readJson<string[]>(DELETED_USERS_KEY, []));
  return deletedUserIdsCache;
}

function invalidateDeletedUsersCache(): void {
  deletedUserIdsCache = null;
}

export function isUserDeleted(userId: string): boolean {
  return loadDeletedUserIdsFromStorage().has(userId);
}

export function markUserDeleted(userId: string): void {
  const deleted = loadDeletedUserIdsFromStorage();
  if (deleted.has(userId)) {
    return;
  }

  deleted.add(userId);
  writeJson(DELETED_USERS_KEY, [...deleted]);
  invalidateDeletedUsersCache();
  notifyUserChange();
}

export function clearDeletedUsers(): void {
  sessionStorage.removeItem(DELETED_USERS_KEY);
  invalidateDeletedUsersCache();
  notifyUserChange();
}
