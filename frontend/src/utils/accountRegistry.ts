import { getApiCifFromUserId, getApiUserIdFromCif } from '@/utils/apiAccountCache';
export { formatAccountNumberDisplay } from './accountNumber';
export function getCifFromUserId(userId: string): string {
    return getApiCifFromUserId(userId) ?? userId;
}
export function getUserIdFromCif(cif: string): string | null {
    return getApiUserIdFromCif(cif);
}
