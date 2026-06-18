export type ApiConnectionStatus = 'checking' | 'online' | 'offline' | 'degraded';
export interface ApiStatusSnapshot {
    status: ApiConnectionStatus;
    dbHost: string | null;
    latencyMs: number | null;
    message: string | null;
    usingLocalFallback: boolean;
    checkedAt: number | null;
}
type ApiStatusListener = () => void;
const listeners = new Set<ApiStatusListener>();
let snapshot: ApiStatusSnapshot = {
    status: 'checking',
    dbHost: null,
    latencyMs: null,
    message: null,
    usingLocalFallback: false,
    checkedAt: null,
};
export function getApiStatusSnapshot(): ApiStatusSnapshot {
    return snapshot;
}
export function subscribeApiStatus(listener: ApiStatusListener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
function notifyApiStatusListeners(): void {
    for (const listener of listeners) {
        listener();
    }
}
export function updateApiStatus(patch: Partial<ApiStatusSnapshot>): void {
    snapshot = { ...snapshot, ...patch };
    notifyApiStatusListeners();
}
export function markApiOnline(dbHost?: string | null, latencyMs?: number | null): void {
    updateApiStatus({
        status: 'online',
        dbHost: dbHost ?? snapshot.dbHost,
        latencyMs: latencyMs ?? snapshot.latencyMs,
        message: null,
        usingLocalFallback: false,
        checkedAt: Date.now(),
    });
}
export function markApiOffline(message: string): void {
    updateApiStatus({
        status: 'offline',
        message,
        checkedAt: Date.now(),
    });
}
export function markApiDegraded(message: string): void {
    updateApiStatus({
        status: 'degraded',
        message,
        checkedAt: Date.now(),
    });
}
export function markUsingLocalFallback(active: boolean): void {
    updateApiStatus({
        usingLocalFallback: active,
        status: active ? 'offline' : snapshot.status,
    });
}
