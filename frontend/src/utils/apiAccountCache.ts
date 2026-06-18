import type { EnrichedBankAccount } from '@/types';
let cifByUserId = new Map<string, string>();
let userIdByCif = new Map<string, string>();
export function setApiAccountCache(accounts: EnrichedBankAccount[]): void {
    cifByUserId = new Map();
    userIdByCif = new Map();
    for (const account of accounts) {
        const cif = account.cif.trim().toUpperCase();
        if (!cifByUserId.has(account.userId)) {
            cifByUserId.set(account.userId, account.cif);
            userIdByCif.set(cif, account.userId);
        }
    }
}
export function clearApiAccountCache(): void {
    cifByUserId = new Map();
    userIdByCif = new Map();
}
export function getApiCifFromUserId(userId: string): string | null {
    return cifByUserId.get(userId) ?? null;
}
export function getApiUserIdFromCif(cif: string): string | null {
    return userIdByCif.get(cif.trim().toUpperCase()) ?? null;
}
