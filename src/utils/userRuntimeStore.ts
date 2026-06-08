import type { User } from '@/types';

const RUNTIME_USERS_KEY = 'ufm:v5:runtime-users';

type UserChangeListener = () => void;

const userChangeListeners = new Set<UserChangeListener>();
let runtimeUsersCache: User[] | null = null;

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

export function subscribeUserChange(listener: UserChangeListener): () => void {
  userChangeListeners.add(listener);
  return () => {
    userChangeListeners.delete(listener);
  };
}

export function notifyUserChange(): void {
  for (const listener of userChangeListeners) {
    listener();
  }
}

function invalidateRuntimeUsersCache(): void {
  runtimeUsersCache = null;
}

export function loadRuntimeUsers(): User[] {
  if (runtimeUsersCache) {
    return runtimeUsersCache;
  }

  runtimeUsersCache = readJson<User[]>(RUNTIME_USERS_KEY, []);
  return runtimeUsersCache;
}

export function getRuntimeUserById(userId: string): User | undefined {
  return loadRuntimeUsers().find((user) => user.id === userId);
}

export function appendRuntimeUser(user: User): void {
  invalidateRuntimeUsersCache();
  const users = loadRuntimeUsers();
  writeJson(RUNTIME_USERS_KEY, [...users, user]);
  invalidateRuntimeUsersCache();
}

export function removeRuntimeUser(userId: string): void {
  const users = loadRuntimeUsers().filter((user) => user.id !== userId);
  writeJson(RUNTIME_USERS_KEY, users);
  invalidateRuntimeUsersCache();
}

export function clearRuntimeUsers(): void {
  sessionStorage.removeItem(RUNTIME_USERS_KEY);
  invalidateRuntimeUsersCache();
  notifyUserChange();
}
