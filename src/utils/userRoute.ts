import { getCifFromUserId, getUserIdFromCif } from '@/utils/accountRegistry';

const LEGACY_USER_ID_PATTERN = /^u\d{3}$/i;

export function resolveUserIdFromRouteParam(
  routeParam: string | undefined,
): string | undefined {
  if (!routeParam) {
    return undefined;
  }

  const trimmed = routeParam.trim();
  const byCif = getUserIdFromCif(trimmed);
  if (byCif) {
    return byCif;
  }

  if (LEGACY_USER_ID_PATTERN.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return undefined;
}

export function getUserRouteSegment(userId: string): string {
  return getCifFromUserId(userId);
}

export function canonicalizeUserPathname(
  pathname: string,
  routeParam: string,
  userId: string,
): string | null {
  const canonicalSegment = getUserRouteSegment(userId);
  if (routeParam === canonicalSegment) {
    return null;
  }

  return pathname.replace(`/users/${routeParam}`, `/users/${canonicalSegment}`);
}
