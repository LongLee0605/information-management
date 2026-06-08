import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUserById } from '@/services';
import type { User } from '@/types';
import { resolveUserIdFromRouteParam } from '@/utils/userRoute';
import { subscribeUserChange } from '@/utils/userRuntimeStore';

interface UseUserResult {
  user: User | null;
  userId: string | undefined;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => void;
}

export function useUser(routeParam: string | undefined): UseUserResult {
  const userId = useMemo(
    () => resolveUserIdFromRouteParam(routeParam),
    [routeParam],
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => {
    setFetchKey((key) => key + 1);
  }, []);

  useEffect(() => {
    return subscribeUserChange(() => {
      setFetchKey((key) => key + 1);
    });
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const activeUserId = userId;
    let cancelled = false;

    async function fetchUser() {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await getUserById(activeUserId);
        if (!cancelled) {
          if (data) {
            setUser(data);
          } else {
            setUser(null);
            setNotFound(true);
          }
        }
      } catch {
        if (!cancelled) {
          setError('Không thể tải thông tin người dùng.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchUser();

    return () => {
      cancelled = true;
    };
  }, [userId, fetchKey]);

  return useMemo(
    () => ({
      user: userId ? user : null,
      userId,
      loading: Boolean(routeParam && userId && loading),
      error: userId ? error : null,
      notFound: Boolean(routeParam && !userId) || Boolean(userId && notFound),
      refetch,
    }),
    [routeParam, userId, user, loading, error, notFound, refetch],
  );
}
