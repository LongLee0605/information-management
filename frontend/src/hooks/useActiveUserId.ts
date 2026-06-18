import { useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useSelectedUserContext } from '@/context';
import { resolveUserIdFromRouteParam } from '@/utils/userRoute';

function getRouteUserParam(pathname: string): string | null {
  const match = pathname.match(/^\/users\/([^/]+)/);
  return match?.[1] ?? null;
}

export function useActiveUserId(): string | null {
  const { pathname } = useLocation();
  const { contextUserId } = useSelectedUserContext();
  const routeParam = getRouteUserParam(pathname);
  const routeUserId = routeParam ? resolveUserIdFromRouteParam(routeParam) ?? null : null;

  if (routeUserId) {
    return routeUserId;
  }

  if (pathname === ROUTES.HOME) {
    return null;
  }

  return contextUserId;
}
