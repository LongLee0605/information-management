import { getApiCifFromUserId, getApiUserIdFromCif } from '@/utils/apiAccountCache';
const API_USER_ID_PATTERN = /^\d+$/;
export function resolveUserIdFromRouteParam(routeParam: string | undefined): string | undefined {
    if (!routeParam) {
        return undefined;
    }
    const trimmed = routeParam.trim();
    const byApiCif = getApiUserIdFromCif(trimmed);
    if (byApiCif) {
        return byApiCif;
    }
    if (API_USER_ID_PATTERN.test(trimmed)) {
        return trimmed;
    }
    return undefined;
}
export function getUserRouteSegment(userId: string): string {
    return getApiCifFromUserId(userId) ?? userId;
}
export function canonicalizeUserPathname(pathname: string, routeParam: string, userId: string): string | null {
    const canonicalSegment = getUserRouteSegment(userId);
    if (routeParam === canonicalSegment) {
        return null;
    }
    return pathname.replace(`/users/${routeParam}`, `/users/${canonicalSegment}`);
}
