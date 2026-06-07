import { useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useSelectedUserContext } from '@/context';

function getRouteUserId(pathname: string): string | null {
  const match = pathname.match(/^\/users\/([^/]+)/);
  return match?.[1] ?? null;
}

export function useActiveUserId(): string | null {
  const { pathname } = useLocation();
  const { contextUserId } = useSelectedUserContext();
  const routeUserId = getRouteUserId(pathname);

  if (routeUserId) {
    return routeUserId;
  }

  if (pathname === ROUTES.HOME) {
    return null;
  }

  return contextUserId;
}
